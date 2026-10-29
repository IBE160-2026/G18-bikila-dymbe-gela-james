// AD-2 stage, live source: fetches one MET Locationforecast and one NVE seNorge `fsw` response per
// place in the catalog and puts them in `ctx.raw`, in the same shape as sources/fixtures.ts.
// A call that fails with a network error, 429 or 5xx is tried again a fixed number of times with a
// growing wait (Story 1.6), each attempt through the source's call-rate gate; a timeout or another 4xx
// is not. No state is kept between runs. A call that still fails leaves the response missing with a
// reason, which validate.ts records; nothing is repaired (AD-11).
import type { CatalogEntry } from '../../shared/contracts/catalog'
import type { Avvisning } from '../../shared/contracts/published'
import type { RawResponses, RunContext } from '../../shared/contracts/run'
import { wgs84ToUtm33 } from '../../shared/geo'

/** MET's terms require an identifying User-Agent; no keys are needed. */
export const USER_AGENT = 'SnowFinder-data/1.0 (IBE160 G18, Hogskolen i Molde; https://github.com/IBE160-2026)'
/** At most this many calls in flight per source. */
export const DEFAULT_CONCURRENCY = 5
/**
 * At most one call started per this many ms per source, so 10 calls/s. MET's terms require a
 * special agreement above 20 requests/s per application; NVE gets the same limit out of courtesy.
 */
export const DEFAULT_MIN_INTERVAL_MS = 100
export const DEFAULT_TIMEOUT_MS = 20_000
/** Attempts per call, the first included, when a source is temporarily unavailable. */
export const DEFAULT_ATTEMPTS = 3
/** The wait before the second attempt; it doubles before each one after that (1 s, then 2 s). */
export const DEFAULT_RETRY_BASE_MS = 1000
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

export type Sleep = (ms: number) => Promise<void>

const sleepFor: Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * A gate each call awaits before it starts: starts are at least `intervalMs` apart. Callers pass
 * one at a time, and each waits from the previous caller's actual start, so timers that fire late
 * together after a busy event loop cannot release a burst. The clock is monotonic, and a timer
 * that fires early is waited out again.
 */
export function startGate(intervalMs: number, sleep: Sleep = sleepFor, now: () => number = () => performance.now()) {
  let lastStart = Number.NEGATIVE_INFINITY
  let queue: Promise<void> = Promise.resolve()
  return (): Promise<void> => {
    const turn = queue.then(async () => {
      for (let wait = lastStart + intervalMs - now(); wait > 0; wait = lastStart + intervalMs - now()) {
        await sleep(wait)
      }
      lastStart = now()
    })
    // A failed turn fails only its own caller, not every caller queued after it.
    queue = turn.catch(() => {})
    return turn
  }
}

type Outcome = { body: unknown } | { error: string; retryable: boolean }

const shorten = (text: string) => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > MAX_BODY_IN_REASON ? `${flat.slice(0, MAX_BODY_IN_REASON)} …` : flat
}

/** AbortSignal.timeout rejects with a TimeoutError; used both for the reason and to skip retries. */
const isTimeout = (error: unknown) => error instanceof Error && error.name === 'TimeoutError'

function describeError(error: unknown, timeoutMs: number): string {
  if (isTimeout(error)) return `Tidsavbrudd etter ${timeoutMs / 1000} s`
  if (error instanceof Error) {
    // Node's fetch reports "fetch failed" and puts the real cause (DNS, refused, reset) in `cause`.
    const cause = error.cause instanceof Error ? `: ${error.cause.message}` : ''
    return `Nettverksfeil: ${error.message || error.name}${cause}`
  }
  return `Nettverksfeil: ${String(error)}`
}

/**
 * One GET, one attempt. Never throws: any failure becomes a reason. Network errors, 429 and 5xx may
 * pass on a new attempt. A timeout is not retried: 300 places × 3 × 20 s would run into the next
 * hourly job, and a source that does not answer in 20 s is down, not unstable.
 */
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
      const retryable = response.status === 429 || response.status >= 500
      return { error: body ? `HTTP ${response.status}: ${body}` : `HTTP ${response.status}`, retryable }
    }
    try {
      return { body: JSON.parse(text) }
    } catch {
      return { error: 'Svaret er ikke JSON', retryable: false }
    }
  } catch (error) {
    return { error: describeError(error, timeoutMs), retryable: !isTimeout(error) }
  }
}

interface RetryOptions {
  fetchFn: FetchFn
  timeoutMs: number
  attempts: number
  retryBaseMs: number
  sleep: Sleep
  /** The source's call-rate gate, awaited before every attempt. */
  gate: () => Promise<void>
}

/** A GET with up to `attempts` tries, waiting retryBaseMs × 2^(n−1) before try n + 1. Never throws. */
async function getWithRetries(url: string, { fetchFn, timeoutMs, attempts, retryBaseMs, sleep, gate }: RetryOptions): Promise<Outcome> {
  const maxAttempts = Math.max(1, attempts)
  let tried = 0
  for (;;) {
    if (tried > 0) await sleep(retryBaseMs * 2 ** (tried - 1))
    await gate()
    const outcome = await getOnce(url, fetchFn, timeoutMs)
    tried++
    if (!('error' in outcome)) return outcome
    if (!outcome.retryable || tried >= maxAttempts) {
      return tried > 1 ? { ...outcome, error: `${outcome.error} (etter ${tried} forsøk)` } : outcome
    }
  }
}

export interface FetchOptions {
  fetchFn: FetchFn
  concurrency?: number
  /** Minimum time between two call starts per source; 0 turns the limit off (tests only). */
  minIntervalMs?: number
  timeoutMs?: number
  /** Attempts per call, the first included; 1 turns retries off. */
  attempts?: number
  /** The wait before the second attempt; it doubles for each attempt after that. */
  retryBaseMs?: number
  /** Waits between attempts; injected so tests record the waits instead of sleeping. */
  sleep?: Sleep
}

/** The source stage in live mode: fills `raw` with one MET and one NVE response per place. */
export async function fetchAll(
  ctx: RunContext,
  {
    fetchFn,
    concurrency = DEFAULT_CONCURRENCY,
    minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    attempts = DEFAULT_ATTEMPTS,
    retryBaseMs = DEFAULT_RETRY_BASE_MS,
    sleep = sleepFor,
  }: FetchOptions,
): Promise<RunContext> {
  const referenceMs = Date.parse(ctx.referenceTime)
  // Each source has its own limits, so a slow source does not hold back the other.
  const retry = { fetchFn, timeoutMs, attempts, retryBaseMs, sleep }
  const metGate = startGate(minIntervalMs)
  const nveGate = startGate(minIntervalMs)
  const [met, nve] = await Promise.all([
    mapLimit(ctx.catalog, concurrency, (sted) => getWithRetries(metUrl(sted), { ...retry, gate: metGate })),
    mapLimit(ctx.catalog, concurrency, (sted) => getWithRetries(nveUrl(sted, referenceMs), { ...retry, gate: nveGate })),
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
