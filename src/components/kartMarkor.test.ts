import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PublishedData, type Sted } from '../../shared/contracts/published'
import { colors } from '../lib/theme'
import { MARKER_CLASS, markerStyle, tooltipText } from './kartMarkor'

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
