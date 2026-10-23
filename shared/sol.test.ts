import { describe, expect, it } from 'vitest'
import { erDagslys, erDagslystime, solhoyde } from './sol'

// Story 3.5: known elevations. Oslo 59.91° N 10.75° E, Tromsø 69.65° N 18.96° E.
const OSLO = [59.91, 10.75] as const
const TROMSO = [69.65, 18.96] as const

describe('solhoyde', () => {
  it('gives about 53.5° in Oslo at solar noon on the summer solstice (90 − 59.91 + 23.44)', () => {
    const hoyde = solhoyde('2026-06-21T11:20:00Z', ...OSLO)
    expect(hoyde).toBeGreaterThan(53)
    expect(hoyde).toBeLessThan(54)
  })

  it('keeps the sun below the horizon all day in Tromsø on the winter solstice (polar night)', () => {
    expect(solhoyde('2026-12-21T11:00:00Z', ...TROMSO)).toBeLessThan(0)
    for (let time = 0; time < 24; time++) {
      expect(erDagslys(Date.UTC(2026, 11, 21, time), ...TROMSO), `${time}:00`).toBe(false)
    }
  })

  it('keeps the sun above the horizon all day in Tromsø on the summer solstice (midnight sun)', () => {
    for (let time = 0; time < 24; time++) {
      expect(erDagslys(Date.UTC(2026, 5, 21, time), ...TROMSO), `${time}:00`).toBe(true)
    }
  })

  it('gives about 6.6° in Oslo at noon on the winter solstice (90 − 59.91 − 23.44)', () => {
    expect(solhoyde('2026-12-21T11:20:00Z', ...OSLO)).toBeCloseTo(6.65, 0)
  })

  it('puts sunrise in Oslo on 23 October between 06 and 07 UTC, and sunset between 15 and 16 UTC', () => {
    // The almanac gives about 08:20 and 17:45 summer time (UTC+2), that is 06:20 and 15:45 UTC.
    expect(erDagslys('2026-10-23T06:00:00Z', ...OSLO)).toBe(false)
    expect(erDagslys('2026-10-23T07:00:00Z', ...OSLO)).toBe(true)
    expect(erDagslys('2026-10-23T15:00:00Z', ...OSLO)).toBe(true)
    expect(erDagslys('2026-10-23T16:00:00Z', ...OSLO)).toBe(false)
  })

  it('stays continuous across the new year, with noon in Oslo near 7° on both sides (90 − 59.91 − 23.0)', () => {
    const nyttarsaften = solhoyde('2026-12-31T11:20:00Z', ...OSLO)
    const nyttarsdag = solhoyde('2027-01-01T11:20:00Z', ...OSLO)
    expect(nyttarsaften).toBeCloseTo(7.1, 0)
    expect(nyttarsdag).toBeCloseTo(7.1, 0)
    expect(Math.abs(nyttarsdag - nyttarsaften)).toBeLessThan(0.2)
    // Half an hour either side of midnight differs by far less than a degree.
    const forMidnatt = solhoyde('2026-12-31T23:30:00Z', ...OSLO)
    const etterMidnatt = solhoyde('2027-01-01T00:00:00Z', ...OSLO)
    expect(Math.abs(etterMidnatt - forMidnatt)).toBeLessThan(1)
  })

  it('handles 29 February in a leap year: noon in Oslo near 22°, between 28 February and 1 March', () => {
    // The almanac declination on 29 February 2028 is about −7.8°, so noon is about 90 − 59.91 − 7.8 ≈ 22.3°.
    const [feb28, feb29, mar1] = ['2028-02-28', '2028-02-29', '2028-03-01'].map((dato) =>
      solhoyde(`${dato}T11:20:00Z`, ...OSLO),
    )
    expect(feb29).toBeGreaterThan(21)
    expect(feb29).toBeLessThan(23)
    expect(feb28).toBeLessThan(feb29)
    expect(feb29).toBeLessThan(mar1)
    expect(mar1 - feb28).toBeLessThan(1)
  })

  it('counts an hour as daylight when the sun is up at its start or half an hour later', () => {
    // On the polar circle (66.45° N 6.6° E) at the winter solstice the sun is up only around 11:30 UTC.
    const [lat, lon] = [66.45, 6.6]
    expect(erDagslys('2026-12-21T11:00:00Z', lat, lon)).toBe(false)
    expect(erDagslys('2026-12-21T11:30:00Z', lat, lon)).toBe(true)
    expect(erDagslys('2026-12-21T12:00:00Z', lat, lon)).toBe(false)
    expect(erDagslystime('2026-12-21T11:00:00Z', lat, lon)).toBe(true)
    expect(erDagslystime('2026-12-21T10:00:00Z', lat, lon)).toBe(false)
    expect(erDagslystime('2026-12-21T12:00:00Z', lat, lon)).toBe(false)
  })

  it('rejects a time that is not one', () => {
    expect(() => solhoyde('ikke en tid', ...OSLO)).toThrow(RangeError)
  })
})
