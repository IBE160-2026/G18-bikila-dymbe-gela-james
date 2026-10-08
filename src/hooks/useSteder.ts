import { useEffect, useState } from 'react'
import { loadPublishedData, type LoadResult } from '../lib/data/loadPublishedData'

// AD-8: the only way pages and components get place data. The data file is loaded once per page load
// and shared, so moving between routes never fetches it again.

export type SharedLoader = { load: () => Promise<LoadResult>; current: () => LoadResult | null }

export function createSharedLoader(loadFn: () => Promise<LoadResult>): SharedLoader {
  let pending: Promise<LoadResult> | null = null
  let result: LoadResult | null = null
  return {
    load() {
      pending ??= loadFn().then((loaded) => (result = loaded))
      return pending
    },
    current: () => result,
  }
}

const shared = createSharedLoader(() => loadPublishedData(undefined, import.meta.env.BASE_URL))

/** `null` while loading, then the `ok` or `error` result from loadPublishedData. */
export function useSteder(): LoadResult | null {
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
