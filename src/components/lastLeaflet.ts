export type Leaflet = typeof import('leaflet')

/**
 * A loader that imports Leaflet once and gives every caller the same module. A failed import is not
 * kept, so a map mounted later tries again, as it did before the loader was shared.
 */
export function lagLeafletLaster(importer: () => Promise<{ default: Leaflet }>): () => Promise<Leaflet> {
  let lastet: Promise<Leaflet> | null = null
  return () => {
    lastet ??= importer().then(
      ({ default: L }) => L,
      (error: unknown) => {
        lastet = null
        throw error
      },
    )
    return lastet
  }
}

/**
 * Leaflet touches `window` when its module loads, so it is imported on demand and gets its own chunk.
 * main.tsx starts the import before React draws, so it loads in parallel with the data file (SM-12).
 */
export const lastLeaflet = lagLeafletLaster(() => import('leaflet'))
