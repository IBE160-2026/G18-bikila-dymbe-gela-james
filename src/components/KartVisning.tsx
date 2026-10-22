import 'leaflet/dist/leaflet.css'
import type { CircleMarker, LayerGroup, Map as LeafletMap } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import type { Sted } from '../../shared/contracts/published'
import { navigate } from '../lib/router'
import { NORWAY_BOUNDS, TILE_ATTRIBUTION, TILE_URL, markerSizeForZoom, markerSizeStyle, markerStyle, tooltipText } from './kartMarkor'

export const MAP_LOAD_ERROR = 'Kartet kunne ikke lastes. Last siden på nytt.'

type Leaflet = typeof import('leaflet')
type Kart = { L: Leaflet; map: LeafletMap; markorer: LayerGroup<CircleMarker> }

/** Applies the marker size for the map's zoom to one marker and its tooltip offset. */
function tilpassStorrelse(marker: CircleMarker, sizePx: number): void {
  // setStyle also applies the radius on a circle marker. An incomplete place keeps its 2px dashed border.
  const sizeStyle = markerSizeStyle(sizePx)
  marker.setStyle(marker.options.dashArray ? { radius: sizeStyle.radius } : sizeStyle)
  const tooltip = marker.getTooltip()
  if (tooltip) tooltip.options.offset = [0, -sizePx / 2]
}

/**
 * The map in Utforsk. Leaflet touches `window` when its module loads, so it is imported inside the
 * effect: this keeps the component renderable in Node tests and puts Leaflet in its own chunk.
 *
 * Story 3.1: the map, its tiles and the first fit to Norway are made once. When the filter changes
 * `steder`, only the marker layer is refilled, so zoom and position stay where the user left them.
 */
export default function KartVisning({ steder }: { steder: Sted[] }) {
  const container = useRef<HTMLDivElement>(null)
  const [kart, setKart] = useState<Kart | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = container.current
    if (!element) return
    let cancelled = false
    let remove: (() => void) | null = null

    import('leaflet')
      .then(({ default: L }) => {
        if (cancelled) return
        // A finer zoom step lets Norway fill more of the map on load.
        const map = L.map(element, { zoomSnap: 0.25 })
        map.fitBounds(NORWAY_BOUNDS)
        L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18 }).addTo(map)
        const markorer = L.layerGroup<CircleMarker>().addTo(map)
        // Markers grow as the user zooms in, so they do not hide each other at country level.
        map.on('zoomend', () => {
          const size = markerSizeForZoom(map.getZoom())
          markorer.eachLayer((layer) => tilpassStorrelse(layer as CircleMarker, size))
        })
        remove = () => map.remove()
        setKart({ L, map, markorer })
      })
      .catch((error: unknown) => {
        // The Leaflet chunk can fail to load offline or after a redeploy that renamed it.
        console.error('Leaflet kunne ikke lastes', error)
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      remove?.()
    }
  }, [])

  useEffect(() => {
    if (!kart) return
    const { L, map, markorer } = kart
    markorer.clearLayers()
    const size = markerSizeForZoom(map.getZoom())
    for (const sted of steder) {
      const marker = L.circleMarker([sted.lat, sted.lon], markerStyle(sted, size))
        .bindTooltip(tooltipText(sted), { direction: 'top', offset: [0, -size / 2] })
        .on('click', () => navigate({ name: 'sted', id: sted.id }))
        .addTo(markorer)
      // Lets the E2E tests find a specific place's marker.
      marker.getElement()?.setAttribute('data-sted-id', sted.id)
    }
  }, [kart, steder])

  if (failed) {
    return (
      <p className="error" role="alert">
        {MAP_LOAD_ERROR}
      </p>
    )
  }
  return <div ref={container} className="kart" aria-label="Kart over stedene, fargelagt etter SnowScore" role="region" />
}
