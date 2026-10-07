import { describe, expect, it } from 'vitest'
import { metResponse, snowyDay } from '../testing'
import { demoReferenceTime } from './fixtures'

describe('demoReferenceTime', () => {
  it('is the newest updated_at among valid MET responses', () => {
    const raw = [
      { stedId: 'a', met: metResponse(snowyDay(), '2026-10-07T20:00:00Z'), nve: undefined },
      { stedId: 'b', met: metResponse(snowyDay(), '2026-10-07T20:30:00Z'), nve: undefined },
    ]
    expect(demoReferenceTime(raw)).toBe('2026-10-07T20:30:00Z')
  })

  it('ignores responses that fail the MET contract, even with a newer timestamp', () => {
    const invalid = metResponse([{ precipitation: -1 }], '2026-10-08T12:00:00Z')
    const raw = [
      { stedId: 'a', met: metResponse(snowyDay(), '2026-10-07T20:00:00Z'), nve: undefined },
      { stedId: 'b', met: invalid, nve: undefined },
    ]
    expect(demoReferenceTime(raw)).toBe('2026-10-07T20:00:00Z')
  })

  it('throws when no response is valid', () => {
    expect(() => demoReferenceTime([{ stedId: 'a', met: { broken: true }, nve: undefined }])).toThrow()
  })
})
