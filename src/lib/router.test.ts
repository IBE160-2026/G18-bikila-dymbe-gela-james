import { describe, expect, it } from 'vitest'
import { href, parseRoute, type Route } from './router'

const BASES = ['/', '/G18-bikila-dymbe-gela-james/']
const KART: Route = { name: 'utforsk', visning: 'kart' }
const LISTE: Route = { name: 'utforsk', visning: 'liste' }
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
    const routes: Route[] = [KART, LISTE, FORKLARING, { name: 'sted', id: 'hemsedal-skisenter' }, { name: 'sted', id: 'å b/c' }]
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
})

describe('router outside the base', () => {
  it('treats a path outside the subfolder as not found', () => {
    expect(parseRoute('/annet-repo/', '/G18-bikila-dymbe-gela-james/')).toEqual({ name: 'ikke-funnet' })
  })
})
