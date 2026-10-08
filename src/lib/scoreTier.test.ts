import { describe, expect, it } from 'vitest'
import type { Sted } from '../../shared/contracts/published'
import { scoreText, scoreTier } from './scoreTier'

function score(value: number): Sted['snowScore'] {
  return { kind: 'score', score: value, a: 0, b: 0, c: 0, newSnowMm: 0, precipitationMm: 0, meanTemperatureC: 0 }
}

describe('scoreTier', () => {
  it.each([
    [0, 0, 'Lite'],
    [19, 0, 'Lite'],
    [20, 1, 'Middels'],
    [44, 1, 'Middels'],
    [45, 2, 'Godt'],
    [69, 2, 'Godt'],
    [70, 3, 'Svært godt'],
    [100, 3, 'Svært godt'],
  ])('score %i is tier %i (%s)', (value, tier, label) => {
    expect(scoreTier(score(value))).toEqual({ tier, label })
  })

  it('returns incomplete for incomplete data, never tier 0', () => {
    expect(scoreTier({ kind: 'incomplete', missingShare: 0.5 })).toBe('incomplete')
  })
})

describe('scoreText', () => {
  it('always pairs the number with the label', () => {
    expect(scoreText(score(82))).toBe('82 · Svært godt')
    expect(scoreText(score(0))).toBe('0 · Lite')
  })

  it('says "Ufullstendige data" instead of a number for incomplete data', () => {
    expect(scoreText({ kind: 'incomplete', missingShare: 1 })).toBe('Ufullstendige data')
  })
})
