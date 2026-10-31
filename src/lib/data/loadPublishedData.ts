import { PublishedData } from '../../../shared/contracts/published'
import { dataAlderMs, ferskhet, FJERNES_ETTER_MS } from '../../../shared/freshness'
import { now } from '../clock'

// AD-1/AD-10: the app's only way to get data. Loads latest.json and falls back to demo.json only when
// latest.json does not exist (a clean clone). A latest.json that exists but is broken is an error,
// never a reason to show demo data instead. AD-12: parsed with the schema publish.ts validated against.
// Story 1.11: under `npm run dev` the file the hourly job publishes to the branch `data` comes between
// them. It is optional, so every problem with it gives demo data, never the error page.

export type DataSource = 'latest' | 'datagren' | 'demo'

/** The fallback of the hourly job (.github/workflows/data.yml). */
export const DATAGREN_URL = 'https://raw.githubusercontent.com/IBE160-2026/G18-bikila-dymbe-gela-james/data/latest.json'
const DATAGREN_TIMEOUT_MS = 5_000

export type LoadResult =
  | { status: 'ok'; data: PublishedData; source: DataSource }
  | { status: 'error'; message: string }

export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>

type Attempt = { kind: 'missing' } | { kind: 'found'; body: unknown } | { kind: 'unreadable'; reason: string }

async function tryFetch(fetchFn: FetchFn, url: string): Promise<Attempt> {
  let response: Response
  try {
    // latest.json changes every hour, so always revalidate instead of using a cached copy.
    response = await fetchFn(url, { cache: 'no-cache' })
  } catch (error) {
    // A failed request is not proof that the file is absent; never fall back to demo data on it.
    return { kind: 'unreadable', reason: `${url} kunne ikke hentes: ${String(error)}` }
  }
  if (response.status === 404) return { kind: 'missing' }
  if (!response.ok) return { kind: 'unreadable', reason: `${url} svarte HTTP ${response.status}` }
  // The Vite dev server and many static hosts answer an unknown path with index.html, so a
  // non-JSON response counts as missing, like a 404.
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('json')) return { kind: 'missing' }
  try {
    return { kind: 'found', body: await response.json() }
  } catch {
    return { kind: 'unreadable', reason: `${url} er ikke gyldig JSON` }
  }
}

/** Fields added after the first published files, with the value an older file gets for them. */
const NYERE_FELT = {
  // Story 3.5
  skydekkeDagslys: null,
  // Story 4.2
  skivindu: null,
  skivinduUtenDagslys: false,
}

/**
 * Stories 3.5 and 4.2: a latest.json written before a field existed gets its default, so the app keeps
 * working until the next pipeline run. Read side only; publish.ts still requires the fields.
 */
function medNyereFelt(body: unknown): unknown {
  if (typeof body !== 'object' || body === null || !('steder' in body) || !Array.isArray(body.steder)) return body
  const steder: unknown[] = body.steder.map((sted: unknown) =>
    typeof sted === 'object' && sted !== null ? { ...NYERE_FELT, ...sted } : sted,
  )
  return { ...body, steder }
}

/**
 * The file on the branch `data`, or null when it should not be used. raw.githubusercontent.com answers
 * text/plain, so the content type says nothing here, unlike in tryFetch. A file older than the limit
 * for removing places, or with no place left after that limit, gives null: a clean clone long after
 * the last run should show the demo, not «Ingen ferske data».
 */
async function readDatagren(fetchFn: FetchFn, url: string): Promise<PublishedData | null> {
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), DATAGREN_TIMEOUT_MS)
  try {
    const response = await fetchFn(url, { cache: 'no-cache', signal: timeout.signal })
    if (response.status === 404) return null
    if (!response.ok) {
      console.error(`${url} svarte HTTP ${response.status}`)
      return null
    }
    const parsed = PublishedData.safeParse(medNyereFelt(await response.json()))
    if (!parsed.success) {
      console.error(`${url} følger ikke PublishedData`, parsed.error.issues)
      return null
    }
    const naa = now(parsed.data)
    const alder = dataAlderMs(parsed.data.generert, naa)
    const harSteder = parsed.data.steder.some((s) => ferskhet(s.kildeTidspunkt, naa) !== 'for-gammel')
    return alder !== null && alder <= FJERNES_ETTER_MS && harSteder ? parsed.data : null
  } catch (error) {
    console.error(`${url} kunne ikke leses: ${String(error)}`)
    return null
  } finally {
    clearTimeout(timer)
  }
}

export const LOAD_ERROR_MESSAGE = 'Klarte ikke å lese stedsdataene. Prøv å laste siden på nytt senere.'

export async function loadPublishedData(
  fetchFn: FetchFn = (url, init) => fetch(url, init),
  baseUrl = '/',
  datagrenUrl?: string,
): Promise<LoadResult> {
  const sources = ['latest', 'demo'] as const
  for (const source of sources) {
    const url = `${baseUrl}data/${source}.json`
    if (source === 'demo' && datagrenUrl !== undefined) {
      const data = await readDatagren(fetchFn, datagrenUrl)
      if (data !== null) return { status: 'ok', data, source: 'datagren' }
    }
    const attempt = await tryFetch(fetchFn, url)
    if (attempt.kind === 'missing') continue
    if (attempt.kind === 'unreadable') {
      console.error(attempt.reason)
      return { status: 'error', message: LOAD_ERROR_MESSAGE }
    }
    const parsed = PublishedData.safeParse(medNyereFelt(attempt.body))
    if (!parsed.success) {
      console.error(`${url} følger ikke PublishedData`, parsed.error.issues)
      return { status: 'error', message: LOAD_ERROR_MESSAGE }
    }
    return { status: 'ok', data: parsed.data, source }
  }
  return { status: 'error', message: LOAD_ERROR_MESSAGE }
}
