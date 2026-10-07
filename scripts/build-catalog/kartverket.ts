import type { StedsnavnHit } from './build'
import { getJson, HttpError, type HttpDeps } from './http'

const STEDSNAVN_URL = 'https://api.kartverket.no/stedsnavn/v1/sted'
const HOYDE_URL = 'https://ws.geonorge.no/hoydedata/v1/punkt'
const KOMMUNE_URL = 'https://api.kartverket.no/kommuneinfo/v1/punkt'

// Kartverket's open APIs have no published quota; keep a polite, small number of requests in flight.
export const KARTVERKET_CONCURRENCY = 4

/**
 * Exact-name search. The `navneobjekttype` filter in the API does not match every type we need
 * (e.g. "By" returns nothing for Molde), so type filtering happens in build.ts.
 */
export async function searchPlaceName(navn: string, deps: HttpDeps): Promise<StedsnavnHit[]> {
  const params = new URLSearchParams({ sok: navn, utkoordsys: '4258', treffPerSide: '100' })
  const body = (await getJson(`${STEDSNAVN_URL}?${params}`, deps)) as { navn?: StedsnavnHit[] }
  if (!Array.isArray(body.navn)) throw new Error(`Uventet svar fra stedsnavn-API-et for «${navn}»`)
  return body.navn
}

/** Terrain height in metres, or undefined when the point has no height (outside the model). */
export async function fetchHeight(lat: number, lon: number, deps: HttpDeps): Promise<number | undefined> {
  const params = new URLSearchParams({ koordsys: '4258', nord: String(lat), ost: String(lon), geojson: 'false' })
  const body = (await getJson(`${HOYDE_URL}?${params}`, deps)) as { punkter?: { z?: unknown }[] }
  const z = body.punkter?.[0]?.z
  return typeof z === 'number' ? z : undefined
}

/** Municipality name for a point, used only to disambiguate OSM places that share a slug. */
export async function fetchKommune(lat: number, lon: number, deps: HttpDeps): Promise<string | undefined> {
  const params = new URLSearchParams({ nord: String(lat), ost: String(lon), koordsys: '4258' })
  try {
    const body = (await getJson(`${KOMMUNE_URL}?${params}`, deps)) as { kommunenavn?: unknown }
    // Sami municipalities are "Kárášjohka - Karasjok"; the Norwegian part keeps ids readable.
    return typeof body.kommunenavn === 'string' ? body.kommunenavn.split(/\s+[-–]\s+/).at(-1) : undefined
  } catch (error) {
    // A point in the sea gives 404; the place is then left without suffix and the schema decides.
    if (error instanceof HttpError && error.status === 404) return undefined
    throw error
  }
}
