import { describe, expect, it } from 'vitest'
import { href, parseRoute, type Route } from './router'

const BASES = ['/', '/G18-bikila-dymbe-gela-james/']

describe.each(BASES)('router with base %s', (base) => {
  it('parses the root as utforsk, with and without the trailing slash', () => {
    expect(parseRoute(base, base)).toEqual({ name: 'utforsk' })
    expect(parseRoute(base.replace(/\/$/, '') || '/', base)).toEqual({ name: 'utforsk' })
  })

  it('parses a place page', () => {
    expect(parseRoute(`${base}sted/hemsedal-skisenter`, base)).toEqual({ name: 'sted', id: 'hemsedal-skisenter' })
    expect(parseRoute(`${base}sted/hemsedal-skisenter/`, base)).toEqual({ name: 'sted', id: 'hemsedal-skisenter' })
  })

  it('returns ikke-funnet for unknown paths', () => {
    for (const path of [`${base}noe-annet`, `${base}sted`, `${base}sted/`, `${base}sted/a/b`, `${base}sted/%E0`]) {
      expect(parseRoute(path, base)).toEqual({ name: 'ikke-funnet' })
    }
  })

  it('round-trips href and parseRoute', () => {
    const routes: Route[] = [{ name: 'utforsk' }, { name: 'sted', id: 'hemsedal-skisenter' }, { name: 'sted', id: 'å b/c' }]
    for (const route of routes) expect(parseRoute(href(route, base), base)).toEqual(route)
  })

  it('builds links under the base', () => {
    expect(href({ name: 'utforsk' }, base)).toBe(base)
    expect(href({ name: 'sted', id: 'oslo' }, base)).toBe(`${base}sted/oslo`)
  })
})

describe('router outside the base', () => {
  it('treats a path outside the subfolder as not found', () => {
    expect(parseRoute('/annet-repo/', '/G18-bikila-dymbe-gela-james/')).toEqual({ name: 'ikke-funnet' })
  })
})
