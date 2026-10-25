// AD-6: pure, so the Node data pipeline (tsconfig.scripts.json, which does not include `src/`) can import
// shared/filter.ts without ever pulling in src/. Moved here from src/lib/sortering.ts (Story 3.6 review);
// src/lib/sortering.ts re-exports both so ListeVisning.tsx's existing import keeps working unchanged.

export type Posisjon = { lat: number; lon: number }

const EARTH_RADIUS_KM = 6371
const toRadians = (deg: number) => (deg * Math.PI) / 180

/** Great-circle distance in km (haversine); well within a kilometre at Norwegian distances. */
export function avstandKm(a: Posisjon, b: Posisjon): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}
