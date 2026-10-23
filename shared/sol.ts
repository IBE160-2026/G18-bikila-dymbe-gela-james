// Story 3.5 (FR-22): the sun's elevation, so the pipeline can tell daylight hours from dark ones.
// The usual textbook approximation from declination and hour angle (with a short equation of time),
// good to well under a degree; enough to decide whether the sun is above the horizon. No dependency.

const DAY_MS = 86_400_000
const toRadians = (deg: number) => (deg * Math.PI) / 180
const toDegrees = (rad: number) => (rad * 180) / Math.PI

/** Day of the year in UTC, 1 for 1 January. */
function dayOfYear(time: number): number {
  const date = new Date(time)
  return Math.floor((time - Date.UTC(date.getUTCFullYear(), 0, 1)) / DAY_MS) + 1
}

/**
 * The sun's elevation above the horizon in degrees at `time` (ISO 8601 or ms since epoch) seen from
 * `lat`/`lon` in degrees. Negative below the horizon; refraction is ignored.
 */
export function solhoyde(time: string | number, lat: number, lon: number): number {
  const ms = typeof time === 'number' ? time : Date.parse(time)
  if (!Number.isFinite(ms)) throw new RangeError(`Invalid time: ${String(time)}`)
  const n = dayOfYear(ms)
  // Declination: −23.44° at the winter solstice, +23.44° at the summer solstice.
  const declination = toRadians(-23.44 * Math.cos(((2 * Math.PI) / 365) * (n + 10)))
  // Equation of time in minutes: the gap between clock noon and solar noon over the year.
  const b = ((2 * Math.PI) / 364) * (n - 81)
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  const utcHours = (ms - Math.floor(ms / DAY_MS) * DAY_MS) / 3_600_000
  const solarHours = utcHours + lon / 15 + equationOfTime / 60
  const hourAngle = toRadians(15 * (solarHours - 12))
  const phi = toRadians(lat)
  const sinElevation =
    Math.sin(phi) * Math.sin(declination) + Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle)
  return toDegrees(Math.asin(Math.max(-1, Math.min(1, sinElevation))))
}

/** True when the sun's centre is geometrically above the horizon at `time` (refraction ignored). */
export function erDagslys(time: string | number, lat: number, lon: number): boolean {
  return solhoyde(time, lat, lon) > 0
}

const HALF_HOUR_MS = 1_800_000

/**
 * Story 3.5: the hour starting at `time` counts as daylight when the sun is above the horizon at its
 * start or half an hour later. Near the polar circle in midwinter the sun can be up only between two
 * whole hours; checking the half hour too keeps such a short day from looking like polar night.
 */
export function erDagslystime(time: string | number, lat: number, lon: number): boolean {
  const ms = typeof time === 'number' ? time : Date.parse(time)
  return erDagslys(ms, lat, lon) || erDagslys(ms + HALF_HOUR_MS, lat, lon)
}
