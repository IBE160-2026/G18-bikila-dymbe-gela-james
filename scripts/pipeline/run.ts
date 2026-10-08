// AD-2: the single entrypoint of the data program. Creates the run ID, calls the stages in order and
// always writes the run report in `finally`. `npm run data:demo` runs it on the recorded fixtures,
// `npm run data` on live MET and NVE data. Publishing the live data file comes in Story 1.5.
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Catalog, type CatalogEntry } from '../../shared/contracts/catalog'
import type { RunContext, RunReport } from '../../shared/contracts/run'
import { fetchAll, type FetchFn } from './fetch'
import { buildReport, MIN_VALID_SHARE, publish, writeRunReport } from './publish'
import { score } from './score'
import { DEFAULT_FIXTURES_DIR, demoReferenceTime, loadDemoCatalog, readFixtures } from './sources/fixtures'
import { validate } from './validate'

export const DEMO_OUT_PATH = fileURLToPath(new URL('../../public/data/demo.json', import.meta.url))
/** AD-10: the demo's run ID is fixed so regenerating gives a byte-identical file. */
export const DEMO_RUN_ID = 'demo'
export const CATALOG_PATH = fileURLToPath(new URL('../../data/catalog.json', import.meta.url))
/**
 * Why a live run that completed is not published yet. main() exits 1 on any other reason (a crash)
 * and when fewer than MIN_VALID_SHARE of the places are valid, so a total outage is not a success.
 */
export const LIVE_NOT_PUBLISHED = 'Publisering av live-data kommer i Story 1.5'

export interface DemoOptions {
  fixturesDir?: string
  outPath?: string
  log?: (line: string) => void
}

function emptyContext(runId: string, mode: RunContext['mode'], start: string): RunContext {
  return {
    runId,
    mode,
    start,
    referenceTime: start,
    catalog: [],
    raw: [],
    validated: [],
    avviste: [],
    steder: [],
    report: null,
  }
}

/** Runs the pipeline on the fixtures. Never throws: failures end up in the returned report. */
export async function runDemo({
  fixturesDir = DEFAULT_FIXTURES_DIR,
  outPath = DEMO_OUT_PATH,
  log = console.log,
}: DemoOptions = {}): Promise<RunReport> {
  // Until the fixtures are read there is no reference time; a crash this early reports wall-clock time.
  let ctx = emptyContext(DEMO_RUN_ID, 'demo', new Date().toISOString())
  let error: unknown
  let referenceTimeKnown = false
  try {
    ctx = { ...ctx, catalog: await loadDemoCatalog(fixturesDir) }
    ctx = await readFixtures(ctx, fixturesDir)
    // AD-10: in demo, start, end and "now" are all the reference time, so the duration is 0.
    const referenceTime = demoReferenceTime(ctx.raw)
    ctx = { ...ctx, start: referenceTime, referenceTime }
    referenceTimeKnown = true
    ctx = validate(ctx)
    ctx = score(ctx)
    ctx = await publish(ctx, { outPath, now: referenceTime })
  } catch (caught) {
    error = caught ?? new Error('Ukjent feil')
  } finally {
    // The end time is the reference time in demo; after an early crash it is the wall clock.
    const now = referenceTimeKnown ? ctx.referenceTime : new Date().toISOString()
    ctx = { ...ctx, report: writeRunReport(ctx, error, now, log) }
  }
  return ctx.report as RunReport
}

export interface LiveOptions {
  catalogPath?: string
  /** Injected so tests never use the network. */
  fetchFn?: FetchFn
  /** The wall clock; injected so tests control the start, reference and end time. */
  clock?: () => string
  concurrency?: number
  timeoutMs?: number
  log?: (line: string) => void
}

/** A readable run ID that is unique per run: the start time to the second plus a random suffix. */
export function liveRunId(start: string): string {
  return `${start.replace(/\.\d+/, '').replace(/[-:]/g, '')}-${randomUUID().slice(0, 8)}`
}

async function loadCatalog(path: string): Promise<CatalogEntry[]> {
  return Catalog.parse(JSON.parse(await readFile(path, 'utf8'))).steder
}

/**
 * Runs the pipeline on live data: fetch → validate → score, then prints the run report. Writes no
 * file yet (publishing is Story 1.5). Never throws: failures end up in the returned report.
 */
export async function runLive({
  catalogPath = CATALOG_PATH,
  fetchFn = (url, init) => fetch(url, init),
  clock = () => new Date().toISOString(),
  concurrency,
  timeoutMs,
  log = console.log,
}: LiveOptions = {}): Promise<RunReport> {
  // AD-10: in live, the reference time is the wall clock when the run started.
  const start = clock()
  let ctx = emptyContext(liveRunId(start), 'live', start)
  let error: unknown
  try {
    ctx = { ...ctx, catalog: await loadCatalog(catalogPath) }
    log(`Henter MET og NVE for ${ctx.catalog.length} steder (runId ${ctx.runId}) ...`)
    ctx = await fetchAll(ctx, { fetchFn, concurrency, timeoutMs })
    ctx = validate(ctx)
    ctx = score(ctx)
    ctx = { ...ctx, report: buildReport(ctx, { end: clock(), publisert: false, ikkePublisertFordi: LIVE_NOT_PUBLISHED }) }
  } catch (caught) {
    error = caught ?? new Error('Ukjent feil')
  } finally {
    ctx = { ...ctx, report: writeRunReport(ctx, error, clock(), log) }
  }
  return ctx.report as RunReport
}

async function main(argv: string[]): Promise<void> {
  if (argv.includes('--demo')) {
    const report = await runDemo()
    if (!report.publisert) process.exitCode = 1
    return
  }
  const report = await runLive()
  if (report.ikkePublisertFordi !== LIVE_NOT_PUBLISHED || report.andelGyldige < MIN_VALID_SHARE) process.exitCode = 1
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(`Dataprogrammet feilet: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
