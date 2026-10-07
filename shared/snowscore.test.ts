import { readFileSync } from 'node:fs'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { computeSnowScore, mmToCm, snowFraction, type HourlyValue, type SnowScoreResult } from './snowscore'

interface GoldenCase {
  navn: string
  timer: HourlyValue[]
  forventet:
    | {
        kind: 'score'
        a: number
        b: number
        c: number
        score: number
        newSnowMm: number
        precipitationMm: number
        meanTemperatureC: number
      }
    | { kind: 'incomplete'; missingShare: number }
}

const golden = JSON.parse(
  readFileSync(new URL('../tests/golden/snowscore.json', import.meta.url), 'utf8'),
) as { grenser: string; tilfeller: GoldenCase[] }

const TOLERANCE = 1e-9
const RUNS = { numRuns: 1000 }

const precipitation = fc.double({ min: 0, max: 30, noNaN: true, noDefaultInfinity: true })
const temperature = fc.double({ min: -40, max: 20, noNaN: true, noDefaultInfinity: true })
const completeHour = fc.record({ precipitationMm: precipitation, temperatureC: temperature })
const completeHours = fc.array(completeHour, { minLength: 1, maxLength: 48 })
const anyHours = fc.array(
  fc.record({
    precipitationMm: fc.option(precipitation, { freq: 20 }),
    temperatureC: fc.option(temperature, { freq: 20 }),
  }),
  { maxLength: 48 },
)

function expectScore(result: SnowScoreResult): Extract<SnowScoreResult, { kind: 'score' }> {
  if (result.kind !== 'score') throw new Error(`Expected a score, got ${JSON.stringify(result)}`)
  return result
}

describe('computeSnowScore golden table', () => {
  it('documents which boundaries are inclusive', () => {
    expect(golden.grenser.length).toBeGreaterThan(0)
  })

  it.each(golden.tilfeller.map((c) => [c.navn, c] as const))('%s', (_navn, testCase) => {
    const result = computeSnowScore(testCase.timer)
    const expected = testCase.forventet
    if (expected.kind === 'incomplete') {
      expect(result).toEqual(expected)
      return
    }
    const score = expectScore(result)
    expect(Math.abs(score.a - expected.a)).toBeLessThan(TOLERANCE)
    expect(Math.abs(score.b - expected.b)).toBeLessThan(TOLERANCE)
    expect(Math.abs(score.c - expected.c)).toBeLessThan(TOLERANCE)
    expect(Math.abs(score.newSnowMm - expected.newSnowMm)).toBeLessThan(TOLERANCE)
    expect(Math.abs(score.precipitationMm - expected.precipitationMm)).toBeLessThan(TOLERANCE)
    expect(Math.abs(score.meanTemperatureC - expected.meanTemperatureC)).toBeLessThan(TOLERANCE)
    expect(score.score).toBe(expected.score)
  })

  it('treats ten hours of 0.05 mm as P = 0.5 mm despite float drift', () => {
    const hours = Array.from({ length: 10 }, () => ({ precipitationMm: 0.05, temperatureC: -2 }))
    const result = expectScore(computeSnowScore(hours))
    expect(result.b).toBeGreaterThan(0)
    expect(result.c).toBeGreaterThan(0)
  })
})

describe('snowFraction', () => {
  it('is 1 at or below 0 °C, 0 at or above 2 °C and linear between', () => {
    expect(snowFraction(-10)).toBe(1)
    expect(snowFraction(0)).toBe(1)
    expect(snowFraction(0.5)).toBe(0.75)
    expect(snowFraction(1)).toBe(0.5)
    expect(snowFraction(2)).toBe(0)
    expect(snowFraction(5)).toBe(0)
  })
})

describe('mmToCm', () => {
  it('converts 1 mm water to 1 cm snow', () => {
    expect(mmToCm(12)).toBe(12)
  })
})

describe('computeSnowScore properties', () => {
  it('gives an integer score between 0 and 100', () => {
    fc.assert(
      fc.property(anyHours, (hours) => {
        const result = computeSnowScore(hours)
        if (result.kind === 'incomplete') return
        expect(Number.isInteger(result.score)).toBe(true)
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
      }),
      RUNS,
    )
  })

  it('never lowers A when one hour at or below 0 °C gets more precipitation', () => {
    fc.assert(
      fc.property(
        completeHours,
        fc.nat(),
        fc.double({ min: -40, max: 0, noNaN: true }),
        fc.double({ min: 0, max: 30, noNaN: true }),
        (hours, rawIndex, coldTemperature, extra) => {
          const index = rawIndex % hours.length
          const before = hours.map((h, i) => (i === index ? { ...h, temperatureC: coldTemperature } : h))
          const after = before.map((h, i) =>
            i === index ? { ...h, precipitationMm: h.precipitationMm + extra } : h,
          )
          expect(expectScore(computeSnowScore(after)).a).toBeGreaterThanOrEqual(expectScore(computeSnowScore(before)).a)
        },
      ),
      RUNS,
    )
  })

  it('never lowers B when every hour gets colder', () => {
    fc.assert(
      fc.property(completeHours, fc.double({ min: 0, max: 30, noNaN: true }), (hours, drop) => {
        const colder = hours.map((h) => ({ ...h, temperatureC: h.temperatureC - drop }))
        expect(expectScore(computeSnowScore(colder)).b).toBeGreaterThanOrEqual(expectScore(computeSnowScore(hours)).b)
      }),
      RUNS,
    )
  })

  it('gives B = C = 0 whenever P < 0.5 mm', () => {
    const smallHours = fc.array(
      fc.record({ precipitationMm: fc.double({ min: 0, max: 0.04, noNaN: true }), temperatureC: temperature }),
      { minLength: 1, maxLength: 12 },
    )
    fc.assert(
      fc.property(smallHours, (hours) => {
        const result = expectScore(computeSnowScore(hours))
        expect(result.precipitationMm).toBeLessThan(0.5)
        expect(result.b).toBe(0)
        expect(result.c).toBe(0)
      }),
      RUNS,
    )
  })

  it('is incomplete exactly when more than 10 % of the hours are missing', () => {
    fc.assert(
      fc.property(anyHours, (hours) => {
        const missing = hours.filter((h) => h.precipitationMm === null || h.temperatureC === null).length
        const missingShare = hours.length === 0 ? 1 : missing / hours.length
        expect(computeSnowScore(hours).kind).toBe(missingShare > 0.1 ? 'incomplete' : 'score')
      }),
      RUNS,
    )
  })

  it('is deterministic', () => {
    fc.assert(
      fc.property(anyHours, (hours) => {
        const copy = hours.map((h) => ({ ...h }))
        expect(computeSnowScore(copy)).toEqual(computeSnowScore(hours))
      }),
      RUNS,
    )
  })
})

describe('computeSnowScore invalid input', () => {
  it.each([
    ['negative precipitation', { precipitationMm: -0.1, temperatureC: -2 }],
    ['NaN precipitation', { precipitationMm: Number.NaN, temperatureC: -2 }],
    ['Infinity precipitation', { precipitationMm: Number.POSITIVE_INFINITY, temperatureC: -2 }],
    ['NaN temperature', { precipitationMm: 1, temperatureC: Number.NaN }],
    ['-Infinity temperature', { precipitationMm: 1, temperatureC: Number.NEGATIVE_INFINITY }],
    ['negative precipitation with missing temperature', { precipitationMm: -0.1, temperatureC: null }],
    ['NaN temperature with missing precipitation', { precipitationMm: null, temperatureC: Number.NaN }],
  ])('throws RangeError on %s', (_name, hour) => {
    expect(() => computeSnowScore([{ precipitationMm: 1, temperatureC: -2 }, hour])).toThrow(RangeError)
  })

  it('throws RangeError even when the list would otherwise be incomplete', () => {
    const hours: HourlyValue[] = [
      { precipitationMm: null, temperatureC: -2 },
      { precipitationMm: 1, temperatureC: null },
      { precipitationMm: -1, temperatureC: -2 },
    ]
    expect(() => computeSnowScore(hours)).toThrow(RangeError)
  })
})
