import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PublishedData, Sted } from '../../shared/contracts/published'
import { FJERNES_ETTER_MS, UTDATERT_ETTER_MS } from '../../shared/freshness'
import type { LoadResult } from '../lib/data/loadPublishedData'
import {
  createStederStore,
  FERSKHET_SJEKK_MS,
  medFerskhet,
  oppdaterFerskhet,
  trengerFerskhetssjekk,
  type StederResult,
} from './useSteder'

describe('createStederStore', () => {
  const LOADED_AT = Date.parse('2026-10-08T12:00:00Z')
  const stedMed = (id: string, kildeTidspunkt: string) => ({ id, navn: id, kildeTidspunkt }) as Sted
  const fil = (mode: PublishedData['mode']): LoadResult => ({
    status: 'ok',
    data: { mode, referenceTime: '2026-10-08T12:00:00Z', steder: [stedMed('a', '2026-10-08T09:30:00Z')] } as PublishedData,
    source: mode === 'live' ? 'latest' : 'demo',
  })
  const utdatert = (result: StederResult | null) => (result?.status === 'ok' ? [...result.utdatert] : null)

  afterEach(() => vi.useRealTimers())

  it('loads once and gives every subscriber the very same snapshot', async () => {
    const loadFn = vi.fn(() => Promise.resolve(fil('demo')))
    const store = createStederStore(loadFn)
    expect(store.getSnapshot()).toBeNull()

    const first = vi.fn()
    const second = vi.fn()
    store.subscribe(first)
    store.subscribe(second)
    await vi.waitFor(() => expect(store.getSnapshot()).not.toBeNull())

    expect(loadFn).toHaveBeenCalledTimes(1)
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot()).toBe(store.getSnapshot())
  })

  it('re-checks live data every minute and tells every subscriber', async () => {
    vi.useFakeTimers({ now: LOADED_AT })
    const store = createStederStore(() => Promise.resolve(fil('live')))
    const listener = vi.fn()
    store.subscribe(listener)
    await vi.waitFor(() => expect(store.getSnapshot()).not.toBeNull())
    expect(utdatert(store.getSnapshot())).toEqual([])

    // The place is 2 h 30 min old at load; one more hour makes it older than 3 h.
    vi.setSystemTime(LOADED_AT + 3_600_000)
    vi.advanceTimersByTime(FERSKHET_SJEKK_MS)
    expect(utdatert(store.getSnapshot())).toEqual(['a'])
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('never re-checks demo data, and stops checking when the last subscriber leaves', async () => {
    vi.useFakeTimers({ now: LOADED_AT })
    const demo = createStederStore(() => Promise.resolve(fil('demo')))
    demo.subscribe(() => {})
    await vi.waitFor(() => expect(demo.getSnapshot()).not.toBeNull())
    expect(vi.getTimerCount()).toBe(0)

    const live = createStederStore(() => Promise.resolve(fil('live')))
    const unsubscribe = live.subscribe(() => {})
    await vi.waitFor(() => expect(live.getSnapshot()).not.toBeNull())
    expect(vi.getTimerCount()).toBe(1)
    unsubscribe()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('starts checking again when a new subscriber arrives after everyone left (route change, StrictMode)', async () => {
    vi.useFakeTimers({ now: LOADED_AT })
    const store = createStederStore(() => Promise.resolve(fil('live')))
    store.subscribe(() => {})()
    await vi.waitFor(() => expect(store.getSnapshot()).not.toBeNull())
    expect(vi.getTimerCount()).toBe(0)
    store.subscribe(() => {})
    expect(vi.getTimerCount()).toBe(1)
  })

  it('does not tell subscribers anything when a check changes nothing, so the map is not rebuilt', async () => {
    vi.useFakeTimers({ now: LOADED_AT })
    const store = createStederStore(() => Promise.resolve(fil('live')))
    const listener = vi.fn()
    store.subscribe(listener)
    await vi.waitFor(() => expect(store.getSnapshot()).not.toBeNull())
    const snapshot = store.getSnapshot()
    vi.advanceTimersByTime(5 * FERSKHET_SJEKK_MS)
    expect(store.getSnapshot()).toBe(snapshot)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('checks at once when the tab is shown again', async () => {
    vi.useFakeTimers({ now: LOADED_AT })
    const dokument = Object.assign(new EventTarget(), { visibilityState: 'visible' })
    vi.stubGlobal('document', dokument)
    try {
      const store = createStederStore(() => Promise.resolve(fil('live')))
      store.subscribe(() => {})
      await vi.waitFor(() => expect(store.getSnapshot()).not.toBeNull())
      vi.setSystemTime(LOADED_AT + 3_600_000)
      dokument.dispatchEvent(new Event('visibilitychange'))
      expect(utdatert(store.getSnapshot())).toEqual(['a'])
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('shows the error view instead of a skeleton forever when loading throws', async () => {
    const store = createStederStore(() => Promise.reject(new Error('boom')))
    store.subscribe(() => {})
    await vi.waitFor(() => expect(store.getSnapshot()).not.toBeNull())
    expect(store.getSnapshot()).toMatchObject({ status: 'error' })
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

describe('oppdaterFerskhet', () => {
  // A live file: age is measured against the (fake) wall clock, which the tests move forward.
  const LOADED_AT = Date.parse('2026-10-08T12:00:00Z')
  const sted = (id: string, kildeTidspunkt: string) => ({ id, navn: id, kildeTidspunkt }) as Sted
  const raw = (steder: Sted[]): LoadResult => ({
    status: 'ok',
    data: { mode: 'live', referenceTime: '2026-10-08T12:00:00Z', steder } as PublishedData,
    source: 'latest',
  })
  const file = raw([sted('a', '2026-10-08T11:00:00Z'), sted('b', '2026-10-08T09:30:00Z')])

  afterEach(() => vi.useRealTimers())

  it('returns the very same result while no place changes status', () => {
    vi.useFakeTimers({ now: LOADED_AT })
    const first = medFerskhet(file)
    vi.setSystemTime(LOADED_AT + 60_000)
    expect(oppdaterFerskhet(first, file)).toBe(first)
  })

  it('marks a place «Utdatert» once it passes 3 h, keeping the same data so the map is not rebuilt', () => {
    vi.useFakeTimers({ now: LOADED_AT })
    const first = medFerskhet(file)
    vi.setSystemTime(LOADED_AT + 2.5 * 3_600_000)
    const later = oppdaterFerskhet(first, file)
    if (first.status !== 'ok' || later.status !== 'ok') throw new Error('expected ok')
    expect([...later.utdatert].sort()).toEqual(['a', 'b'])
    expect(later.data).toBe(first.data)
  })

  it('removes a place once it passes 12 h', () => {
    vi.useFakeTimers({ now: LOADED_AT })
    const first = medFerskhet(file)
    vi.setSystemTime(LOADED_AT + 10 * 3_600_000)
    const later = oppdaterFerskhet(first, file)
    if (later.status !== 'ok') throw new Error('expected ok')
    expect(later.data.steder.map(({ id }) => id)).toEqual(['a'])
    expect([...later.fjernet]).toEqual(['b'])
    if (first.status !== 'ok') throw new Error('expected ok')
    expect(later.data).not.toBe(first.data)
  })

  it('passes a load error through', () => {
    const error: LoadResult = { status: 'error', message: 'x' }
    expect(oppdaterFerskhet(error, error)).toBe(error)
  })

  it('re-checks only live data, never demo data or an error', () => {
    expect(trengerFerskhetssjekk(file)).toBe(true)
    if (file.status !== 'ok') throw new Error('expected ok')
    expect(trengerFerskhetssjekk({ ...file, data: { ...file.data, mode: 'demo' } })).toBe(false)
    expect(trengerFerskhetssjekk({ status: 'error', message: 'x' })).toBe(false)
    expect(trengerFerskhetssjekk(null)).toBe(false)
  })
})
