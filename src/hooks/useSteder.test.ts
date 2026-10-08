import { describe, expect, it, vi } from 'vitest'
import type { PublishedData, Sted } from '../../shared/contracts/published'
import { FJERNES_ETTER_MS, UTDATERT_ETTER_MS } from '../../shared/freshness'
import type { LoadResult } from '../lib/data/loadPublishedData'
import { createSharedLoader, medFerskhet, type StederResult } from './useSteder'

describe('createSharedLoader', () => {
  it('loads once and hands every caller the same result', async () => {
    const loaded: StederResult = { status: 'error', message: 'x' }
    const loadFn = vi.fn(() => Promise.resolve(loaded))
    const loader = createSharedLoader(loadFn)

    expect(loader.current()).toBeNull()
    const [first, second] = await Promise.all([loader.load(), loader.load()])
    expect(await loader.load()).toBe(loaded)
    expect(first).toBe(loaded)
    expect(second).toBe(loaded)
    expect(loader.current()).toBe(loaded)
    expect(loadFn).toHaveBeenCalledTimes(1)
  })
})

describe('medFerskhet', () => {
  const REFERENCE = '2026-10-07T20:30:29Z'
  const aged = (ageMs: number) => new Date(Date.parse(REFERENCE) - ageMs).toISOString()

  function sted(id: string, kildeTidspunkt: string | null): Sted {
    return {
      id,
      navn: id,
      lat: 60,
      lon: 10,
      hoyde: 100,
      type: 'by',
      kilde: 'kartverket',
      kildeTidspunkt,
      runId: 'demo',
      snowScore: { kind: 'incomplete', missingShare: 1 },
      nysnoCm: null,
      temperatur: null,
      vindMaks: null,
      skydekke: null,
      nveNysnoSisteDognMm: null,
    }
  }

  function loaded(steder: Sted[], mode: PublishedData['mode'] = 'demo'): LoadResult {
    // Only the fields medFerskhet reads matter here; the rest of the file is passed through untouched.
    const data = { mode, referenceTime: REFERENCE, steder } as PublishedData
    return { status: 'ok', data, source: 'demo' }
  }

  it('removes places older than 12 h, marks those older than 3 h, and keeps unknown age', () => {
    const result = medFerskhet(
      loaded([
        sted('fersk', aged(UTDATERT_ETTER_MS)),
        sted('utdatert', aged(UTDATERT_ETTER_MS + 1)),
        sted('grense-12', aged(FJERNES_ETTER_MS)),
        sted('for-gammel', aged(FJERNES_ETTER_MS + 1)),
        sted('ukjent', null),
      ]),
    )
    if (result.status !== 'ok') throw new Error('expected ok')
    expect(result.data.steder.map(({ id }) => id)).toEqual(['fersk', 'utdatert', 'grense-12', 'ukjent'])
    expect([...result.utdatert]).toEqual(['utdatert', 'grense-12'])
    expect([...result.fjernet]).toEqual(['for-gammel'])
  })

  it('measures age against the demo file’s referenceTime, not the wall clock', () => {
    vi.useFakeTimers({ now: Date.parse('2030-01-01T00:00:00Z') })
    try {
      const result = medFerskhet(loaded([sted('fersk', REFERENCE)]))
      expect(result.status === 'ok' && result.data.steder).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('measures age against the wall clock in live mode, not the file’s referenceTime', () => {
    vi.useFakeTimers({ now: Date.parse('2030-01-01T00:00:00Z') })
    try {
      const result = medFerskhet(
        loaded(
          [
            sted('aar-2000', '2000-01-01T00:00:00Z'),
            // Fresh against referenceTime, but years old against the wall clock.
            sted('referansetid', REFERENCE),
            sted('noen-minutter', '2029-12-31T23:55:00Z'),
          ],
          'live',
        ),
      )
      if (result.status !== 'ok') throw new Error('expected ok')
      expect(result.data.steder.map(({ id }) => id)).toEqual(['noen-minutter'])
      expect([...result.fjernet]).toEqual(['aar-2000', 'referansetid'])
    } finally {
      vi.useRealTimers()
    }
  })

  it('passes an error through unchanged', () => {
    const error: LoadResult = { status: 'error', message: 'x' }
    expect(medFerskhet(error)).toBe(error)
  })
})
