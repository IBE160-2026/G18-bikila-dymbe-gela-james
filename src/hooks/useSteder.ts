import { useSyncExternalStore } from 'react'
import { erGamleData, ferskhet } from '../../shared/freshness'
import { now } from '../lib/clock'
import { dataKilde, LOAD_ERROR_MESSAGE, loadPublishedData, type DataSource, type LoadResult } from '../lib/data/loadPublishedData'
import type { PublishedData } from '../../shared/contracts/published'

// AD-8: the only way pages and components get place data. One store per page loads the file once and
// applies the age limits once, so every caller sees the same places and moving between routes never
// fetches again. In live mode the store re-checks the limits every minute and when the tab is shown
// again, so a tab left open still marks and removes places as they age. When a live file passes 90 min
// it loads the file once more (Story 1.6b), so the banner only shows when the job has stopped.

/** How often a live page re-checks the age limits. */
export const FERSKHET_SJEKK_MS = 60_000
/**
 * Story 1.6b: once a live file passes 90 min, the page loads the file again before showing the banner,
 * since the job has most likely published a newer one. If that gave no newer file, it tries again at
 * most this often, so a tab costs one call an hour while the job is down.
 */
export const NY_HENTING_ETTER_MS = 60 * 60_000

/** LoadResult after the age limits (NFR-3): places older than 12 h are gone from `data.steder`. */
export type StederResult =
  | {
      status: 'ok'
      data: PublishedData
      source: DataSource
      /** Places older than 3 h; shown with «Utdatert». */
      utdatert: ReadonlySet<string>
      /** Places older than 12 h, removed so the place page can say why instead of "not found". */
      fjernet: ReadonlySet<string>
      /** The whole file was published more than 90 min ago; Utforsk and the place page show a banner. */
      gamleData: boolean
    }
  | { status: 'error'; message: string }

/**
 * Applies the age limits in one place, so map, list and place page always see the same places.
 * Age is measured against now(data): the file's referenceTime in demo (AD-10).
 */
export function medFerskhet(result: LoadResult): StederResult {
  if (result.status === 'error') return result
  const naa = now(result.data)
  const utdatert = new Set<string>()
  const fjernet = new Set<string>()
  const steder = result.data.steder.filter((sted) => {
    const alder = ferskhet(sted.kildeTidspunkt, naa)
    if (alder === 'utdatert') utdatert.add(sted.id)
    if (alder === 'for-gammel') fjernet.add(sted.id)
    return alder !== 'for-gammel'
  })
  const gamleData = erGamleData(result.data.generert, naa)
  return { ...result, data: { ...result.data, steder }, utdatert, fjernet, gamleData }
}

function sammeSett(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((id) => b.has(id))
}

/**
 * The age limits again for a page that stays open. Returns `previous` itself when no place changed
 * status and the banner did not change, and keeps its `data` when only «Utdatert» or the banner
 * changed, so the map is not rebuilt (and its zoom reset) every minute.
 */
export function oppdaterFerskhet(previous: StederResult, raw: LoadResult): StederResult {
  const next = medFerskhet(raw)
  if (previous.status !== 'ok' || next.status !== 'ok') return next
  if (!sammeSett(previous.fjernet, next.fjernet)) return next
  if (sammeSett(previous.utdatert, next.utdatert) && previous.gamleData === next.gamleData) return previous
  return { ...previous, utdatert: next.utdatert, gamleData: next.gamleData }
}

/** Only live data ages while the page is open; demo time stands still (AD-10). */
export function trengerFerskhetssjekk(raw: LoadResult | null): boolean {
  return raw?.status === 'ok' && raw.data.mode === 'live'
}

export type StederStore = {
  subscribe: (onChange: () => void) => () => void
  getSnapshot: () => StederResult | null
}

/** Time in ms by the file's own clock (AD-10), or null when there is no file. */
function naaMs(raw: LoadResult | null): number | null {
  return raw?.status === 'ok' ? now(raw.data).getTime() : null
}

/** A live file published more than 90 min ago; demo data never ages (AD-10). */
function erGammelLiveFil(raw: LoadResult | null): boolean {
  return trengerFerskhetssjekk(raw) && raw?.status === 'ok' && erGamleData(raw.data.generert, now(raw.data))
}

/**
 * One store for the whole page: it loads the file once, applies the age limits once and, for live
 * data, re-checks them every minute and when the tab is shown again. A live file that passes 90 min
 * is loaded again (Story 1.6b), so a tab left open gets the job's newer file instead of the banner.
 * Every useSteder() caller reads the same snapshot, so map, list and place page can never disagree.
 */
export function createStederStore(loadFn: () => Promise<LoadResult>): StederStore {
  let raw: LoadResult | null = null
  let result: StederResult | null = null
  let pending: Promise<void> | null = null
  let stopSjekk: (() => void) | null = null
  /** A new load is in flight; there is never more than one. */
  let henter = false
  /** No new load before this time (by now()), so a stopped job costs one call an hour. */
  let nesteHentingMs = Number.NEGATIVE_INFINITY
  const listeners = new Set<() => void>()

  function publiser(next: StederResult) {
    if (next === result) return
    result = next
    for (const listener of listeners) listener()
  }

  /** Takes a loaded file into use. A file that is already old counts as a try, so it is not loaded again at once. */
  function brukFil(loaded: LoadResult) {
    raw = loaded
    const naa = naaMs(loaded)
    nesteHentingMs = erGammelLiveFil(loaded) && naa !== null ? naa + NY_HENTING_ETTER_MS : Number.NEGATIVE_INFINITY
  }

  function hentPaNytt() {
    const naa = naaMs(raw)
    if (raw?.status !== 'ok' || naa === null) return
    const forrige = raw.data.generert
    henter = true
    nesteHentingMs = naa + NY_HENTING_ETTER_MS
    loadFn()
      // A failed load keeps the data on screen; the banner then shows as before.
      .catch((): LoadResult => ({ status: 'error', message: LOAD_ERROR_MESSAGE }))
      .then((loaded) => {
        henter = false
        // Only a newer file replaces the one on screen; the same or an older one means the job has stopped.
        if (loaded.status === 'ok' && Date.parse(loaded.data.generert) > Date.parse(forrige)) {
          brukFil(loaded)
          // New data, so the age limits start over; the map keeps its zoom (KartVisning is built once).
          publiser(medFerskhet(loaded))
        }
        sjekk()
      })
  }

  function sjekk() {
    if (raw === null || result === null) return
    const naa = naaMs(raw)
    // Look for a newer file before the banner shows; sjekk() runs again when the load is done.
    if (!henter && erGammelLiveFil(raw) && naa !== null && naa >= nesteHentingMs) hentPaNytt()
    let next = oppdaterFerskhet(result, raw)
    // While the load is in flight the banner waits for it, so it does not flash before the newer data.
    // «Utdatert» and removal still apply as before.
    if (henter && next.status === 'ok' && result.status === 'ok' && next.gamleData && !result.gamleData) {
      next = next.data === result.data && sammeSett(next.utdatert, result.utdatert) ? result : { ...next, gamleData: false }
    }
    publiser(next)
  }

  function startSjekk() {
    if (stopSjekk || !trengerFerskhetssjekk(raw)) return
    const timer = setInterval(sjekk, FERSKHET_SJEKK_MS)
    // Background tabs throttle timers and computers sleep, so check at once when the tab is shown again.
    const vedSynlig = () => {
      if (document.visibilityState === 'visible') sjekk()
    }
    const harDokument = typeof document !== 'undefined'
    if (harDokument) document.addEventListener('visibilitychange', vedSynlig)
    stopSjekk = () => {
      clearInterval(timer)
      if (harDokument) document.removeEventListener('visibilitychange', vedSynlig)
    }
  }

  return {
    subscribe(onChange) {
      listeners.add(onChange)
      pending ??= loadFn()
        // loadPublishedData never rejects, but an unexpected throw must show the error view, not a
        // skeleton forever.
        .catch((): LoadResult => ({ status: 'error', message: LOAD_ERROR_MESSAGE }))
        .then((loaded) => {
          brukFil(loaded)
          publiser(medFerskhet(loaded))
          if (listeners.size > 0) startSjekk()
        })
      if (raw !== null) startSjekk()
      return () => {
        listeners.delete(onChange)
        if (listeners.size === 0) {
          stopSjekk?.()
          stopSjekk = null
        }
      }
    },
    getSnapshot: () => result,
  }
}

// AD-10: `--mode demo` on the command line chooses demo.json when the app is built; nothing else does.
const store = createStederStore(() =>
  loadPublishedData(undefined, import.meta.env.BASE_URL, dataKilde(import.meta.env.MODE)),
)

/** `null` while loading, then the `ok` or `error` result, with too old places already removed. */
export function useSteder(): StederResult | null {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
