// AD-2 stage, live source: fetches one MET Locationforecast and one NVE seNorge `fsw` response per
// place in the catalog and puts them in `ctx.raw`, in the same shape as sources/fixtures.ts.
// One attempt per place and source (retries are Story 1.6) and no state between runs. A failed call
// leaves the response missing with a reason, which validate.ts records; nothing is repaired (AD-11).
import type { CatalogEntry } from '../../shared/contracts/catalog'
import type { Avvisning } from '../../shared/contracts/published'
import type { RawResponses, RunContext } from '../../shared/contracts/run'
import { wgs84ToUtm33 } from '../../shared/geo'

/** MET's terms require an identifying User-Agent; no keys are needed. */
export const USER_AGENT = 'SnowFinder-data/1.0 (IBE160 G18, Hogskolen i Molde; https://github.com/IBE160-2026)'
/** At most this many calls in flight per source. */
export const DEFAULT_CONCURRENCY = 5
export const DEFAULT_TIMEOUT_MS = 20_000
/** Days of NVE history before the reference date, so the last daily value is always in the period. */
export const NVE_DAYS_BACK = 6

const DAY_MS = 86_400_000
const MAX_BODY_IN_REASON = 200

export type FetchFn = (url: string, init: RequestInit) => Promise<Response>

export function metUrl(sted: CatalogEntry): string {
  return `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${sted.lat}&lon=${sted.lon}&altitude=${sted.hoyde}`
}

const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10)

/** NVE GridTimeSeries in UTM33 (EPSG:25833), from NVE_DAYS_BACK days before `referenceMs` to that day. */
export function nveUrl(sted: CatalogEntry, referenceMs: number): string {
  const { x, y } = wgs84ToUtm33(sted.lat, sted.lon)
  const from = isoDate(referenceMs - NVE_DAYS_BACK * DAY_MS)
  return `https://gts.nve.no/api/GridTimeSeries/${Math.round(x)}/${Math.round(y)}/${from}/${isoDate(referenceMs)}/fsw.json`
}

/** Runs `task` over `items` with at most `limit` in flight, preserving order in the result. */
export async function mapLimit<T, R>(items: readonly T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await task(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

type Outcome = { body: unknown } | { error: string }

const shorten = (text: string) => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > MAX_BODY_IN_REASON ? `${flat.slice(0, MAX_BODY_IN_REASON)} …` : flat
}

function describeError(error: unknown, timeoutMs: number): string {
  if (error instanceof Error && error.name === 'TimeoutError') return `Tidsavbrudd etter ${timeoutMs / 1000} s`
  if (error instanceof Error) {
    // Node's fetch reports "fetch failed" and puts the real cause (DNS, refused, reset) in `cause`.
    const cause = error.cause instanceof Error ? `: ${error.cause.message}` : ''
    return `Nettverksfeil: ${error.message || error.name}${cause}`
  }
  return `Nettverksfeil: ${String(error)}`
}

/** One GET, one attempt. Never throws: any failure becomes a reason. */
async function getOnce(url: string, fetchFn: FetchFn, timeoutMs: number): Promise<Outcome> {
  try {
    // The signal also covers reading the body, so a stalled body times out too.
    const response = await fetchFn(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    })
    const text = await response.text()
    if (!response.ok) {
      // NVE explains a missing grid cell ("No cell exists") in the body of its HTTP 400.
      const body = shorten(text)
      return { error: body ? `HTTP ${response.status}: ${body}` : `HTTP ${response.status}` }
    }
    try {
      return { body: JSON.parse(text) }
    } catch {
      return { error: 'Svaret er ikke JSON' }
    }
  } catch (error) {
    return { error: describeError(error, timeoutMs) }
  }
}

export interface FetchOptions {
  fetchFn: FetchFn
  concurrency?: number
  timeoutMs?: number
}

/** The source stage in live mode: fills `raw` with one MET and one NVE response per place. */
export async function fetchAll(
  ctx: RunContext,
  { fetchFn, concurrency = DEFAULT_CONCURRENCY, timeoutMs = DEFAULT_TIMEOUT_MS }: FetchOptions,
): Promise<RunContext> {
  const referenceMs = Date.parse(ctx.referenceTime)
  // Each source has its own limit, so a slow source does not hold back the other.
  const [met, nve] = await Promise.all([
    mapLimit(ctx.catalog, concurrency, (sted) => getOnce(metUrl(sted), fetchFn, timeoutMs)),
    mapLimit(ctx.catalog, concurrency, (sted) => getOnce(nveUrl(sted, referenceMs), fetchFn, timeoutMs)),
  ])
  const raw: RawResponses[] = ctx.catalog.map((sted, i) => {
    const feil: Partial<Record<Avvisning['kilde'], string>> = {}
    const metOutcome = met[i]
    const nveOutcome = nve[i]
    if ('error' in metOutcome) feil.met = metOutcome.error
    if ('error' in nveOutcome) feil.nve = nveOutcome.error
    return {
      stedId: sted.id,
      met: 'body' in metOutcome ? metOutcome.body : undefined,
      nve: 'body' in nveOutcome ? nveOutcome.body : undefined,
      ...(Object.keys(feil).length > 0 ? { feil } : {}),
    }
  })
  return { ...ctx, raw }
}
