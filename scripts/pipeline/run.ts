// AD-2: the single entrypoint of the data program. Creates the run ID, calls the stages in order and
// always writes the run report in `finally`. `npm run data:demo` runs it on the recorded fixtures.
// Live fetching (fetch.ts) comes in Story 1.3/1.5.
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RunContext, RunReport } from '../../shared/contracts/run'
import { publish, writeRunReport } from './publish'
import { score } from './score'
import { DEFAULT_FIXTURES_DIR, demoReferenceTime, loadDemoCatalog, readFixtures } from './sources/fixtures'
import { validate } from './validate'

export const DEMO_OUT_PATH = fileURLToPath(new URL('../../public/data/demo.json', import.meta.url))
/** AD-10: the demo's run ID is fixed so regenerating gives a byte-identical file. */
export const DEMO_RUN_ID = 'demo'

export interface DemoOptions {
  fixturesDir?: string
  outPath?: string
  log?: (line: string) => void
}

function emptyContext(start: string): RunContext {
  return {
    runId: DEMO_RUN_ID,
    mode: 'demo',
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
  let ctx = emptyContext(new Date().toISOString())
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

async function main(argv: string[]): Promise<void> {
  if (!argv.includes('--demo')) {
    console.error('Bare demokjøring finnes ennå: bruk `npm run data:demo`. Live-henting kommer i Story 1.3/1.5.')
    process.exitCode = 2
    return
  }
  const report = await runDemo()
  if (!report.publisert) process.exitCode = 1
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(`Dataprogrammet feilet: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
