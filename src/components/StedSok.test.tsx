import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { PublishedData } from '../../shared/contracts/published'
import { filtrerSteder, STANDARD_FILTER } from '../../shared/filter'
import { href, sted, utforsk, type Route, type UtforskRoute } from '../lib/router'
import StedSok, {
  antallForslagTekst,
  apneForslag,
  enterIndeks,
  ingenTreffTekst,
  OPPFYLLER_IKKE,
  sokReducer,
  START_TILSTAND,
  type SokHandling,
  type SokTilstand,
} from './StedSok'

// Story 3.9 (FR-32): the keyboard rules are a pure reducer, and the markup is rendered without a browser.
// Typing, a mouse click, the address staying unchanged while typing, and Back are in tests/e2e/sok.spec.ts.

const demo = PublishedData.parse(JSON.parse(readFileSync(new URL('../../public/data/demo.json', import.meta.url), 'utf8')))
const alle = new Set(demo.steder.map(({ id }) => id))

const kjor = (handlinger: SokHandling[], fra: SokTilstand = START_TILSTAND) => handlinger.reduce(sokReducer, fra)
const tast = (key: string, antall: number): SokHandling => ({ type: 'tast', tast: key, antall })
const skriv = (tekst: string): SokHandling => ({ type: 'skriv', tekst })

const render = (tilstand: SokTilstand, treffIds: ReadonlySet<string> = alle, route: UtforskRoute = utforsk()) =>
  renderToStaticMarkup(<StedSok steder={demo.steder} treffIds={treffIds} route={route} start={tilstand} />)

/** The text of each suggestion, with the screen-reader separators, tags left out. */
const forslag = (html: string) =>
  [...html.matchAll(/<li [^>]*role="option"[^>]*>(.*?)<\/li>/g)].map(([, inner]) => inner.replace(/<[^>]+>/g, ''))

describe('sokReducer: the keyboard', () => {
  it('opens the list with nothing highlighted while typing', () => {
    expect(kjor([skriv('t')])).toEqual({ tekst: 't', apen: true, markert: null })
  })

  it('moves the highlight down and up with the arrows, wrapping round', () => {
    const fire = 4
    expect(kjor([skriv('t'), tast('ArrowDown', fire)]).markert).toBe(0)
    expect(kjor([skriv('t'), tast('ArrowDown', fire), tast('ArrowDown', fire)]).markert).toBe(1)
    expect(kjor([skriv('t'), tast('ArrowUp', fire)]).markert).toBe(3)
    expect(kjor([skriv('t'), tast('ArrowDown', fire), tast('ArrowUp', fire)]).markert).toBe(3)
    expect(kjor([skriv('t'), ...Array.from({ length: 5 }, () => tast('ArrowDown', fire))]).markert).toBe(0)
  })

  it('reopens a closed list with an arrow, highlighting the first or the last', () => {
    const lukket = kjor([skriv('t'), tast('ArrowDown', 4), tast('ArrowDown', 4), tast('Escape', 4)])
    expect(lukket).toEqual({ tekst: 't', apen: false, markert: null })
    expect(sokReducer(lukket, tast('ArrowDown', 4))).toEqual({ tekst: 't', apen: true, markert: 0 })
    expect(sokReducer(lukket, tast('ArrowUp', 4))).toEqual({ tekst: 't', apen: true, markert: 3 })
  })

  it('highlights nothing when there are no suggestions', () => {
    expect(kjor([skriv('xyz'), tast('ArrowDown', 0)])).toEqual({ tekst: 'xyz', apen: true, markert: null })
  })

  it('closes the list on the first Escape and clears the field on the next', () => {
    const forste = kjor([skriv('gaus'), tast('ArrowDown', 1), tast('Escape', 1)])
    expect(forste).toEqual({ tekst: 'gaus', apen: false, markert: null })
    expect(sokReducer(forste, tast('Escape', 1))).toEqual(START_TILSTAND)
  })

  it('clears the field on the first Escape when no list is shown, as with only spaces', () => {
    expect(kjor([skriv('   '), tast('Escape', 0)])).toEqual(START_TILSTAND)
  })

  it('closes the list when the focus leaves the field, keeping the text', () => {
    expect(kjor([skriv('gaus'), tast('ArrowDown', 1), { type: 'lukk' }])).toEqual({ tekst: 'gaus', apen: false, markert: null })
  })

  it('ignores other keys', () => {
    const tilstand = kjor([skriv('gaus'), tast('ArrowDown', 1)])
    expect(sokReducer(tilstand, tast('Tab', 1))).toBe(tilstand)
    expect(sokReducer(tilstand, tast('a', 1))).toBe(tilstand)
  })
})

describe('enterIndeks', () => {
  it('opens the highlighted suggestion', () => {
    expect(enterIndeks(kjor([skriv('t'), tast('ArrowDown', 4), tast('ArrowDown', 4)]), 4)).toBe(1)
  })

  it('opens the first suggestion when none is highlighted', () => {
    expect(enterIndeks(kjor([skriv('t')]), 4)).toBe(0)
  })

  it('opens nothing when the list is closed or has no suggestions', () => {
    expect(enterIndeks(kjor([skriv('t'), tast('Escape', 4)]), 4)).toBeNull()
    expect(enterIndeks(kjor([skriv('xyz')]), 0)).toBeNull()
    expect(enterIndeks(START_TILSTAND, 0)).toBeNull()
  })
})

describe('apneForslag', () => {
  it('opens /sted/<id> with the filter and the view in the address, as a list row does', () => {
    const gaTil = vi.fn<(route: Route) => void>()
    const route: UtforskRoute = { ...utforsk('liste'), filter: { ...STANDARD_FILTER, minNysnoCm: 20 } }
    apneForslag('oslo', route, gaTil)
    expect(gaTil).toHaveBeenCalledExactlyOnceWith(sted('oslo', route))
    expect(href(gaTil.mock.calls[0][0], '/')).toBe('/sted/oslo?visning=liste&nysno=20')
  })
})

describe('StedSok markup', () => {
  it('has a visible label and a closed combobox when empty', () => {
    const html = render(START_TILSTAND)
    expect(html).toMatch(/<label for="([^"]+)" class="sted-sok-etikett">Søk etter sted<\/label><input id="\1"/)
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toMatch(/aria-controls="([^"]+)"[\s\S]*<ul id="\1" role="listbox"/)
    expect(html).not.toContain('aria-activedescendant')
    expect(forslag(html)).toEqual([])
    expect(html).toContain('aria-live="polite"></p>')
  })

  it('shows no list for search text with only spaces', () => {
    const html = render(kjor([skriv('   ')]))
    expect(forslag(html)).toEqual([])
    expect(html).not.toContain('Fant ingen')
    expect(html).toContain('aria-expanded="false"')
  })

  it('lists the suggestions by the search rule, with the score badge, and announces how many', () => {
    const html = render(kjor([skriv('tromso')]))
    expect(forslag(html)).toEqual(['Tromsø, 0 · Lite', 'Tromsø Alpinpark, 3 · Lite'])
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain(`aria-live="polite">${antallForslagTekst(2)}</p>`)
    expect(antallForslagTekst(2)).toBe('2 steder')
    expect(antallForslagTekst(1)).toBe('1 sted')
    expect(html).toContain('class="score-badge')
  })

  it('points aria-activedescendant at the highlighted suggestion, which is aria-selected', () => {
    const html = render(kjor([skriv('skisenter'), tast('ArrowDown', 3), tast('ArrowDown', 3)]))
    const aktiv = /aria-activedescendant="([^"]+)"/.exec(html)?.[1]
    expect(aktiv).toBeDefined()
    expect(html).toContain(`id="${aktiv}" role="option" aria-selected="true"`)
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1)
    expect(forslag(html)[1]).toContain('Oppdal Skisenter')
  })

  it('marks a place the filter hides with «Oppfyller ikke filteret»', () => {
    const treff = filtrerSteder(demo.steder, { ...STANDARD_FILTER, minNysnoCm: 20 })
    expect(treff.some(({ id }) => id === 'oslo')).toBe(false)
    const html = render(kjor([skriv('oslo')]), new Set(treff.map(({ id }) => id)))
    expect(forslag(html)).toEqual([expect.stringContaining(`, ${OPPFYLLER_IKKE}`)])
    expect(forslag(render(kjor([skriv('oslo')])))[0]).not.toContain(OPPFYLLER_IKKE)
  })

  it('shows «Ufullstendige data» without a number for an incomplete place', () => {
    const [trondheim] = forslag(render(kjor([skriv('trondheim')])))
    expect(trondheim).toBe('Trondheim, Ufullstendige data')
  })

  it('says what was searched for and how many places there are when nothing matches', () => {
    const tekst = ingenTreffTekst('  xyz ', demo.steder.length)
    expect(tekst).toBe('Fant ingen steder som heter «xyz». SnowFinder dekker 24 steder i Norge.')
    const html = render(kjor([skriv('  xyz ')]))
    expect(forslag(html)).toEqual([])
    expect(html).toContain(`<p class="sted-sok-ingen">${tekst}</p>`)
    expect(html).toContain(`aria-live="polite">${tekst}</p>`)
    expect(html).toContain('aria-expanded="false"')
  })

  it('shows nothing once the list is closed, but keeps the text', () => {
    const html = render(kjor([skriv('gaus'), tast('Escape', 1)]))
    expect(forslag(html)).toEqual([])
    expect(html).toContain('value="gaus"')
  })
})
