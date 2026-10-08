import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PublishedData, type Sted } from '../../shared/contracts/published'
import { avstandKm, sorterSteder } from './sortering'

const demo = PublishedData.parse(
  JSON.parse(readFileSync(new URL('../../public/data/demo.json', import.meta.url), 'utf8')),
)

function sted(id: string, navn: string, score: number | null, lat = 60, lon = 10): Sted {
  return {
    ...demo.steder[0],
    id,
    navn,
    lat,
    lon,
    snowScore:
      score === null
        ? { kind: 'incomplete', missingShare: 0.5 }
        : { kind: 'score', score, a: 0, b: 0, c: 0, newSnowMm: 0, precipitationMm: 0, meanTemperatureC: 0 },
  }
}

const ids = (steder: Sted[]) => steder.map(({ id }) => id)

describe('avstandKm', () => {
  it('is zero for the same point and symmetric', () => {
    const oslo = { lat: 59.9139, lon: 10.7522 }
    const bergen = { lat: 60.3913, lon: 5.3221 }
    expect(avstandKm(oslo, oslo)).toBe(0)
    expect(avstandKm(oslo, bergen)).toBeCloseTo(avstandKm(bergen, oslo), 9)
  })

  it('matches known distances', () => {
    // Oslo–Bergen is about 305 km as the crow flies; one degree of latitude is about 111.2 km.
    expect(avstandKm({ lat: 59.9139, lon: 10.7522 }, { lat: 60.3913, lon: 5.3221 })).toBeGreaterThan(300)
    expect(avstandKm({ lat: 59.9139, lon: 10.7522 }, { lat: 60.3913, lon: 5.3221 })).toBeLessThan(310)
    expect(avstandKm({ lat: 60, lon: 10 }, { lat: 61, lon: 10 })).toBeCloseTo(111.19, 1)
  })
})

describe('sorterSteder', () => {
  const steder = [
    sted('c', 'Cecilie', 50),
    sted('inc', 'Aaa', null),
    sted('b', 'Berit', 82),
    sted('a', 'Anne', 50),
    sted('null', 'Null', 0),
  ]

  it('sorts by score high to low, equal scores by name, incomplete data last (below 0)', () => {
    expect(ids(sorterSteder(steder, 'score'))).toEqual(['b', 'a', 'c', 'null', 'inc'])
  })

  it('does not change the input array', () => {
    const before = ids(steder)
    sorterSteder(steder, 'navn')
    expect(ids(steder)).toEqual(before)
  })

  it('sorts names in Norwegian order, with Æ, Ø and Å last', () => {
    const navn = [sted('1', 'Ålesund', 1), sted('2', 'Ørsta', 1), sted('3', 'Zinkgruva', 1), sted('4', 'Æsj', 1), sted('5', 'Oslo', 1)]
    expect(sorterSteder(navn, 'navn').map((s) => s.navn)).toEqual(['Oslo', 'Zinkgruva', 'Æsj', 'Ørsta', 'Ålesund'])
  })

  it('sorts by distance nearest first, equal distances by name', () => {
    const her = { lat: 60, lon: 10 }
    const nær = [sted('langt', 'Langt', 90, 70, 10), sted('b', 'B', 10, 61, 10), sted('a', 'A', 5, 61, 10), sted('her', 'Her', 0, 60, 10)]
    expect(ids(sorterSteder(nær, 'avstand', her))).toEqual(['her', 'a', 'b', 'langt'])
  })

  it('falls back to score when distance is chosen without a position', () => {
    expect(ids(sorterSteder(steder, 'avstand'))).toEqual(ids(sorterSteder(steder, 'score')))
  })

  it('puts the incomplete demo place last and the highest demo score first', () => {
    const sortert = sorterSteder(demo.steder, 'score')
    expect(sortert).toHaveLength(24)
    expect(sortert[0].id).toBe('gaustatoppen')
    expect(sortert.at(-1)?.id).toBe('trondheim')
  })
})
