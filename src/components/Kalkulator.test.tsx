import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WINDOW_HOURS, computeSnowScore } from '../lib/snowscore'
import Kalkulator, { kalkuler, kalkulatorTimer, lesTall, NEDBOR_GRENSER } from './Kalkulator'

// Story 2.4: the calculator builds the hourly input and leaves the formula to the shared module (AD-6).

describe('lesTall', () => {
  it.each([
    ['12', 12],
    ['0', 0],
    ['2,5', 2.5],
    ['2.5', 2.5],
    ['−2,5', -2.5],
    ['-14', -14],
    [' 7 ', 7],
    // Half-typed and short forms, so no error flashes while typing «5,5».
    ['5,', 5],
    [',5', 0.5],
    ['+3', 3],
  ])('reads «%s» as %d', (tekst, verdi) => {
    expect(lesTall(tekst, { min: -50, max: 500 }, 'mm')).toEqual({ verdi, feil: null })
  })

  it.each(['', 'abc', '1e2', '1,2,3', '−', '12 mm'])('rejects «%s» with a hint', (tekst) => {
    expect(lesTall(tekst, NEDBOR_GRENSER, 'mm')).toEqual({ verdi: null, feil: 'Skriv et tall, for eksempel 12 eller −2,5.' })
  })

  it('rejects values outside the limits, which are inclusive', () => {
    expect(lesTall('-1', NEDBOR_GRENSER, 'mm').feil).toBe('Velg et tall fra 0 til 500 mm.')
    expect(lesTall('500,5', NEDBOR_GRENSER, 'mm').feil).toBe('Velg et tall fra 0 til 500 mm.')
    expect(lesTall('500', NEDBOR_GRENSER, 'mm').feil).toBeNull()
  })
})

describe('kalkuler', () => {
  it('scores the window with the shared module, precipitation spread evenly', () => {
    const utregning = kalkuler('12', '−2')
    expect(utregning).toEqual({ kind: 'score', resultat: computeSnowScore(kalkulatorTimer(12, -2)) })
    const timer = kalkulatorTimer(12, -2)
    expect(timer).toHaveLength(WINDOW_HOURS)
    expect(timer.every(({ precipitationMm, temperatureC }) => precipitationMm === 12 / WINDOW_HOURS && temperatureC === -2)).toBe(true)
  })

  it('gives S = P · f(T) and T̄ = T for an even window (12 mm at −2 °C)', () => {
    const utregning = kalkuler('12', '−2')
    if (utregning.kind !== 'score') throw new Error('expected a score')
    const { newSnowMm, precipitationMm, meanTemperatureC, a, b, c, score } = utregning.resultat
    expect(newSnowMm).toBeCloseTo(12, 9)
    expect(precipitationMm).toBeCloseTo(12, 9)
    expect(meanTemperatureC).toBe(-2)
    // A = 60 · 12/20 = 36, B = 25 · 4/16 = 6,25, C = 15 → 57,25 → 57.
    expect(a).toBeCloseTo(36, 9)
    expect(b).toBeCloseTo(6.25, 9)
    expect(c).toBeCloseTo(15, 9)
    expect(score).toBe(57)
  })

  it('reports each invalid field on its own, and both at once', () => {
    expect(kalkuler('x', '−2')).toEqual({ kind: 'ugyldig', nedborFeil: 'Skriv et tall, for eksempel 12 eller −2,5.', temperaturFeil: null })
    expect(kalkuler('12', '40')).toEqual({ kind: 'ugyldig', nedborFeil: null, temperaturFeil: 'Velg et tall fra −50 til 30 °C.' })
    expect(kalkuler('', '−51')).toEqual({
      kind: 'ugyldig',
      nedborFeil: 'Skriv et tall, for eksempel 12 eller −2,5.',
      temperaturFeil: 'Velg et tall fra −50 til 30 °C.',
    })
    expect(kalkuler('12', '−50').kind).toBe('score')
    expect(kalkuler('12', '30').kind).toBe('score')
  })

  it('keeps the inclusive P ≥ 0,5 mm rule when 0,5 mm is split over the window', () => {
    const c = (nedbor: string) => {
      const utregning = kalkuler(nedbor, '−5')
      return utregning.kind === 'score' ? utregning.resultat.c : null
    }
    expect(c('0,4')).toBe(0)
    expect(c('0,5')).toBeCloseTo(15, 9)
    expect(c('0,6')).toBeCloseTo(15, 9)
  })

  it('is exactly the shared module for many inputs, so it has no formula of its own (AD-6)', () => {
    for (const nedbor of [0, 0.3, 0.5, 4, 12, 20, 35, 500]) {
      for (const temperatur of [-50, -14, -2, 0, 1, 2, 5, 30]) {
        expect(kalkuler(String(nedbor), String(temperatur))).toEqual({
          kind: 'score',
          resultat: computeSnowScore(kalkulatorTimer(nedbor, temperatur)),
        })
      }
    }
  })
})

describe('Kalkulator', () => {
  const html = renderToStaticMarkup(<Kalkulator />)

  it('starts at 12 mm and −2 °C and shows A, B, C and the score', () => {
    expect(html).toContain('value="12"')
    expect(html).toContain('value="−2"')
    expect(html).toContain('<dd>36,0 av 60</dd>')
    expect(html).toContain('<dd>6,3 av 25</dd>')
    expect(html).toContain('<dd>15,0 av 15</dd>')
    expect(html).toContain('57 · Godt')
  })

  it('labels both fields and has no error text while the values are valid', () => {
    expect(html).toContain('<label for="kalkulator-nedbor">Nedbør i 24 timer (mm)</label>')
    expect(html).toContain('<label for="kalkulator-temperatur">Snittemperatur (°C)</label>')
    expect(html).not.toContain('aria-describedby')
    expect(html).toContain('aria-invalid="false"')
  })

  it('imports the shared module through the app re-export, which is shared/snowscore.ts itself', () => {
    // AD-6: src/lib/snowscore.ts only re-exports shared/snowscore.ts, so this is a direct import of the module.
    const kilde = readFileSync(new URL('./Kalkulator.tsx', import.meta.url), 'utf8')
    expect(kilde).toContain("from '../lib/snowscore'")
    const reeksport = readFileSync(new URL('../lib/snowscore.ts', import.meta.url), 'utf8')
    expect(reeksport).toContain("export * from '../../shared/snowscore'")
  })

  it('lets the temperature field show a keypad with a minus sign, and makes only the score line live', () => {
    expect(html).toMatch(/id="kalkulator-nedbor" type="text" inputMode="decimal"/)
    expect(html).toMatch(/id="kalkulator-temperatur" type="text" inputMode="text"/)
    expect(html.match(/aria-live/g)).toHaveLength(1)
    expect(html).toContain('<p class="kalkulator-sum" aria-live="polite">SnowScore: ')
  })
})
