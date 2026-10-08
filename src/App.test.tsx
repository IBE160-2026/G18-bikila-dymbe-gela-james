import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PublishedData } from '../shared/contracts/published'
import { AppView } from './App'
import { LOAD_ERROR_MESSAGE, type LoadResult } from './lib/data/loadPublishedData'
import type { Route } from './lib/router'

const demo = PublishedData.parse(
  JSON.parse(readFileSync(new URL('../public/data/demo.json', import.meta.url), 'utf8')),
)

const demoResult: LoadResult = { status: 'ok', data: demo, source: 'demo' }
const UTFORSK: Route = { name: 'utforsk' }

function render(result: LoadResult | null, route: Route = UTFORSK): string {
  return renderToStaticMarkup(<AppView result={result} route={route} />)
}

describe('AppView', () => {
  it('shows the header, the demo banner and the map for the committed demo.json', () => {
    const html = render(demoResult)
    expect(html).toContain('<a href="/" class="app-title">SnowFinder</a>')
    expect(html).toContain('Demodata – ikke ekte prognoser')
    expect(html).toContain('class="kart"')
  })

  it('shows no demo banner for live data', () => {
    const live = { ...demo, mode: 'live' as const }
    const html = render({ status: 'ok', data: live, source: 'latest' })
    expect(html).not.toContain('Demodata')
    expect(html).toContain('class="kart"')
  })

  it('shows the error message in an alert', () => {
    const html = render({ status: 'error', message: LOAD_ERROR_MESSAGE })
    expect(html).toContain(`<p class="error" role="alert">${LOAD_ERROR_MESSAGE}</p>`)
    expect(html).not.toContain('class="kart"')
  })

  it('announces loading as a skeleton status, on the map and on a place page', () => {
    const cases = [
      [UTFORSK, '<div class="skeleton kart-skeleton" role="status">'],
      [{ name: 'sted', id: 'oslo' }, '<div class="skeleton" role="status">'],
    ] as const
    for (const [route, skeleton] of cases) {
      const html = render(null, route)
      expect(html).toContain(skeleton)
      expect(html).toContain('Laster stedsdata')
    }
  })

  it('shows a place page with name, score badge and a link back to the map', () => {
    const html = render(demoResult, { name: 'sted', id: 'gaustatoppen' })
    expect(html).toContain('<h1 class="sted-navn">Gaustatoppen</h1>')
    expect(html).toContain('<span class="score-badge score-badge--2">58 · Godt</span>')
    expect(html).toContain('<a href="/">Tilbake til kartet</a>')
    expect(html).not.toContain('class="kart"')
  })

  it('shows "Ufullstendige data" as text, not a badge, for an incomplete place', () => {
    const html = render(demoResult, { name: 'sted', id: 'trondheim' })
    expect(html).toContain('<span class="score-incomplete">Ufullstendige data</span>')
    expect(html).not.toContain('score-badge')
  })

  it('says "Fant ikke stedet" for an unknown place id', () => {
    const html = render(demoResult, { name: 'sted', id: 'finnes-ikke' })
    expect(html).toContain('Fant ikke stedet')
    expect(html).toContain('<a href="/">Gå til kartet</a>')
  })

  it('says "Fant ikke siden" for an unknown route, even before data has loaded', () => {
    const html = render(null, { name: 'ikke-funnet' })
    expect(html).toContain('Fant ikke siden')
    expect(html).toContain('<a href="/">Gå til kartet</a>')
  })
})
