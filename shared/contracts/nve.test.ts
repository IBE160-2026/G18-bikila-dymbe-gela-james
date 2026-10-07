import { describe, expect, it } from 'vitest'
import { latestNveValue, NveGridTimeSeries, parseNveDate } from './nve'

const series = (overrides: Record<string, unknown> = {}) => ({
  Theme: 'fsw',
  NoDataValue: 255,
  X: 262211,
  Y: 6649332,
  StartDate: '05.10.2026 06:00:00',
  EndDate: '07.10.2026 06:00:00',
  Unit: 'mm',
  TimeResolution: 1440,
  Data: [0, 2, 5],
  ...overrides,
})

describe('parseNveDate', () => {
  it('parses dd.MM.yyyy HH:mm:ss as UTC', () => {
    expect(parseNveDate('07.10.2026 06:00:00')).toBe(Date.parse('2026-10-07T06:00:00Z'))
    expect(parseNveDate('31.12.2026 23:59:59')).toBe(Date.parse('2026-12-31T23:59:59Z'))
  })

  it.each([
    ['31.02.2026 06:00:00', 'day that does not exist'],
    ['07.13.2026 06:00:00', 'month 13'],
    ['07.00.2026 06:00:00', 'month 0'],
    ['07.10.2026 25:00:00', 'hour 25'],
    ['07.10.2026 24:00:00', 'hour 24'],
    ['07.10.2026 06:60:00', 'minute 60'],
    ['07.10.2026 06:00:60', 'second 60'],
    ['2026-10-07T06:00:00Z', 'ISO format'],
  ])('rejects %s (%s)', (text) => {
    expect(parseNveDate(text)).toBeNaN()
  })
})

describe('NveGridTimeSeries', () => {
  it('accepts a valid response', () => {
    expect(NveGridTimeSeries.safeParse(series()).success).toBe(true)
  })

  it('rejects an invalid date', () => {
    expect(NveGridTimeSeries.safeParse(series({ EndDate: '07.13.2026 06:00:00' })).success).toBe(false)
  })

  it('accepts NoDataValue outside the valid range, such as 65535, and turns it into null', () => {
    const parsed = NveGridTimeSeries.parse(series({ NoDataValue: 65535, Data: [0, 2, 65535] }))
    expect(latestNveValue(parsed, '2026-10-07T20:30:00Z')).toBeNull()
  })

  it('rejects values outside 0–1000 mm that are not NoDataValue', () => {
    expect(NveGridTimeSeries.safeParse(series({ Data: [0, 2, 65535] })).success).toBe(false)
    expect(NveGridTimeSeries.safeParse(series({ Data: [0, -1, 5] })).success).toBe(false)
  })
})
