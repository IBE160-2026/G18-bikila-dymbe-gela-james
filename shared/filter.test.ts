import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PublishedData } from './contracts/published'
import {
  aktiveKrav,
  FILTER_GRENSER,
  FILTER_KRAV,
  filtrerSteder,
  STANDARD_FILTER,
  type FilterParams,
  type Filtrerbar,
} from './filter'

// Story 3.1: the golden table locks the filter rules (FR-20, AD-6).

type GoldenSted = Filtrerbar & { id: string }
interface GoldenCase {
  navn: string
  filter: FilterParams
  forventet: string[]
}

const golden = JSON.parse(readFileSync(new URL('../tests/golden/filter.json', import.meta.url), 'utf8')) as {
  grenser: string
  steder: GoldenSted[]
  tilfeller: GoldenCase[]
}

const ids = (steder: { id: string }[]) => steder.map(({ id }) => id)

describe('filtrerSteder golden table', () => {
  it.each(golden.tilfeller.map((c) => [c.navn, c] as const))('%s', (_navn, testCase) => {
    expect(ids(filtrerSteder(golden.steder, testCase.filter))).toEqual(testCase.forventet)
  })
})

describe('aktiveKrav', () => {
  it('counts only limits that are set and away from the "no limit" end', () => {
    expect(aktiveKrav(STANDARD_FILTER)).toEqual([])
    expect(aktiveKrav({ minNysnoCm: 0, maksVindMs: 25, maksTemperaturC: 10 })).toEqual([])
    expect(aktiveKrav({ minNysnoCm: 1, maksVindMs: 24, maksTemperaturC: 9 })).toEqual(['minNysnoCm', 'maksVindMs', 'maksTemperaturC'])
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
    const treff = filtrerSteder(demo.steder, { minNysnoCm: 2, maksVindMs: null, maksTemperaturC: 0 })
    expect(ids(treff).sort()).toEqual(['galdhopiggen', 'gaustatoppen', 'jiehkkevarri', 'oksskolten', 'oppdal-skisenter', 'rondeslottet'])
  })

  it('filters 300 places far below the 2 s of NFR-1', () => {
    const steder = Array.from({ length: 300 }, (_, i) => demo.steder[i % demo.steder.length])
    const start = performance.now()
    const treff = filtrerSteder(steder, { minNysnoCm: 2, maksVindMs: 10, maksTemperaturC: 0 })
    const ms = performance.now() - start
    expect(treff.length).toBeGreaterThan(0)
    expect(ms).toBeLessThan(200)
  })
})
