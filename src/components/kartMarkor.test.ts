import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PublishedData, type Sted } from '../../shared/contracts/published'
import { colors } from '../lib/theme'
import { MARKER_CLASS, markerSizeForZoom, markerSizeStyle, markerStyle, markorEndringer, tooltipText } from './kartMarkor'

const demo = PublishedData.parse(
  JSON.parse(readFileSync(new URL('../../public/data/demo.json', import.meta.url), 'utf8')),
)

function withScore(snowScore: Sted['snowScore']): Sted {
  return { ...demo.steder[0], navn: 'Hemsedal', snowScore }
}

const score = (value: number): Sted['snowScore'] => ({
  kind: 'score',
  score: value,
  a: 0,
  b: 0,
  c: 0,
  newSnowMm: 0,
  precipitationMm: 0,
  meanTemperatureC: 0,
})

describe('markerStyle', () => {
  it.each([
    [10, 'snowscore-0'],
    [30, 'snowscore-1'],
    [50, 'snowscore-2'],
    [82, 'snowscore-3'],
  ] as const)('fills score %i with %s and a white 2px border, 28px across', (value, token) => {
    expect(markerStyle(withScore(score(value)))).toMatchObject({
      fillColor: colors[token],
      color: colors['surface-raised'],
      weight: 2,
      radius: 14,
      fillOpacity: 1,
      className: MARKER_CLASS,
    })
  })

  it('draws incomplete data as a hollow marker with a dashed grey border', () => {
    const style = markerStyle(withScore({ kind: 'incomplete', missingShare: 0.4 }))
    expect(style).toMatchObject({ fillColor: colors['surface-raised'], color: colors['snowscore-0'] })
    expect(style.dashArray).toBe('4 3')
  })
})

describe('markerSizeForZoom', () => {
  it.each([
    [3, 10],
    [5, 10],
    [6.5, 19],
    [8, 28],
    [12, 28],
  ])('zoom %s gives a %spx marker', (zoom, size) => {
    expect(markerSizeForZoom(zoom)).toBe(size)
  })

  it('uses a 1px border below 16px and the DESIGN.md 2px border from 16px', () => {
    expect(markerSizeStyle(10)).toEqual({ radius: 5, weight: 1 })
    expect(markerSizeStyle(16)).toEqual({ radius: 8, weight: 2 })
  })

  it('keeps the 2px dashed border on a small incomplete marker', () => {
    expect(markerStyle(withScore({ kind: 'incomplete', missingShare: 0.4 }), 10)).toMatchObject({ radius: 5, weight: 2, dashArray: '4 3' })
  })

  it('keeps colour and shape when a smaller size is passed', () => {
    expect(markerStyle(withScore(score(82)), 10)).toMatchObject({ radius: 5, weight: 1, fillColor: colors['snowscore-3'] })
  })
})

describe('tooltipText', () => {
  it('gives name, number and label', () => {
    expect(tooltipText(withScore(score(82)))).toBe('Hemsedal · 82 · Svært godt')
  })

  it('says "Ufullstendige data" and never 0 for incomplete data', () => {
    const text = tooltipText(withScore({ kind: 'incomplete', missingShare: 0.4 }))
    expect(text).toBe('Hemsedal · Ufullstendige data')
  })

  it('gives the exact text for every place in the demo data', () => {
    // Written out independently of scoreTier.ts, from the tier bounds decided on 2026-10-08.
    const label = (value: number) => (value >= 70 ? 'Svært godt' : value >= 45 ? 'Godt' : value >= 20 ? 'Middels' : 'Lite')
    for (const sted of demo.steder) {
      const expected =
        sted.snowScore.kind === 'score'
          ? `${sted.navn} · ${sted.snowScore.score} · ${label(sted.snowScore.score)}`
          : `${sted.navn} · Ufullstendige data`
      expect(tooltipText(sted)).toBe(expected)
    }
  })
})

describe('markorEndringer', () => {
  const alle = demo.steder
  const ids = (steder: readonly Sted[]) => steder.map(({ id }) => id)
  const kartMed = (steder: readonly Sted[]) => new Map(steder.map((sted) => [sted.id, sted]))
  const del = alle.filter((_, i) => i % 3 === 0)
  const resten = alle.filter((sted) => !del.includes(sted))

  it('draws every place on an empty map', () => {
    expect(markorEndringer(new Map(), alle)).toEqual({ fjern: [], leggTil: alle })
  })

  it('removes only the places a stricter filter drops and leaves the rest untouched', () => {
    const { fjern, leggTil } = markorEndringer(kartMed(alle), del)
    expect(leggTil).toEqual([])
    expect(fjern).toEqual(ids(resten))
  })

  it('adds only the places a looser filter brings back and leaves the rest untouched', () => {
    const { fjern, leggTil } = markorEndringer(kartMed(del), alle)
    expect(fjern).toEqual([])
    expect(leggTil).toEqual(resten)
  })

  it('changes nothing when the hits are the same places, as after a new search', () => {
    expect(markorEndringer(kartMed(alle), [...alle])).toEqual({ fjern: [], leggTil: [] })
  })

  it('draws a place again when a new data file gives a new object with the same id', () => {
    const [forste, ...andre] = alle
    const nyttForste = { ...forste, snowScore: score(82) }
    expect(markorEndringer(kartMed(alle), [nyttForste, ...andre])).toEqual({ fjern: [forste.id], leggTil: [nyttForste] })
  })
})
