import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PublishedData } from '../shared/contracts/published'
import { AppView } from './App'
import { medEnhet } from './components/ListeVisning'
import { LOAD_ERROR_MESSAGE, type LoadResult } from './lib/data/loadPublishedData'
import type { Route } from './lib/router'

const demo = PublishedData.parse(
  JSON.parse(readFileSync(new URL('../public/data/demo.json', import.meta.url), 'utf8')),
)

const demoResult: LoadResult = { status: 'ok', data: demo, source: 'demo' }
const UTFORSK: Route = { name: 'utforsk', visning: 'kart' }
const LISTE: Route = { name: 'utforsk', visning: 'liste' }

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
      [LISTE, '<div class="skeleton liste-skeleton" role="status">'],
      [{ name: 'sted', id: 'oslo' }, '<div class="skeleton" role="status">'],
    ] as const
    for (const [route, skeleton] of cases) {
      const html = render(null, route)
      expect(html).toContain(skeleton)
      expect(html).toContain('Laster stedsdata')
    }
  })

  it('shows a place page with name, score badge and a link back', () => {
    const html = render(demoResult, { name: 'sted', id: 'gaustatoppen' })
    expect(html).toContain('<h1 class="sted-navn">Gaustatoppen</h1>')
    expect(html).toContain('<span class="score-badge score-badge--2">58 · Godt</span>')
    expect(html).toContain('<a href="/">Tilbake</a>')
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

  it('marks the map as the current view by default', () => {
    const html = render(demoResult)
    expect(html).toContain('<a href="/" class="visning-valg" aria-current="page">Kart</a>')
    expect(html).toContain('<a href="/?visning=liste" class="visning-valg">Liste</a>')
    expect(html).not.toContain('liste-rad')
  })

  it('shows the list instead of the map for visning=liste, sorted by score', () => {
    const html = render(demoResult, LISTE)
    expect(html).toContain('<a href="/?visning=liste" class="visning-valg" aria-current="page">Liste</a>')
    expect(html).not.toContain('class="kart"')
    expect(html).toContain('<label for="sortering">Sorter etter</label>')
    const rows = [...html.matchAll(/<a href="\/sted\/([^"]+)" class="liste-rad">/g)].map((match) => match[1])
    expect(rows).toHaveLength(24)
    expect(rows[0]).toBe('gaustatoppen')
    expect(rows.at(-1)).toBe('trondheim')
  })

  it('shows score as number and label, numbers with units, and incomplete data as text in the list', () => {
    const html = render(demoResult, LISTE)
    // Visually hidden separators, so a screen reader does not run the row's parts together.
    const s = '<span class="visually-hidden">, </span>'
    expect(html).toContain(
      `<a href="/sted/gaustatoppen" class="liste-rad"><span class="liste-navn">Gaustatoppen</span>${s}` +
        `<span class="score-badge score-badge--2">58 · Godt</span>${s}` +
        `<span class="liste-detaljer"><span>Nysnø 10 cm</span><span>${s}Vind 12 m/s</span><span>${s}Temp −6,4 °C</span></span></a>`,
    )
    expect(html).toContain(
      `<span class="liste-navn">Trondheim</span>${s}<span class="score-incomplete">Ufullstendige data</span>${s}` +
        `<span class="liste-detaljer"><span>Nysnø –</span><span>${s}Vind 5,1 m/s</span><span>${s}Temp –</span></span>`,
    )
  })

  it('gives each list row link a name that reads as separate parts', () => {
    const html = render(demoResult, LISTE)
    const row = /<a href="\/sted\/gaustatoppen" class="liste-rad">(.*?)<\/a>/.exec(html)?.[1] ?? ''
    expect(row.replace(/<[^>]+>/g, '')).toBe('Gaustatoppen, 58 · Godt, Nysnø 10 cm, Vind 12 m/s, Temp −6,4 °C')
  })
})

describe('medEnhet', () => {
  it('formats in Norwegian with one decimal, and shows a dash for missing data', () => {
    expect(medEnhet(3.000000000000001, 'cm')).toBe('3 cm')
    expect(medEnhet(0.285, 'cm')).toBe('0,3 cm')
    expect(medEnhet(-8.89, '°C')).toBe('−8,9 °C')
    // -0.04 °C rounds to 0, not "−0".
    expect(medEnhet(-0.04, '°C')).toBe('0 °C')
    expect(medEnhet(null, 'm/s')).toBe('–')
  })
})
