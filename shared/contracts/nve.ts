import { z } from 'zod'

// AD-11: the NVE GridTimeSeries response for seNorge «nysnø siste døgn» (theme `fsw`). Field names
// are NVE's. Unknown fields are ignored; every field we read is required and checked.
// See data-dictionary.md for units and ranges.

const NVE_DATE = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/

/**
 * Parses NVE's `dd.MM.yyyy HH:mm:ss`. seNorge's day runs 06–06 UTC, so the time is read as UTC.
 * Returns NaN when the text does not match.
 */
export function parseNveDate(text: string): number {
  const match = NVE_DATE.exec(text)
  if (!match) return Number.NaN
  const [, day, month, year, hour, minute, second] = match.map(Number)
  const ms = Date.UTC(year, month - 1, day, hour, minute, second)
  // Date.UTC rolls 31.02 over into March and hour 25 into the next day; reject instead of
  // accepting a different time.
  const d = new Date(ms)
  const roundTrips =
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day &&
    d.getUTCHours() === hour &&
    d.getUTCMinutes() === minute &&
    d.getUTCSeconds() === second
  return roundTrips ? ms : Number.NaN
}

const nveDate = z.string().refine((text) => Number.isFinite(parseNveDate(text)), {
  message: 'Datoen skal ha formatet dd.MM.yyyy HH:mm:ss',
})

const DAY_MS = 86_400_000
const MIN_MM = 0
const MAX_MM = 1000

export const NveGridTimeSeries = z
  .object({
    Theme: z.literal('fsw'),
    Unit: z.literal('mm'),
    // Daily values only.
    TimeResolution: z.literal(1440),
    NoDataValue: z.number(),
    X: z.number(),
    Y: z.number(),
    StartDate: nveDate,
    EndDate: nveDate,
    // New snow in one day, mm water equivalent. NoDataValue (255 for fsw, 65535 for some other
    // themes) marks a missing day and may lie outside the range, so it is checked below.
    Data: z.array(z.number()).min(1),
  })
  .superRefine((series, ctx) => {
    series.Data.forEach((value, index) => {
      if (value !== series.NoDataValue && !(value >= MIN_MM && value <= MAX_MM)) {
        ctx.addIssue({
          code: 'custom',
          message: `Verdien ${value} er utenfor ${MIN_MM}–${MAX_MM} mm og er ikke NoDataValue`,
          path: ['Data', index],
        })
      }
    })
    const days = (parseNveDate(series.EndDate) - parseNveDate(series.StartDate)) / DAY_MS + 1
    if (days !== series.Data.length) {
      ctx.addIssue({
        code: 'custom',
        message: `Data har ${series.Data.length} verdier, men perioden har ${days} dager`,
        path: ['Data'],
      })
    }
  })

export type NveGridTimeSeries = z.infer<typeof NveGridTimeSeries>

/**
 * NVE's latest daily value at or before `referenceTime`, in mm; null when there is none or the
 * day is NoDataValue.
 */
export function latestNveValue(series: NveGridTimeSeries, referenceTime: string): number | null {
  const start = parseNveDate(series.StartDate)
  const reference = Date.parse(referenceTime)
  for (let i = series.Data.length - 1; i >= 0; i--) {
    if (start + i * DAY_MS <= reference) {
      const value = series.Data[i]
      return value === series.NoDataValue ? null : value
    }
  }
  return null
}
