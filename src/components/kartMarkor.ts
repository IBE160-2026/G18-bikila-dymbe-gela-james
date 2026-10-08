import type { CircleMarkerOptions, LatLngBoundsLiteral } from 'leaflet'
import type { Sted } from '../../shared/contracts/published'
import { scoreText, scoreTier } from '../lib/scoreTier'
import { colors } from '../lib/theme'

// Pure helpers for KartVisning, kept free of Leaflet's runtime so they can be tested in Node.

/** DESIGN.md components.map-marker: 28px circle with a 2px border. */
export const MARKER_SIZE_PX = 28
export const MARKER_BORDER_PX = 2

export const MARKER_CLASS = 'kart-markor'

/** Mainland Norway with Svalbard left out, so the whole country fills the map on load. */
export const NORWAY_BOUNDS: LatLngBoundsLiteral = [
  [57.9, 4.4],
  [71.2, 31.2],
]

export const TILE_URL = 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png'
export const TILE_ATTRIBUTION = '© <a href="https://www.kartverket.no/">Kartverket</a>'

export function markerStyle(sted: Sted): CircleMarkerOptions {
  const base: CircleMarkerOptions = {
    radius: MARKER_SIZE_PX / 2,
    weight: MARKER_BORDER_PX,
    opacity: 1,
    fillOpacity: 1,
    className: MARKER_CLASS,
  }
  const tier = scoreTier(sted.snowScore)
  if (tier === 'incomplete') {
    // Decided 2026-10-08: hollow with a dashed grey border, so it never reads as a score of 0.
    return { ...base, color: colors['snowscore-0'], fillColor: colors['surface-raised'], dashArray: '4 3' }
  }
  return { ...base, color: colors['surface-raised'], fillColor: colors[`snowscore-${tier.tier}`] }
}

/** "Hemsedal · 82 · Svært godt": the score is never colour alone. */
export function tooltipText(sted: Sted): string {
  return `${sted.navn} · ${scoreText(sted.snowScore)}`
}
