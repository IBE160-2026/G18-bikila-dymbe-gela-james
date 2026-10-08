import { useEffect, useState } from 'react'
import { ferskhet } from '../../shared/freshness'
import { now } from '../lib/clock'
import { loadPublishedData, type DataSource, type LoadResult } from '../lib/data/loadPublishedData'
import type { PublishedData } from '../../shared/contracts/published'

// AD-8: the only way pages and components get place data. The data file is loaded once per page load
// and shared, so moving between routes never fetches it again.

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

export type SharedLoader = { load: () => Promise<StederResult>; current: () => StederResult | null }

export function createSharedLoader(loadFn: () => Promise<StederResult>): SharedLoader {
  let pending: Promise<StederResult> | null = null
  let result: StederResult | null = null
  return {
    load() {
      pending ??= loadFn().then((loaded) => (result = loaded))
      return pending
    },
    current: () => result,
  }
}

const shared = createSharedLoader(() => loadPublishedData(undefined, import.meta.env.BASE_URL).then(medFerskhet))

/** `null` while loading, then the `ok` or `error` result, with too old places already removed. */
export function useSteder(): StederResult | null {
  const [result, setResult] = useState(shared.current)

  useEffect(() => {
    if (result !== null) return
    let cancelled = false
    void shared.load().then((loaded) => {
      if (!cancelled) setResult(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [result])

  return result
}
