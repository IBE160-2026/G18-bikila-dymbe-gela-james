import type { Sted } from '../../shared/contracts/published'

// Story 1.8: sorting for the list view. Pure, so the order is tested without a browser.

export const SORTERINGER = ['score', 'avstand', 'navn'] as const
export type Sortering = (typeof SORTERINGER)[number]

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

const navnCollator = new Intl.Collator('nb')

function etterNavn(a: Sted, b: Sted): number {
  // The id breaks ties between equal names, so the order never depends on the input order.
  return navnCollator.compare(a.navn, b.navn) || a.id.localeCompare(b.id)
}

// Incomplete data sorts below every score, including 0, so it is never shown as the lowest score.
function scoreVerdi(sted: Sted): number {
  return sted.snowScore.kind === 'score' ? sted.snowScore.score : -1
}

/**
 * A new array in the chosen order: score high to low (incomplete last), name in Norwegian order
 * (Æ, Ø, Å last), or distance nearest first. Equal values sort by name. Distance without a position
 * falls back to score.
 */
export function sorterSteder(steder: readonly Sted[], valg: Sortering, posisjon?: Posisjon): Sted[] {
  const sortert = [...steder]
  if (valg === 'navn') return sortert.sort(etterNavn)
  if (valg === 'avstand' && posisjon) {
    const km = new Map(steder.map((sted) => [sted.id, avstandKm(posisjon, sted)]))
    return sortert.sort((a, b) => (km.get(a.id) ?? 0) - (km.get(b.id) ?? 0) || etterNavn(a, b))
  }
  return sortert.sort((a, b) => scoreVerdi(b) - scoreVerdi(a) || etterNavn(a, b))
}
