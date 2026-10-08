import { useEffect, useState } from 'react'
import { ferskhet } from '../../shared/freshness'
import { now } from '../lib/clock'
import { loadPublishedData, type DataSource, type LoadResult } from '../lib/data/loadPublishedData'
import type { PublishedData } from '../../shared/contracts/published'

// AD-8: the only way pages and components get place data. The data file is loaded once per page load
// and shared, so moving between routes never fetches it again. In live mode the age limits are
// checked again every minute, so a tab left open still marks and removes places as they age.

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

export type SharedLoader<T> = { load: () => Promise<T>; current: () => T | null }

export function createSharedLoader<T>(loadFn: () => Promise<T>): SharedLoader<T> {
  let pending: Promise<T> | null = null
  let result: T | null = null
  return {
    load() {
      pending ??= loadFn().then((loaded) => (result = loaded))
      return pending
    },
    current: () => result,
  }
}

// The raw file is shared; the age limits are applied per page, against the current time.
const shared = createSharedLoader(() => loadPublishedData(undefined, import.meta.env.BASE_URL))

/** `null` while loading, then the `ok` or `error` result, with too old places already removed. */
export function useSteder(): StederResult | null {
  const [raw, setRaw] = useState(shared.current)
  const [result, setResult] = useState(() => {
    const loaded = shared.current()
    return loaded && medFerskhet(loaded)
  })

  useEffect(() => {
    if (raw !== null) return
    let cancelled = false
    void shared.load().then((loaded) => {
      if (cancelled) return
      setRaw(loaded)
      setResult(medFerskhet(loaded))
    })
    return () => {
      cancelled = true
    }
  }, [raw])

  useEffect(() => {
    if (raw === null || !trengerFerskhetssjekk(raw)) return
    const sjekk = () => setResult((previous) => (previous ? oppdaterFerskhet(previous, raw) : previous))
    const timer = setInterval(sjekk, FERSKHET_SJEKK_MS)
    // Background tabs throttle timers and computers sleep, so check at once when the tab is shown again.
    const vedSynlig = () => {
      if (document.visibilityState === 'visible') sjekk()
    }
    document.addEventListener('visibilitychange', vedSynlig)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', vedSynlig)
    }
  }, [raw])

  return result
}
