import { describe, expect, it } from 'vitest'
import { computeSnowScore } from '../../shared/snowscore'
import { score } from './score'
import { metResponse, nveResponse, rawContext, snowyDay, type HourInput } from './testing'
import { validate } from './validate'

const scored = (raw: Parameters<typeof rawContext>[0]) => score(validate(rawContext(raw)))

describe('score', () => {
  it('scores the 24 hours from the hour containing the reference time', () => {
    // Two hours before the window and 10 after it are rainy and warm; they must not count.
    const hours: HourInput[] = [
      { precipitation: 10, temperature: 8 },
      { precipitation: 10, temperature: 8 },
      ...snowyDay(),
      ...Array.from({ length: 10 }, () => ({ precipitation: 10, temperature: 8 })),
    ]
    const [sted] = scored([{ id: 'a', met: metResponse(hours, undefined, '2026-10-07T18:00:00Z'), nve: nveResponse() }])
      .steder
    expect(sted.snowScore).toEqual(computeSnowScore(snowyDay().map(() => ({ precipitationMm: 1, temperatureC: -5 }))))
    // A = 60, B = 25 · 7/16, C = 15.
    expect(sted.snowScore).toMatchObject({ kind: 'score', score: 86 })
    expect(sted.nysnoCm).toBe(24)
    expect(sted.temperatur).toBe(-5)
  })

  it('carries lineage: run ID and the source timestamp', () => {
    const [sted] = scored([{ id: 'a', met: metResponse(snowyDay(), '2026-10-07T17:00:00Z'), nve: nveResponse() }]).steder
    expect(sted.runId).toBe('test-run')
    expect(sted.kildeTidspunkt).toBe('2026-10-07T17:00:00Z')
  })

  it('takes the highest wind and the mean cloud cover over the window', () => {
    const hours = snowyDay().map((h, i) => ({ ...h, wind: i === 5 ? 14.2 : 2, cloud: i < 12 ? 100 : 0 }))
    const [sted] = scored([{ id: 'a', met: metResponse(hours), nve: nveResponse() }]).steder
    expect(sted.vindMaks).toBe(14.2)
    expect(sted.skydekke).toBe(50)
  })

  it('gives «incomplete» and no numbers when more than 10 % of the hours are missing', () => {
    // 3 of 24 hours have no next_1_hours (12.5 %).
    const hours = snowyDay().map((h, i) => (i < 3 ? { temperature: -5 } : h))
    const [sted] = scored([{ id: 'a', met: metResponse(hours), nve: nveResponse() }]).steder
    expect(sted.snowScore).toEqual({ kind: 'incomplete', missingShare: 3 / 24 })
    expect(sted.nysnoCm).toBeNull()
    expect(sted.temperatur).toBeNull()
  })

  it('counts hours absent from the timeseries as missing', () => {
    // The forecast ends after 20 hours: 4 of 24 missing.
    const [sted] = scored([{ id: 'a', met: metResponse(snowyDay().slice(0, 20)), nve: nveResponse() }]).steder
    expect(sted.snowScore).toEqual({ kind: 'incomplete', missingShare: 4 / 24 })
  })

  it('still scores with exactly 2 of 24 hours missing (8.3 %)', () => {
    const hours = snowyDay().map((h, i) => (i < 2 ? { temperature: -5 } : h))
    expect(scored([{ id: 'a', met: metResponse(hours), nve: nveResponse() }]).steder[0].snowScore.kind).toBe('score')
  })

  it('shows a place whose MET response failed as incomplete, without values', () => {
    const [sted] = scored([{ id: 'a', met: { broken: true }, nve: nveResponse() }]).steder
    expect(sted).toMatchObject({
      kildeTidspunkt: null,
      snowScore: { kind: 'incomplete', missingShare: 1 },
      nysnoCm: null,
      temperatur: null,
      vindMaks: null,
      skydekke: null,
      nveNysnoSisteDognMm: 5,
    })
  })

  it('uses NVE’s last daily value before the reference time, and null for NoDataValue', () => {
    // Days 05.10, 06.10, 07.10 and 08.10 at 06:00; the reference time is 07.10 20:30.
    const withFuture = scored([{ id: 'a', met: metResponse(snowyDay()), nve: nveResponse([1, 2, 3, 4]) }])
    expect(withFuture.steder[0].nveNysnoSisteDognMm).toBe(3)
    const noData = scored([{ id: 'a', met: metResponse(snowyDay()), nve: nveResponse([1, 2, 255]) }])
    expect(noData.steder[0].nveNysnoSisteDognMm).toBeNull()
    const missing = scored([{ id: 'a', met: metResponse(snowyDay()) }])
    expect(missing.steder[0].nveNysnoSisteDognMm).toBeNull()
  })

  it('gives no wind, cloud or score when the valid forecast has no step inside the window', () => {
    // 24 hours ending at 18:00, before the window starts at 20:00.
    const met = metResponse(snowyDay(), undefined, '2026-10-06T18:00:00Z')
    const [sted] = scored([{ id: 'a', met, nve: nveResponse() }]).steder
    expect(sted.kildeTidspunkt).not.toBeNull()
    expect(sted.snowScore).toEqual({ kind: 'incomplete', missingShare: 1 })
    expect(sted.vindMaks).toBeNull()
    expect(sted.skydekke).toBeNull()
  })

  it('is idempotent', () => {
    const ctx = validate(rawContext([{ id: 'a', met: metResponse(snowyDay()), nve: nveResponse() }]))
    expect(score(score(ctx))).toEqual(score(ctx))
  })
})
