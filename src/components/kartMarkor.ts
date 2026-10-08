import type { CircleMarkerOptions, LatLngBoundsLiteral } from 'leaflet'
import type { Sted } from '../../shared/contracts/published'
import { scoreText, scoreTier } from '../lib/scoreTier'
import { colors } from '../lib/theme'

// Pure helpers for KartVisning, kept free of Leaflet's runtime so they can be tested in Node.

/** DESIGN.md components.map-marker: 28px circle with a 2px border, the size reached from zoom 8. */
export const MARKER_SIZE_PX = 28
export const MARKER_BORDER_PX = 2

export const MARKER_CLASS = 'kart-markor'

// Decided 2026-10-08 after a manual check with 300 places: at country level 28px markers hid each
// other in southern Norway, so the size follows the zoom and reaches the DESIGN.md size at zoom 8.
export const MIN_MARKER_SIZE_PX = 10
const MIN_SIZE_ZOOM = 5
const FULL_SIZE_ZOOM = 8
/** Below this diameter a 2px white border would cover most of the tier colour. */
const THIN_BORDER_BELOW_PX = 16

/** Marker diameter for a zoom level: 10px at zoom 5 or less, growing linearly to 28px at zoom 8. */
export function markerSizeForZoom(zoom: number): number {
  const t = Math.min(1, Math.max(0, (zoom - MIN_SIZE_ZOOM) / (FULL_SIZE_ZOOM - MIN_SIZE_ZOOM)))
  return MIN_MARKER_SIZE_PX + t * (MARKER_SIZE_PX - MIN_MARKER_SIZE_PX)
}

/** Radius and border for a marker of the given diameter; a thin border keeps small markers' colour visible. */
export function markerSizeStyle(sizePx: number): Pick<CircleMarkerOptions, 'radius' | 'weight'> {
  return { radius: sizePx / 2, weight: sizePx < THIN_BORDER_BELOW_PX ? 1 : MARKER_BORDER_PX }
}

/** Mainland Norway with Svalbard left out, so the whole country fills the map on load. */
export const NORWAY_BOUNDS: LatLngBoundsLiteral = [
  [57.9, 4.4],
  [71.2, 31.2],
]

export const TILE_URL = 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png'
export const TILE_ATTRIBUTION = '© <a href="https://www.kartverket.no/">Kartverket</a>'

export function markerStyle(sted: Sted, sizePx: number = MARKER_SIZE_PX): CircleMarkerOptions {
  const base: CircleMarkerOptions = {
    ...markerSizeStyle(sizePx),
    opacity: 1,
    fillOpacity: 1,
    className: MARKER_CLASS,
  }
  const tier = scoreTier(sted.snowScore)
  if (tier === 'incomplete') {
    // Decided 2026-10-08: hollow with a dashed grey border, so it never reads as a score of 0.
    // The border is the only sign of incomplete data, so it stays 2px even on small markers.
    return { ...base, weight: MARKER_BORDER_PX, color: colors['snowscore-0'], fillColor: colors['surface-raised'], dashArray: '4 3' }
  }
  return { ...base, color: colors['surface-raised'], fillColor: colors[`snowscore-${tier.tier}`] }
}

/** "Hemsedal · 82 · Svært godt": the score is never colour alone. */
export function tooltipText(sted: Sted): string {
  return `${sted.navn} · ${scoreText(sted.snowScore)}`
}
