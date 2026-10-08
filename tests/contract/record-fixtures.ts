// Run by hand (`npm run fixtures:record`, needs network). Records one real MET Locationforecast and
// one NVE GridTimeSeries `fsw` response per place in demo-catalog.json, then applies the two
// documented edits (see fixtures/README.md). Nothing else calls the network: `npm run data:demo`,
// the tests and the app only read the committed files.
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Catalog } from '../../shared/contracts/catalog'
import { MetForecast } from '../../shared/contracts/met'
import { NveGridTimeSeries } from '../../shared/contracts/nve'
import { selectWindow } from '../../shared/snowscore'
// The URL builders are shared with the live run, so the fixtures are recorded from the same calls.
import { metUrl, nveUrl } from '../../scripts/pipeline/fetch'

// AD-5: the catalog script's HTTP helpers are not imported; getJson below follows the same pattern.
// The pipeline's URL builders (imported above) are shared on purpose, so fixtures and live runs make
// the same calls.
const USER_AGENT = 'SnowFinder-fixtures/1.0 (IBE160 G18, Hogskolen i Molde; https://github.com/IBE160-2026)'
const CONCURRENCY = 4
const ATTEMPTS = 3

const FIXTURES = new URL('./fixtures/', import.meta.url)
const fixturePath = (relative: string) => fileURLToPath(new URL(relative, FIXTURES))

/** Gets hours removed from its window so more than 10 % are missing. */
export const INCOMPLETE_ID = 'trondheim'
/** Window hours removed from INCOMPLETE_ID: 4 of 24 = 16.7 %. */
export const REMOVED_WINDOW_HOURS = [6, 7, 8, 9]
/** Gets `updated_at` moved this far behind the newest other fixture. */
export const STALE_ID = 'kirkenes'
export const STALE_SHIFT_HOURS = 4

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function getJson(url: string): Promise<unknown> {
  let lastError: unknown
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(1000 * 2 ** (attempt - 1))
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      })
      if (response.ok) return await response.json()
      lastError = new Error(`HTTP ${response.status} fra ${url}`)
      if (response.status !== 429 && response.status < 500) break
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

async function writeJson(relative: string, value: unknown): Promise<void> {
  const path = fixturePath(relative)
  const tmp = `${path}.${process.pid}.tmp`
  try {
    await writeFile(tmp, `${JSON.stringify(value)}\n`, 'utf8')
    await rename(tmp, path)
  } catch (error) {
    await rm(tmp, { force: true })
    throw error
  }
}

async function main(): Promise<void> {
  const catalog = Catalog.parse(JSON.parse(await readFile(fixturePath('demo-catalog.json'), 'utf8')))
  const today = Date.now()
  // The raw bodies are stored, not the parsed ones, because parsing drops the fields we do not use.
  const met = new Map<string, MetForecast>()
  const nve = new Map<string, unknown>()

  const queue = [...catalog.steder]
  const worker = async () => {
    for (let sted = queue.shift(); sted; sted = queue.shift()) {
      console.log(`Henter ${sted.id} ...`)
      // Record only responses that pass the contract, so the fixtures are real *valid* answers.
      const metRaw = await getJson(metUrl(sted))
      MetForecast.parse(metRaw)
      met.set(sted.id, metRaw as MetForecast)
      const nveRaw = await getJson(nveUrl(sted, today))
      NveGridTimeSeries.parse(nveRaw)
      nve.set(sted.id, nveRaw)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const stale = met.get(STALE_ID)
  const incomplete = met.get(INCOMPLETE_ID)
  if (!stale || !incomplete) throw new Error(`${STALE_ID} og ${INCOMPLETE_ID} må stå i demo-catalog.json`)

  const newestOther = Math.max(
    ...[...met.entries()].filter(([id]) => id !== STALE_ID).map(([, f]) => Date.parse(f.properties.meta.updated_at)),
  )
  stale.properties.meta.updated_at = new Date(newestOther - STALE_SHIFT_HOURS * 3_600_000)
    .toISOString()
    .replace('.000Z', 'Z')

  // The demo reference time is the newest updated_at after the stale edit (AD-10).
  const referenceTime = new Date(newestOther).toISOString()
  const window = selectWindow(incomplete.properties.timeseries, referenceTime)
  const removed = new Set(REMOVED_WINDOW_HOURS.map((i) => window[i]?.time))
  incomplete.properties.timeseries = incomplete.properties.timeseries.filter((step) => !removed.has(step.time))

  await mkdir(fixturePath('met/'), { recursive: true })
  await mkdir(fixturePath('nve/'), { recursive: true })
  for (const sted of catalog.steder) {
    await writeJson(`met/${sted.id}.json`, met.get(sted.id))
    await writeJson(`nve/${sted.id}.json`, nve.get(sted.id))
  }
  console.log(`\nSkrev ${catalog.steder.length * 2} fixtures. Referansetid: ${referenceTime}`)
}

// Only run when executed directly, so the contract test can import the constants above.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error: unknown) => {
    console.error(`\nOpptaket feilet: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
