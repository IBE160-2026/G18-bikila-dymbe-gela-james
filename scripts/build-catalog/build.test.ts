import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Catalog } from '../../shared/contracts/catalog'
import {
  dedupe,
  finalize,
  needsKommune,
  resolveSeed,
  round4,
  SeedsSchema,
  selectSkiResorts,
  slugify,
  type Candidate,
  type OsmElement,
  type StedsnavnHit,
} from './build'
import { getJson, mapLimit, type HttpDeps } from './http'
import { fetchSkiResorts } from './osm'

// No network in tests: every source answer below is a small inline sample.

const GENERERT = new Date('2026-10-07T12:00:00.000Z')

function osm(id: number, name: string, lat: number, lon: number, tags: Record<string, string> = {}): OsmElement {
  return { type: 'way', id, center: { lat, lon }, tags: { landuse: 'winter_sports', name, ...tags } }
}

function hit(overrides: Partial<StedsnavnHit> & { navn: string; kommune: string }): StedsnavnHit {
  const { navn, kommune, ...rest } = overrides
  return {
    navneobjekttype: 'Fjell',
    stedsnummer: 1,
    stedstatus: 'aktiv',
    representasjonspunkt: { nord: 61.63644, øst: 8.31248 },
    kommuner: [{ kommunenavn: kommune }],
    stedsnavn: [{ skrivemåte: navn }],
    ...rest,
  }
}

function heightsFor(candidates: Candidate[], height = 500): Map<Candidate, number | undefined> {
  return new Map(candidates.map((c) => [c, height]))
}

describe('slugify and rounding', () => {
  it('maps Norwegian letters and other characters', () => {
    expect(slugify('Store Skagastølstind')).toBe('store-skagastolstind')
    expect(slugify('Ålesund')).toBe('alesund')
    expect(slugify('Mo i Rana')).toBe('mo-i-rana')
    expect(slugify('Kvitfjell / Ærøy')).toBe('kvitfjell-aeroy')
    expect(slugify('Kárášjohka')).toBe('karasjohka')
    expect(slugify('Čáhppesđuottar Ŋuorggam Ŧ')).toBe('cahppesduottar-nuorggam-t')
  })

  it('rounds to four decimals', () => {
    expect(round4(61.63644)).toBe(61.6364)
    expect(round4(8.31248)).toBe(8.3125)
  })
})

describe('normal run', () => {
  it('builds a sorted, valid catalog from all sources', () => {
    const resorts = selectSkiResorts(
      [osm(1, 'Hafjell', 61.2342, 10.4286, { wikidata: 'Q1' }), osm(2, 'Trysilfjellet', 61.3167, 12.2167)],
      { antall: 150, ekskluder: [], inkluder: [] },
    )
    const peak = resolveSeed({ navn: 'Galdhøpiggen', type: 'fjelltopp', kommune: 'Lom' }, [
      hit({ navn: 'Galdhøpiggen', kommune: 'Lom' }),
    ])
    expect(peak.ok).toBe(true)
    const candidates = [...resorts.selected, ...(peak.ok ? [peak.candidate] : [])]

    const { catalog, rejected } = finalize(dedupe(candidates).kept, heightsFor(candidates), GENERERT)

    expect(rejected).toEqual([])
    expect(catalog.generert).toBe('2026-10-07T12:00:00Z')
    expect(catalog.steder.map((s) => s.id)).toEqual(['galdhopiggen', 'hafjell', 'trysilfjellet'])
    expect(catalog.steder[0]).toEqual({
      id: 'galdhopiggen',
      navn: 'Galdhøpiggen',
      lat: 61.6364,
      lon: 8.3125,
      hoyde: 500,
      type: 'fjelltopp',
      kilde: 'kartverket',
    })
    expect(Catalog.safeParse(catalog).success).toBe(true)
  })

  it('ranks ski resorts by wikidata/website, then piste:type, then name, and applies ekskluder/inkluder', () => {
    const elements = [
      osm(1, 'Aaa', 60.1, 10.1),
      osm(2, 'Bbb', 60.2, 10.2, { 'piste:type': 'downhill' }),
      osm(3, 'Ccc', 60.3, 10.3, { website: 'https://ccc.no' }),
      osm(4, 'Ddd', 60.4, 10.4, { wikidata: 'Q4' }),
      osm(5, 'Eee', 60.5, 10.5),
    ]
    const ranked = selectSkiResorts(elements, { antall: 3, ekskluder: [], inkluder: [] })
    expect(ranked.selected.map((c) => c.navn)).toEqual(['Ccc', 'Ddd', 'Bbb'])

    const curated = selectSkiResorts(elements, { antall: 3, ekskluder: ['Ccc'], inkluder: ['Eee'] })
    expect(curated.selected.map((c) => c.navn)).toEqual(['Eee', 'Ddd', 'Bbb'])
  })

  it('reports inkluder names missing from OSM', () => {
    const result = selectSkiResorts([osm(1, 'Hafjell', 61.23, 10.43)], {
      antall: 10,
      ekskluder: ['Finnes ikke'],
      inkluder: ['Kvitfjell'],
    })
    expect(result.missingIncludes).toEqual(['Kvitfjell'])
    expect(result.unusedExcludes).toEqual(['Finnes ikke'])
  })

  it('accepts the committed seeds.json', () => {
    const seeds = SeedsSchema.parse(JSON.parse(readFileSync(new URL('./seeds.json', import.meta.url), 'utf8')))
    expect(seeds.steder.filter((s) => s.type === 'fjelltopp')).toHaveLength(100)
    expect(seeds.steder.filter((s) => s.type === 'by')).toHaveLength(50)
    const keys = seeds.steder.map((s) => `${s.type}:${s.navn}:${s.kommune}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('Overpass busy', () => {
  const html = '<?xml version="1.0"?><html><body>Dispatcher_Client::request_read_and_idx::timeout</body></html>'

  function fakeDeps(answers: (() => Response)[]): HttpDeps & { calls: string[]; sleeps: number[] } {
    const calls: string[] = []
    const sleeps: number[] = []
    return {
      calls,
      sleeps,
      fetch: async (url) => {
        calls.push(url)
        const next = answers.shift()
        if (!next) throw new Error('no more answers')
        return next()
      },
      sleep: async (ms) => {
        sleeps.push(ms)
      },
    }
  }

  it('retries with growing delays, then moves on to the next mirror', async () => {
    const deps = fakeDeps([
      () => new Response(html, { status: 200 }),
      () => new Response('busy', { status: 504 }),
      () => {
        throw new TypeError('fetch failed')
      },
      () => new Response(JSON.stringify({ elements: [osm(1, 'Hafjell', 61.23, 10.43)] }), { status: 200 }),
    ])
    const elements = await fetchSkiResorts(deps, { mirrors: ['https://a', 'https://b'], baseDelayMs: 10 })
    expect(elements).toHaveLength(1)
    expect(deps.calls).toEqual(['https://a', 'https://a', 'https://a', 'https://b'])
    expect(deps.sleeps).toEqual([10, 20])
  })

  it('fails with a clear message when every mirror fails', async () => {
    const deps = fakeDeps(Array.from({ length: 4 }, () => () => new Response(html, { status: 200 })))
    await expect(
      fetchSkiResorts(deps, { mirrors: ['https://a', 'https://b'], attemptsPerMirror: 2, baseDelayMs: 1 }),
    ).rejects.toThrow(/Overpass svarte ikke på noe speil/)
  })

  it('treats a partial result with a runtime-error remark as a failure', async () => {
    const deps = fakeDeps([
      () => new Response(JSON.stringify({ elements: [], remark: 'runtime error: Query timed out' }), { status: 200 }),
    ])
    await expect(fetchSkiResorts(deps, { mirrors: ['https://a'], attemptsPerMirror: 1 })).rejects.toThrow(/timed out/)
  })

  it('getJson retries 5xx but not 4xx', async () => {
    const retried = fakeDeps([() => new Response('', { status: 503 }), () => new Response('{"ok":1}')])
    await expect(getJson('https://k', retried, 3, 5)).resolves.toEqual({ ok: 1 })
    expect(retried.sleeps).toEqual([5])

    const notFound = fakeDeps([() => new Response('', { status: 404 })])
    await expect(getJson('https://k', notFound, 3, 5)).rejects.toThrow(/HTTP 404/)
    expect(notFound.calls).toHaveLength(1)
  })

  it('mapLimit keeps order and never exceeds the limit', async () => {
    let inFlight = 0
    let maxInFlight = 0
    const result = await mapLimit([1, 2, 3, 4, 5, 6], 2, async (n) => {
      inFlight++
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 1))
      inFlight--
      return n * 10
    })
    expect(result).toEqual([10, 20, 30, 40, 50, 60])
    expect(maxInFlight).toBe(2)
  })
})

describe('name not found', () => {
  it('fails when Kartverket has no hit of the right type in the municipality', () => {
    const result = resolveSeed({ navn: 'Galdhøpiggen', type: 'fjelltopp', kommune: 'Vågå' }, [
      hit({ navn: 'Galdhøpiggen', kommune: 'Lom' }),
    ])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/Vågå.*fant: Fjell i Lom/)
  })

  it('fails when only a different object type matches', () => {
    const result = resolveSeed({ navn: 'Molde', type: 'by', kommune: 'Molde' }, [
      hit({ navn: 'Molde', kommune: 'Molde', navneobjekttype: 'Gard' }),
    ])
    expect(result.ok).toBe(false)
  })
})

describe('ambiguous name', () => {
  const lom = hit({ navn: 'Galdhøpiggen', kommune: 'Lom', stedsnummer: 313058 })
  const porsgrunn = hit({
    navn: 'Galdhøpiggen',
    kommune: 'Porsgrunn',
    navneobjekttype: 'Topp',
    stedsnummer: 653562,
    representasjonspunkt: { nord: 59.18303, øst: 9.85987 },
  })

  it('picks the hit with the right type and municipality', () => {
    const result = resolveSeed({ navn: 'Galdhøpiggen', type: 'fjelltopp', kommune: 'Lom' }, [
      lom,
      porsgrunn,
      hit({ navn: 'Galdhøpiggen', kommune: 'Lom', navneobjekttype: 'Gard', stedsnummer: 9 }),
    ])
    expect(result).toEqual({
      ok: true,
      candidate: { navn: 'Galdhøpiggen', lat: 61.6364, lon: 8.3125, type: 'fjelltopp', kilde: 'kartverket', kommune: 'Lom' },
    })
  })

  it('matches Sami municipality names and prefers active over historic names', () => {
    const result = resolveSeed({ navn: 'Karasjok', type: 'by', kommune: 'Karasjok' }, [
      hit({
        navn: 'Kárášjohka',
        kommune: 'Kárášjohka - Karasjok',
        navneobjekttype: 'Tettsted',
        stedsnavn: [{ skrivemåte: 'Kárášjohka' }, { skrivemåte: 'Karasjok' }],
        representasjonspunkt: { nord: 69.4719, øst: 25.5112 },
      }),
      hit({ navn: 'Karasjok', kommune: 'Karasjok', navneobjekttype: 'Tettsted', stedstatus: 'relikt', stedsnummer: 2 }),
    ])
    expect(result.ok && result.candidate.lat).toBe(69.4719)
  })

  it('fails when still ambiguous, and stedsnummer in the seed resolves it', () => {
    const twoInSurnadal = [
      hit({ navn: 'Snota', kommune: 'Surnadal', stedsnummer: 923132, representasjonspunkt: { nord: 62.848, øst: 9.095 } }),
      hit({ navn: 'Snota', kommune: 'Surnadal', stedsnummer: 437024, representasjonspunkt: { nord: 62.858, øst: 9.096 } }),
    ]
    const ambiguous = resolveSeed({ navn: 'Snota', type: 'fjelltopp', kommune: 'Surnadal' }, twoInSurnadal)
    expect(ambiguous.ok).toBe(false)
    if (!ambiguous.ok) expect(ambiguous.reason).toMatch(/flertydig.*923132, 437024/)

    const picked = resolveSeed(
      { navn: 'Snota', type: 'fjelltopp', kommune: 'Surnadal', stedsnummer: 923132 },
      twoInSurnadal,
    )
    expect(picked.ok && picked.candidate.lat).toBe(62.848)
  })
})

describe('duplicates', () => {
  const peak: Candidate = { navn: 'Gaustatoppen', lat: 59.8541, lon: 8.6489, type: 'fjelltopp', kilde: 'kartverket', kommune: 'Tinn' }

  it('keeps one place when two sources report the same place', () => {
    const fromOsm: Candidate = { navn: 'Gaustatoppen', lat: 59.85, lon: 8.65, type: 'skisted', kilde: 'osm' }
    const sameCoords: Candidate = { navn: 'Gausta', lat: 59.8541, lon: 8.6489, type: 'skisted', kilde: 'osm' }
    const { kept, duplicates } = dedupe([fromOsm, sameCoords, peak])
    expect(kept).toEqual([peak])
    expect(duplicates.map((d) => d.dropped)).toEqual([fromOsm, sameCoords])
  })

  it('collapses one OSM resort mapped twice under the same name', () => {
    const result = selectSkiResorts(
      [osm(1, 'Storhogna', 62.12, 11.1), osm(2, 'Storhogna', 62.13, 11.11, { wikidata: 'Q2' })],
      { antall: 10, ekskluder: [], inkluder: [] },
    )
    expect(result.selected).toHaveLength(1)
    expect(result.selected[0].lat).toBe(62.13)
  })

  it('treats differently named OSM areas closer than 1 km as one resort, keeping the better ranked', () => {
    const result = selectSkiResorts(
      [
        osm(1, 'Alphapark', 60.6500, 6.4300),
        osm(2, 'Voss Resort Fjellheisar', 60.6530, 6.4350, { website: 'https://vossresort.no' }),
        osm(3, 'Annet sted', 60.6700, 6.4300),
      ],
      { antall: 10, ekskluder: [], inkluder: [] },
    )
    expect(result.selected.map((c) => c.navn)).toEqual(['Voss Resort Fjellheisar', 'Annet sted'])
  })

  it('applies ekskluder before merging nearby areas, and inkluder wins the merge', () => {
    const elements = [
      osm(1, 'Ringkollen skistadion', 60.1690, 10.4300, { 'piste:type': 'nordic' }),
      osm(2, 'Ringkollen alpinbakke', 60.1700, 10.4380),
    ]
    const excluded = selectSkiResorts(elements, { antall: 10, ekskluder: ['Ringkollen skistadion'], inkluder: [] })
    expect(excluded.selected.map((c) => c.navn)).toEqual(['Ringkollen alpinbakke'])
    const included = selectSkiResorts(elements, { antall: 10, ekskluder: [], inkluder: ['Ringkollen alpinbakke'] })
    expect(included.selected.map((c) => c.navn)).toEqual(['Ringkollen alpinbakke'])
  })

  it('adds the municipality to colliding slugs', () => {
    const a: Candidate = { navn: 'Storhogna', lat: 62.1234, lon: 11.1234, type: 'skisted', kilde: 'osm' }
    const b: Candidate = { navn: 'Storhøgna', lat: 61.0, lon: 10.0, type: 'fjelltopp', kilde: 'kartverket', kommune: 'Ringebu' }
    const { kept } = dedupe([a, b])
    expect(needsKommune(kept)).toEqual([a])

    const withKommune = kept.map((c) => (c === a ? { ...a, kommune: 'Engerdal' } : c))
    const { catalog } = finalize(withKommune, heightsFor(withKommune), GENERERT)
    expect(catalog.steder.map((s) => s.id)).toEqual(['storhogna-engerdal', 'storhogna-ringebu'])
  })

  it('lets the schema reject a duplicate id that could not be resolved', () => {
    const a: Candidate = { navn: 'Storhogna', lat: 62.1234, lon: 11.1234, type: 'skisted', kilde: 'osm' }
    const b: Candidate = { navn: 'Storhogna', lat: 61.0, lon: 10.0, type: 'skisted', kilde: 'osm' }
    expect(() => finalize([a, b], heightsFor([a, b]), GENERERT)).toThrow(/Duplikat id/)
  })
})

describe('invalid values', () => {
  it('rejects places outside the Norway box or without height, and reports why', () => {
    const ok: Candidate = { navn: 'Hafjell', lat: 61.2342, lon: 10.4286, type: 'skisted', kilde: 'osm' }
    const sweden: Candidate = { navn: 'Åre', lat: 63.3990, lon: 32.0, type: 'skisted', kilde: 'osm' }
    const noHeight: Candidate = { navn: 'Tåke', lat: 62.0, lon: 9.0, type: 'fjelltopp', kilde: 'kartverket' }
    const inSea: Candidate = { navn: 'Havet', lat: 62.7, lon: 7.1, type: 'by', kilde: 'kartverket' }
    const heights = new Map<Candidate, number | undefined>([
      [ok, 830.4],
      [sweden, 400],
      [noHeight, undefined],
      [inSea, -174.4],
    ])

    const { catalog, rejected } = finalize([ok, sweden, noHeight, inSea], heights, GENERERT)

    expect(catalog.steder.map((s) => [s.id, s.hoyde])).toEqual([['hafjell', 830]])
    expect(rejected.map((r) => r.navn)).toEqual(['Åre', 'Tåke', 'Havet'])
    expect(rejected[0].reason).toMatch(/utenfor Norge/)
    expect(rejected[1].reason).toMatch(/mangler høyde/)
    expect(rejected[2].reason).toMatch(/hoyde/)
  })

  it('rejects OSM ski resorts outside the Norway box before they take a slot', () => {
    const result = selectSkiResorts(
      [osm(1, 'Svalbard-bakke', 78.2163, 15.657, { wikidata: 'Q9' }), osm(2, 'Hafjell', 61.2342, 10.4286)],
      { antall: 1, ekskluder: [], inkluder: [] },
    )
    expect(result.selected.map((c) => c.navn)).toEqual(['Hafjell'])
    expect(result.rejected[0].reason).toMatch(/utenfor Norge/)
  })

  it('rejects OSM elements without coordinates', () => {
    const result = selectSkiResorts([{ type: 'relation', id: 9, tags: { name: 'Uten senter' } }], {
      antall: 10,
      ekskluder: [],
      inkluder: [],
    })
    expect(result.selected).toEqual([])
    expect(result.rejected[0].reason).toMatch(/koordinater/)
  })
})
