import { describe, expect, it } from 'vitest'
import { wgs84ToUtm33 } from '../../shared/geo'
import { fetchAll, metUrl, nveUrl, USER_AGENT, type FetchFn } from './fetch'
import { score } from './score'
import { catalogEntry, metResponse, nveResponse, rawContext, REFERENCE_TIME, snowyDay } from './testing'
import { validate } from './validate'

const isMet = (url: string) => url.startsWith('https://api.met.no/')

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

interface Call {
  url: string
  init: RequestInit
}

/** A fake fetch that records every call and answers with `answer`; MET and NVE answer valid by default. */
function fakeFetch(answer: (url: string, init: RequestInit) => Promise<Response> | Response = defaultAnswer) {
  const calls: Call[] = []
  const fetchFn: FetchFn = async (url, init) => {
    calls.push({ url, init })
    return answer(url, init)
  }
  return { fetchFn, calls }
}

function defaultAnswer(url: string): Response {
  return isMet(url) ? json(metResponse(snowyDay())) : json(nveResponse())
}

/** Places with the given ids and no responses yet, as run.ts hands them to fetch.ts. */
const contextFor = (ids: string[]) => rawContext(ids.map((id) => ({ id })))

describe('URL builders', () => {
  const sted = { ...catalogEntry('a'), lat: 61.6363, lon: 8.3125, hoyde: 2469 }

  it('ask MET for the place with its altitude', () => {
    expect(metUrl(sted)).toBe(
      'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=61.6363&lon=8.3125&altitude=2469',
    )
  })

  it('ask NVE for the UTM33 grid cell and the six days up to the reference date', () => {
    const { x, y } = wgs84ToUtm33(sted.lat, sted.lon)
    expect(nveUrl(sted, Date.parse(REFERENCE_TIME))).toBe(
      `https://gts.nve.no/api/GridTimeSeries/${Math.round(x)}/${Math.round(y)}/2026-10-01/2026-10-07/fsw.json`,
    )
  })
})

describe('fetchAll', () => {
  it('fetches one MET and one NVE response per place, with an identifying User-Agent and a timeout', async () => {
    const { fetchFn, calls } = fakeFetch()
    const ctx = await fetchAll(contextFor(['a', 'b', 'c']), { fetchFn })

    expect(ctx.raw.map((r) => r.stedId)).toEqual(['a', 'b', 'c'])
    expect(ctx.raw.every((r) => r.met !== undefined && r.nve !== undefined && r.feil === undefined)).toBe(true)
    expect(calls).toHaveLength(6)
    expect(calls.filter((c) => isMet(c.url))).toHaveLength(3)
    for (const { init } of calls) {
      expect(new Headers(init.headers).get('User-Agent')).toBe(USER_AGENT)
      expect(init.signal).toBeInstanceOf(AbortSignal)
    }
    expect(USER_AGENT).toMatch(/SnowFinder.*IBE160 G18/)
  })

  it('turns network errors, 5xx and 429 into a missing MET response with the reason, one attempt each', async () => {
    const { fetchFn, calls } = fakeFetch((url) => {
      if (!isMet(url)) return json(nveResponse())
      if (url.includes(`lat=${catalogEntry('a').lat}&`)) {
        throw new TypeError('fetch failed', { cause: new Error('ECONNRESET') })
      }
      if (url.includes(`lat=${catalogEntry('b').lat}&`)) return new Response('<html>Bad gateway</html>', { status: 502 })
      return new Response('', { status: 429 })
    })
    const ctx = await fetchAll(contextFor(['a', 'b', 'c']), { fetchFn })

    expect(ctx.raw.map((r) => r.feil)).toEqual([
      { met: 'Nettverksfeil: fetch failed: ECONNRESET' },
      { met: 'HTTP 502: <html>Bad gateway</html>' },
      { met: 'HTTP 429' },
    ])
    expect(ctx.raw.every((r) => r.met === undefined && r.nve !== undefined)).toBe(true)
    // No retries in v1 (Story 1.6).
    expect(calls).toHaveLength(6)

    const validated = validate(ctx)
    expect(validated.avviste).toEqual([
      { stedId: 'a', kilde: 'met', arsak: 'Nettverksfeil: fetch failed: ECONNRESET' },
      { stedId: 'b', kilde: 'met', arsak: 'HTTP 502: <html>Bad gateway</html>' },
      { stedId: 'c', kilde: 'met', arsak: 'HTTP 429' },
    ])
    expect(validated.validated.every((v) => v.met === null && v.nve !== null)).toBe(true)
  })

  it('reports NVE «no cell» (HTTP 400) for a place at sea, and the place keeps its MET data', async () => {
    const noCell = { Error: 'Tema: fsw. No cell exists for coordinates 473070, 7463031.' }
    const { fetchFn } = fakeFetch((url) => (isMet(url) ? json(metResponse(snowyDay())) : json(noCell, 400)))
    const ctx = score(validate(await fetchAll(contextFor(['kyst']), { fetchFn })))

    expect(ctx.avviste).toEqual([{ stedId: 'kyst', kilde: 'nve', arsak: `HTTP 400: ${JSON.stringify(noCell)}` }])
    expect(ctx.steder[0].nveNysnoSisteDognMm).toBeNull()
    expect(ctx.steder[0].snowScore.kind).toBe('score')
  })

  it('gives up on a call after the timeout', async () => {
    // Like the real fetch, the fake only stops when the signal aborts.
    const hang: FetchFn = (_url, init) =>
      new Promise((_resolve, reject) => init.signal?.addEventListener('abort', () => reject(init.signal?.reason)))
    const ctx = await fetchAll(contextFor(['a']), { fetchFn: hang, timeoutMs: 10 })
    expect(ctx.raw[0].feil).toEqual({ met: 'Tidsavbrudd etter 0.01 s', nve: 'Tidsavbrudd etter 0.01 s' })
    expect(validate(ctx).avviste.map((a) => a.kilde)).toEqual(['met', 'nve'])
  })

  it('treats a 200 response that is not JSON as a failed call', async () => {
    const { fetchFn } = fakeFetch((url) => (isMet(url) ? new Response('<html>Maintenance</html>') : json(nveResponse())))
    const ctx = await fetchAll(contextFor(['a']), { fetchFn })
    expect(ctx.raw[0]).toMatchObject({ met: undefined, feil: { met: 'Svaret er ikke JSON' } })
  })

  it('passes invalid JSON on unchanged, so validate.ts rejects it and nothing is repaired', async () => {
    const broken = metResponse([{ precipitation: -1 }])
    const { fetchFn } = fakeFetch((url) => (isMet(url) ? json(broken) : json(nveResponse())))
    const ctx = await fetchAll(contextFor(['a']), { fetchFn })
    expect(ctx.raw[0].met).toEqual(broken)
    expect(validate(ctx).avviste).toEqual([expect.objectContaining({ stedId: 'a', kilde: 'met' })])
  })

  it('never has more than 5 calls in flight per source for 300 places', async () => {
    const inFlight = { met: 0, nve: 0 }
    const highest = { met: 0, nve: 0 }
    const { fetchFn, calls } = fakeFetch(async (url) => {
      const source = isMet(url) ? 'met' : 'nve'
      inFlight[source]++
      highest[source] = Math.max(highest[source], inFlight[source])
      await new Promise((resolve) => setTimeout(resolve, 1))
      inFlight[source]--
      return defaultAnswer(url)
    })
    const ids = Array.from({ length: 300 }, (_, i) => `sted-${i}`)
    const ctx = await fetchAll(contextFor(ids), { fetchFn })

    expect(calls).toHaveLength(600)
    expect(highest).toEqual({ met: 5, nve: 5 })
    expect(ctx.raw.map((r) => r.stedId)).toEqual(ids)
  })
})
