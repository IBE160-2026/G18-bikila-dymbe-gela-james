import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { STANDARD_FILTER, type FilterParams } from '../../shared/filter'
import FilterPanel, { antallTekst, forslagTekst, kravTekst, verdiTekst } from './FilterPanel'

// Story 3.1: the panel's markup, without a browser. Behaviour at 375 and 1280 px is in tests/e2e/filter.spec.ts.

const render = (params: FilterParams, antall = 24) =>
  renderToStaticMarkup(<FilterPanel params={params} onEndre={() => {}} antall={antall} />)

describe('verdiTekst', () => {
  it('says «Alle» when a requirement is off, and the limit in words otherwise', () => {
    expect(verdiTekst('minNysnoCm', null)).toBe('Alle')
    expect(verdiTekst('minNysnoCm', 0)).toBe('Alle')
    expect(verdiTekst('maksVindMs', 25)).toBe('Alle')
    expect(verdiTekst('maksTemperaturC', 10)).toBe('Alle')
    expect(verdiTekst('minNysnoCm', 10)).toBe('minst 10 cm')
    expect(verdiTekst('maksVindMs', 8)).toBe('høyst 8 m/s')
    expect(verdiTekst('maksTemperaturC', -5)).toBe('høyst −5 °C')
    expect(kravTekst('maksTemperaturC', 0)).toBe('Temperatur høyst 0 °C')
  })
})

// Story 3.3: the hit count and the suggestion at zero hits, in the same words as the panel.
describe('antallTekst and forslagTekst', () => {
  it('counts hits as «24 treff», «1 treff» and «Ingen treff»', () => {
    expect(antallTekst(24)).toBe('24 treff')
    expect(antallTekst(1)).toBe('1 treff')
    expect(antallTekst(0)).toBe('Ingen treff')
  })

  it('words a suggestion as the panel does, «uten …kravet» at «Alle», and «Nullstill» when none helps', () => {
    expect(forslagTekst({ krav: 'minNysnoCm', verdi: 12, antall: 1 })).toBe('Prøv nysnø minst 12 cm.')
    expect(forslagTekst({ krav: 'maksVindMs', verdi: 8, antall: 3 })).toBe('Prøv vind høyst 8 m/s.')
    expect(forslagTekst({ krav: 'maksTemperaturC', verdi: -5, antall: 2 })).toBe('Prøv temperatur høyst −5 °C.')
    expect(forslagTekst({ krav: 'minNysnoCm', verdi: null, antall: 1 })).toBe('Prøv uten nysnøkravet.')
    expect(forslagTekst({ krav: 'maksVindMs', verdi: null, antall: 1 })).toBe('Prøv uten vindkravet.')
    expect(forslagTekst({ krav: 'maksTemperaturC', verdi: null, antall: 1 })).toBe('Prøv uten temperaturkravet.')
    expect(forslagTekst(null)).toBe('Det hjelper ikke å endre bare ett krav. Prøv «Nullstill».')
  })
})

describe('FilterPanel', () => {
  it('shows the hit count on the sheet bar and next to the heading, without announcing it itself', () => {
    for (const [antall, tekst] of [
      [24, '24 treff'],
      [1, '1 treff'],
      [0, 'Ingen treff'],
    ] as const) {
      const html = render(STANDARD_FILTER, antall)
      expect(html).toContain(`aria-controls="filter-innhold">Filter</button><span class="filter-antall">${tekst}</span>`)
      expect(html).toContain(`<h2 class="filter-tittel">Filter</h2><span class="filter-antall">${tekst}</span>`)
      expect(html).not.toContain('aria-live')
      expect(html).not.toContain('role="status"')
    }
  })

  it('has three labelled sliders at «Alle» by default, and no «Nullstill»', () => {
    const html = render(STANDARD_FILTER)
    for (const [id, navn] of [
      ['filter-minNysnoCm', 'Nysnø'],
      ['filter-maksVindMs', 'Vind'],
      ['filter-maksTemperaturC', 'Temperatur'],
    ]) {
      expect(html).toContain(`<label for="${id}">${navn}</label>`)
      expect(html).toMatch(new RegExp(`<input id="${id}" type="range"[^>]*aria-valuetext="Alle"`))
    }
    expect(html).toMatch(/id="filter-minNysnoCm" type="range" min="0" max="30" step="1"[^>]*value="0"/)
    expect(html).toMatch(/id="filter-maksVindMs" type="range" min="0" max="25" step="1"[^>]*value="25"/)
    expect(html).toMatch(/id="filter-maksTemperaturC" type="range" min="-20" max="10" step="1"[^>]*value="10"/)
    expect(html.match(/<span class="filter-verdi" aria-hidden="true">Alle<\/span>/g)).toHaveLength(3)
    expect(html).not.toContain('Nullstill')
    expect(html).not.toContain('filter-chips')
  })

  it('has a closed «Filter» button for the bottom sheet that controls the panel', () => {
    const html = render(STANDARD_FILTER)
    expect(html).toContain(
      '<button id="filter-knapp" type="button" class="filter-knapp" aria-expanded="false" aria-controls="filter-innhold">Filter</button>',
    )
    expect(html).toContain('<div id="filter-innhold" class="filter-innhold">')
    expect(html).toContain('<aside class="filter kort" aria-label="Filter">')
  })

  it('shows active requirements as chips, their values in words and «Nullstill»', () => {
    const html = render({ minNysnoCm: 2, maksVindMs: null, maksTemperaturC: 0 })
    expect(html).toContain(
      '<ul class="filter-chips" aria-label="Aktive krav"><li class="filter-chip">Nysnø minst 2 cm</li><li class="filter-chip">Temperatur høyst 0 °C</li></ul>',
    )
    expect(html).toMatch(/id="filter-minNysnoCm"[^>]*aria-valuetext="minst 2 cm"[^>]*value="2"/)
    expect(html).toMatch(/id="filter-maksVindMs"[^>]*aria-valuetext="Alle"/)
    // One «Nullstill» on the closed sheet and one in the panel; CSS shows only one at a time.
    expect(html.match(/>Nullstill<\/button>/g)).toHaveLength(2)
  })
})
