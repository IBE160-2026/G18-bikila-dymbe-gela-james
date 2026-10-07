import { describe, expect, it } from 'vitest'
import { wgs84ToUtm33 } from './geo'

// Reference values from Kartverket's transformation service (EPSG:4258 → EPSG:25833), fetched 2026-10-07.
const knownPoints = [
  { name: 'Oslo', lat: 59.9127, lon: 10.7461, x: 262211.233, y: 6649332.037 },
  { name: 'Kirkenes (15° east of the central meridian)', lat: 69.7271, lon: 30.045, x: 1076685.536, y: 7806974.213 },
  { name: 'Bergen (negative easting)', lat: 60.3932, lon: 5.3245, x: -31954.948, y: 6734392.176 },
  { name: 'Hammerfest', lat: 70.6634, lon: 23.6821, x: 819890.284, y: 7862779.51 },
  { name: 'Kristiansand', lat: 58.1462, lon: 7.9957, x: 88126.671, y: 6466412.77 },
  { name: 'Galdhøpiggen', lat: 61.6364, lon: 8.3125, x: 146002.237, y: 6851884.867 },
  { name: 'On the central meridian', lat: 65, lon: 15, x: 500000, y: 7208454.582 },
]

describe('wgs84ToUtm33', () => {
  it.each(knownPoints)('matches Kartverket within 1 m: $name', ({ lat, lon, x, y }) => {
    const result = wgs84ToUtm33(lat, lon)
    expect(Math.abs(result.x - x)).toBeLessThan(1)
    expect(Math.abs(result.y - y)).toBeLessThan(1)
  })
})
