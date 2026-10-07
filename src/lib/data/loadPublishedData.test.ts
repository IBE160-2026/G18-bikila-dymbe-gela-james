import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LOAD_ERROR_MESSAGE, loadPublishedData, type FetchFn } from './loadPublishedData'

const demoText = readFileSync(new URL('../../../public/data/demo.json', import.meta.url), 'utf8')
const demo = JSON.parse(demoText)
const live = { ...demo, mode: 'live', runId: 'run-1', report: { ...demo.report, runId: 'run-1', mode: 'live' } }

const json = (body: unknown) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
const notFound = () => new Response('Not found', { status: 404 })
// What the Vite dev server answers for a file that does not exist.
const indexHtml = () => new Response('<!doctype html>', { status: 200, headers: { 'content-type': 'text/html' } })

function fakeFetch(files: Record<string, () => Response>): FetchFn & { calls: string[] } {
  const calls: string[] = []
  const fn = async (url: string) => {
    calls.push(url)
    return (files[url] ?? notFound)()
  }
  return Object.assign(fn, { calls })
}

describe('loadPublishedData', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads latest.json when it exists', async () => {
    const fetchFn = fakeFetch({ '/data/latest.json': () => json(live), '/data/demo.json': () => json(demo) })
    const result = await loadPublishedData(fetchFn)
    expect(result).toMatchObject({ status: 'ok', source: 'latest', data: { mode: 'live' } })
    expect(fetchFn.calls).toEqual(['/data/latest.json'])
  })

  it('falls back to demo.json when latest.json is missing (clean clone)', async () => {
    const result = await loadPublishedData(fakeFetch({ '/data/demo.json': () => json(demo) }))
    expect(result).toMatchObject({ status: 'ok', source: 'demo', data: { mode: 'demo' } })
    if (result.status === 'ok') expect(result.data.steder).toHaveLength(24)
  })

  it('treats an HTML answer (dev server fallback) as missing', async () => {
    const result = await loadPublishedData(
      fakeFetch({ '/data/latest.json': indexHtml, '/data/demo.json': () => json(demo) }),
    )
    expect(result).toMatchObject({ status: 'ok', source: 'demo' })
  })

  it('gives an error, not demo data, on a network error for latest.json', async () => {
    const fetchFn: FetchFn = async (url) => {
      if (url.endsWith('latest.json')) throw new TypeError('Failed to fetch')
      return json(demo)
    }
    expect(await loadPublishedData(fetchFn)).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
  })

  it('gives an error, not demo data, when latest.json answers with a server error', async () => {
    const result = await loadPublishedData(
      fakeFetch({
        '/data/latest.json': () => new Response('Bad gateway', { status: 502 }),
        '/data/demo.json': () => json(demo),
      }),
    )
    expect(result).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
  })

  it('asks the browser to revalidate instead of using a cached copy', async () => {
    const inits: (RequestInit | undefined)[] = []
    const fetchFn: FetchFn = async (_url, init) => {
      inits.push(init)
      return json(live)
    }
    await loadPublishedData(fetchFn)
    expect(inits).toEqual([{ cache: 'no-cache' }])
  })

  it('uses the base URL', async () => {
    const fetchFn = fakeFetch({ '/snowfinder/data/demo.json': () => json(demo) })
    expect(await loadPublishedData(fetchFn, '/snowfinder/')).toMatchObject({ status: 'ok', source: 'demo' })
  })

  it('gives an error, not demo data, when latest.json fails PublishedData', async () => {
    const broken = { ...live, steder: [{ id: 'x' }] }
    const result = await loadPublishedData(
      fakeFetch({ '/data/latest.json': () => json(broken), '/data/demo.json': () => json(demo) }),
    )
    expect(result).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
  })

  it('gives an error when the file is not valid JSON', async () => {
    const result = await loadPublishedData(fakeFetch({ '/data/demo.json': () => json('{"mode": "demo",') }))
    expect(result).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
  })

  it('gives an error when demo.json is broken', async () => {
    const result = await loadPublishedData(fakeFetch({ '/data/demo.json': () => json({ ...demo, mode: 'test' }) }))
    expect(result).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
  })

  it('gives an error when no data file exists', async () => {
    expect(await loadPublishedData(fakeFetch({}))).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
  })
})
