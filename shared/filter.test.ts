import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PublishedData } from './contracts/published'
import {
  aktiveKrav,
  FILTER_GRENSER,
  FILTER_KRAV,
  filtrerSteder,
  forslagVedNullTreff,
  HURTIGVALG,
  parseFilter,
  serializeFilter,
  STANDARD_FILTER,
  type FilterParams,
  type Filtrerbar,
  type Forslag,
} from './filter'

// Story 3.1: the golden table locks the filter rules (FR-20, AD-6). Story 3.3 adds the suggestion at zero hits (FR-14).

type GoldenSted = Filtrerbar & { id: string }
interface GoldenCase {
  navn: string
  filter: FilterParams
  forventet: string[]
  /** Only on cases with zero hits; `null` means no single change helps, so the app offers «Nullstill». */
  forventetForslag?: Forslag | null
}

const golden = JSON.parse(readFileSync(new URL('../tests/golden/filter.json', import.meta.url), 'utf8')) as {
  grenser: string
  forslag: string
  /** Story 3.6: the fixed position every golden case is evaluated from. Posisjon only matters to a case
   * that actually sets `maksAvstandKm`; the others are unaffected by passing it along too. */
  brukerposisjon: { lat: number; lon: number }
  steder: GoldenSted[]
  tilfeller: GoldenCase[]
}

const ids = (steder: { id: string }[]) => steder.map(({ id }) => id)

describe('filtrerSteder golden table', () => {
  it.each(golden.tilfeller.map((c) => [c.navn, c] as const))('%s', (_navn, testCase) => {
    expect(ids(filtrerSteder(golden.steder, testCase.filter, golden.brukerposisjon))).toEqual(testCase.forventet)
  })
})

describe('forslagVedNullTreff golden table', () => {
  it('has an expected suggestion on every case with zero hits, and none on the others', () => {
    for (const testCase of golden.tilfeller) {
      expect('forventetForslag' in testCase, testCase.navn).toBe(testCase.forventet.length === 0)
    }
  })

  it.each(golden.tilfeller.map((c) => [c.navn, c] as const))('%s', (_navn, testCase) => {
    expect(forslagVedNullTreff(golden.steder, testCase.filter, golden.brukerposisjon)).toEqual(testCase.forventetForslag ?? null)
  })

  it('gives a suggestion that, applied, shows exactly its number of places', () => {
    for (const { filter, forventetForslag } of golden.tilfeller) {
      if (!forventetForslag) continue
      const { krav, verdi, antall } = forventetForslag
      expect(filtrerSteder(golden.steder, { ...filter, [krav]: verdi }, golden.brukerposisjon)).toHaveLength(antall)
    }
  })
})

// Story 3.6 (FR-23, NFR-Privacy): without a known position the distance requirement has no effect at
// all, unlike a place that is missing a value for one of the other requirements.
describe('maksAvstandKm without a known position', () => {
  it('hides nothing, even though every place but one is far beyond the active limit', () => {
    const aktiv = { ...STANDARD_FILTER, maksAvstandKm: 10 }
    expect(ids(filtrerSteder(golden.steder, aktiv))).toEqual(ids(golden.steder))
    expect(ids(filtrerSteder(golden.steder, aktiv, undefined))).toEqual(ids(golden.steder))
  })

  it('never suggests easing it, since easing a no-op requirement can never add a place', () => {
    const ingenTreff = { ...STANDARD_FILTER, minNysnoCm: 30 }
    // Same zero-hit filter as the golden table's «Null treff» case, but with the distance requirement
    // also active and no position known: the suggestion must still be about new snow, not distance.
    expect(forslagVedNullTreff(golden.steder, { ...ingenTreff, maksAvstandKm: 10 })).toEqual({
      krav: 'minNysnoCm',
      verdi: 12,
      antall: 1,
    })
  })
})

describe('forslagVedNullTreff', () => {
  const sted = (nysnoCm: number, vindMaks: number): Filtrerbar => ({
    nysnoCm,
    vindMaks,
    temperatur: 0,
    skydekkeDagslys: 0,
    lat: 60,
    lon: 10,
  })
  const UTEN_AVSTAND = { maksSkydekkeDagslys: null, maksAvstandKm: null } as const

  it('prefers the requirement that gives the most places over the one that needs fewer steps', () => {
    // Easing new snow 3 steps to 2 cm gives one place; easing wind 15 steps to 20 m/s gives two.
    const steder = [sted(10, 20), sted(10, 20), sted(2, 5)]
    expect(forslagVedNullTreff(steder, { minNysnoCm: 5, maksVindMs: 5, maksTemperaturC: null, ...UTEN_AVSTAND })).toEqual({
      krav: 'maksVindMs',
      verdi: 20,
      antall: 2,
    })
  })

  it('skips a place without the value while easing, and counts it only once the requirement is removed', () => {
    // The golden places cannot show this: «dyp» meets every limit the others meet, so a walk stops before «Alle».
    const steder: Filtrerbar[] = [{ nysnoCm: null, vindMaks: 5, temperatur: 0, skydekkeDagslys: 0, lat: 60, lon: 10 }, sted(2, 20)]
    expect(forslagVedNullTreff(steder, { minNysnoCm: 5, maksVindMs: 5, maksTemperaturC: null, ...UTEN_AVSTAND })).toEqual({
      krav: 'minNysnoCm',
      verdi: null,
      antall: 1,
    })
  })

  it('returns, without hanging, for a limit the slider cannot set', () => {
    expect(forslagVedNullTreff([sted(10, 5)], { minNysnoCm: Number.NaN, maksVindMs: null, maksTemperaturC: null, ...UTEN_AVSTAND })).toBeNull()
    expect(forslagVedNullTreff([sted(10, 5)], { minNysnoCm: Number.NaN, maksVindMs: 4, maksTemperaturC: null, ...UTEN_AVSTAND })).toBeNull()
    expect(forslagVedNullTreff([sted(10, 5)], { minNysnoCm: Infinity, maksVindMs: null, maksTemperaturC: null, ...UTEN_AVSTAND })).toBeNull()
  })

  it('gives no suggestion when there are places, or no places at all', () => {
    expect(forslagVedNullTreff([sted(10, 5)], { minNysnoCm: 5, maksVindMs: null, maksTemperaturC: null, ...UTEN_AVSTAND })).toBeNull()
    expect(forslagVedNullTreff([], { minNysnoCm: 5, maksVindMs: null, maksTemperaturC: null, ...UTEN_AVSTAND })).toBeNull()
  })
})

// Story 3.4 (FR-15): the quick picks fill the whole filter in one action with a fixed, documented combination.
describe('HURTIGVALG', () => {
  it('has only valid slider values: each set requirement is within its range and on one of its steps', () => {
    for (const { navn, verdier } of HURTIGVALG) {
      for (const krav of FILTER_KRAV) {
        const verdi = verdier[krav]
        if (verdi === null) continue
        const { min, max, steg } = FILTER_GRENSER[krav]
        expect(verdi, `${navn} ${krav}`).toBeGreaterThanOrEqual(min)
        expect(verdi, `${navn} ${krav}`).toBeLessThanOrEqual(max)
        expect((verdi - min) % steg, `${navn} ${krav}`).toBe(0)
      }
    }
  })

  it('round-trips through the address unchanged, so a shared quick-pick link restores it exactly', () => {
    for (const { navn, verdier } of HURTIGVALG) {
      const query = new URLSearchParams(serializeFilter(verdier)).toString()
      expect(parseFilter(new URLSearchParams(query)), navn).toEqual(verdier)
    }
  })
})

describe('aktiveKrav', () => {
  it('counts only limits that are set and away from the "no limit" end', () => {
    expect(aktiveKrav(STANDARD_FILTER)).toEqual([])
    expect(aktiveKrav({ minNysnoCm: 0, maksVindMs: 25, maksTemperaturC: 10, maksSkydekkeDagslys: 100, maksAvstandKm: 200 })).toEqual([])
    expect(aktiveKrav({ minNysnoCm: 1, maksVindMs: 24, maksTemperaturC: 9, maksSkydekkeDagslys: 90, maksAvstandKm: 190 })).toEqual([
      'minNysnoCm',
      'maksVindMs',
      'maksTemperaturC',
      'maksSkydekkeDagslys',
      'maksAvstandKm',
    ])
    expect(aktiveKrav({ ...STANDARD_FILTER, maksTemperaturC: -20 })).toEqual(['maksTemperaturC'])
  })

  it('puts every default at the end of its range', () => {
    for (const krav of FILTER_KRAV) {
      const { min, max, standard } = FILTER_GRENSER[krav]
      expect([min, max], krav).toContain(standard)
    }
  })
})

describe('filtrerSteder on the demo data', () => {
  const demo = PublishedData.parse(
    JSON.parse(readFileSync(new URL('../public/data/demo.json', import.meta.url), 'utf8')),
  )

  it('keeps the six places with at least 2 cm new snow and at most 0 °C', () => {
    const treff = filtrerSteder(demo.steder, { minNysnoCm: 2, maksVindMs: null, maksTemperaturC: 0, maksSkydekkeDagslys: null, maksAvstandKm: null })
    expect(ids(treff).sort()).toEqual(['galdhopiggen', 'gaustatoppen', 'jiehkkevarri', 'oksskolten', 'oppdal-skisenter', 'rondeslottet'])
  })

  it('suggests 12 cm for at least 13 cm new snow, which gives Trysil', () => {
    const filter: FilterParams = { minNysnoCm: 13, maksVindMs: null, maksTemperaturC: null, maksSkydekkeDagslys: null, maksAvstandKm: null }
    expect(forslagVedNullTreff(demo.steder, filter)).toEqual({ krav: 'minNysnoCm', verdi: 12, antall: 1 })
    expect(ids(filtrerSteder(demo.steder, { ...filter, minNysnoCm: 12 }))).toEqual(['trysil'])
  })

  it('keeps the four places within 150 km of a position near Oslo, combined with new snow', () => {
    // Story 3.6: a day-trip scenario (Oslo, 59.9139° N 10.7522° E). The same position and span the
    // network E2E test uses, so the two stay consistent with each other.
    const posisjon = { lat: 59.9139, lon: 10.7522 }
    const filter: FilterParams = { ...STANDARD_FILTER, maksAvstandKm: 150 }
    expect(ids(filtrerSteder(demo.steder, filter, posisjon)).sort()).toEqual(['gaustatoppen', 'hafjell', 'lillehammer', 'oslo'])
    // Trysil has more new snow but lies 174 km away, just outside the span: only Gaustatoppen (10 cm)
    // is both close enough and snowy enough.
    expect(ids(filtrerSteder(demo.steder, { ...filter, minNysnoCm: 5 }, posisjon))).toEqual(['gaustatoppen'])
  })

  it('suggests 20 % for cloud cover in daylight at most 0 %, which gives Bergen (11,2 %)', () => {
    const filter: FilterParams = { ...STANDARD_FILTER, maksSkydekkeDagslys: 0 }
    expect(filtrerSteder(demo.steder, filter)).toEqual([])
    expect(forslagVedNullTreff(demo.steder, filter)).toEqual({ krav: 'maksSkydekkeDagslys', verdi: 20, antall: 1 })
    expect(ids(filtrerSteder(demo.steder, { ...filter, maksSkydekkeDagslys: 20 }))).toEqual(['bergen'])
  })

  it('filters 300 places far below the 2 s of NFR-1', () => {
    const steder = Array.from({ length: 300 }, (_, i) => demo.steder[i % demo.steder.length])
    const start = performance.now()
    const treff = filtrerSteder(steder, { minNysnoCm: 2, maksVindMs: 10, maksTemperaturC: 0, maksSkydekkeDagslys: null, maksAvstandKm: null })
    const ms = performance.now() - start
    expect(treff.length).toBeGreaterThan(0)
    expect(ms).toBeLessThan(200)
  })
})

describe('parseFilter and serializeFilter', () => {
  const parse = (query: string) => parseFilter(new URLSearchParams(query))
  const query = (params: FilterParams) => new URLSearchParams(serializeFilter(params)).toString()

  it('round-trips every step of every range, with the default end as «Alle»', () => {
    for (const krav of FILTER_KRAV) {
      const { min, max, steg, standard } = FILTER_GRENSER[krav]
      for (let verdi = min; verdi <= max; verdi += steg) {
        const params: FilterParams = { ...STANDARD_FILTER, [krav]: verdi === standard ? null : verdi }
        expect(parse(query(params)), `${krav}=${verdi}`).toEqual(params)
      }
    }
  })

  it('round-trips a filter with all five requirements set', () => {
    // The cloud cover in daylight goes after `temp` (Story 3.5), and distance last of all (Story 3.6).
    const params: FilterParams = { minNysnoCm: 5, maksVindMs: 10, maksTemperaturC: -2, maksSkydekkeDagslys: 60, maksAvstandKm: 80 }
    expect(query(params)).toBe('nysno=5&vind=10&temp=-2&sky=60&avstand=80')
    expect(parse(query(params))).toEqual(params)
  })

  it('reads `sky` on its own', () => {
    expect(parse('sky=60')).toEqual({ ...STANDARD_FILTER, maksSkydekkeDagslys: 60 })
  })

  it('turns a cloud cover off its steps of 10, or outside 0–100, into «Alle»', () => {
    for (const ugyldig of ['sky=65', 'sky=abc', 'sky=110', 'sky=-10', 'sky=100', 'sky=60&sky=70']) {
      expect(parse(`${ugyldig}&temp=0`), ugyldig).toEqual({ ...STANDARD_FILTER, maksTemperaturC: 0 })
    }
    expect(parse('sky=0').maksSkydekkeDagslys).toBe(0)
  })

  it('writes only active requirements, in panel order, so one filter gives one address', () => {
    expect(serializeFilter(STANDARD_FILTER)).toEqual([])
    expect(
      serializeFilter({ minNysnoCm: 0, maksVindMs: 25, maksTemperaturC: 10, maksSkydekkeDagslys: 100, maksAvstandKm: 200 }),
    ).toEqual([])
    expect(
      serializeFilter({ maksSkydekkeDagslys: null, maksTemperaturC: 0, maksVindMs: null, minNysnoCm: 2, maksAvstandKm: null }),
    ).toEqual([
      ['nysno', '2'],
      ['temp', '0'],
    ])
    expect(serializeFilter({ ...STANDARD_FILTER, maksAvstandKm: 150 })).toEqual([['avstand', '150']])
  })

  it('reads `avstand` on its own, and off its steps of 10 or outside 0–200 into «Alle»', () => {
    expect(parse('avstand=150')).toEqual({ ...STANDARD_FILTER, maksAvstandKm: 150 })
    for (const ugyldig of ['avstand=155', 'avstand=abc', 'avstand=210', 'avstand=-10', 'avstand=200', 'avstand=100&avstand=120']) {
      expect(parse(`${ugyldig}&temp=0`), ugyldig).toEqual({ ...STANDARD_FILTER, maksTemperaturC: 0 })
    }
    expect(parse('avstand=0').maksAvstandKm).toBe(0)
  })

  it('reads the parameters in any order', () => {
    expect(parse('temp=0&nysno=2')).toEqual({ minNysnoCm: 2, maksVindMs: null, maksTemperaturC: 0, maksSkydekkeDagslys: null, maksAvstandKm: null })
  })

  it('turns a value the panel could not have set into «Alle», and keeps the other requirements', () => {
    const tilfeller: [string, string][] = [
      ['text', 'nysno=abc'],
      ['a decimal', 'nysno=2.5'],
      ['a decimal comma', 'nysno=2,5'],
      ['an exponent', 'nysno=1e1'],
      ['below the range', 'nysno=-1'],
      ['above the range', 'nysno=31'],
      ['empty', 'nysno='],
      ['whitespace', 'nysno=%202'],
      ['the same parameter twice', 'nysno=2&nysno=3'],
    ]
    for (const [navn, ugyldig] of tilfeller) {
      expect(parse(`${ugyldig}&temp=0`), navn).toEqual({ ...STANDARD_FILTER, maksTemperaturC: 0 })
    }
    expect(parse('nysno=abc&vind=99&temp=0')).toEqual({ ...STANDARD_FILTER, maksTemperaturC: 0 })
    expect(parse('vind=-1&temp=-21')).toEqual(STANDARD_FILTER)
  })

  it('reads the default end and "-0" as the slider would set them', () => {
    expect(parse('nysno=0&vind=25&temp=10&sky=100&avstand=200')).toEqual(STANDARD_FILTER)
    expect(parse('nysno=-0')).toEqual(STANDARD_FILTER)
    expect(Object.is(parse('temp=-0').maksTemperaturC, 0)).toBe(true)
    expect(parse('temp=05').maksTemperaturC).toBe(5)
  })

  it('ignores unknown parameters', () => {
    expect(parse('visning=liste&sortering=navn&annet=1')).toEqual(STANDARD_FILTER)
  })
})
