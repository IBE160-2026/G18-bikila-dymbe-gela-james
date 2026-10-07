import { z } from 'zod'
import { CatalogEntry } from './catalog'

// AD-12: the published data file. `publish.ts` validates against PublishedData before writing, and
// src/lib/data/ parses with the same schema when loading. AD-10: demo and live share this shape.

export const MODES = ['demo', 'live'] as const
export const KILDER_DATA = ['met', 'nve'] as const

const isoUtc = z.iso.datetime()
const share = z.number().min(0).max(1)

/** The result of shared/snowscore.ts computeSnowScore, as stored in the file. */
export const SnowScoreResult = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('score'),
    score: z.number().int().min(0).max(100),
    a: z.number().min(0).max(60),
    b: z.number().min(0).max(25),
    c: z.number().min(0).max(15),
    newSnowMm: z.number().min(0),
    precipitationMm: z.number().min(0),
    meanTemperatureC: z.number(),
  }),
  z.strictObject({
    kind: z.literal('incomplete'),
    missingShare: share,
  }),
])

export const Avvisning = z.strictObject({
  stedId: z.string(),
  kilde: z.enum(KILDER_DATA),
  arsak: z.string().min(1),
})

export type Avvisning = z.infer<typeof Avvisning>

// AD-11: one report per run, also for runs that do not publish.
export const RunReport = z.strictObject({
  runId: z.string().min(1),
  mode: z.enum(MODES),
  start: isoUtc,
  varighetMs: z.number().int().min(0),
  antallSteder: z.number().int().min(0),
  /** Share of places whose MET response was present and valid; incomplete places count as valid. */
  andelGyldige: share,
  avvistePerKilde: z.strictObject({ met: z.number().int().min(0), nve: z.number().int().min(0) }),
  antallUfullstendige: z.number().int().min(0),
  publisert: z.boolean(),
  /** Why the run was not published; null when it was. */
  ikkePublisertFordi: z.string().nullable(),
  avviste: z.array(Avvisning),
})

export type RunReport = z.infer<typeof RunReport>

export const Sted = z.strictObject({
  ...CatalogEntry.shape,
  /** MET's `updated_at` for this place's forecast; null when the response was missing or rejected. */
  kildeTidspunkt: isoUtc.nullable(),
  runId: z.string().min(1),
  snowScore: SnowScoreResult,
  /** S converted to cm with mmToCm; null when the score is incomplete. */
  nysnoCm: z.number().min(0).nullable(),
  /** T̄ over the window in °C; null when the score is incomplete. */
  temperatur: z.number().nullable(),
  /** Highest wind speed in the window in m/s; null when no hour has data. */
  vindMaks: z.number().min(0).nullable(),
  /** Mean cloud cover in the window in %; null when no hour has data. */
  skydekke: z.number().min(0).max(100).nullable(),
  /** NVE seNorge new snow over the last day at or before the reference time, in mm; null when missing. */
  nveNysnoSisteDognMm: z.number().min(0).nullable(),
})

export type Sted = z.infer<typeof Sted>

export const PublishedData = z.strictObject({
  mode: z.enum(MODES),
  /** The run's "now": wall clock in live, the newest fixture timestamp in demo (AD-10). */
  referenceTime: isoUtc,
  runId: z.string().min(1),
  generert: isoUtc,
  report: RunReport,
  steder: z.array(Sted),
})

export type PublishedData = z.infer<typeof PublishedData>
