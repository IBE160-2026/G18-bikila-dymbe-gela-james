import { describe, expect, it } from 'vitest'
import { wgs84ToUtm33 } from '../../shared/geo'
import {
  DEFAULT_ATTEMPTS,
  DEFAULT_MIN_INTERVAL_MS,
  DEFAULT_RETRY_BASE_MS,
  fetchAll,
  metUrl,
  nveUrl,
  startGate,
  USER_AGENT,
  type FetchFn,
} from './fetch'
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

/** A sleep that records each wait between attempts and returns at once. */
function recordingSleep() {
  const slept: number[] = []
  return { slept, sleep: async (ms: number) => void slept.push(ms) }
}

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

  it('ends the NVE period on the UTC date, which still holds the newest finished day just after Norwegian midnight', () => {
    // 22:30 UTC is 00:30 on 08.10 in Norway; the newest finished day is stamped 07.10 06:00 UTC.
    const { x, y } = wgs84ToUtm33(sted.lat, sted.lon)
    expect(nveUrl(sted, Date.parse('2026-10-07T22:30:00Z'))).toBe(
      `https://gts.nve.no/api/GridTimeSeries/${Math.round(x)}/${Math.round(y)}/2026-10-01/2026-10-07/fsw.json`,
    )
  })
})

describe('fetchAll', () => {
  it('fetches one MET and one NVE response per place, with an identifying User-Agent and a timeout', async () => {
    const { fetchFn, calls } = fakeFetch()
    const ctx = await fetchAll(contextFor(['a', 'b', 'c']), { fetchFn, minIntervalMs: 0 })

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

  it('tries network errors, 5xx and 429 three times, waiting 1 s and then 2 s, before reporting the reason', async () => {
    const { fetchFn, calls } = fakeFetch((url) => {
      if (!isMet(url)) return json(nveResponse())
      if (url.includes(`lat=${catalogEntry('a').lat}&`)) {
        throw new TypeError('fetch failed', { cause: new Error('ECONNRESET') })
      }
      if (url.includes(`lat=${catalogEntry('b').lat}&`)) return new Response('<html>Bad gateway</html>', { status: 502 })
      return new Response('', { status: 429 })
    })
    const { slept, sleep } = recordingSleep()
    const ctx = await fetchAll(contextFor(['a', 'b', 'c']), { fetchFn, minIntervalMs: 0, sleep })

    expect(DEFAULT_ATTEMPTS).toBe(3)
    expect(DEFAULT_RETRY_BASE_MS).toBe(1000)
    expect(ctx.raw.map((r) => r.feil)).toEqual([
      { met: 'Nettverksfeil: fetch failed: ECONNRESET (etter 3 forsøk)' },
      { met: 'HTTP 502: <html>Bad gateway</html> (etter 3 forsøk)' },
      { met: 'HTTP 429 (etter 3 forsøk)' },
    ])
    expect(ctx.raw.every((r) => r.met === undefined && r.nve !== undefined)).toBe(true)
    // Three attempts per MET call, one per NVE call; two waits per failed place.
    expect(calls.filter((c) => isMet(c.url))).toHaveLength(9)
    expect(calls.filter((c) => !isMet(c.url))).toHaveLength(3)
    expect([...slept].sort((a, b) => a - b)).toEqual([1000, 1000, 1000, 2000, 2000, 2000])

    const validated = validate(ctx)
    expect(validated.avviste).toEqual([
      { stedId: 'a', kilde: 'met', arsak: 'Nettverksfeil: fetch failed: ECONNRESET (etter 3 forsøk)' },
      { stedId: 'b', kilde: 'met', arsak: 'HTTP 502: <html>Bad gateway</html> (etter 3 forsøk)' },
      { stedId: 'c', kilde: 'met', arsak: 'HTTP 429 (etter 3 forsøk)' },
    ])
    expect(validated.validated.every((v) => v.met === null && v.nve !== null)).toBe(true)
  })

  it('uses the answer when a brief failure passes on the next attempt, with no rejection', async () => {
    let metCalls = 0
    const { fetchFn } = fakeFetch((url) => {
      if (!isMet(url)) return json(nveResponse())
      return ++metCalls === 1 ? new Response('', { status: 503 }) : json(metResponse(snowyDay()))
    })
    const { slept, sleep } = recordingSleep()
    const ctx = await fetchAll(contextFor(['a']), { fetchFn, minIntervalMs: 0, sleep })

    expect(metCalls).toBe(2)
    expect(slept).toEqual([1000])
    expect(ctx.raw[0].met).toEqual(metResponse(snowyDay()))
    expect(ctx.raw[0].feil).toBeUndefined()
    expect(validate(ctx).avviste).toEqual([])
  })

  it.each([500, 503])('tries HTTP %i three times', async (status) => {
    const { fetchFn, calls } = fakeFetch((url) => (isMet(url) ? new Response('', { status }) : json(nveResponse())))
    const { slept, sleep } = recordingSleep()
    const ctx = await fetchAll(contextFor(['a']), { fetchFn, minIntervalMs: 0, sleep })

    expect(calls.filter((c) => isMet(c.url))).toHaveLength(3)
    expect(slept).toEqual([1000, 2000])
    expect(ctx.raw[0].feil).toEqual({ met: `HTTP ${status} (etter 3 forsøk)` })
  })

  it('stops at a timeout after a retryable failure, and says how many attempts were made', async () => {
    let metCalls = 0
    const { fetchFn, calls } = fakeFetch((url, init) => {
      if (!isMet(url)) return json(nveResponse())
      if (++metCalls === 1) return new Response('', { status: 503 })
      // Like the real fetch, the fake only stops when the signal aborts.
      return new Promise((_resolve, reject) => init.signal?.addEventListener('abort', () => reject(init.signal?.reason)))
    })
    const { slept, sleep } = recordingSleep()
    const ctx = await fetchAll(contextFor(['a']), { fetchFn, minIntervalMs: 0, timeoutMs: 10, sleep })

    expect(calls.filter((c) => isMet(c.url))).toHaveLength(2)
    expect(slept).toEqual([1000])
    expect(ctx.raw[0].feil).toEqual({ met: 'Tidsavbrudd etter 0.01 s (etter 2 forsøk)' })
  })

  it.each([
    ['NVE «no cell» (HTTP 400)', 400],
    ['HTTP 404', 404],
  ])('tries %s only once, since a new attempt will not help', async (_name, status) => {
    const { fetchFn, calls } = fakeFetch((url) => (isMet(url) ? json(metResponse(snowyDay())) : new Response('', { status })))
    const { slept, sleep } = recordingSleep()
    const ctx = await fetchAll(contextFor(['a']), { fetchFn, minIntervalMs: 0, sleep })

    expect(calls).toHaveLength(2)
    expect(slept).toEqual([])
    expect(ctx.raw[0].feil).toEqual({ nve: `HTTP ${status}` })
  })

  it('reports NVE «no cell» (HTTP 400) for a place at sea, and the place keeps its MET data', async () => {
    const noCell = { Error: 'Tema: fsw. No cell exists for coordinates 473070, 7463031.' }
    const { fetchFn } = fakeFetch((url) => (isMet(url) ? json(metResponse(snowyDay())) : json(noCell, 400)))
    const ctx = score(validate(await fetchAll(contextFor(['kyst']), { fetchFn, minIntervalMs: 0 })))

    expect(ctx.avviste).toEqual([{ stedId: 'kyst', kilde: 'nve', arsak: `HTTP 400: ${JSON.stringify(noCell)}` }])
    expect(ctx.steder[0].nveNysnoSisteDognMm).toBeNull()
    expect(ctx.steder[0].snowScore.kind).toBe('score')
  })

  it('gives up on a call after the timeout, without a new attempt', async () => {
    // Like the real fetch, the fake only stops when the signal aborts.
    const { fetchFn: hang, calls } = fakeFetch(
      (_url, init) => new Promise((_resolve, reject) => init.signal?.addEventListener('abort', () => reject(init.signal?.reason))),
    )
    const { slept, sleep } = recordingSleep()
    const ctx = await fetchAll(contextFor(['a']), { fetchFn: hang, minIntervalMs: 0, timeoutMs: 10, sleep })
    expect(ctx.raw[0].feil).toEqual({ met: 'Tidsavbrudd etter 0.01 s', nve: 'Tidsavbrudd etter 0.01 s' })
    expect(calls).toHaveLength(2)
    expect(slept).toEqual([])
    expect(validate(ctx).avviste.map((a) => a.kilde)).toEqual(['met', 'nve'])
  })

  it('treats a 200 response that is not JSON as a failed call', async () => {
    const { fetchFn } = fakeFetch((url) => (isMet(url) ? new Response('<html>Maintenance</html>') : json(nveResponse())))
    const ctx = await fetchAll(contextFor(['a']), { fetchFn, minIntervalMs: 0 })
    expect(ctx.raw[0]).toMatchObject({ met: undefined, feil: { met: 'Svaret er ikke JSON' } })
  })

  it('passes invalid JSON on unchanged, so validate.ts rejects it and nothing is repaired', async () => {
    const broken = metResponse([{ precipitation: -1 }])
    const { fetchFn } = fakeFetch((url) => (isMet(url) ? json(broken) : json(nveResponse())))
    const ctx = await fetchAll(contextFor(['a']), { fetchFn, minIntervalMs: 0 })
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
    const ctx = await fetchAll(contextFor(ids), { fetchFn, minIntervalMs: 0 })

    expect(calls).toHaveLength(600)
    expect(highest).toEqual({ met: 5, nve: 5 })
    expect(ctx.raw.map((r) => r.stedId)).toEqual(ids)
  })
})

describe('startGate', () => {
  /** A fake clock whose sleep moves time forward by `ms`; the first sleep can end `early` ms too soon. */
  function fakeTime(early = 0) {
    const time = { now: 1000, slept: [] as number[] }
    const sleep = async (ms: number) => {
      time.slept.push(ms)
      time.now += time.slept.length === 1 ? ms - early : ms
    }
    return { time, sleep, now: () => time.now }
  }

  it('spaces starts at least the interval apart, also when callers arrive together', async () => {
    const { time, sleep, now } = fakeTime()
    const gate = startGate(100, sleep, now)
    const starts: number[] = []
    const call = async () => {
      await gate()
      starts.push(time.now)
    }

    await Promise.all([call(), call(), call()])
    expect(starts).toEqual([1000, 1100, 1200])

    // A caller after a quiet spell starts at once.
    time.now = 5000
    await call()
    expect(time.slept).toEqual([100, 100])
  })

  it('waits again when a timer fires early', async () => {
    const { time, sleep, now } = fakeTime(5)
    const gate = startGate(100, sleep, now)
    await gate()
    await gate()
    expect(time.now).toBeGreaterThanOrEqual(1100)
    expect(time.slept).toEqual([100, 5])
  })

  it('fails only the caller whose wait failed, and lets the next one through', async () => {
    const { time, now } = fakeTime()
    const gate = startGate(100, async (ms) => {
      time.slept.push(ms)
      if (time.slept.length === 1) throw new Error('timer broke')
      time.now += ms
    }, now)
    await gate()
    await expect(gate()).rejects.toThrow('timer broke')
    await expect(gate()).resolves.toBeUndefined()
  })
})

// In real time. The exact spacing is tested with the fake clock above; here the fake fetch is called
// a moment after the gate opens, and on a busy machine other work can delay one call by a few ms.
// So these check the span, which without the gate is about 1 ms for all calls.
describe('fetchAll call rate', () => {
  it('limits each source to 10 calls per second by default, half the 20 MET allows without an agreement', async () => {
    const metStarts: number[] = []
    const { fetchFn } = fakeFetch((url) => {
      if (isMet(url)) metStarts.push(performance.now())
      return defaultAnswer(url)
    })
    await fetchAll(contextFor(['a', 'b', 'c']), { fetchFn })

    expect(DEFAULT_MIN_INTERVAL_MS).toBe(100)
    // Two intervals: 200 ms, less the slack.
    expect(metStarts[2] - metStarts[0]).toBeGreaterThanOrEqual(150)
  })

  it('sends every new attempt through the gate, so retries never exceed the call rate', async () => {
    const metStarts: number[] = []
    const { fetchFn } = fakeFetch((url) => {
      if (!isMet(url)) return defaultAnswer(url)
      metStarts.push(performance.now())
      return new Response('', { status: 503 })
    })
    // No wait between attempts, so only the gate spaces them out.
    const { sleep } = recordingSleep()
    await fetchAll(contextFor(['a', 'b']), { fetchFn, minIntervalMs: 20, sleep })

    expect(metStarts).toHaveLength(6)
    // Five intervals: 100 ms, less the slack.
    expect(metStarts[5] - metStarts[0]).toBeGreaterThanOrEqual(75)
  })

  it('spreads the calls to each source out, even with free concurrency slots', async () => {
    const starts = { met: [] as number[], nve: [] as number[] }
    const { fetchFn } = fakeFetch((url) => {
      starts[isMet(url) ? 'met' : 'nve'].push(performance.now())
      return defaultAnswer(url)
    })
    await fetchAll(contextFor(['a', 'b', 'c', 'd', 'e', 'f']), { fetchFn, minIntervalMs: 20 })

    for (const times of [starts.met, starts.nve]) {
      expect(times).toHaveLength(6)
      // Five intervals: 100 ms, less the slack.
      expect(times[5] - times[0]).toBeGreaterThanOrEqual(75)
    }
  })
})
