import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { HURTIGVALG, STANDARD_FILTER, type FilterParams } from '../../shared/filter'
import FilterPanel, { antallTekst, forslagTekst, kravTekst, verdiTekst } from './FilterPanel'

// Story 3.1: the panel's markup, without a browser. Behaviour at 375 and 1280 px is in tests/e2e/filter.spec.ts.

// Story 3.6: the distance filter's own position, defaulted here to "not known, nothing to say" so the
// other tests are unaffected; its own describe block below sets posisjonKjent/posisjonStatus explicitly.
// Story 3.8: NVE values are there by default; the new snow source block sets nveMangler itself.
const render = (params: FilterParams, antall = 24, posisjonKjent = false, posisjonStatus = '', nveMangler = false) =>
  renderToStaticMarkup(
    <FilterPanel
      params={params}
      onEndre={() => {}}
      antall={antall}
      posisjonKjent={posisjonKjent}
      posisjonStatus={posisjonStatus}
      beOmPosisjon={() => {}}
      nveMangler={nveMangler}
    />,
  )

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
    expect(verdiTekst('maksAvstandKm', 200)).toBe('Alle')
    expect(verdiTekst('maksAvstandKm', 50)).toBe('høyst 50 km')
    expect(kravTekst('maksAvstandKm', 50)).toBe('Avstand høyst 50 km')
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
    expect(forslagTekst({ krav: 'maksAvstandKm', verdi: 100, antall: 2 })).toBe('Prøv avstand høyst 100 km.')
    expect(forslagTekst({ krav: 'maksAvstandKm', verdi: null, antall: 2 })).toBe('Prøv uten avstandskravet.')
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
      // The count itself is never a status; the only one in the panel is Story 3.8's empty NVE status.
      expect(html).not.toMatch(/class="filter-antall"[^>]*role=/)
      expect(html.match(/role="status"/g)).toEqual(['role="status"'])
      expect(html).toContain('<p class="filter-hint" role="status"></p>')
    }
  })

  it('has five labelled sliders at «Alle» by default, and no «Nullstill»', () => {
    const html = render(STANDARD_FILTER)
    for (const [id, navn] of [
      ['filter-minNysnoCm', 'Nysnø'],
      ['filter-maksVindMs', 'Vind'],
      ['filter-maksTemperaturC', 'Temperatur'],
      ['filter-maksSkydekkeDagslys', 'Skydekke i dagslys'],
      ['filter-maksAvstandKm', 'Avstand'],
    ]) {
      expect(html).toContain(`<label for="${id}">${navn}</label>`)
      expect(html).toMatch(new RegExp(`<input id="${id}" type="range"[^>]*aria-valuetext="Alle"`))
    }
    expect(html).toMatch(/id="filter-minNysnoCm" type="range" min="0" max="30" step="1"[^>]*value="0"/)
    expect(html).toMatch(/id="filter-maksVindMs" type="range" min="0" max="25" step="1"[^>]*value="25"/)
    expect(html).toMatch(/id="filter-maksTemperaturC" type="range" min="-20" max="10" step="1"[^>]*value="10"/)
    expect(html).toMatch(/id="filter-maksSkydekkeDagslys" type="range" min="0" max="100" step="10"[^>]*value="100"/)
    expect(html).toMatch(/id="filter-maksAvstandKm" type="range" min="0" max="200" step="10"[^>]*value="200"/)
    expect(html.match(/<span class="filter-verdi" aria-hidden="true">Alle<\/span>/g)).toHaveLength(5)
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
    const html = render({ minNysnoCm: 2, maksVindMs: null, maksTemperaturC: 0, maksSkydekkeDagslys: null, maksAvstandKm: null, stedstyper: null, nysnoKilde: 'met' })
    expect(html).toContain(
      '<ul class="filter-chips" aria-label="Aktive krav"><li class="filter-chip">Nysnø minst 2 cm</li><li class="filter-chip">Temperatur høyst 0 °C</li></ul>',
    )
    expect(html).toMatch(/id="filter-minNysnoCm"[^>]*aria-valuetext="minst 2 cm"[^>]*value="2"/)
    expect(html).toMatch(/id="filter-maksVindMs"[^>]*aria-valuetext="Alle"/)
    // One «Nullstill» on the closed sheet and one in the panel; CSS shows only one at a time.
    expect(html.match(/>Nullstill<\/button>/g)).toHaveLength(2)
  })
})

// Story 3.7 (FR-24, decided 2026-10-27, Sena): three checkboxes after the sliders, none ticked by default.
describe('FilterPanel place type', () => {
  it('has a «Stedstype» group of three unticked checkboxes after the sliders, and no «Nullstill»', () => {
    const html = render(STANDARD_FILTER)
    expect(html).toContain(
      '<fieldset class="filter-felt filter-stedstyper" aria-describedby="filter-stedstyper-hint"><legend>Stedstype</legend>' +
        '<p id="filter-stedstyper-hint" class="filter-hint">Ingen avkrysset viser alle stedstyper.</p>',
    )
    for (const [type, navn] of [
      ['skisted', 'Skisted'],
      ['fjelltopp', 'Fjelltopp'],
      ['by', 'By'],
    ]) {
      expect(html).toContain(`<label class="filter-stedstype"><input id="filter-stedstyper-${type}" type="checkbox"/>${navn}</label>`)
    }
    expect(html.indexOf('filter-maksAvstandKm')).toBeLessThan(html.indexOf('filter-stedstyper'))
    expect(html).not.toContain('Nullstill')
  })

  it('ticks the chosen types, shows them as a chip, and offers «Nullstill»', () => {
    const html = render({ ...STANDARD_FILTER, stedstyper: ['skisted', 'by'] })
    expect(html).toContain('<input id="filter-stedstyper-skisted" type="checkbox" checked=""/>')
    expect(html).toContain('<input id="filter-stedstyper-fjelltopp" type="checkbox"/>')
    expect(html).toContain('<input id="filter-stedstyper-by" type="checkbox" checked=""/>')
    expect(html).toContain('<ul class="filter-chips" aria-label="Aktive krav"><li class="filter-chip">Stedstype skisted, by</li></ul>')
    expect(html.match(/>Nullstill<\/button>/g)).toHaveLength(2)
  })

  it('puts the place type chip after the slider chips', () => {
    const html = render({ ...STANDARD_FILTER, minNysnoCm: 2, stedstyper: ['fjelltopp'] })
    expect(html).toContain('<li class="filter-chip">Nysnø minst 2 cm</li><li class="filter-chip">Stedstype fjelltopp</li></ul>')
  })

  it('words the suggestion to drop it as «Prøv uten stedstypekravet.»', () => {
    expect(forslagTekst({ krav: 'stedstyper', verdi: null, antall: 5 })).toBe('Prøv uten stedstypekravet.')
  })
})

// Story 3.6 (FR-23, NFR-Privacy): the fifth slider's status text, in the same HINT pattern as the cloud
// cover slider (Story 3.5), but driven by the position state passed in from Utforsk rather than fixed.
describe('the distance slider (Story 3.6)', () => {
  it('has no status text by default, and the whole filter at «Alle» has no aria-describedby at all', () => {
    const html = render(STANDARD_FILTER)
    expect(html).not.toMatch(/id="filter-maksAvstandKm"[^>]*aria-describedby=/)
    expect(html).not.toContain('filter-maksAvstandKm-hint')
  })

  it('shows the given status text under the slider, describedby the same way as the cloud cover hint', () => {
    const html = render(STANDARD_FILTER, 24, false, 'Fikk ikke tilgang til posisjonen din. Avstandskravet har ingen effekt.')
    expect(html).toMatch(/id="filter-maksAvstandKm"[^>]*aria-describedby="filter-maksAvstandKm-hint"/)
    expect(html).toContain(
      '<p id="filter-maksAvstandKm-hint" class="filter-hint" role="status">Fikk ikke tilgang til posisjonen din. Avstandskravet har ingen effekt.</p>',
    )
    // Both the cloud cover slider's fixed hint and the distance slider's status text are now present.
    expect(html.match(/<input[^>]*aria-describedby=/g)).toHaveLength(2)
  })

  it('gives only the distance slider\'s dynamic hint a status role, never the cloud cover slider\'s fixed one', () => {
    const html = render(STANDARD_FILTER, 24, false, 'Henter posisjonen din …')
    // Story 3.8's NVE status is always in the panel but empty here, so count only the ones with text.
    expect(html.match(/role="status">[^<]/g)).toHaveLength(1)
    expect(html).not.toMatch(/id="filter-maksSkydekkeDagslys-hint"[^>]*role=/)
  })

  // «Hele Norge» (Kelly, 2026-10-25): resets only the distance requirement, next to its slider.
  describe('«Hele Norge»', () => {
    it('is absent while the distance requirement is off', () => {
      const html = render(STANDARD_FILTER)
      expect(html).not.toContain('Hele Norge')
    })

    it('appears next to the distance slider only once the requirement is active', () => {
      const html = render({ ...STANDARD_FILTER, maksAvstandKm: 100 })
      expect(html).toMatch(
        /<button type="button" class="filter-hele-norge">Hele Norge<\/button><\/div><input id="filter-maksAvstandKm"/,
      )
      // Exactly one button, and it is gone again once the requirement goes back to «Alle».
      expect(html.match(/Hele Norge/g)).toHaveLength(1)
      expect(render({ ...STANDARD_FILTER, maksAvstandKm: null, stedstyper: null })).not.toContain('Hele Norge')
    })
  })
})

// Story 3.4 (FR-15): the two quick picks, each a chip that fills the whole filter in one action.
describe('Hurtigvalgene', () => {
  const PUDDERDAG: FilterParams = {
    minNysnoCm: 10,
    maksVindMs: 8,
    maksTemperaturC: -2,
    maksSkydekkeDagslys: null,
    maksAvstandKm: null,
    stedstyper: null,
    nysnoKilde: 'met',
  }
  const SOL_ETTER_SNOFALL: FilterParams = {
    minNysnoCm: 5,
    maksVindMs: null,
    maksTemperaturC: null,
    maksSkydekkeDagslys: 30,
    maksAvstandKm: null,
    stedstyper: null,
    nysnoKilde: 'met',
  }

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

    // Story 3.7: a ticked place type is part of the combination too, so it un-presses the chip as well.
    expect(render({ ...PUDDERDAG, stedstyper: ['by'] })).toMatch(/id="hurtigvalg-0" class="filter-hurtigvalg-chip" aria-pressed="false"/)
  })
})

// Story 3.8 (FR-25, decided 2026-10-27, Sena): the new snow source as two radio buttons under the new snow
// slider, saying plainly that NVE's values are modelled, not measured snow.
describe('FilterPanel new snow source', () => {
  it('has a «Datagrunnlag for nysnø» group right under the new snow slider, with the forecast chosen', () => {
    const html = render(STANDARD_FILTER)
    expect(html).toContain(
      '<fieldset class="filter-felt filter-nysnokilde" aria-describedby="filter-nysnokilde-hint"><legend>Datagrunnlag for nysnø</legend>',
    )
    expect(html).toContain(
      '<label class="filter-valg"><input id="filter-nysnokilde-met" type="radio" name="nysnokilde" checked="" value="met"/>Prognose (MET, neste 24 t)</label>',
    )
    expect(html).toContain(
      '<label class="filter-valg"><input id="filter-nysnokilde-nve" type="radio" name="nysnokilde" value="nve"/>Siste 24 t (NVE, modellert)</label>',
    )
    const gruppe = html.indexOf('filter-nysnokilde')
    expect(html.indexOf('id="filter-minNysnoCm"')).toBeLessThan(gruppe)
    expect(gruppe).toBeLessThan(html.indexOf('id="filter-maksVindMs"'))
    expect(html).not.toContain('Nullstill')
  })

  it('says in the linked hint that NVE’s values are modelled estimates, not measured snow, and how they are converted', () => {
    expect(render(STANDARD_FILTER)).toContain(
      '<p id="filter-nysnokilde-hint" class="filter-hint">NVEs nysnø siste døgn er modellerte verdier fra seNorge, ikke målt snø. ' +
        'NVE-verdiene er modellerte estimater. SnowFinder bruker en forenklet omregning der 1 mm vannekvivalent tilsvarer omtrent ' +
        '1 cm snø. Faktisk snødybde kan variere. Med «Siste 24 t» valgt og nysnøkravet på skjules steder uten NVE-verdi. ' +
        'Står nysnø på «Alle», har valget ingen effekt.</p>',
    )
  })

  it('names the source in the chip, and gives a chip of its own next to «Nullstill» while new snow is «Alle»', () => {
    const aktiv = render({ ...STANDARD_FILTER, minNysnoCm: 5, nysnoKilde: 'nve' })
    expect(aktiv).toContain('<input id="filter-nysnokilde-nve" type="radio" name="nysnokilde" checked="" value="nve"/>')
    expect(aktiv).toContain('<ul class="filter-chips" aria-label="Aktive krav"><li class="filter-chip">Nysnø siste 24 t minst 5 cm</li></ul>')

    const utenKrav = render({ ...STANDARD_FILTER, nysnoKilde: 'nve' })
    expect(utenKrav).toContain('<ul class="filter-chips" aria-label="Aktive krav"><li class="filter-chip">Datagrunnlag siste 24 t (NVE)</li></ul>')
    expect(utenKrav.match(/>Nullstill<\/button>/g)).toHaveLength(2)
  })

  it('says NVE is missing from the run only with NVE chosen, as a status, and leaves the source as it is', () => {
    const melding = '<p class="filter-hint" role="status">NVE-data mangler i denne kjøringen. Velg «Prognose» for å filtrere på nysnø.</p>'
    const nve = { ...STANDARD_FILTER, nysnoKilde: 'nve' } as const
    expect(render(nve, 24, false, '', true)).toContain(melding)
    expect(render(nve, 24, false, '', true)).toContain('checked="" value="nve"')
    // The status stays in the page, empty, so the message is announced when it is filled in.
    expect(render(STANDARD_FILTER, 24, false, '', true)).toContain('<p class="filter-hint" role="status"></p>')
    expect(render(nve, 24, false, '', false)).toContain('<p class="filter-hint" role="status"></p>')
  })

  it('names the source in the suggestion, and leaves the forecast’s words as they were', () => {
    const forslag = { krav: 'minNysnoCm', verdi: 15, antall: 1 } as const
    expect(forslagTekst(forslag, 'nve')).toBe('Prøv nysnø siste 24 t minst 15 cm.')
    expect(forslagTekst(forslag, 'met')).toBe('Prøv nysnø minst 15 cm.')
    expect(forslagTekst(forslag)).toBe('Prøv nysnø minst 15 cm.')
    expect(kravTekst('minNysnoCm', 5, 'nve')).toBe('Nysnø siste 24 t minst 5 cm')
    expect(kravTekst('maksVindMs', 8, 'nve')).toBe('Vind høyst 8 m/s')
  })

  it('un-presses a quick pick when the source is NVE, since the pick means the forecast', () => {
    const pudderdag = HURTIGVALG[0].verdier
    expect(render(pudderdag)).toMatch(/id="hurtigvalg-0" class="filter-hurtigvalg-chip" aria-pressed="true"/)
    expect(render({ ...pudderdag, nysnoKilde: 'nve' })).toMatch(/id="hurtigvalg-0" class="filter-hurtigvalg-chip" aria-pressed="false"/)
  })
})
