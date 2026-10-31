import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DATAGREN_URL, LOAD_ERROR_MESSAGE, loadPublishedData, type FetchFn } from './loadPublishedData'

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

  describe('the branch data, under npm run dev', () => {
    const NOW = new Date('2026-10-31T12:00:00Z')
    const HOUR_MS = 3_600_000
    const load = (fetchFn: FetchFn) => loadPublishedData(fetchFn, '/', DATAGREN_URL)
    // What raw.githubusercontent.com answers.
    const plain = (body: unknown) =>
      new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      })
    const isoAgo = (ageMs: number) => new Date(NOW.getTime() - ageMs).toISOString()
    const withSourceTime = (time: (index: number) => string) =>
      live.steder.map((sted: Record<string, unknown>, index: number) => ({ ...sted, kildeTidspunkt: time(index) }))
    const aged = (ageMs: number) => ({ ...live, generert: isoAgo(ageMs), steder: withSourceTime(() => isoAgo(HOUR_MS)) })
    const fresh = aged(HOUR_MS)
    const withDemo = (branch: () => Response) => fakeFetch({ [DATAGREN_URL]: branch, '/data/demo.json': () => json(demo) })

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'], now: NOW })
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('does not read the branch when a local latest.json exists', async () => {
      const fetchFn = fakeFetch({ '/data/latest.json': () => json(live), [DATAGREN_URL]: () => plain(fresh) })
      expect(await load(fetchFn)).toMatchObject({ status: 'ok', source: 'latest' })
      expect(fetchFn.calls).toEqual(['/data/latest.json'])
    })

    it('does not read the branch when the local latest.json is broken, and still gives an error', async () => {
      const fetchFn = fakeFetch({ '/data/latest.json': () => json({ ...live, steder: [{ id: 'x' }] }), [DATAGREN_URL]: () => plain(fresh) })
      expect(await load(fetchFn)).toEqual({ status: 'error', message: LOAD_ERROR_MESSAGE })
      expect(fetchFn.calls).toEqual(['/data/latest.json'])
    })

    it('uses a fresh text/plain file instead of the demo data', async () => {
      const fetchFn = withDemo(() => plain(fresh))
      expect(await load(fetchFn)).toMatchObject({ status: 'ok', source: 'datagren', data: { mode: 'live' } })
      expect(fetchFn.calls).toEqual(['/data/latest.json', DATAGREN_URL])
      expect(console.error).not.toHaveBeenCalled()
    })

    it('gives a file from the branch the defaults for newer fields, like latest.json', async () => {
      const steder = fresh.steder.map((sted: Record<string, unknown>) => {
        const kopi = { ...sted }
        delete kopi.skivindu
        return kopi
      })
      const result = await load(withDemo(() => plain({ ...fresh, steder })))
      expect(result).toMatchObject({ status: 'ok', source: 'datagren' })
      if (result.status === 'ok') expect(result.data.steder.every((s) => s.skivindu === null)).toBe(true)
    })

    it('gives demo data, without logging, when the branch has no file', async () => {
      expect(await load(withDemo(notFound))).toMatchObject({ status: 'ok', source: 'demo', data: { mode: 'demo' } })
      expect(console.error).not.toHaveBeenCalled()
    })

    it('gives demo data and logs when the call is rejected (no network)', async () => {
      const fetchFn: FetchFn = async (url) => {
        if (url === DATAGREN_URL) throw new TypeError('Failed to fetch')
        return url === '/data/demo.json' ? json(demo) : notFound()
      }
      expect(await load(fetchFn)).toMatchObject({ status: 'ok', source: 'demo' })
      expect(console.error).toHaveBeenCalledOnce()
    })

    it('gives demo data and logs when the answer never starts within 5 s', async () => {
      const fetchFn: FetchFn = (url, init) => {
        if (url !== DATAGREN_URL) return Promise.resolve(url === '/data/demo.json' ? json(demo) : notFound())
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        })
      }
      const result = load(fetchFn)
      await vi.advanceTimersByTimeAsync(4_999)
      let settled = false
      void result.then(() => (settled = true))
      await Promise.resolve()
      expect(settled).toBe(false)
      await vi.advanceTimersByTimeAsync(1)
      expect(await result).toMatchObject({ status: 'ok', source: 'demo' })
      expect(console.error).toHaveBeenCalledOnce()
    })

    it('gives demo data and logs when the body stops arriving before 5 s', async () => {
      const fetchFn: FetchFn = async (url, init) => {
        if (url !== DATAGREN_URL) return url === '/data/demo.json' ? json(demo) : notFound()
        const body = new ReadableStream({
          start(controller) {
            init?.signal?.addEventListener('abort', () => controller.error(new DOMException('Aborted', 'AbortError')))
          },
        })
        return new Response(body, { status: 200 })
      }
      const result = load(fetchFn)
      await vi.advanceTimersByTimeAsync(5_000)
      expect(await result).toMatchObject({ status: 'ok', source: 'demo' })
      expect(console.error).toHaveBeenCalledOnce()
    })

    it.each([
      ['not JSON', () => plain('{"mode": "live",')],
      ['another HTTP error', () => new Response('Bad gateway', { status: 502 })],
      ['the wrong schema', () => plain({ ...fresh, steder: [{ id: 'x' }] })],
    ])('gives demo data and logs on %s', async (_name, branch) => {
      expect(await load(withDemo(branch))).toMatchObject({ status: 'ok', source: 'demo' })
      expect(console.error).toHaveBeenCalledOnce()
    })

    it('gives demo data, without logging, for a file over 12 h old', async () => {
      const result = await load(withDemo(() => plain(aged(12 * HOUR_MS + 1000))))
      expect(result).toMatchObject({ status: 'ok', source: 'demo' })
      expect(console.error).not.toHaveBeenCalled()
    })

    it('still uses a file that is exactly 12 h old', async () => {
      expect(await load(withDemo(() => plain(aged(12 * HOUR_MS))))).toMatchObject({ status: 'ok', source: 'datagren' })
    })

    it('gives demo data, without logging, for a new file where every place is over 12 h old', async () => {
      const steder = withSourceTime(() => isoAgo(12 * HOUR_MS + 1000))
      const result = await load(withDemo(() => plain({ ...fresh, steder })))
      expect(result).toMatchObject({ status: 'ok', source: 'demo' })
      expect(console.error).not.toHaveBeenCalled()
    })

    it('uses a new file when only one place is under 12 h old', async () => {
      const steder = withSourceTime((index) => isoAgo(index === 0 ? HOUR_MS : 12 * HOUR_MS + 1000))
      expect(await load(withDemo(() => plain({ ...fresh, steder })))).toMatchObject({ status: 'ok', source: 'datagren' })
    })

    it('does not read the branch without the address (production build and E2E)', async () => {
      const fetchFn = withDemo(() => plain(fresh))
      expect(await loadPublishedData(fetchFn)).toMatchObject({ status: 'ok', source: 'demo' })
      expect(fetchFn.calls).toEqual(['/data/latest.json', '/data/demo.json'])
    })
  })
})
