// AD-2 stage: publishes the data file atomically when enough places are valid, and owns the run
// report (AD-11) that run.ts writes in its `finally`.
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { PublishedData, RunReport } from '../../shared/contracts/published'
import type { RunContext } from '../../shared/contracts/run'

/** AD-2: publish only when at least this share of places is valid. */
export const MIN_VALID_SHARE = 0.95

export interface ReportOutcome {
  /** When the run ended; duration is measured from ctx.start. */
  end: string
  publisert: boolean
  ikkePublisertFordi: string | null
}

/** A place is valid when its MET response was present and passed validation (AD-2). NVE is optional. */
export function validShare(ctx: RunContext): number {
  if (ctx.catalog.length === 0) return 0
  const valid = ctx.validated.filter((v) => v.met !== null).length
  return valid / ctx.catalog.length
}

export function buildReport(ctx: RunContext, outcome: ReportOutcome): RunReport {
  // Places with a valid MET response but too many missing hours; rejected responses are counted
  // in avvistePerKilde instead, so no place is counted twice.
  const validMet = new Set(ctx.validated.filter((v) => v.met !== null).map((v) => v.stedId))
  const antallUfullstendige = ctx.steder.filter(
    (s) => validMet.has(s.id) && s.snowScore.kind === 'incomplete',
  ).length
  return RunReport.parse({
    runId: ctx.runId,
    mode: ctx.mode,
    start: ctx.start,
    varighetMs: Math.max(0, Date.parse(outcome.end) - Date.parse(ctx.start)),
    antallSteder: ctx.catalog.length,
    andelGyldige: validShare(ctx),
    avvistePerKilde: {
      met: ctx.avviste.filter((a) => a.kilde === 'met').length,
      nve: ctx.avviste.filter((a) => a.kilde === 'nve').length,
    },
    antallUfullstendige,
    publisert: outcome.publisert,
    ikkePublisertFordi: outcome.ikkePublisertFordi,
    avviste: ctx.avviste,
  })
}

/** Writes `content` to a temporary name next to `path`, then renames it into place. */
async function writeAtomically(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const tmpPath = `${path}.${process.pid}.tmp`
  try {
    await writeFile(tmpPath, content, 'utf8')
    await rename(tmpPath, path)
  } catch (error) {
    await rm(tmpPath, { force: true })
    throw error
  }
}

export interface PublishOptions {
  outPath: string
  /** The run's end time: the reference time in demo (duration 0), the wall clock in live. */
  now: string
}

/**
 * Publishes when the valid share is at least MIN_VALID_SHARE. Below it, nothing is written and the
 * previous file stays untouched; the returned context carries a report saying why.
 */
export async function publish(ctx: RunContext, { outPath, now }: PublishOptions): Promise<RunContext> {
  const share = validShare(ctx)
  if (share < MIN_VALID_SHARE) {
    const percent = (share * 100).toFixed(1)
    const report = buildReport(ctx, {
      end: now,
      publisert: false,
      ikkePublisertFordi: `Bare ${percent} % av stedene har gyldige data; minst ${MIN_VALID_SHARE * 100} % kreves`,
    })
    return { ...ctx, report }
  }

  const report = buildReport(ctx, { end: now, publisert: true, ikkePublisertFordi: null })
  // AD-12: the file is checked against the same schema the app parses it with.
  const data = PublishedData.parse({
    mode: ctx.mode,
    referenceTime: ctx.referenceTime,
    runId: ctx.runId,
    generert: now,
    report,
    steder: ctx.steder,
  })
  await writeAtomically(outPath, `${JSON.stringify(data, null, 2)}\n`)
  return { ...ctx, report }
}

/**
 * AD-11: the run report step, called by run.ts in `finally` for every run. A run that crashed
 * before publish.ts gets a report saying why. Unpublished reports go to the job log in full.
 */
function failureReason(error: unknown): string {
  if (error instanceof Error && error.message) return `Kjøringen feilet: ${error.message}`
  if (error !== undefined && error !== null && String(error)) return `Kjøringen feilet: ${String(error)}`
  // No error object: the run stopped before publish.ts made a report.
  return 'Kjøringen feilet uten feilmelding før publisering'
}

export function writeRunReport(ctx: RunContext, error: unknown, now: string, log: (line: string) => void): RunReport {
  const report =
    ctx.report && error === undefined
      ? ctx.report
      : buildReport(ctx, {
          end: now,
          publisert: false,
          ikkePublisertFordi: failureReason(error),
        })
  if (report.publisert) {
    log(
      `Publisert (${report.mode}, runId ${report.runId}): ${report.antallSteder} steder, ` +
        `${(report.andelGyldige * 100).toFixed(1)} % gyldige, ${report.antallUfullstendige} ufullstendige, ` +
        `avviste MET ${report.avvistePerKilde.met}, NVE ${report.avvistePerKilde.nve}`,
    )
    // The reasons also belong in the job log, not only in the published file.
    for (const a of report.avviste) log(`  Avvist ${a.kilde.toUpperCase()} for ${a.stedId}: ${a.arsak}`)
  } else {
    log(`Ikke publisert: ${report.ikkePublisertFordi}. Forrige datafil står urørt.`)
    log(JSON.stringify(report, null, 2))
  }
  return report
}
