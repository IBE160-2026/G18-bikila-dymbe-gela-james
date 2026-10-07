// AD-5: run by hand (`npm run catalog`). Produces data/catalog.json and nothing else.
import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import {
  dedupe,
  finalize,
  needsKommune,
  resolveSeed,
  selectSkiResorts,
  SeedsSchema,
  summarize,
  type Candidate,
  type Rejection,
} from './build'
import { defaultDeps, mapLimit } from './http'
import { fetchHeight, fetchKommune, KARTVERKET_CONCURRENCY, searchPlaceName } from './kartverket'
import { fetchSkiResorts } from './osm'

const SEEDS_PATH = fileURLToPath(new URL('./seeds.json', import.meta.url))
const CATALOG_PATH = fileURLToPath(new URL('../../data/catalog.json', import.meta.url))

// Acceptance criterion for Story 1.2; outside this range the inputs are probably broken.
const MIN_PLACES = 250
const MAX_PLACES = 350

class CatalogError extends Error {}

function printRejections(title: string, rejections: Rejection[]): void {
  if (rejections.length === 0) return
  console.log(`\n${title} (${rejections.length}):`)
  for (const r of rejections) console.log(`  - ${r.navn} [${r.type}]: ${r.reason}`)
}

async function main(): Promise<void> {
  const deps = defaultDeps
  const seeds = SeedsSchema.parse(JSON.parse(await readFile(SEEDS_PATH, 'utf8')))

  console.log('Henter skisteder fra OpenStreetMap (Overpass) ...')
  const elements = await fetchSkiResorts(deps)
  const resorts = selectSkiResorts(elements, seeds.skisteder)
  console.log(`  ${elements.length} navngitte områder, ${resorts.selected.length} valgt`)
  if (resorts.unusedExcludes.length > 0) {
    console.warn(`  Advarsel: ekskluder-navn uten treff i OSM: ${resorts.unusedExcludes.join(', ')}`)
  }
  if (resorts.missingIncludes.length > 0) {
    throw new CatalogError(`inkluder-navn uten treff i OSM: ${resorts.missingIncludes.join(', ')}`)
  }

  console.log(`Slår opp ${seeds.steder.length} fjelltopper og byer i Kartverkets stedsnavn-API ...`)
  const resolutions = await mapLimit(seeds.steder, KARTVERKET_CONCURRENCY, async (seed) => ({
    seed,
    result: resolveSeed(seed, await searchPlaceName(seed.navn, deps)),
  }))
  const failed = resolutions.filter(({ result }) => !result.ok)
  if (failed.length > 0) {
    const lines = failed.map(({ seed, result }) => `  - ${seed.navn} (${seed.type}, ${seed.kommune}): ${result.ok ? '' : result.reason}`)
    throw new CatalogError(`${failed.length} navn i seeds.json ble ikke funnet entydig:\n${lines.join('\n')}`)
  }
  const seeded = resolutions.flatMap(({ result }) => (result.ok ? [result.candidate] : []))

  const { kept, duplicates } = dedupe([...resorts.selected, ...seeded])
  for (const { kept: k, dropped } of duplicates) {
    console.log(`  Duplikat: «${dropped.navn}» (${dropped.kilde}) er samme sted som «${k.navn}» (${k.kilde})`)
  }

  const missingKommune = needsKommune(kept)
  const withKommune = new Map<Candidate, Candidate>()
  await mapLimit(missingKommune, KARTVERKET_CONCURRENCY, async (candidate) => {
    const kommune = await fetchKommune(candidate.lat, candidate.lon, deps)
    withKommune.set(candidate, { ...candidate, kommune })
  })
  const candidates = kept.map((candidate) => withKommune.get(candidate) ?? candidate)

  console.log(`Henter høyde for ${candidates.length} steder ...`)
  const heights = new Map<Candidate, number | undefined>()
  await mapLimit(candidates, KARTVERKET_CONCURRENCY, async (candidate) => {
    heights.set(candidate, await fetchHeight(candidate.lat, candidate.lon, deps))
  })

  const { catalog, rejected } = finalize(candidates, heights, new Date())
  printRejections('Avviste steder', [...resorts.rejected, ...rejected])
  // The Kartverket places are curated by hand, so losing one means seeds.json needs fixing.
  const rejectedSeeds = rejected.filter((r) => r.kilde === 'kartverket')
  if (rejectedSeeds.length > 0) {
    throw new CatalogError(
      `${rejectedSeeds.length} steder fra seeds.json ble avvist: ${rejectedSeeds.map((r) => r.navn).join(', ')}`,
    )
  }

  const total = catalog.steder.length
  if (total < MIN_PLACES || total > MAX_PLACES) {
    throw new CatalogError(`katalogen fikk ${total} steder, forventet ${MIN_PLACES}–${MAX_PLACES}`)
  }

  // Atomic replace: a crash mid-write leaves the previous catalog untouched.
  const tmpPath = `${CATALOG_PATH}.${process.pid}.tmp`
  try {
    await writeFile(tmpPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
    await rename(tmpPath, CATALOG_PATH)
  } catch (error) {
    await rm(tmpPath, { force: true })
    throw error
  }

  const counts = summarize(catalog)
  console.log(`\nSkrev ${CATALOG_PATH}`)
  console.log(`  skisted:   ${counts.skisted}`)
  console.log(`  fjelltopp: ${counts.fjelltopp}`)
  console.log(`  by:        ${counts.by}`)
  console.log(`  totalt:    ${total}`)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`\nKatalogen ble ikke skrevet; forrige data/catalog.json står urørt.\nÅrsak: ${message}`)
  process.exitCode = 1
})
