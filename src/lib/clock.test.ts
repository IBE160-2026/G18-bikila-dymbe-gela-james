import { afterEach, describe, expect, it, vi } from 'vitest'
import { now } from './clock'

describe('now', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the reference time in demo mode, whatever the wall clock says', () => {
    vi.useFakeTimers({ now: Date.parse('2030-01-01T00:00:00Z') })
    expect(now({ mode: 'demo', referenceTime: '2026-10-07T20:30:29Z' }).toISOString()).toBe('2026-10-07T20:30:29.000Z')
  })

  it('returns the wall clock in live mode', () => {
    vi.useFakeTimers({ now: Date.parse('2030-01-01T00:00:00Z') })
    expect(now({ mode: 'live', referenceTime: '2026-10-07T20:30:29Z' }).toISOString()).toBe('2030-01-01T00:00:00.000Z')
  })

  it('returns a new Date each time, so callers cannot change the clock', () => {
    const data = { mode: 'demo', referenceTime: '2026-10-07T20:30:29Z' } as const
    const first = now(data)
    first.setUTCFullYear(1999)
    expect(now(data).getUTCFullYear()).toBe(2026)
  })
})
