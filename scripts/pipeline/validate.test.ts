import { describe, expect, it } from 'vitest'
import { metResponse, nveResponse, rawContext, snowyDay } from './testing'
import { MISSING_RESPONSE, validate } from './validate'

describe('validate', () => {
  it('passes valid responses on and rejects nothing', () => {
    const ctx = validate(rawContext([{ id: 'a', met: metResponse(snowyDay()), nve: nveResponse() }]))
    expect(ctx.avviste).toEqual([])
    expect(ctx.validated[0].met?.properties.timeseries).toHaveLength(24)
    expect(ctx.validated[0].nve?.Data).toEqual([0, 2, 5])
  })

  it('rejects an invalid MET response with place, source and reason, and never repairs it', () => {
    const met = metResponse(snowyDay())
    met.properties.timeseries[3].data.instant.details.air_temperature = Number.NaN
    const ctx = validate(rawContext([{ id: 'a', met, nve: nveResponse() }]))
    expect(ctx.validated[0].met).toBeNull()
    expect(ctx.validated[0].nve).not.toBeNull()
    expect(ctx.avviste).toHaveLength(1)
    expect(ctx.avviste[0]).toMatchObject({ stedId: 'a', kilde: 'met' })
    expect(ctx.avviste[0].arsak).toContain('air_temperature')
  })

  it('rejects out-of-range values, wrong units and non-JSON text', () => {
    const negative = metResponse([{ precipitation: -0.1 }])
    const wrongUnit = metResponse(snowyDay())
    ;(wrongUnit.properties.meta.units as Record<string, string>).air_temperature = 'fahrenheit'
    const ctx = validate(
      rawContext([
        { id: 'a', met: negative, nve: nveResponse() },
        { id: 'b', met: wrongUnit, nve: nveResponse() },
        { id: 'c', met: '<html>Service Unavailable</html>', nve: nveResponse() },
      ]),
    )
    expect(ctx.avviste.map((a) => a.stedId)).toEqual(['a', 'b', 'c'])
    expect(ctx.validated.every((v) => v.met === null)).toBe(true)
  })

  it('rejects MET timesteps that are out of order', () => {
    const met = metResponse(snowyDay())
    met.properties.timeseries.reverse()
    expect(validate(rawContext([{ id: 'a', met, nve: nveResponse() }])).avviste).toHaveLength(1)
  })

  it('rejects an NVE response whose data does not match its period', () => {
    const nve = { ...nveResponse([0, 1, 2]), Data: [0, 1] }
    const ctx = validate(rawContext([{ id: 'a', met: metResponse(snowyDay()), nve }]))
    expect(ctx.avviste).toEqual([expect.objectContaining({ stedId: 'a', kilde: 'nve' })])
    expect(ctx.validated[0].met).not.toBeNull()
  })

  it('rejects NVE error bodies such as «no cell» for places at sea', () => {
    const nve = { Error: 'Tema: fsw. No cell exists for coordinates 473070, 7463031.' }
    const ctx = validate(rawContext([{ id: 'a', met: metResponse(snowyDay()), nve }]))
    expect(ctx.avviste).toEqual([expect.objectContaining({ stedId: 'a', kilde: 'nve' })])
  })

  it('records missing responses', () => {
    const ctx = validate(rawContext([{ id: 'a' }]))
    expect(ctx.avviste).toEqual([
      { stedId: 'a', kilde: 'met', arsak: MISSING_RESPONSE },
      { stedId: 'a', kilde: 'nve', arsak: MISSING_RESPONSE },
    ])
  })

  it('is idempotent', () => {
    const ctx = rawContext([{ id: 'a', met: metResponse(snowyDay()) }])
    expect(validate(validate(ctx))).toEqual(validate(ctx))
  })
})
