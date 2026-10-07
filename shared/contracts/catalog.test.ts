import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Catalog, type CatalogEntry } from './catalog'

const galdhopiggen: CatalogEntry = {
  id: 'galdhopiggen',
  navn: 'Galdhøpiggen',
  lat: 61.6364,
  lon: 8.3125,
  hoyde: 2467,
  type: 'fjelltopp',
  kilde: 'kartverket',
}

const hafjell: CatalogEntry = {
  id: 'hafjell',
  navn: 'Hafjell',
  lat: 61.2342,
  lon: 10.4286,
  hoyde: 830,
  type: 'skisted',
  kilde: 'osm',
}

const catalog = (steder: unknown[]) => ({ generert: '2026-10-07T12:00:00Z', steder })

describe('Catalog', () => {
  it('accepts a valid catalog', () => {
    expect(Catalog.safeParse(catalog([galdhopiggen, hafjell])).success).toBe(true)
  })

  it('rejects duplicate ids', () => {
    const result = Catalog.safeParse(catalog([galdhopiggen, { ...hafjell, id: 'galdhopiggen' }]))
    expect(result.success).toBe(false)
  })

  it('rejects duplicate coordinates', () => {
    const result = Catalog.safeParse(catalog([galdhopiggen, { ...hafjell, lat: 61.6364, lon: 8.3125 }]))
    expect(result.success).toBe(false)
  })

  it('rejects coordinates with five decimals', () => {
    expect(Catalog.safeParse(catalog([{ ...galdhopiggen, lat: 61.63644 }])).success).toBe(false)
    expect(Catalog.safeParse(catalog([{ ...galdhopiggen, lon: 8.31248 }])).success).toBe(false)
  })

  it('rejects places outside the Norway box', () => {
    // Copenhagen is south of the box
    expect(Catalog.safeParse(catalog([{ ...galdhopiggen, lat: 55.6761, lon: 12.5683 }])).success).toBe(false)
    // West of the box, in the North Sea
    expect(Catalog.safeParse(catalog([{ ...galdhopiggen, lon: 3.9 }])).success).toBe(false)
  })

  it('rejects unknown type and source', () => {
    expect(Catalog.safeParse(catalog([{ ...galdhopiggen, type: 'innsjo' }])).success).toBe(false)
    expect(Catalog.safeParse(catalog([{ ...galdhopiggen, kilde: 'yr' }])).success).toBe(false)
  })

  it('rejects non-integer or negative height, extra fields and non-UTC timestamps', () => {
    expect(Catalog.safeParse(catalog([{ ...galdhopiggen, hoyde: 2467.2 }])).success).toBe(false)
    expect(Catalog.safeParse(catalog([{ ...galdhopiggen, hoyde: -3 }])).success).toBe(false)
    expect(Catalog.safeParse(catalog([{ ...galdhopiggen, kommune: 'Lom' }])).success).toBe(false)
    expect(Catalog.safeParse({ generert: '2026-10-07T14:00:00+02:00', steder: [] }).success).toBe(false)
  })
})

describe('committed data/catalog.json', () => {
  it('is a valid catalog with 250–350 places sorted by id', () => {
    const raw = JSON.parse(readFileSync(new URL('../../data/catalog.json', import.meta.url), 'utf8'))
    const parsed = Catalog.parse(raw)
    expect(parsed.steder.length).toBeGreaterThanOrEqual(250)
    expect(parsed.steder.length).toBeLessThanOrEqual(350)
    const ids = parsed.steder.map((sted) => sted.id)
    expect(ids).toEqual([...ids].sort())
  })
})
