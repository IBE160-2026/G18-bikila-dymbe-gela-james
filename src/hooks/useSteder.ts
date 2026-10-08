import { useSyncExternalStore } from 'react'
import { ferskhet } from '../../shared/freshness'
import { now } from '../lib/clock'
import { LOAD_ERROR_MESSAGE, loadPublishedData, type DataSource, type LoadResult } from '../lib/data/loadPublishedData'
import type { PublishedData } from '../../shared/contracts/published'

// AD-8: the only way pages and components get place data. One store per page loads the file once and
// applies the age limits once, so every caller sees the same places and moving between routes never
// fetches again. In live mode the store re-checks the limits every minute and when the tab is shown
// again, so a tab left open still marks and removes places as they age.

/** How often a live page re-checks the age limits. */
export const FERSKHET_SJEKK_MS = 60_000

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
  return { ...result, data: { ...result.data, steder }, utdatert, fjernet }
}

function sammeSett(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((id) => b.has(id))
}

/**
 * The age limits again for a page that stays open. Returns `previous` itself when no place changed
 * status, and keeps its `data` when only «Utdatert» changed, so the map is not rebuilt (and its
 * zoom reset) every minute.
 */
export function oppdaterFerskhet(previous: StederResult, raw: LoadResult): StederResult {
  const next = medFerskhet(raw)
  if (previous.status !== 'ok' || next.status !== 'ok') return next
  const sammeFjernet = sammeSett(previous.fjernet, next.fjernet)
  if (sammeFjernet && sammeSett(previous.utdatert, next.utdatert)) return previous
  return sammeFjernet ? { ...previous, utdatert: next.utdatert } : next
}

/** Only live data ages while the page is open; demo time stands still (AD-10). */
export function trengerFerskhetssjekk(raw: LoadResult | null): boolean {
  return raw?.status === 'ok' && raw.data.mode === 'live'
}

export type StederStore = {
  subscribe: (onChange: () => void) => () => void
  getSnapshot: () => StederResult | null
}

/**
 * One store for the whole page: it loads the file once, applies the age limits once and, for live
 * data, re-checks them every minute and when the tab is shown again. Every useSteder() caller reads
 * the same snapshot, so map, list and place page can never disagree.
 */
export function createStederStore(loadFn: () => Promise<LoadResult>): StederStore {
  let raw: LoadResult | null = null
  let result: StederResult | null = null
  let pending: Promise<void> | null = null
  let stopSjekk: (() => void) | null = null
  const listeners = new Set<() => void>()

  function publiser(next: StederResult) {
    if (next === result) return
    result = next
    for (const listener of listeners) listener()
  }

  function sjekk() {
    if (raw !== null && result !== null) publiser(oppdaterFerskhet(result, raw))
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
          raw = loaded
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

const store = createStederStore(() => loadPublishedData(undefined, import.meta.env.BASE_URL))

/** `null` while loading, then the `ok` or `error` result, with too old places already removed. */
export function useSteder(): StederResult | null {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
