import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { besteSkivindu, SKIVINDU, type SkivinduResultat, type SkivinduTime } from './skivindu'

// Story 4.2: the golden table locks the ski window rules (FR-17, AD-6), with the same function the pipeline uses.

interface GoldenCase {
  navn: string
  lat: number
  lon: number
  forventet: SkivinduResultat
  timer: SkivinduTime[]
}

const golden = JSON.parse(readFileSync(new URL('../tests/golden/skivindu.json', import.meta.url), 'utf8')) as {
  grenser: string
  tilfeller: GoldenCase[]
}

function expectResultat(actual: SkivinduResultat, expected: SkivinduResultat) {
  expect(actual.skivinduUtenDagslys).toBe(expected.skivinduUtenDagslys)
  if (expected.skivindu === null) {
    expect(actual.skivindu).toBeNull()
    return
  }
  const { snittVindMs, snittSkydekke, ...rest } = expected.skivindu
  expect(actual.skivindu).toMatchObject(rest)
  expect(actual.skivindu?.snittVindMs).toBeCloseTo(snittVindMs, 9)
  expect(actual.skivindu?.snittSkydekke).toBeCloseTo(snittSkydekke, 9)
}

describe('besteSkivindu golden table', () => {
  it('covers a 48-hour period in every case', () => {
    for (const testCase of golden.tilfeller) expect(testCase.timer, testCase.navn).toHaveLength(SKIVINDU.periodeTimer)
  })

  it.each(golden.tilfeller.map((c) => [c.navn, c] as const))('%s', (_navn, testCase) => {
    expectResultat(besteSkivindu(testCase.timer, testCase.lat, testCase.lon), testCase.forventet)
  })
})

// 60° N 10° E from 2026-10-08T06:00Z: hours 0–10 are daylight (06–16 UTC), as in the golden table.
const LAT = 60
const LON = 10
const MORGEN = '2026-10-08T06:00:00Z'

/** `n` consecutive hours from `start`, each made from its index. */
function timer(n: number, f: (i: number) => Partial<SkivinduTime>, start = MORGEN): SkivinduTime[] {
  return Array.from({ length: n }, (_, i) => ({
    time: new Date(Date.parse(start) + i * 3_600_000).toISOString().replace('.000Z', 'Z'),
    vindMs: 5,
    skydekke: 50,
    nedborMm: 0,
    temperaturC: -5,
    ...f(i),
  }))
}

describe('besteSkivindu boundaries', () => {
  it('counts 0.1 mm of snow as snowfall, but not 0.09 mm', () => {
    const med = (mm: number) => besteSkivindu(timer(11, (i) => (i === 3 ? { nedborMm: mm } : {})), LAT, LON).skivindu
    expect(med(0.1)).toMatchObject({ start: '2026-10-08T10:00:00Z', etterSnofall: true })
    expect(med(0.09)).toMatchObject({ start: '2026-10-08T06:00:00Z', etterSnofall: false })
  })

  it('weights precipitation by snow fraction: 0.2 mm at +1 °C is 0.1 mm of snow, at +2 °C none', () => {
    const ved = (t: number) =>
      besteSkivindu(timer(11, (i) => (i === 3 ? { nedborMm: 0.2, temperaturC: t } : {})), LAT, LON).skivindu?.etterSnofall
    expect(ved(1)).toBe(true)
    expect(ved(2)).toBe(false)
  })

  it('counts missing precipitation or temperature as no snow', () => {
    const hours = timer(11, (i) => (i === 3 ? { nedborMm: null } : i === 4 ? { nedborMm: 5, temperaturC: null } : {}))
    expect(besteSkivindu(hours, LAT, LON).skivindu).toMatchObject({ start: MORGEN, etterSnofall: false })
  })

  it('ranks by wind rounded to whole m/s: 2.4 and 1.6 tie at 2, so cloud cover decides', () => {
    const hours = timer(11, (i) => (i < 4 ? { vindMs: 1.6, skydekke: 60 } : i >= 6 ? { vindMs: 2.4, skydekke: 10 } : { vindMs: 9 }))
    expect(besteSkivindu(hours, LAT, LON).skivindu).toMatchObject({ start: '2026-10-08T12:00:00Z', snittSkydekke: 10 })
  })

  it('rounds 2.5 m/s up to 3, so it loses to 2.4', () => {
    const hours = timer(11, (i) => (i < 4 ? { vindMs: 2.5, skydekke: 0 } : i >= 6 ? { vindMs: 2.4, skydekke: 90 } : { vindMs: 9 }))
    expect(besteSkivindu(hours, LAT, LON).skivindu?.start).toBe('2026-10-08T12:00:00Z')
  })

  it('rounds a mean that is 1.5 in decimals up to 2, even when float summation gives 1.4999…', () => {
    // 1.2 + 1.4 + 1.6 + 1.8 sums to 5.999… in floats. Correctly rounded, hours 0–3 tie with hours 6–9 at
    // 2 m/s and lose on cloud cover; rounded down to 1 they would win.
    const tidlig = [1.2, 1.4, 1.6, 1.8]
    expect(tidlig.reduce((sum, v) => sum + v, 0) / 4).toBeLessThan(1.5)
    const hours = timer(11, (i) =>
      i < 4 ? { vindMs: tidlig[i], skydekke: 90 } : i >= 6 && i <= 9 ? { vindMs: 2.4, skydekke: 10 } : { vindMs: 9 },
    )
    expect(besteSkivindu(hours, LAT, LON).skivindu?.start).toBe('2026-10-08T12:00:00Z')
  })

  it('takes the earliest window when wind and cloud cover tie', () => {
    expect(besteSkivindu(timer(11, () => ({})), LAT, LON).skivindu?.start).toBe(MORGEN)
  })

  it('breaks a run at an hour without wind or cloud cover', () => {
    // Hours 0–2 and 9–10 are calm but cut off by hours 3 and 8; the four windy hours 4–7 are the only full window.
    const hours = timer(11, (i) => (i === 3 || i === 8 ? { skydekke: null } : i >= 4 && i <= 7 ? { vindMs: 8 } : { vindMs: 1 }))
    expect(besteSkivindu(hours, LAT, LON).skivindu).toMatchObject({ start: '2026-10-08T10:00:00Z', timer: 4, snittVindMs: 8 })
  })

  it('breaks a run at a gap in time, even when the hours on both sides are candidates', () => {
    const hours = timer(11, () => ({})).filter((_, i) => i !== 2 && i !== 6)
    // Runs: 0–1, 3–5, 7–10. Only the last has four hours.
    expect(besteSkivindu(hours, LAT, LON).skivindu).toMatchObject({ start: '2026-10-08T13:00:00Z', timer: 4 })
  })

  it('falls back to the longest run, then ranks among runs of that length', () => {
    // Daylight is broken every third hour; runs of two hours remain, the calmer one wins.
    const hours = timer(11, (i) => (i % 3 === 2 ? { vindMs: null } : { vindMs: i >= 6 ? 1 : 4 }))
    expect(besteSkivindu(hours, LAT, LON).skivindu).toMatchObject({ start: '2026-10-08T12:00:00Z', timer: 2, snittVindMs: 1 })
  })

  it('never picks a night hour when the period has daylight', () => {
    // From 16:00 UTC: hour 0 is daylight, the calm hours after are night.
    const hours = timer(6, (i) => ({ vindMs: i === 0 ? 7 : 0 }), '2026-10-08T16:00:00Z')
    expect(besteSkivindu(hours, LAT, LON)).toMatchObject({
      skivindu: { start: '2026-10-08T16:00:00Z', timer: 1 },
      skivinduUtenDagslys: false,
    })
  })

  it('sets the flag in the polar night even when nothing is a candidate', () => {
    const hours = timer(48, () => ({ nedborMm: 1 }), '2026-12-20T20:00:00Z')
    expect(besteSkivindu(hours, 69.65, 18.96)).toEqual({ skivindu: null, skivinduUtenDagslys: true })
  })

  it('gives no window and no flag for an empty period', () => {
    expect(besteSkivindu([], LAT, LON)).toEqual({ skivindu: null, skivinduUtenDagslys: false })
  })
})
