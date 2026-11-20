import { describe, expect, it, vi } from 'vitest'
import { lagLeafletLaster, type Leaflet } from './lastLeaflet'

const leaflet = { version: 'test' } as unknown as Leaflet

describe('lagLeafletLaster', () => {
  it('imports Leaflet once and gives the early start and the map the same module', async () => {
    const importer = vi.fn(() => Promise.resolve({ default: leaflet }))
    const last = lagLeafletLaster(importer)
    const tidlig = last()
    const kartet = last()
    expect(tidlig).toBe(kartet)
    await expect(kartet).resolves.toBe(leaflet)
    await expect(last()).resolves.toBe(leaflet)
    expect(importer).toHaveBeenCalledTimes(1)
  })

  it('passes a failed import on to the map, which then shows its error, and tries again next time', async () => {
    const feil = new Error('Failed to fetch dynamically imported module')
    const importer = vi.fn<() => Promise<{ default: Leaflet }>>().mockRejectedValueOnce(feil).mockResolvedValueOnce({ default: leaflet })
    const last = lagLeafletLaster(importer)
    await expect(last()).rejects.toBe(feil)
    await expect(last()).resolves.toBe(leaflet)
    expect(importer).toHaveBeenCalledTimes(2)
  })
})
