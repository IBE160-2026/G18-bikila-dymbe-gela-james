import { z } from 'zod'

// AD-7: the subset of MET Locationforecast 2.0 compact that SnowFinder uses. Field names are MET's.
// Unknown fields are ignored (MET adds fields without a version bump); every field we read is
// required and range-checked, and invalid responses are rejected, never repaired.
// See data-dictionary.md for units and ranges.

const isoUtc = z.iso.datetime()

/** Is `iso` on a whole UTC hour? MET's timeseries steps are always on the hour. */
const onWholeHour = (iso: string) => Date.parse(iso) % 3_600_000 === 0

const InstantDetails = z.object({
  air_temperature: z.number().min(-70).max(50),
  wind_speed: z.number().min(0).max(100),
  cloud_area_fraction: z.number().min(0).max(100),
})

const NextHourDetails = z.object({
  precipitation_amount: z.number().min(0).max(200),
})

export const MetTimestep = z.object({
  time: isoUtc.refine(onWholeHour, { message: 'Tidssteget skal være på hel time' }),
  data: z.object({
    instant: z.object({ details: InstantDetails }),
    // Present for roughly the first 2–3 days only; absent hours count as missing precipitation.
    next_1_hours: z.object({ details: NextHourDetails }).optional(),
  }),
})

export type MetTimestep = z.infer<typeof MetTimestep>

export const MetForecast = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('Point'),
    // [lon, lat, altitude]
    coordinates: z.tuple([z.number(), z.number(), z.number()]),
  }),
  properties: z.object({
    meta: z.object({
      updated_at: isoUtc,
      units: z.object({
        air_temperature: z.literal('celsius'),
        precipitation_amount: z.literal('mm'),
        wind_speed: z.literal('m/s'),
        cloud_area_fraction: z.literal('%'),
      }),
    }),
    timeseries: z
      .array(MetTimestep)
      .min(1)
      .superRefine((steps, ctx) => {
        for (let i = 1; i < steps.length; i++) {
          if (Date.parse(steps[i].time) <= Date.parse(steps[i - 1].time)) {
            ctx.addIssue({ code: 'custom', message: 'Tidsstegene skal være strengt stigende', path: [i, 'time'] })
          }
        }
      }),
  }),
})

export type MetForecast = z.infer<typeof MetForecast>
