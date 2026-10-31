import { medNyereFelt, PublishedData } from '../../../shared/contracts/published'

// AD-1/AD-10: the app's only way to get data. It loads one local file, chosen when the app is built:
// demo.json with `--mode demo`, otherwise latest.json. It never reads the other file and never an
// external address, so a missing or broken latest.json gives a message, never demo data.
// AD-12: parsed with the schema publish.ts validated against.

export type DataSource = 'latest' | 'demo'

/** The file for Vite's mode. `--mode demo` on the command line is the only way to get demo data. */
export function dataKilde(mode: string): DataSource {
  return mode === 'demo' ? 'demo' : 'latest'
}

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
    // A failed request is not proof that the file is absent, so it is an error, not a missing file.
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

export const LOAD_ERROR_MESSAGE = 'Klarte ikke å lese stedsdataene. Prøv å laste siden på nytt senere.'
export const INGEN_DATAFIL_MESSAGE = 'Fant ingen værdata. Sjekk nettet og start på nytt, eller kjør npm run dev:demo.'

export async function loadPublishedData(
  fetchFn: FetchFn = (url, init) => fetch(url, init),
  baseUrl = '/',
  source: DataSource = 'latest',
): Promise<LoadResult> {
  const url = `${baseUrl}data/${source}.json`
  const attempt = await tryFetch(fetchFn, url)
  if (attempt.kind === 'missing') return { status: 'error', message: INGEN_DATAFIL_MESSAGE }
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
