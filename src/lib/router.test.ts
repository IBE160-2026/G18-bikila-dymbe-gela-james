import { describe, expect, it } from 'vitest'
import { STANDARD_FILTER } from '../../shared/filter'
import { href, parseRoute, utforsk, type Route, type UtforskRoute } from './router'

const BASES = ['/', '/G18-bikila-dymbe-gela-james/']
const KART: UtforskRoute = utforsk('kart')
const LISTE: UtforskRoute = utforsk('liste')
const FILTRERT: UtforskRoute = {
  name: 'utforsk',
  visning: 'liste',
  filter: { minNysnoCm: 5, maksVindMs: 10, maksTemperaturC: -2 },
  sortering: 'navn',
}
const FORKLARING: Route = { name: 'forklaring' }

describe.each(BASES)('router with base %s', (base) => {
  it('parses the root as utforsk, with and without the trailing slash', () => {
    expect(parseRoute(base, base)).toEqual(KART)
    expect(parseRoute(base.replace(/\/$/, '') || '/', base)).toEqual(KART)
  })

  it('reads visning from the query, defaulting to the map', () => {
    expect(parseRoute(base, base, '?visning=liste')).toEqual(LISTE)
    expect(parseRoute(base, base, '?visning=kart')).toEqual(KART)
    expect(parseRoute(base, base, '?visning=noe')).toEqual(KART)
    expect(parseRoute(base, base, '?annet=1&visning=liste')).toEqual(LISTE)
    expect(parseRoute(base, base, '')).toEqual(KART)
  })

  it('parses a place page', () => {
    expect(parseRoute(`${base}sted/hemsedal-skisenter`, base)).toEqual({ name: 'sted', id: 'hemsedal-skisenter' })
    expect(parseRoute(`${base}sted/hemsedal-skisenter/`, base)).toEqual({ name: 'sted', id: 'hemsedal-skisenter' })
  })

  it('parses the explanation page, with and without the trailing slash', () => {
    expect(parseRoute(`${base}slik-beregner-vi-snowscore`, base)).toEqual(FORKLARING)
    expect(parseRoute(`${base}slik-beregner-vi-snowscore/`, base)).toEqual(FORKLARING)
  })

  it('returns ikke-funnet for unknown paths', () => {
    for (const path of [`${base}noe-annet`, `${base}slik-beregner-vi-snowscore/x`, `${base}sted`, `${base}sted/`, `${base}sted/a/b`, `${base}sted/%E0`]) {
      expect(parseRoute(path, base)).toEqual({ name: 'ikke-funnet' })
    }
  })

  it('round-trips href and parseRoute', () => {
    const routes: Route[] = [
      KART,
      LISTE,
      FILTRERT,
      { ...KART, filter: { ...STANDARD_FILTER, maksTemperaturC: 0 } },
      { ...KART, sortering: 'navn' },
      FORKLARING,
      { name: 'sted', id: 'hemsedal-skisenter' },
      { name: 'sted', id: 'å b/c' },
    ]
    for (const route of routes) {
      const url = new URL(href(route, base), 'http://x')
      expect(parseRoute(url.pathname, base, url.search)).toEqual(route)
    }
  })

  it('builds links under the base', () => {
    expect(href(KART, base)).toBe(base)
    expect(href(LISTE, base)).toBe(`${base}?visning=liste`)
    expect(href({ name: 'sted', id: 'oslo' }, base)).toBe(`${base}sted/oslo`)
    expect(href(FORKLARING, base)).toBe(`${base}slik-beregner-vi-snowscore`)
  })

  it('reads the filter and the order from the query, next to visning', () => {
    expect(parseRoute(base, base, '?visning=liste&nysno=5&vind=10&temp=-2&sortering=navn')).toEqual(FILTRERT)
    expect(parseRoute(base, base, '?sortering=navn&temp=-2&vind=10&nysno=5&visning=liste')).toEqual(FILTRERT)
    // Without visning the filter opens on the map.
    expect(parseRoute(base, base, '?nysno=2&temp=0')).toEqual({ ...KART, filter: { minNysnoCm: 2, maksVindMs: null, maksTemperaturC: 0 } })
  })

  it('never keeps «avstand» or an unknown order', () => {
    for (const sortering of ['avstand', 'score', 'noe', '']) {
      expect(parseRoute(base, base, `?visning=liste&sortering=${sortering}`)).toEqual(LISTE)
    }
  })

  it('reads a repeated sortering as the default, like a repeated filter parameter', () => {
    expect(parseRoute(base, base, '?visning=liste&sortering=navn&sortering=navn')).toEqual(LISTE)
    expect(parseRoute(base, base, '?visning=liste&sortering=navn&sortering=score')).toEqual(LISTE)
  })

  it('writes the query in a fixed order and leaves out every default', () => {
    expect(href(FILTRERT, base)).toBe(`${base}?visning=liste&nysno=5&vind=10&temp=-2&sortering=navn`)
    expect(href({ ...KART, filter: { minNysnoCm: 0, maksVindMs: 25, maksTemperaturC: 0 } }, base)).toBe(`${base}?temp=0`)
    expect(href({ ...KART, sortering: 'navn' }, base)).toBe(`${base}?sortering=navn`)
  })
})

describe('router outside the base', () => {
  it('treats a path outside the subfolder as not found', () => {
    expect(parseRoute('/annet-repo/', '/G18-bikila-dymbe-gela-james/')).toEqual({ name: 'ikke-funnet' })
  })
})
