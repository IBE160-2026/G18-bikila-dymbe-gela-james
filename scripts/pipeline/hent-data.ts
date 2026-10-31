// AD-10: `npm run data:hent` downloads the file the hourly job last published to the branch `data`, and
// runs before `npm run dev` and `npm run build`. It must never stop them, so every problem is logged,
// the local file stays as it was, and the command exits with code 0.
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { medNyereFelt, PublishedData } from '../../shared/contracts/published'
import type { FetchFn } from './fetch'
import { writeAtomically } from './publish'
import { LIVE_OUT_PATH } from './run'

export const HENT_URL = 'https://raw.githubusercontent.com/IBE160-2026/G18-bikila-dymbe-gela-james/data/latest.json'
export const HENT_TIMEOUT_MS = 15_000

const INGEN_ENDRING = 'Den lokale datafila er ikke endret.'

export interface HentOptions {
  /** Injected so tests never use the network. */
  fetchFn?: FetchFn
  outPath?: string
  log?: (line: string) => void
}

/** The valid local file's `generert`, or null when there is no file or it cannot be read. */
async function lokalGenerert(path: string): Promise<string | null> {
  try {
    const parsed = PublishedData.safeParse(medNyereFelt(JSON.parse(await readFile(path, 'utf8'))))
    return parsed.success ? parsed.data.generert : null
  } catch {
    return null
  }
}

/** The published file if it is valid live data, otherwise the reason it cannot be used. */
function lesPublisert(text: string): { data: PublishedData } | { feil: string } {
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return { feil: 'svaret er ikke gyldig JSON' }
  }
  const parsed = PublishedData.safeParse(medNyereFelt(body))
  if (!parsed.success) return { feil: 'svaret følger ikke PublishedData' }
  if (parsed.data.mode !== 'live') return { feil: `svaret har mode «${parsed.data.mode}», ikke «live»` }
  return { data: parsed.data }
}

function feilmelding(error: unknown): string {
  if (error instanceof Error && error.name === 'TimeoutError') return `Tidsavbrudd etter ${HENT_TIMEOUT_MS / 1000} s`
  return error instanceof Error ? error.message : String(error)
}

/** Never throws. Replaces the local file only with a valid, newer live file, and writes it atomically. */
export async function hentData({
  fetchFn = (url, init) => fetch(url, init),
  outPath = LIVE_OUT_PATH,
  log = console.log,
}: HentOptions = {}): Promise<void> {
  try {
    // The timeout also covers reading the body. raw.githubusercontent.com answers text/plain, so the
    // content type says nothing here.
    const response = await fetchFn(HENT_URL, { signal: AbortSignal.timeout(HENT_TIMEOUT_MS) })
    if (response.status === 404) {
      log(`Fant ingen publisert datafil på grenen data. ${INGEN_ENDRING}`)
      return
    }
    if (!response.ok) {
      log(`Klarte ikke å hente værdata: HTTP ${response.status}. ${INGEN_ENDRING}`)
      return
    }
    const publisert = lesPublisert(await response.text())
    if ('feil' in publisert) {
      log(`Klarte ikke å bruke værdata fra grenen data: ${publisert.feil}. ${INGEN_ENDRING}`)
      return
    }
    await oppdaterLokalFil(publisert.data, outPath, log)
  } catch (error) {
    log(`Klarte ikke å hente værdata: ${feilmelding(error)}. ${INGEN_ENDRING}`)
  }
}

async function oppdaterLokalFil(data: PublishedData, outPath: string, log: (line: string) => void): Promise<void> {
  const lokal = await lokalGenerert(outPath)
  if (lokal !== null && Date.parse(data.generert) <= Date.parse(lokal)) {
    log(`Den lokale datafila (${lokal}) er like ny som den publiserte (${data.generert}), eller nyere. ${INGEN_ENDRING}`)
    return
  }
  await writeAtomically(outPath, `${JSON.stringify(data, null, 2)}\n`)
  log(`Hentet værdata fra grenen data (${data.generert}).`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  // No exit code on failure: `npm run dev` and `npm run build` must go on without a new file.
  hentData().catch((error: unknown) => console.error(`Klarte ikke å hente værdata: ${feilmelding(error)}`))
}
