import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SNOWSCORE } from '../lib/snowscore'
import Delpoengliste, { fyllProsent } from './Delpoengliste'

// Story 2.5: one bar per sub-score, filled against its own maximum and hidden from screen readers.

describe('fyllProsent', () => {
  it.each([
    ['half full', 30, SNOWSCORE.maxA, 50],
    ['full', 15, SNOWSCORE.maxC, 100],
    ['empty', 0, SNOWSCORE.maxB, 0],
    ['below zero, clamped', -3, SNOWSCORE.maxB, 0],
    ['above the maximum, clamped', 70, SNOWSCORE.maxA, 100],
  ])('%s: %d of %d is %d %%', (_, verdi, maks, prosent) => {
    expect(fyllProsent(verdi, maks)).toBe(prosent)
  })

  it('uses the unrounded value, so 13,125 of 25 is 52,5 %', () => {
    expect(fyllProsent(13.125, 25)).toBeCloseTo(52.5, 9)
  })

  it('does not throw on a value that is not a number', () => {
    expect(fyllProsent(Number.NaN, 60)).toBe(0)
  })

  it('gives 0 % for a maximum of 0 instead of dividing by zero', () => {
    expect(fyllProsent(5, 0)).toBe(0)
  })
})

describe('Delpoengliste', () => {
  const html = renderToStaticMarkup(<Delpoengliste a={30} b={0} c={15} />)
  /** Each dd's text without tags: what a screen reader and the existing tests read. */
  const ddTekst = [...html.matchAll(/<dd[^>]*>(.*?)<\/dd>/g)].map(([, inner]) => inner.replace(/<[^>]+>/g, ''))

  it('keeps the label and «x av N» text of each sub-score unchanged', () => {
    expect(html.match(/<dt>[^<]*<\/dt>/g)).toEqual(['<dt>A Nysnøpotensial</dt>', '<dt>B Kuldebonus</dt>', '<dt>C Snøandel</dt>'])
    expect(ddTekst).toEqual(['30,0 av 60', '0,0 av 25', '15,0 av 15'])
  })

  it('puts a decorative bar first in each dd, filled against the maximum from the shared module', () => {
    expect(html.match(/<span class="delpoeng-stolpe" aria-hidden="true">/g)).toHaveLength(3)
    expect(html.match(/style="width:[^"]*"/g)).toEqual(['style="width:50%"', 'style="width:0%"', 'style="width:100%"'])
    expect(html).toMatch(/<dd class="delpoeng-verdi"><span class="delpoeng-stolpe"/)
  })
})
