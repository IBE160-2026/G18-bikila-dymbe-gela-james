import { useSyncExternalStore } from 'react'

// A minimal History API router (no react-router, by the story's constraint). Paths are relative to
// import.meta.env.BASE_URL so the app also works from a GitHub Pages subfolder.

export type Route = { name: 'utforsk' } | { name: 'sted'; id: string } | { name: 'ikke-funnet' }

function withTrailingSlash(base: string): string {
  return base.endsWith('/') ? base : `${base}/`
}

export function parseRoute(pathname: string, base: string): Route {
  const root = withTrailingSlash(base)
  // "/subfolder" without the trailing slash is the same page as "/subfolder/".
  const path = withTrailingSlash(pathname)
  if (!path.startsWith(root)) return { name: 'ikke-funnet' }
  const rest = path.slice(root.length).replace(/\/$/, '')
  if (rest === '') return { name: 'utforsk' }
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
    case 'ikke-funnet':
      return root
    case 'sted':
      return `${root}sted/${encodeURIComponent(route.id)}`
  }
}

const NAVIGATE_EVENT = 'snowfinder:navigate'

export function navigate(route: Route, base: string = import.meta.env.BASE_URL): void {
  const target = href(route, base)
  if (target !== window.location.pathname) window.history.pushState(null, '', target)
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

function pathname(): string {
  return window.location.pathname
}

/** The current route; re-renders on navigate() and on the browser's back and forward buttons. */
export function useRoute(base: string = import.meta.env.BASE_URL): Route {
  return parseRoute(useSyncExternalStore(subscribe, pathname), base)
}
