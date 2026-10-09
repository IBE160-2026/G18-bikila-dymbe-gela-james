import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { computeSnowScore } from '../lib/snowscore'
import Regneeksempel, { REGNEEKSEMPEL, timerMedSnoandel } from './Regneeksempel'

// Story 2.2: the page's worked example and the golden table must be the same example, and the page must
// show what the shared module computes for it.

type Tilfelle = {
  navn: string
  timer: unknown
  forventet: { score: number; a: number; b: number; c: number; newSnowMm: number }
}
const golden = JSON.parse(readFileSync(new URL('../../tests/golden/snowscore.json', import.meta.url), 'utf8')) as {
  tilfeller: Tilfelle[]
}
const brief = golden.tilfeller.find(({ navn }) => navn === 'Briefens eksempel')

/** The rendered text without tags. */
const tekst = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('Regneeksempel', () => {
  const html = renderToStaticMarkup(<Regneeksempel />)
  const text = tekst(html)

  it('uses the same hours as the brief case in the golden table', () => {
    expect(brief).toBeDefined()
    expect(REGNEEKSEMPEL).toEqual(brief?.timer)
  })

  it('computes the golden answer with the shared module', () => {
    const resultat = computeSnowScore(REGNEEKSEMPEL)
    if (resultat.kind !== 'score' || !brief) throw new Error('expected a score and the brief case')
    // Same tolerance idea as the golden test in shared/snowscore.test.ts: float sums differ in the last digit.
    expect(resultat.a).toBeCloseTo(brief.forventet.a, 9)
    expect(resultat.b).toBeCloseTo(brief.forventet.b, 9)
    expect(resultat.c).toBeCloseTo(brief.forventet.c, 9)
    expect(resultat.score).toBe(brief.forventet.score)
    // The table's per-hour new snow adds up to the module's S, so the two cannot drift apart.
    expect(timerMedSnoandel().reduce((total, { nysno }) => total + nysno, 0)).toBeCloseTo(resultat.newSnowMm, 9)
  })

  it('derives S, P and T̄ before the sub-scores and the sum (answer key)', () => {
    const linjer = [
      'S = 1 + 3 + 4 + 3 + 1 + 0 = 12 mm',
      'P = 1 + 3 + 4 + 3 + 1 + 0 = 12 mm',
      'T̄ = (−1 − 3 − 4 − 3 − 2 − 1) / 6 = −2,33 °C',
      'A = 60 · min(1, 12 / 20) = 36',
      // Redone by hand from the numbers shown: 25 × (2 + 2,33) / 16 = 6,77.
      'B = 25 · min(1, max(0, (2 − (−2,33)) / 16)) = 6,77',
      'C = 15 · 12 / 12 = 15',
      'SnowScore = 36 + 6,77 + 15 = 57,77, avrundet til 58',
    ]
    for (const linje of linjer) expect(text).toContain(linje)
    const order = linjer.map((linje) => text.indexOf(linje))
    expect(order).toEqual([...order].sort((x, y) => x - y))
  })

  it('shows every hour with its snow fraction and new snow', () => {
    const rader = [...html.matchAll(/<tr><th scope="row">(\d+)<\/th>(.*?)<\/tr>/g)].map(([, time, celler]) => [
      time,
      ...[...celler.matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map(([, celle]) => celle),
    ])
    expect(rader).toEqual([
      ['1', '1', '−1', '1', '1'],
      ['2', '3', '−3', '1', '3'],
      ['3', '4', '−4', '1', '4'],
      ['4', '3', '−3', '1', '3'],
      ['5', '1', '−2', '1', '1'],
      ['6', '0', '−1', '1', '0'],
    ])
  })

  it('says a real score uses the full window and shows f(T) between 0 and 1', () => {
    expect(text).toContain('En ekte SnowScore regnes over 24 timer')
    expect(text).toContain('Hadde en time vært 1 °C, ville f(T) vært 0,5')
  })
})
