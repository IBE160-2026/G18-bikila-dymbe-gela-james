import { PublishedData } from '../../../shared/contracts/published'

// AD-1/AD-10: the app's only way to get data. Loads latest.json and falls back to demo.json only when
// latest.json does not exist (a clean clone). A latest.json that exists but is broken is an error,
// never a reason to show demo data instead. AD-12: parsed with the schema publish.ts validated against.

export type DataSource = 'latest' | 'demo'

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

export const LOAD_ERROR_MESSAGE = 'Klarte ikke å lese stedsdataene. Prøv å laste siden på nytt senere.'

export async function loadPublishedData(fetchFn: FetchFn = (url, init) => fetch(url, init), baseUrl = '/'): Promise<LoadResult> {
  const sources: DataSource[] = ['latest', 'demo']
  for (const source of sources) {
    const url = `${baseUrl}data/${source}.json`
    const attempt = await tryFetch(fetchFn, url)
    if (attempt.kind === 'missing') continue
    if (attempt.kind === 'unreadable') {
      console.error(attempt.reason)
      return { status: 'error', message: LOAD_ERROR_MESSAGE }
    }
    const parsed = PublishedData.safeParse(attempt.body)
    if (!parsed.success) {
      console.error(`${url} følger ikke PublishedData`, parsed.error.issues)
      return { status: 'error', message: LOAD_ERROR_MESSAGE }
    }
    return { status: 'ok', data: parsed.data, source }
  }
  return { status: 'error', message: LOAD_ERROR_MESSAGE }
}
