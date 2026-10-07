import { z } from 'zod'

// AD-12: the catalog contract. Written only by scripts/build-catalog/, read by the data pipeline.

export const NORWAY_BOUNDS = { minLat: 57.9, maxLat: 71.2, minLon: 4.5, maxLon: 31.2 } as const

export const STED_TYPES = ['skisted', 'fjelltopp', 'by'] as const
export const KILDER = ['osm', 'kartverket'] as const

// Floating-point products like 59.1234 * 1e4 are not exact integers, so allow a tiny tolerance.
function hasAtMostFourDecimals(value: number): boolean {
  const scaled = value * 1e4
  return Math.abs(scaled - Math.round(scaled)) < 1e-6
}

const coordinate = (min: number, max: number) =>
  z
    .number()
    .min(min)
    .max(max)
    .refine(hasAtMostFourDecimals, { message: 'Koordinaten skal ha høyst 4 desimaler' })

export const CatalogEntry = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id skal være en slug'),
  navn: z.string().trim().min(1),
  lat: coordinate(NORWAY_BOUNDS.minLat, NORWAY_BOUNDS.maxLat),
  lon: coordinate(NORWAY_BOUNDS.minLon, NORWAY_BOUNDS.maxLon),
  // Terrain height in metres at lat/lon: the OSM area's centre for skisted, the summit for fjelltopp,
  // Kartverket's centre point for by. Galdhøpiggen (2469 m) is the highest; negative means sea.
  hoyde: z.number().int().min(0).max(2500),
  type: z.enum(STED_TYPES),
  kilde: z.enum(KILDER),
})

export type CatalogEntry = z.infer<typeof CatalogEntry>

export const Catalog = z.strictObject({
  generert: z.iso.datetime(),
  steder: z.array(CatalogEntry).superRefine((steder, ctx) => {
    const ids = new Set<string>()
    const coordinates = new Set<string>()
    steder.forEach((sted, index) => {
      if (ids.has(sted.id)) {
        ctx.addIssue({ code: 'custom', message: `Duplikat id: ${sted.id}`, path: [index, 'id'] })
      }
      ids.add(sted.id)
      const key = `${sted.lat},${sted.lon}`
      if (coordinates.has(key)) {
        ctx.addIssue({ code: 'custom', message: `Duplikate koordinater: ${key}`, path: [index, 'lat'] })
      }
      coordinates.add(key)
    })
  }),
})

export type Catalog = z.infer<typeof Catalog>
