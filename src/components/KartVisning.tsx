import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import type { Sted } from '../../shared/contracts/published'
import { navigate } from '../lib/router'
import { MARKER_SIZE_PX, NORWAY_BOUNDS, TILE_ATTRIBUTION, TILE_URL, markerStyle, tooltipText } from './kartMarkor'

export const MAP_LOAD_ERROR = 'Kartet kunne ikke lastes. Last siden på nytt.'

/**
 * The map in Utforsk. Leaflet touches `window` when its module loads, so it is imported inside the
 * effect: this keeps the component renderable in Node tests and puts Leaflet in its own chunk.
 */
export default function KartVisning({ steder }: { steder: Sted[] }) {
  const container = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = container.current
    if (!element) return
    let cancelled = false
    let remove: (() => void) | null = null

    import('leaflet')
      .then(({ default: L }) => {
        if (cancelled) return
        const map = L.map(element, { zoomSnap: 0.5 })
        map.fitBounds(NORWAY_BOUNDS)
        L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18 }).addTo(map)
        for (const sted of steder) {
          const marker = L.circleMarker([sted.lat, sted.lon], markerStyle(sted))
            .bindTooltip(tooltipText(sted), { direction: 'top', offset: [0, -MARKER_SIZE_PX / 2] })
            .on('click', () => navigate({ name: 'sted', id: sted.id }))
            .addTo(map)
          // Lets the E2E smoke test find a specific place's marker.
          marker.getElement()?.setAttribute('data-sted-id', sted.id)
        }
        remove = () => map.remove()
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
  }, [steder])

  if (failed) {
    return (
      <p className="error" role="alert">
        {MAP_LOAD_ERROR}
      </p>
    )
  }
  return <div ref={container} className="kart" aria-label="Kart over stedene, fargelagt etter SnowScore" role="region" />
}
