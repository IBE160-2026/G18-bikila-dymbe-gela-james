// AD-2 stage: turns validated responses into published place records. The formula itself lives
// only in shared/snowscore.ts (AD-6); this file picks the window and aggregates wind and cloud.
import type { MetForecast } from '../../shared/contracts/met'
import { latestNveValue } from '../../shared/contracts/nve'
import type { Sted } from '../../shared/contracts/published'
import type { RunContext } from '../../shared/contracts/run'
import { computeSnowScore, mmToCm, selectWindow, SNOWSCORE, type HourlyValue } from '../../shared/snowscore'
import { besteSkivindu, SKIVINDU, type SkivinduTime } from '../../shared/skivindu'
import { erDagslystime } from '../../shared/sol'

interface Weather {
  snowScore: Sted['snowScore']
  nysnoCm: number | null
  temperatur: number | null
  vindMaks: number | null
  skydekke: number | null
  skydekkeDagslys: number | null
  skivindu: Sted['skivindu']
  skivinduUtenDagslys: boolean
}

// AD-2: a place whose response failed still appears, as incomplete data and without old values.
const NO_WEATHER: Weather = {
  snowScore: { kind: 'incomplete', missingShare: 1 },
  nysnoCm: null,
  temperatur: null,
  vindMaks: null,
  skydekke: null,
  skydekkeDagslys: null,
  skivindu: null,
  skivinduUtenDagslys: false,
}

const HOUR_MS = 3_600_000

const mean = (values: number[]) => (values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null)

/**
 * Story 3.5 (FR-22): mean cloud cover over the window's daylight hours at the place. An hour is daylight
 * when the sun is geometrically above the horizon (over 0°, refraction ignored) at its start or half an
 * hour later (shared/sol.ts). As for SnowScore, more than 10 % of those hours without data gives null,
 * so one present hour cannot decide the filter; no daylight hour at all (polar night) gives null too.
 */
function cloudInDaylight(
  window: readonly (MetForecast['properties']['timeseries'][number] | undefined)[],
  referenceTime: string,
  position: { lat: number; lon: number },
): number | null {
  // selectWindow's slots start at the hour containing the reference time, one hour apart.
  const start = Math.floor(Date.parse(referenceTime) / HOUR_MS) * HOUR_MS
  const daylight = window.filter((_, i) => erDagslystime(start + i * HOUR_MS, position.lat, position.lon))
  if (daylight.length === 0) return null
  const present = daylight.filter((step) => step !== undefined)
  if ((daylight.length - present.length) / daylight.length > SNOWSCORE.maxMissingShare) return null
  return mean(present.map((step) => step.data.instant.details.cloud_area_fraction))
}

/**
 * Story 4.2: one entry per hour over the ski window's 48-hour period, from the hour containing the
 * reference time as in selectWindow (which stays at SnowScore's 24 hours). A missing step is an hour of nulls.
 */
function skivinduTimer(steps: MetForecast['properties']['timeseries'], referenceTime: string): SkivinduTime[] {
  const start = Math.floor(Date.parse(referenceTime) / HOUR_MS) * HOUR_MS
  const byTime = new Map(steps.map((step) => [Date.parse(step.time), step]))
  return Array.from({ length: SKIVINDU.periodeTimer }, (_, i) => {
    const ms = start + i * HOUR_MS
    const step = byTime.get(ms)
    return {
      time: new Date(ms).toISOString().replace('.000Z', 'Z'),
      vindMs: step?.data.instant.details.wind_speed ?? null,
      skydekke: step?.data.instant.details.cloud_area_fraction ?? null,
      nedborMm: step?.data.next_1_hours?.details.precipitation_amount ?? null,
      temperaturC: step?.data.instant.details.air_temperature ?? null,
    }
  })
}

/** `position` is the place's own lat/lon, where Story 3.5 checks whether each hour is daylight. */
export function weatherFromForecast(
  forecast: MetForecast,
  referenceTime: string,
  position: { lat: number; lon: number },
): Weather {
  const window = selectWindow(forecast.properties.timeseries, referenceTime)
  const hours: HourlyValue[] = window.map((step) => ({
    precipitationMm: step?.data.next_1_hours?.details.precipitation_amount ?? null,
    temperatureC: step?.data.instant.details.air_temperature ?? null,
  }))
  const snowScore = computeSnowScore(hours)

  const present = window.filter((step) => step !== undefined).map((step) => step.data.instant.details)
  // "Max wind" is the conservative choice for the wind filter (Design Notes, Story 1.10).
  const vindMaks = present.length > 0 ? Math.max(...present.map((d) => d.wind_speed)) : null
  const skydekke = mean(present.map((d) => d.cloud_area_fraction))
  const skydekkeDagslys = cloudInDaylight(window, referenceTime, position)
  const { skivindu, skivinduUtenDagslys } = besteSkivindu(
    skivinduTimer(forecast.properties.timeseries, referenceTime),
    position.lat,
    position.lon,
  )

  return {
    snowScore,
    nysnoCm: snowScore.kind === 'score' ? mmToCm(snowScore.newSnowMm) : null,
    temperatur: snowScore.kind === 'score' ? snowScore.meanTemperatureC : null,
    vindMaks,
    skydekke,
    skydekkeDagslys,
    skivindu,
    skivinduUtenDagslys,
  }
}

export function score(ctx: RunContext): RunContext {
  const validatedById = new Map(ctx.validated.map((v) => [v.stedId, v]))
  const steder: Sted[] = ctx.catalog.map((entry) => {
    const validated = validatedById.get(entry.id)
    const met = validated?.met ?? null
    const nve = validated?.nve ?? null
    return {
      ...entry,
      kildeTidspunkt: met?.properties.meta.updated_at ?? null,
      runId: ctx.runId,
      ...(met ? weatherFromForecast(met, ctx.referenceTime, entry) : NO_WEATHER),
      nveNysnoSisteDognMm: nve ? latestNveValue(nve, ctx.referenceTime) : null,
    }
  })
  return { ...ctx, steder }
}
