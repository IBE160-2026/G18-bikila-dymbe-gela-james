import { useMemo, useSyncExternalStore } from 'react'
import { parseFilter, serializeFilter, STANDARD_FILTER, type FilterParams } from '../../shared/filter'

// A minimal History API router (no react-router, by the story's constraint). Paths are relative to
// import.meta.env.BASE_URL so the app also works from a GitHub Pages subfolder.

export const VISNINGER = ['kart', 'liste'] as const
export type Visning = (typeof VISNINGER)[number]

/**
 * The list orders kept in the address. «Avstand» is left out on purpose: a shared link would then ask
 * the receiver for their position without them having picked it.
 */
export type UrlSortering = 'score' | 'navn'

// AD-8: map and list are one route; `?visning=liste` picks the list, anything else is the map.
// AD-12 (Story 3.2): the filter and the list order ride along in the same query, so a link can be shared.
export type UtforskRoute = { name: 'utforsk'; visning: Visning; filter: FilterParams; sortering: UrlSortering }

// Story 3.2b (UJ-1 step 6): a place page carries the search it was opened from, in the same query as
// Utforsk, so a shared place link and its «Tilbake» keep the filter, the view and the order.
export type StedRoute = { name: 'sted'; id: string; sok: UtforskRoute }

export type Route = UtforskRoute | StedRoute | { name: 'forklaring' } | { name: 'ikke-funnet' }

/** Utforsk with no filter and the default order, as links from other pages open it. */
export function utforsk(visning: Visning = 'kart'): UtforskRoute {
  return { name: 'utforsk', visning, filter: STANDARD_FILTER, sortering: 'score' }
}

/** A place page opened from `sok`; without a search its address is the plain `/sted/<id>`. */
export function sted(id: string, sok: UtforskRoute = utforsk()): StedRoute {
  return { name: 'sted', id, sok }
}

/** Story 2.1: the path of «Slik beregner vi SnowScore», relative to the base. */
const FORKLARING_PATH = 'slik-beregner-vi-snowscore'

function withTrailingSlash(base: string): string {
  return base.endsWith('/') ? base : `${base}/`
}

function parseUtforsk(search: string): UtforskRoute {
  const params = new URLSearchParams(search)
  // As for the filter, a repeated parameter (visning or sortering) is ambiguous and gives the default.
  const visninger = params.getAll('visning')
  const visning = (visninger.length === 1 && VISNINGER.find((verdi) => verdi === visninger[0])) || 'kart'
  const sorteringer = params.getAll('sortering')
  const sortering = sorteringer.length === 1 && sorteringer[0] === 'navn' ? 'navn' : 'score'
  // The router carries the filter but leaves reading it to shared/filter.ts.
  return { name: 'utforsk', visning, filter: parseFilter(params), sortering }
}

export function parseRoute(pathname: string, base: string, search = ''): Route {
  const root = withTrailingSlash(base)
  // "/subfolder" without the trailing slash is the same page as "/subfolder/".
  const path = withTrailingSlash(pathname)
  if (!path.startsWith(root)) return { name: 'ikke-funnet' }
  const rest = path.slice(root.length).replace(/\/$/, '')
  if (rest === '') return parseUtforsk(search)
  if (rest === FORKLARING_PATH) return { name: 'forklaring' }
  const match = /^sted\/([^/]+)$/.exec(rest)
  if (!match) return { name: 'ikke-funnet' }
  try {
    return sted(decodeURIComponent(match[1]), parseUtforsk(search))
  } catch {
    // A malformed escape such as "%E0" cannot name any place.
    return { name: 'ikke-funnet' }
  }
}

/** The query of Utforsk in a fixed order (visning, filter, sortering), leaving out every default. */
function utforskQuery({ visning, filter, sortering }: UtforskRoute): string {
  const params = new URLSearchParams()
  if (visning === 'liste') params.append('visning', 'liste')
  for (const [navn, verdi] of serializeFilter(filter)) params.append(navn, verdi)
  if (sortering === 'navn') params.append('sortering', 'navn')
  const query = params.toString()
  return query === '' ? '' : `?${query}`
}

export function href(route: Route, base: string): string {
  const root = withTrailingSlash(base)
  switch (route.name) {
    case 'utforsk':
      // The map without a filter is the default, so its link carries no query.
      return `${root}${utforskQuery(route)}`
    case 'ikke-funnet':
      return root
    case 'forklaring':
      return `${root}${FORKLARING_PATH}`
    case 'sted':
      // The same query as Utforsk, so the search survives a shared place link.
      return `${root}sted/${encodeURIComponent(route.id)}${utforskQuery(route.sok)}`
  }
}

const NAVIGATE_EVENT = 'snowfinder:navigate'

// Marks history entries made by navigate(), so a page knows the previous entry is part of the app.
const IN_APP_STATE = { snowfinder: true }

/** True when this page was reached by in-app navigation, so history.back() stays in the app. */
export function reachedInApp(): boolean {
  const state: unknown = window.history.state
  return typeof state === 'object' && state !== null && 'snowfinder' in state && state.snowfinder === true
}

export function navigate(route: Route, base: string = import.meta.env.BASE_URL): void {
  const target = href(route, base)
  // Compare with the query too, or a link to the map from `?visning=liste` would keep the list.
  if (target !== window.location.pathname + window.location.search) {
    window.history.pushState(IN_APP_STATE, '', target)
  }
  window.scrollTo(0, 0)
  // pushState fires no event, so tell useRoute itself.
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
}

/**
 * Changes the address without a new history step (Story 3.2: a filter change), so Back leaves the page
 * instead of stepping through slider values. The entry keeps its state, so reachedInApp() is unchanged.
 */
export function replace(route: Route, base: string = import.meta.env.BASE_URL): void {
  const target = href(route, base)
  if (target !== window.location.pathname + window.location.search) {
    window.history.replaceState(window.history.state, '', target)
  }
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAVIGATE_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAVIGATE_EVENT, onChange)
  }
}

// A string snapshot, so useSyncExternalStore sees no change unless the address did.
function location(): string {
  return window.location.pathname + window.location.search
}

/** The current route; re-renders on navigate(), replace() and on the browser's back and forward buttons. */
export function useRoute(base: string = import.meta.env.BASE_URL): Route {
  const adresse = useSyncExternalStore(subscribe, location)
  // Memoised on the address, so the filter object stays the same between renders and the map does not
  // rebuild its markers unless the filter changed.
  return useMemo(() => {
    const url = new URL(adresse, 'http://x')
    return parseRoute(url.pathname, base, url.search)
  }, [adresse, base])
}
