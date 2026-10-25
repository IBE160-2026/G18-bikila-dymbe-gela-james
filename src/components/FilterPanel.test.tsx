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
    expect(verdiTekst('maksSkydekkeDagslys', 100)).toBe('Alle')
    expect(verdiTekst('maksSkydekkeDagslys', 60)).toBe('høyst 60 %')
    expect(kravTekst('maksSkydekkeDagslys', 0)).toBe('Skydekke i dagslys høyst 0 %')
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
    expect(forslagTekst({ krav: 'maksSkydekkeDagslys', verdi: 30, antall: 2 })).toBe('Prøv skydekke i dagslys høyst 30 %.')
    expect(forslagTekst({ krav: 'maksSkydekkeDagslys', verdi: null, antall: 2 })).toBe('Prøv uten skydekkekravet.')
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

  it('has four labelled sliders at «Alle» by default, and no «Nullstill»', () => {
    const html = render(STANDARD_FILTER)
    for (const [id, navn] of [
      ['filter-minNysnoCm', 'Nysnø'],
      ['filter-maksVindMs', 'Vind'],
      ['filter-maksTemperaturC', 'Temperatur'],
      ['filter-maksSkydekkeDagslys', 'Skydekke i dagslys'],
    ]) {
      expect(html).toContain(`<label for="${id}">${navn}</label>`)
      expect(html).toMatch(new RegExp(`<input id="${id}" type="range"[^>]*aria-valuetext="Alle"`))
    }
    expect(html).toMatch(/id="filter-minNysnoCm" type="range" min="0" max="30" step="1"[^>]*value="0"/)
    expect(html).toMatch(/id="filter-maksVindMs" type="range" min="0" max="25" step="1"[^>]*value="25"/)
    expect(html).toMatch(/id="filter-maksTemperaturC" type="range" min="-20" max="10" step="1"[^>]*value="10"/)
    expect(html).toMatch(/id="filter-maksSkydekkeDagslys" type="range" min="0" max="100" step="10"[^>]*value="100"/)
    expect(html.match(/<span class="filter-verdi" aria-hidden="true">Alle<\/span>/g)).toHaveLength(4)
    expect(html).not.toContain('Nullstill')
    expect(html).not.toContain('filter-chips')
  })

  it('explains under the cloud cover slider why places without daylight are hidden (Story 3.5)', () => {
    const html = render(STANDARD_FILTER)
    expect(html).toMatch(/id="filter-maksSkydekkeDagslys"[^>]*aria-describedby="filter-maksSkydekkeDagslys-hint"/)
    expect(html).toContain(
      '<p id="filter-maksSkydekkeDagslys-hint" class="filter-hint">Steder uten dagslys de neste 24 timene (mørketid) vises ikke når kravet er på.</p>',
    )
    // The other sliders have no note (the quick-pick chips also use aria-describedby, for their own text).
    expect(html.match(/<input[^>]*aria-describedby=/g)).toHaveLength(1)
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
    const html = render({ minNysnoCm: 2, maksVindMs: null, maksTemperaturC: 0, maksSkydekkeDagslys: null })
    expect(html).toContain(
      '<ul class="filter-chips" aria-label="Aktive krav"><li class="filter-chip">Nysnø minst 2 cm</li><li class="filter-chip">Temperatur høyst 0 °C</li></ul>',
    )
    expect(html).toMatch(/id="filter-minNysnoCm"[^>]*aria-valuetext="minst 2 cm"[^>]*value="2"/)
    expect(html).toMatch(/id="filter-maksVindMs"[^>]*aria-valuetext="Alle"/)
    // One «Nullstill» on the closed sheet and one in the panel; CSS shows only one at a time.
    expect(html.match(/>Nullstill<\/button>/g)).toHaveLength(2)
  })
})

// Story 3.4 (FR-15): the two quick picks, each a chip that fills the whole filter in one action.
describe('Hurtigvalgene', () => {
  const PUDDERDAG: FilterParams = { minNysnoCm: 10, maksVindMs: 8, maksTemperaturC: -2, maksSkydekkeDagslys: null }
  const SOL_ETTER_SNOFALL: FilterParams = { minNysnoCm: 5, maksVindMs: null, maksTemperaturC: null, maksSkydekkeDagslys: 30 }

  it('shows both as unpressed buttons, each with its fixed combination described underneath', () => {
    const html = render(STANDARD_FILTER)
    expect(html).toContain('<ul class="filter-hurtigvalg" aria-label="Hurtigvalg">')
    expect(html).toContain(
      '<button type="button" id="hurtigvalg-0" class="filter-hurtigvalg-chip" aria-pressed="false" aria-describedby="hurtigvalg-0-beskrivelse">Pudderdag</button>',
    )
    expect(html).toContain(
      '<span id="hurtigvalg-0-beskrivelse" class="filter-hurtigvalg-beskrivelse">Nysnø minst 10 cm, Vind høyst 8 m/s, Temperatur høyst −2 °C</span>',
    )
    expect(html).toContain(
      '<button type="button" id="hurtigvalg-1" class="filter-hurtigvalg-chip" aria-pressed="false" aria-describedby="hurtigvalg-1-beskrivelse">Sol etter snøfall</button>',
    )
    expect(html).toContain(
      '<span id="hurtigvalg-1-beskrivelse" class="filter-hurtigvalg-beskrivelse">Nysnø minst 5 cm, Skydekke i dagslys høyst 30 %</span>',
    )
  })

  it('marks a chip pressed only when the filter is exactly its combination, not on a near match', () => {
    expect(render(PUDDERDAG)).toMatch(/id="hurtigvalg-0" class="filter-hurtigvalg-chip" aria-pressed="true"/)
    expect(render(PUDDERDAG)).toMatch(/id="hurtigvalg-1" class="filter-hurtigvalg-chip" aria-pressed="false"/)
    expect(render(SOL_ETTER_SNOFALL)).toMatch(/id="hurtigvalg-1" class="filter-hurtigvalg-chip" aria-pressed="true"/)

    // Moving one slider away from «Pudderdag» un-presses its chip.
    const justert: FilterParams = { ...PUDDERDAG, maksVindMs: 7 }
    expect(render(justert)).toMatch(/id="hurtigvalg-0" class="filter-hurtigvalg-chip" aria-pressed="false"/)
  })
})
