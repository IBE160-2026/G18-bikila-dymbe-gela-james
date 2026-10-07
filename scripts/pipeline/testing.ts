// Test helpers for the pipeline stages: small, valid MET/NVE responses and contexts built in memory.
import type { CatalogEntry } from '../../shared/contracts/catalog'
import type { RunContext } from '../../shared/contracts/run'

export const REFERENCE_TIME = '2026-10-07T20:30:00Z'

export function catalogEntry(id: string): CatalogEntry {
  // Unique coordinates per id, inside the Norway box.
  const n = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 1000
  return { id, navn: id, lat: 60 + n / 1e4, lon: 10 + n / 1e4, hoyde: 500, type: 'skisted', kilde: 'osm' }
}

export interface HourInput {
  precipitation?: number
  temperature?: number
  wind?: number
  cloud?: number
}

/** A MET compact response with one step per hour from 20:00, `hours.length` steps long. */
export function metResponse(hours: HourInput[], updatedAt = REFERENCE_TIME, start = '2026-10-07T20:00:00Z') {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [10, 60, 500] },
    properties: {
      meta: {
        updated_at: updatedAt,
        units: { air_temperature: 'celsius', precipitation_amount: 'mm', wind_speed: 'm/s', cloud_area_fraction: '%' },
      },
      timeseries: hours.map((h, i) => ({
        time: new Date(Date.parse(start) + i * 3_600_000).toISOString().replace('.000Z', 'Z'),
        data: {
          instant: {
            details: { air_temperature: h.temperature ?? -5, wind_speed: h.wind ?? 3, cloud_area_fraction: h.cloud ?? 50 },
          },
          ...(h.precipitation === undefined ? {} : { next_1_hours: { details: { precipitation_amount: h.precipitation } } }),
        },
      })),
    },
  }
}

/** 24 snowy hours: 1 mm at −5 °C each. */
export const snowyDay = (): HourInput[] => Array.from({ length: 24 }, () => ({ precipitation: 1, temperature: -5 }))

/** NVE daily values from 05.10.2026 06:00 UTC, one per day. */
export function nveResponse(data: number[] = [0, 2, 5]) {
  const start = Date.UTC(2026, 9, 5, 6)
  const end = new Date(start + (data.length - 1) * 86_400_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const endDate = `${pad(end.getUTCDate())}.${pad(end.getUTCMonth() + 1)}.${end.getUTCFullYear()} 06:00:00`
  return {
    Theme: 'fsw',
    FullName: 'Nysnø siste døgn',
    NoDataValue: 255,
    X: 262211,
    Y: 6649332,
    StartDate: '05.10.2026 06:00:00',
    EndDate: endDate,
    PrognoseStartDate: null,
    Unit: 'mm',
    TimeResolution: 1440,
    Altitude: 6,
    Data: data,
  }
}

/** A context as the source stage leaves it: catalog and raw responses filled in. */
export function rawContext(raw: { id: string; met?: unknown; nve?: unknown }[]): RunContext {
  return {
    runId: 'test-run',
    mode: 'demo',
    start: REFERENCE_TIME,
    referenceTime: REFERENCE_TIME,
    catalog: raw.map((r) => catalogEntry(r.id)),
    raw: raw.map((r) => ({ stedId: r.id, met: r.met, nve: r.nve })),
    validated: [],
    avviste: [],
    steder: [],
    report: null,
  }
}
