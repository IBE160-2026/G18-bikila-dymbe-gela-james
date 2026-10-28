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

  it('takes the cloud cover in daylight over the hours with the sun above the horizon only', () => {
    // The place is at 60.01° N 10.01° E. From 20:00 UTC on 7 October, hours 0–8 and 22–23 of the window
    // are deep night (sun below −12°) and hours 12–19 broad day (above 9°). The hours near sunrise and
    // sunset (9–11, 20–21) get the same 20 % as the day's mean, so the result does not hang on whether the
    // formula counts them. Night is overcast.
    const dag = [0, 40, 0, 40, 0, 40, 0, 40]
    const cloud = (i: number) => (i >= 12 && i <= 19 ? dag[i - 12] : i >= 9 && i <= 21 ? 20 : 100)
    const hours = snowyDay().map((h, i) => ({ ...h, cloud: cloud(i) }))
    const [sted] = scored([{ id: 'a', met: metResponse(hours), nve: nveResponse() }]).steder
    expect(sted.skydekkeDagslys).toBe(20)
    // The whole-day mean is unchanged and still counts the night.
    expect(sted.skydekke).toBe((13 * 20 + 11 * 100) / 24)
  })

  /** Scores one place at `lat`/`lon` over the 24 hours from `start`, with clouds per hour. */
  function scoredAt(lat: number, lon: number, start: string, cloud: (i: number) => number) {
    const hours = snowyDay().map((h, i) => ({ ...h, cloud: cloud(i) }))
    const ctx = validate(rawContext([{ id: 'a', met: metResponse(hours, undefined, start), nve: nveResponse() }]))
    const [sted] = score({
      ...ctx,
      referenceTime: start.replace(':00:00Z', ':30:00Z'),
      catalog: ctx.catalog.map((entry) => ({ ...entry, lat, lon })),
    }).steder
    return sted
  }

  it('gives no cloud cover in daylight in the polar night', () => {
    // Tromsø on the winter solstice: the sun stays below the horizon all 24 hours.
    const sted = scoredAt(69.65, 18.96, '2026-12-21T00:00:00Z', () => 50)
    expect(sted.skydekke).toBe(50)
    expect(sted.skydekkeDagslys).toBeNull()
  })

  it('counts every hour in the midnight sun, so daylight and whole-day means are equal', () => {
    const sted = scoredAt(69.65, 18.96, '2026-06-21T00:00:00Z', (i) => (i * 7) % 100)
    expect(sted.skydekkeDagslys).not.toBeNull()
    expect(sted.skydekkeDagslys).toBe(sted.skydekke)
  })

  it('counts an hour as daylight when the sun is up only half an hour after it starts', () => {
    // On the polar circle (66.45° N 6.6° E) at the winter solstice the sun is up only around 11:30 UTC,
    // below the horizon at both 11:00 and 12:00. Hour 11 is the one daylight hour.
    const sted = scoredAt(66.45, 6.6, '2026-12-21T00:00:00Z', (i) => (i === 11 ? 30 : 90))
    expect(sted.skydekkeDagslys).toBe(30)
  })

  it('gives no cloud cover in daylight when more than 10 % of the daylight hours are missing', () => {
    // As in the first test, hours 10–20 are daylight (11 hours). Hours 14 and 15 are well inside the day.
    const utenTimer = (fjern: number[]) => {
      const met = metResponse(snowyDay())
      met.properties.timeseries = met.properties.timeseries.filter((_, i) => !fjern.includes(i))
      return scored([{ id: 'a', met, nve: nveResponse() }]).steder[0]
    }
    // 1 of 11 missing (9 %) still gives the mean; 2 of 11 (18 %) gives null, like SnowScore's rule.
    expect(utenTimer([14]).skydekkeDagslys).toBe(50)
    expect(utenTimer([14, 15]).skydekkeDagslys).toBeNull()
    // The whole-day mean still has its value.
    expect(utenTimer([14, 15]).skydekke).toBe(50)
  })

  it('gives no cloud cover in daylight when the daylight hours are missing', () => {
    // The forecast ends at 03:00 UTC, before sunrise: the night hours alone still give the day mean.
    const [sted] = scored([{ id: 'a', met: metResponse(snowyDay().slice(0, 8)), nve: nveResponse() }]).steder
    expect(sted.skydekke).toBe(50)
    expect(sted.skydekkeDagslys).toBeNull()
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
      skydekkeDagslys: null,
      skivindu: null,
      skivinduUtenDagslys: false,
      nveNysnoSisteDognMm: 5,
    })
  })

  it('finds the ski window over 48 hours, after the snowfall, while SnowScore keeps its 24', () => {
    // Snow for the first 24 hours (to 8 October 19:00 UTC), then calm and dry. The window is the next
    // morning's first daylight hours, beyond SnowScore's window; hours after the 48 are ignored.
    const hours: HourInput[] = [
      ...snowyDay(),
      ...Array.from({ length: 24 }, () => ({ precipitation: 0, temperature: -8, wind: 2, cloud: 10 })),
      ...Array.from({ length: 6 }, () => ({ precipitation: 0, temperature: -8, wind: 0, cloud: 0 })),
    ]
    const [sted] = scored([{ id: 'a', met: metResponse(hours), nve: nveResponse() }]).steder
    expect(sted.snowScore).toMatchObject({ kind: 'score', score: 86 })
    expect(sted.skivinduUtenDagslys).toBe(false)
    expect(sted.skivindu).toEqual({
      start: '2026-10-09T06:00:00Z',
      timer: 4,
      snittVindMs: 2,
      snittSkydekke: 10,
      etterSnofall: true,
    })
  })

  it('looks only at the 48 hours from the hour containing the reference time', () => {
    // The forecast starts at 14:00 UTC, six hours before the reference hour (20:00). Calm daylight hours
    // lie before it (14–16 on 7 October) and after the period (06–09 on 10 October, hours 64–67);
    // inside the period every hour has 3 m/s, so the window is the first daylight hours on 8 October.
    const stille = (j: number) => j <= 2 || (j >= 64 && j <= 67)
    const hours: HourInput[] = Array.from({ length: 72 }, (_, j) => ({
      precipitation: 0,
      temperature: -8,
      wind: stille(j) ? 0 : 3,
      cloud: 50,
    }))
    const [sted] = scored([{ id: 'a', met: metResponse(hours, undefined, '2026-10-07T14:00:00Z'), nve: nveResponse() }])
      .steder
    expect(sted.skivindu).toMatchObject({ start: '2026-10-08T06:00:00Z', timer: 4, snittVindMs: 3 })
  })

  it('gives no ski window when the forecast has no step in the 48 hours', () => {
    const met = metResponse(snowyDay(), undefined, '2026-10-06T18:00:00Z')
    const [sted] = scored([{ id: 'a', met, nve: nveResponse() }]).steder
    expect(sted.skivindu).toBeNull()
    expect(sted.skivinduUtenDagslys).toBe(false)
  })

  it('flags the ski window in the polar night and still picks one among the dark hours', () => {
    // Tromsø from 21 December 00:00 UTC: no daylight hour in the 48. Hours 30–33 are the calmest.
    const hours: HourInput[] = Array.from({ length: 48 }, (_, i) => ({
      precipitation: 0,
      temperature: -8,
      wind: i >= 30 && i <= 33 ? 1 : 6,
    }))
    const ctx = validate(rawContext([{ id: 'a', met: metResponse(hours, undefined, '2026-12-21T00:00:00Z'), nve: nveResponse() }]))
    const [sted] = score({
      ...ctx,
      referenceTime: '2026-12-21T00:30:00Z',
      catalog: ctx.catalog.map((entry) => ({ ...entry, lat: 69.65, lon: 18.96 })),
    }).steder
    expect(sted.skivinduUtenDagslys).toBe(true)
    expect(sted.skivindu).toMatchObject({ start: '2026-12-22T06:00:00Z', timer: 4, snittVindMs: 1 })
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

  it('leaves NVE empty when its newest day is 24 h old or more, and still scores the place', () => {
    // Days 05.10 and 06.10 only: the newest is 38.5 h old at 07.10 20:30, so it is not «nysnø siste døgn».
    const outdated = scored([{ id: 'a', met: metResponse(snowyDay()), nve: nveResponse([1, 9]) }])
    expect(outdated.steder[0].nveNysnoSisteDognMm).toBeNull()
    expect(outdated.steder[0].snowScore.kind).toBe('score')
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
