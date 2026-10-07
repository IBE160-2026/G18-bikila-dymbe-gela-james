// AD-4/AD-11: contract tests against the recorded real MET and NVE responses.
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Catalog } from '../../shared/contracts/catalog'
import { MetForecast } from '../../shared/contracts/met'
import { NveGridTimeSeries } from '../../shared/contracts/nve'
import { selectWindow } from '../../shared/snowscore'
import { INCOMPLETE_ID, REMOVED_WINDOW_HOURS, STALE_ID, STALE_SHIFT_HOURS } from './record-fixtures'

const readJson = (relative: string): unknown =>
  JSON.parse(readFileSync(new URL(`./fixtures/${relative}`, import.meta.url), 'utf8'))
const listIds = (folder: string) =>
  readdirSync(new URL(`./fixtures/${folder}/`, import.meta.url))
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort()

const demoCatalog = Catalog.parse(readJson('demo-catalog.json'))
const fullCatalog = Catalog.parse(JSON.parse(readFileSync(new URL('../../data/catalog.json', import.meta.url), 'utf8')))
const ids = demoCatalog.steder.map((s) => s.id)
const met = new Map(ids.map((id) => [id, MetForecast.parse(readJson(`met/${id}.json`))]))
const newestUpdatedAt = Math.max(...[...met.values()].map((f) => Date.parse(f.properties.meta.updated_at)))

describe('demo catalog', () => {
  it('has 24 places, 8 of each type, copied unchanged from data/catalog.json', () => {
    expect(demoCatalog.steder).toHaveLength(24)
    for (const type of ['skisted', 'fjelltopp', 'by'] as const) {
      expect(demoCatalog.steder.filter((s) => s.type === type)).toHaveLength(8)
    }
    for (const sted of demoCatalog.steder) {
      expect(fullCatalog.steder.find((s) => s.id === sted.id)).toEqual(sted)
    }
  })

  it('is spread over the country, from the south coast to Finnmark', () => {
    const lats = demoCatalog.steder.map((s) => s.lat)
    expect(Math.min(...lats)).toBeLessThan(60)
    expect(Math.max(...lats)).toBeGreaterThan(69)
  })

  it('has exactly one MET and one NVE fixture per place', () => {
    expect(listIds('met')).toEqual([...ids].sort())
    expect(listIds('nve')).toEqual([...ids].sort())
  })
})

describe.each(ids)('fixtures for %s', (id) => {
  it('MET response passes the contract and has hourly precipitation for the window', () => {
    const forecast = met.get(id)
    expect(forecast).toBeDefined()
    expect(forecast?.properties.timeseries.filter((s) => s.data.next_1_hours).length).toBeGreaterThanOrEqual(24)
  })

  it('NVE response passes the contract', () => {
    expect(NveGridTimeSeries.safeParse(readJson(`nve/${id}.json`)).success).toBe(true)
  })
})

describe('documented fixture edits (README.md)', () => {
  it(`${INCOMPLETE_ID} misses more than 10 % of the window`, () => {
    const forecast = met.get(INCOMPLETE_ID)
    if (!forecast) throw new Error('missing fixture')
    const window = selectWindow(forecast.properties.timeseries, new Date(newestUpdatedAt).toISOString())
    const missing = window.flatMap((step, i) => (step?.data.next_1_hours ? [] : [i]))
    expect(missing).toEqual(REMOVED_WINDOW_HOURS)
    expect(missing.length / window.length).toBeGreaterThan(0.1)
  })

  it(`${STALE_ID} was updated more than 3 h before the reference time`, () => {
    const updatedAt = Date.parse(met.get(STALE_ID)?.properties.meta.updated_at ?? '')
    expect(newestUpdatedAt - updatedAt).toBe(STALE_SHIFT_HOURS * 3_600_000)
    expect(newestUpdatedAt - updatedAt).toBeGreaterThan(3 * 3_600_000)
  })

  it('every other place has a full window', () => {
    for (const [id, forecast] of met) {
      if (id === INCOMPLETE_ID) continue
      const window = selectWindow(forecast.properties.timeseries, new Date(newestUpdatedAt).toISOString())
      expect(window.every((step) => step?.data.next_1_hours), id).toBe(true)
    }
  })
})
