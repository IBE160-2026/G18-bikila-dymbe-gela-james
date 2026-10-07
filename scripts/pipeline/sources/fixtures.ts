// AD-10: the demo source. Reads the recorded MET and NVE responses in tests/contract/fixtures/
// instead of calling the APIs, so `npm run data:demo` works offline and gives the same file every time.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Catalog, type CatalogEntry } from '../../../shared/contracts/catalog'
import { MetForecast } from '../../../shared/contracts/met'
import type { RawResponses, RunContext } from '../../../shared/contracts/run'

export const DEFAULT_FIXTURES_DIR = fileURLToPath(new URL('../../../tests/contract/fixtures/', import.meta.url))

/** The demo catalog: 24 places copied from data/catalog.json. */
export async function loadDemoCatalog(dir = DEFAULT_FIXTURES_DIR): Promise<CatalogEntry[]> {
  return Catalog.parse(JSON.parse(await readFile(join(dir, 'demo-catalog.json'), 'utf8'))).steder
}

/**
 * Reads one recorded response. A missing file is a missing response (undefined). A file that is
 * not JSON is passed on as its text, so validate.ts rejects it like any other invalid response.
 */
async function readResponse(path: string): Promise<unknown> {
  let text: string
  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** The source stage in demo mode: fills `raw` with one MET and one NVE response per place. */
export async function readFixtures(ctx: RunContext, dir = DEFAULT_FIXTURES_DIR): Promise<RunContext> {
  const raw: RawResponses[] = await Promise.all(
    ctx.catalog.map(async (sted) => ({
      stedId: sted.id,
      met: await readResponse(join(dir, 'met', `${sted.id}.json`)),
      nve: await readResponse(join(dir, 'nve', `${sted.id}.json`)),
    })),
  )
  return { ...ctx, raw }
}

/**
 * AD-10: the demo's "now" is the newest MET `updated_at` among the fixtures, so data age in the
 * demo never depends on when it is opened. Only responses that pass the MET contract count, so a
 * response validate.ts rejects can never move the reference time.
 */
export function demoReferenceTime(raw: readonly RawResponses[]): string {
  let newest: string | null = null
  for (const { met } of raw) {
    const parsed = MetForecast.safeParse(met)
    if (!parsed.success) continue
    const updatedAt = parsed.data.properties.meta.updated_at
    if (newest === null || Date.parse(updatedAt) > Date.parse(newest)) newest = updatedAt
  }
  if (newest === null) throw new Error('Ingen gyldig MET-fixture, så demoen har ingen referansetid')
  return newest
}
