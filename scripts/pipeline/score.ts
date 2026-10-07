// AD-2 stage: turns validated responses into published place records. The formula itself lives
// only in shared/snowscore.ts (AD-6); this file picks the window and aggregates wind and cloud.
import type { MetForecast } from '../../shared/contracts/met'
import { latestNveValue } from '../../shared/contracts/nve'
import type { Sted } from '../../shared/contracts/published'
import type { RunContext } from '../../shared/contracts/run'
import { computeSnowScore, mmToCm, selectWindow, type HourlyValue } from '../../shared/snowscore'

interface Weather {
  snowScore: Sted['snowScore']
  nysnoCm: number | null
  temperatur: number | null
  vindMaks: number | null
  skydekke: number | null
}

// AD-2: a place whose response failed still appears, as incomplete data and without old values.
const NO_WEATHER: Weather = {
  snowScore: { kind: 'incomplete', missingShare: 1 },
  nysnoCm: null,
  temperatur: null,
  vindMaks: null,
  skydekke: null,
}

export function weatherFromForecast(forecast: MetForecast, referenceTime: string): Weather {
  const window = selectWindow(forecast.properties.timeseries, referenceTime)
  const hours: HourlyValue[] = window.map((step) => ({
    precipitationMm: step?.data.next_1_hours?.details.precipitation_amount ?? null,
    temperatureC: step?.data.instant.details.air_temperature ?? null,
  }))
  const snowScore = computeSnowScore(hours)

  const present = window.filter((step) => step !== undefined).map((step) => step.data.instant.details)
  // "Max wind" is the conservative choice for the wind filter (Design Notes, Story 1.10).
  const vindMaks = present.length > 0 ? Math.max(...present.map((d) => d.wind_speed)) : null
  const skydekke =
    present.length > 0 ? present.reduce((sum, d) => sum + d.cloud_area_fraction, 0) / present.length : null

  return {
    snowScore,
    nysnoCm: snowScore.kind === 'score' ? mmToCm(snowScore.newSnowMm) : null,
    temperatur: snowScore.kind === 'score' ? snowScore.meanTemperatureC : null,
    vindMaks,
    skydekke,
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
      ...(met ? weatherFromForecast(met, ctx.referenceTime) : NO_WEATHER),
      nveNysnoSisteDognMm: nve ? latestNveValue(nve, ctx.referenceTime) : null,
    }
  })
  return { ...ctx, steder }
}
