import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dataKilde, INGEN_DATAFIL_MESSAGE, LOAD_ERROR_MESSAGE, loadPublishedData, type FetchFn } from './loadPublishedData'

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

describe('dataKilde', () => {
  it.each([
    ['demo', 'demo'],
    ['development', 'latest'],
    ['production', 'latest'],
  ])('mode %s reads %s', (mode, source) => {
    expect(dataKilde(mode)).toBe(source)
  })
})

describe('loadPublishedData', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('in normal mode', () => {
    it('loads latest.json and never asks for demo.json', async () => {
      const fetchFn = fakeFetch({ '/data/latest.json': () => json(live), '/data/demo.json': () => json(demo) })
      const result = await loadPublishedData(fetchFn)
      expect(result).toMatchObject({ status: 'ok', source: 'latest', data: { mode: 'live' } })
      expect(fetchFn.calls).toEqual(['/data/latest.json'])
    })

    it.each([
      ['a 404', notFound],
      ['index.html from the dev server', indexHtml],
    ])('gives the message about missing data, not demo data, on %s', async (_name, answer) => {
      const fetchFn = fakeFetch({ '/data/latest.json': answer, '/data/demo.json': () => json(demo) })
      expect(await loadPublishedData(fetchFn)).toEqual({ status: 'error', message: INGEN_DATAFIL_MESSAGE })
      expect(fetchFn.calls).toEqual(['/data/latest.json'])
      expect(console.error).not.toHaveBeenCalled()
    })

    it.each([
      ['not valid JSON', () => json('{"mode": "live",')],
      ['the wrong schema', () => json({ ...live, steder: [{ id: 'x' }] })],
      ['a server error', () => new Response('Bad gateway', { status: 502 })],
    ])('gives the error message and logs, not demo data, on %s', async (_name, answer) => {
      const fetchFn = fakeFetch({ '/data/latest.json': answer, '/data/demo.json': () => json(demo) })
      expect(await loadPublishedData(fetchFn)).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
      expect(fetchFn.calls).toEqual(['/data/latest.json'])
      expect(console.error).toHaveBeenCalledOnce()
    })

    it('gives the error message and logs, not demo data, on a network error', async () => {
      const fetchFn: FetchFn = async (url) => {
        if (url.endsWith('latest.json')) throw new TypeError('Failed to fetch')
        return json(demo)
      }
      expect(await loadPublishedData(fetchFn)).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
      expect(console.error).toHaveBeenCalledOnce()
    })
  })

  describe('in demo mode', () => {
    const load = (fetchFn: FetchFn) => loadPublishedData(fetchFn, '/', 'demo')

    it('loads demo.json and never asks for latest.json, even when it exists', async () => {
      const fetchFn = fakeFetch({ '/data/latest.json': () => json(live), '/data/demo.json': () => json(demo) })
      const result = await load(fetchFn)
      expect(result).toMatchObject({ status: 'ok', source: 'demo', data: { mode: 'demo' } })
      if (result.status === 'ok') expect(result.data.steder).toHaveLength(24)
      expect(fetchFn.calls).toEqual(['/data/demo.json'])
    })

    it('gives the error message when demo.json is broken', async () => {
      const result = await load(fakeFetch({ '/data/demo.json': () => json({ ...demo, mode: 'test' }) }))
      expect(result).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
    })
  })

  it('loads a latest.json written before Story 3.5, with the cloud cover in daylight as null', async () => {
    const gammel = {
      ...live,
      steder: live.steder.map((sted: Record<string, unknown>) => {
        const kopi = { ...sted }
        delete kopi.skydekkeDagslys
        return kopi
      }),
    }
    expect(gammel.steder[0]).not.toHaveProperty('skydekkeDagslys')
    const result = await loadPublishedData(fakeFetch({ '/data/latest.json': () => json(gammel) }))
    expect(result).toMatchObject({ status: 'ok', source: 'latest' })
    if (result.status === 'ok') expect(result.data.steder.every((s) => s.skydekkeDagslys === null)).toBe(true)
  })

  it('loads a latest.json written before Story 4.2, without a ski window and without the polar night flag', async () => {
    const gammel = {
      ...live,
      steder: live.steder.map((sted: Record<string, unknown>) => {
        const kopi = { ...sted }
        delete kopi.skivindu
        delete kopi.skivinduUtenDagslys
        return kopi
      }),
    }
    expect(live.steder.some((s: { skivindu: unknown }) => s.skivindu !== null)).toBe(true)
    const result = await loadPublishedData(fakeFetch({ '/data/latest.json': () => json(gammel) }))
    expect(result).toMatchObject({ status: 'ok', source: 'latest' })
    if (result.status === 'ok') {
      expect(result.data.steder.every((s) => s.skivindu === null && !s.skivinduUtenDagslys)).toBe(true)
    }
  })

  it('keeps the values of a file that has the newer fields', async () => {
    const result = await loadPublishedData(fakeFetch({ '/data/latest.json': () => json(live) }))
    if (result.status !== 'ok') throw new Error('expected ok')
    expect(result.data.steder.map((s) => s.skivindu)).toEqual(live.steder.map((s: { skivindu: unknown }) => s.skivindu))
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

  it('fetches latest.json under the base URL, as on Pages', async () => {
    const fetchFn = fakeFetch({ '/snowfinder/data/latest.json': () => json(live) })
    expect(await loadPublishedData(fetchFn, '/snowfinder/')).toMatchObject({ status: 'ok', source: 'latest' })
    expect(fetchFn.calls).toEqual(['/snowfinder/data/latest.json'])
  })

  it('uses the base URL', async () => {
    const fetchFn = fakeFetch({ '/snowfinder/data/demo.json': () => json(demo) })
    expect(await loadPublishedData(fetchFn, '/snowfinder/', 'demo')).toMatchObject({ status: 'ok', source: 'demo' })
  })
})
