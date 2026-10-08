import { useSyncExternalStore } from 'react'

// A minimal History API router (no react-router, by the story's constraint). Paths are relative to
// import.meta.env.BASE_URL so the app also works from a GitHub Pages subfolder.

export const VISNINGER = ['kart', 'liste'] as const
export type Visning = (typeof VISNINGER)[number]

// AD-8: map and list are one route; `?visning=liste` picks the list, anything else is the map.
export type Route = { name: 'utforsk'; visning: Visning } | { name: 'sted'; id: string } | { name: 'ikke-funnet' }

function withTrailingSlash(base: string): string {
  return base.endsWith('/') ? base : `${base}/`
}

function parseVisning(search: string): Visning {
  const verdi = new URLSearchParams(search).get('visning')
  return VISNINGER.find((visning) => visning === verdi) ?? 'kart'
}

export function parseRoute(pathname: string, base: string, search = ''): Route {
  const root = withTrailingSlash(base)
  // "/subfolder" without the trailing slash is the same page as "/subfolder/".
  const path = withTrailingSlash(pathname)
  if (!path.startsWith(root)) return { name: 'ikke-funnet' }
  const rest = path.slice(root.length).replace(/\/$/, '')
  if (rest === '') return { name: 'utforsk', visning: parseVisning(search) }
  const match = /^sted\/([^/]+)$/.exec(rest)
  if (!match) return { name: 'ikke-funnet' }
  try {
    return { name: 'sted', id: decodeURIComponent(match[1]) }
  } catch {
    // A malformed escape such as "%E0" cannot name any place.
    return { name: 'ikke-funnet' }
  }
}

export function href(route: Route, base: string): string {
  const root = withTrailingSlash(base)
  switch (route.name) {
    case 'utforsk':
      // The map is the default, so its link carries no query.
      return route.visning === 'liste' ? `${root}?visning=liste` : root
    case 'ikke-funnet':
      return root
    case 'sted':
      return `${root}sted/${encodeURIComponent(route.id)}`
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

/** The current route; re-renders on navigate() and on the browser's back and forward buttons. */
export function useRoute(base: string = import.meta.env.BASE_URL): Route {
  const url = new URL(useSyncExternalStore(subscribe, location), 'http://x')
  return parseRoute(url.pathname, base, url.search)
}
