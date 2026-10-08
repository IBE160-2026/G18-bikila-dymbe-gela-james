import { z } from 'zod'
import { CatalogEntry } from './catalog'
import { MetForecast } from './met'
import { NveGridTimeSeries } from './nve'
import { Avvisning, MODES, RunReport, Sted } from './published'

// AD-2: the only way pipeline stages pass data to each other. Each stage takes a RunContext and
// returns a new one; no stage writes a file another stage reads.

export { RunReport }

/** A source response as fetched, before validation. `undefined` means the response is missing. */
export const RawResponses = z.strictObject({
  stedId: z.string(),
  met: z.unknown(),
  nve: z.unknown(),
  /** Why a call failed (network, timeout, HTTP error, not JSON), per source; validate.ts reports it. */
  feil: z.strictObject({ met: z.string().min(1).optional(), nve: z.string().min(1).optional() }).optional(),
})

export type RawResponses = z.infer<typeof RawResponses>

/** A place's responses after validation; null when missing or rejected. */
export const ValidatedResponses = z.strictObject({
  stedId: z.string(),
  met: MetForecast.nullable(),
  nve: NveGridTimeSeries.nullable(),
})

export type ValidatedResponses = z.infer<typeof ValidatedResponses>

export const RunContext = z.strictObject({
  runId: z.string().min(1),
  mode: z.enum(MODES),
  /** When the run started (wall clock in live; the reference time in demo, so duration is 0). */
  start: z.iso.datetime(),
  /** The run's "now", which the SnowScore window starts from. */
  referenceTime: z.iso.datetime(),
  catalog: z.array(CatalogEntry),
  /** Filled by the source stage (fetch.ts live, sources/fixtures.ts demo). */
  raw: z.array(RawResponses),
  /** Filled by validate.ts. */
  validated: z.array(ValidatedResponses),
  /** Filled by validate.ts: rejected or missing responses. */
  avviste: z.array(Avvisning),
  /** Filled by score.ts. */
  steder: z.array(Sted),
  /** Filled by publish.ts. */
  report: RunReport.nullable(),
})

export type RunContext = z.infer<typeof RunContext>
