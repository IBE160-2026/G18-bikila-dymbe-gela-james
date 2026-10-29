import { describe, expect, it } from 'vitest'
import { FJERNES_ETTER_MS, GAMLE_DATA_ETTER_MS, UTDATERT_ETTER_MS, dataAlderMs, erGamleData, ferskhet } from './freshness'

const NOW = new Date('2026-10-07T20:30:29Z')
/** The source time that makes the data exactly `ageMs` old at NOW. */
const aged = (ageMs: number) => new Date(NOW.getTime() - ageMs).toISOString()

describe('dataAlderMs', () => {
  it('is now minus the source time', () => {
    expect(dataAlderMs('2026-10-07T16:30:29Z', NOW)).toBe(4 * 3_600_000)
    expect(dataAlderMs('2026-10-07T20:30:29Z', NOW)).toBe(0)
  })

  it('is null when the source time is missing or unreadable', () => {
    expect(dataAlderMs(null, NOW)).toBeNull()
    expect(dataAlderMs('ikke en dato', NOW)).toBeNull()
  })
})

describe('ferskhet', () => {
  it('uses 3 h and 12 h as the limits', () => {
    expect(UTDATERT_ETTER_MS).toBe(3 * 3_600_000)
    expect(FJERNES_ETTER_MS).toBe(12 * 3_600_000)
  })

  it.each([
    ['fresh data', 0, 'fersk'],
    ['exactly 3 h', UTDATERT_ETTER_MS, 'fersk'],
    ['3 h + 1 ms', UTDATERT_ETTER_MS + 1, 'utdatert'],
    ['exactly 12 h', FJERNES_ETTER_MS, 'utdatert'],
    ['12 h + 1 ms', FJERNES_ETTER_MS + 1, 'for-gammel'],
    ['several days', 72 * 3_600_000, 'for-gammel'],
    // A source time slightly ahead of "now" (clock skew) is fresh, not unknown.
    ['source in the future', -60_000, 'fersk'],
  ] as const)('%s', (_, ageMs, expected) => {
    expect(ferskhet(aged(ageMs), NOW)).toBe(expected)
  })

  it('gives unknown age when the source time is missing', () => {
    expect(ferskhet(null, NOW)).toBe('ukjent')
  })
})

describe('erGamleData', () => {
  it('uses 90 min as the limit', () => {
    expect(GAMLE_DATA_ETTER_MS).toBe(90 * 60_000)
  })

  it.each([
    ['just published', 0, false],
    ['exactly 90 min', GAMLE_DATA_ETTER_MS, false],
    ['90 min + 1 ms', GAMLE_DATA_ETTER_MS + 1, true],
    ['two hours', 2 * 3_600_000, true],
    ['published slightly ahead of "now" (clock skew)', -60_000, false],
  ] as const)('%s', (_, ageMs, expected) => {
    expect(erGamleData(aged(ageMs), NOW)).toBe(expected)
  })

  it('shows no banner when the time cannot be read', () => {
    expect(erGamleData('ikke en dato', NOW)).toBe(false)
  })
})
