// AD-6: the single SnowScore implementation (FR-7). The pipeline, the explanation page and the
// filter all import it from here; never copy the formula elsewhere. No third-party imports.

export const SNOWSCORE = {
  /** Maximum points for new snow (A). */
  maxA: 60,
  /** Maximum points for cold (B). */
  maxB: 25,
  /** Maximum points for snow share (C). */
  maxC: 15,
  /** New snow (mm water) that gives full A. */
  fullSnowMm: 20,
  /** f(T) is 1 at or below this temperature (°C)... */
  allSnowAtOrBelowC: 0,
  /** ...and 0 at or above this one, linear in between. Also the zero point for B. */
  noSnowAtOrAboveC: 2,
  /** Degrees below noSnowAtOrAboveC that give full B (full B at T̄ ≤ −14 °C). */
  coldRangeC: 16,
  /** Below this total precipitation (mm), B and C are 0. The boundary is inclusive: P ≥ 0.5 counts. */
  minPrecipitationMm: 0.5,
  /** More than this share of missing hours (strictly greater) makes the result incomplete. */
  maxMissingShare: 0.1,
  /** 1 mm of water ≈ 1 cm of snow. */
  cmPerMm: 1,
} as const

/**
 * Version of the SnowScore parameters above, shown in the explanation page's change log (FR-8).
 * Bump it, and add a change-log row, every time a parameter in SNOWSCORE changes.
 */
export const SNOWSCORE_VERSION = '1.0'

export interface HourlyValue {
  precipitationMm: number | null
  temperatureC: number | null
}

export type SnowScoreResult =
  | {
      kind: 'score'
      /** round(a + b + c), integer 0–100. */
      score: number
      // Sub-scores are unrounded so the explanation page can show the exact calculation.
      a: number
      b: number
      c: number
      /** S: precipitation weighted by snow fraction, in mm water. */
      newSnowMm: number
      /** P: total precipitation in mm. */
      precipitationMm: number
      /** T̄: mean temperature in °C. */
      meanTemperatureC: number
    }
  | {
      kind: 'incomplete'
      /** Share of hours (0–1) with missing precipitation or temperature. */
      missingShare: number
    }

/** Share of precipitation that falls as snow at temperature t (°C): f(T) = min(1, max(0, (2 − T)/2)). */
export function snowFraction(temperatureC: number): number {
  const { allSnowAtOrBelowC, noSnowAtOrAboveC } = SNOWSCORE
  const range = noSnowAtOrAboveC - allSnowAtOrBelowC
  return Math.min(1, Math.max(0, (noSnowAtOrAboveC - temperatureC) / range))
}

/** The one place mm water is converted to cm snow. */
export function mmToCm(mm: number): number {
  return mm * SNOWSCORE.cmPerMm
}

function assertValid(hour: HourlyValue, index: number): void {
  const { precipitationMm: p, temperatureC: t } = hour
  if (p !== null && (!Number.isFinite(p) || p < 0)) {
    throw new RangeError(`Invalid precipitation at hour ${index}: ${p}`)
  }
  if (t !== null && !Number.isFinite(t)) {
    throw new RangeError(`Invalid temperature at hour ${index}: ${t}`)
  }
}

/**
 * Computes SnowScore over the whole list as the time window (the window length is chosen by the caller).
 * Throws RangeError on negative or non-finite values; data is expected to be validated already.
 */
export function computeSnowScore(hours: readonly HourlyValue[]): SnowScoreResult {
  hours.forEach(assertValid)

  if (hours.length === 0) return { kind: 'incomplete', missingShare: 1 }

  const present = hours.filter(
    (h): h is { precipitationMm: number; temperatureC: number } =>
      h.precipitationMm !== null && h.temperatureC !== null,
  )
  const missingShare = (hours.length - present.length) / hours.length
  if (missingShare > SNOWSCORE.maxMissingShare) return { kind: 'incomplete', missingShare }

  let newSnowMm = 0
  let precipitationMm = 0
  let temperatureSum = 0
  for (const h of present) {
    newSnowMm += h.precipitationMm * snowFraction(h.temperatureC)
    precipitationMm += h.precipitationMm
    temperatureSum += h.temperatureC
  }
  const meanTemperatureC = temperatureSum / present.length

  const { maxA, maxB, maxC, fullSnowMm, noSnowAtOrAboveC, coldRangeC, minPrecipitationMm } = SNOWSCORE
  const a = maxA * Math.min(1, newSnowMm / fullSnowMm)
  // Float sums drift below the boundary (10 × 0.05 = 0.49999999999999994); keep P ≥ 0.5 inclusive.
  const enoughPrecipitation = precipitationMm >= minPrecipitationMm - 1e-9
  const b = enoughPrecipitation
    ? maxB * Math.min(1, Math.max(0, (noSnowAtOrAboveC - meanTemperatureC) / coldRangeC))
    : 0
  // Divide first: (15 × 0.7) / 0.7 is 15.000000000000002, which breaks the published c ≤ 15 bound.
  const c = enoughPrecipitation ? maxC * Math.min(1, newSnowMm / precipitationMm) : 0

  return {
    kind: 'score',
    score: Math.round(a + b + c),
    a,
    b,
    c,
    newSnowMm,
    precipitationMm,
    meanTemperatureC,
  }
}

/** Decided 2026-10-07 (Story 1.10): SnowScore covers the next 24 hours from the reference time. */
export const WINDOW_HOURS = 24

const HOUR_MS = 3_600_000

/**
 * Picks the forecast steps for the SnowScore window: the hour containing `referenceTime` and the
 * 23 after it. A slot is `undefined` when the source has no step for that hour, which the caller
 * maps to a missing hour (null), so gaps count towards the incomplete-data rule.
 */
export function selectWindow<T extends { time: string }>(steps: readonly T[], referenceTime: string): (T | undefined)[] {
  const start = Math.floor(Date.parse(referenceTime) / HOUR_MS) * HOUR_MS
  if (!Number.isFinite(start)) throw new RangeError(`Invalid reference time: ${referenceTime}`)
  const byTime = new Map(steps.map((step) => [Date.parse(step.time), step]))
  return Array.from({ length: WINDOW_HOURS }, (_, i) => byTime.get(start + i * HOUR_MS))
}
