// WGS84/ETRS89 → UTM zone 33N (EPSG:25833), the grid NVE's GridTimeSeries API uses. No dependency.
// NVE uses zone 33 for all of Norway, so places far from 15°E (Bergen, Kirkenes) are 10–15° off the
// central meridian. The Krüger series to n⁴ (Karney 2011) stays at millimetre accuracy that far out,
// unlike the shorter Snyder series.

const A_AXIS = 6378137 // GRS80 semi-major axis (m); ETRS89 and WGS84 differ by far less than 1 m here
const FLATTENING = 1 / 298.257222101
const K0 = 0.9996
const FALSE_EASTING = 500000
const CENTRAL_MERIDIAN_DEG = 15

const n = FLATTENING / (2 - FLATTENING)
const e = Math.sqrt(FLATTENING * (2 - FLATTENING))
const rectifyingRadius = (A_AXIS / (1 + n)) * (1 + n ** 2 / 4 + n ** 4 / 64)
const alpha = [
  n / 2 - (2 * n ** 2) / 3 + (5 * n ** 3) / 16 + (41 * n ** 4) / 180,
  (13 * n ** 2) / 48 - (3 * n ** 3) / 5 + (557 * n ** 4) / 1440,
  (61 * n ** 3) / 240 - (103 * n ** 4) / 140,
  (49561 * n ** 4) / 161280,
]

const toRadians = (deg: number) => (deg * Math.PI) / 180

export interface Utm33 {
  /** Easting in metres; negative west of about 4.5°E at Norwegian latitudes. */
  x: number
  /** Northing in metres. */
  y: number
}

export function wgs84ToUtm33(lat: number, lon: number): Utm33 {
  const phi = toRadians(lat)
  const lambda = toRadians(lon - CENTRAL_MERIDIAN_DEG)
  const sinPhi = Math.sin(phi)
  // Tangent of the conformal latitude.
  const t = Math.sinh(Math.atanh(sinPhi) - e * Math.atanh(e * sinPhi))
  const xiPrime = Math.atan2(t, Math.cos(lambda))
  const etaPrime = Math.atanh(Math.sin(lambda) / Math.sqrt(1 + t * t))

  let xi = xiPrime
  let eta = etaPrime
  alpha.forEach((a, index) => {
    const j = 2 * (index + 1)
    xi += a * Math.sin(j * xiPrime) * Math.cosh(j * etaPrime)
    eta += a * Math.cos(j * xiPrime) * Math.sinh(j * etaPrime)
  })

  return { x: FALSE_EASTING + K0 * rectifyingRadius * eta, y: K0 * rectifyingRadius * xi }
}
