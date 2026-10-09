import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { PublishedData } from '../shared/contracts/published'
import { FJERNES_ETTER_MS } from '../shared/freshness'
import { AppView } from './App'
import { kvalitetLinjer } from './components/Datakvalitet'
import { medFerskhet, type StederResult } from './hooks/useSteder'
import { LOAD_ERROR_MESSAGE } from './lib/data/loadPublishedData'
import type { Route } from './lib/router'
import { INGEN_STEDER } from './pages/Utforsk'

const demo = PublishedData.parse(
  JSON.parse(readFileSync(new URL('../public/data/demo.json', import.meta.url), 'utf8')),
)

const demoResult = medFerskhet({ status: 'ok', data: demo, source: 'demo' })
const UTFORSK: Route = { name: 'utforsk', visning: 'kart' }
const LISTE: Route = { name: 'utforsk', visning: 'liste' }

function render(result: StederResult | null, route: Route = UTFORSK): string {
  return renderToStaticMarkup(<AppView result={result} route={route} />)
}

describe('AppView', () => {
  it('shows the header, the demo banner and the map for the committed demo.json', () => {
    const html = render(demoResult)
    expect(html).toContain('<a href="/" class="app-title" aria-current="page">SnowFinder</a>')
    expect(html).toContain('<a href="/slik-beregner-vi-snowscore" class="toppnav-lenke">Slik beregner vi SnowScore</a>')
    // Story 2.1: one link to the explanation next to the switch covers both map and list.
    expect(html).toContain('<a href="/slik-beregner-vi-snowscore" class="forklaring-lenke">Slik beregner vi SnowScore</a>')
    expect(html).toContain('Demodata – ikke ekte prognoser')
    expect(html).toContain('class="kart"')
  })

  it('shows no demo banner for live data', () => {
    // Live age is measured against the wall clock. Unpinned, every demo place would be older than 12 h
    // and the page would show the empty state instead of the map, so pin the clock to the file's time.
    vi.useFakeTimers({ now: Date.parse(demo.referenceTime) })
    try {
      const live = { ...demo, mode: 'live' as const }
      const html = render(medFerskhet({ status: 'ok', data: live, source: 'latest' }))
      expect(html).not.toContain('Demodata')
      expect(html).toContain('class="kart"')
    } finally {
      vi.useRealTimers()
    }
  })

  it.each(['kart', 'liste'] as const)('explains an empty %s when every place is older than 12 h', (visning) => {
    vi.useFakeTimers({ now: Date.parse(demo.referenceTime) + 2 * FJERNES_ETTER_MS })
    try {
      const live = { ...demo, mode: 'live' as const }
      const html = render(medFerskhet({ status: 'ok', data: live, source: 'latest' }), { name: 'utforsk', visning })
      expect(html).toContain('<p class="visually-hidden" role="status">Ingen ferske data</p>')
      expect(html).toContain('<h2 id="tom-overskrift">Ingen ferske data</h2>')
      expect(html).toContain(`<p>${INGEN_STEDER}</p>`)
      expect(html).not.toContain('aria-label="Visning"')
      expect(html).not.toContain('class="forklaring-lenke"')
      expect(html).toContain('Last inn på nytt</button>')
      expect(html).not.toContain('class="kart"')
      expect(html).not.toContain('liste-rad')
    } finally {
      vi.useRealTimers()
    }
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

  it('shows a full place page: badge, sub-scores out of their maximum, data with units and Norwegian time', () => {
    const html = render(demoResult, { name: 'sted', id: 'gaustatoppen' })
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toContain('<h1 class="sted-navn">Gaustatoppen</h1>')
    expect(html).toContain('<span class="score-badge score-badge--2">58 · Godt</span>')
    const text = html.replace(/<[^>]+>/g, '|')
    for (const pair of [
      'A Nysnøpotensial||30,0 av 60',
      'B Kuldebonus||13,1 av 25',
      'C Snøandel||15,0 av 15',
      'Nysnø neste døgn||10 cm',
      'Temperatur, snitt||−6,4 °C',
      'Vind, maks||12 m/s',
      'Skydekke, snitt||85 %',
      'Høyde||1\u00a0882 moh.',
      'NVE-nysnø siste døgn||0 mm',
    ]) {
      expect(text).toContain(pair)
    }
    // 20:30 UTC is 22:30 in Norway in October (CEST).
    expect(html).toContain('Prognose fra MET, oppdatert 7. oktober 2026 kl. 22:30')
    expect(html).not.toContain('Utdatert')
    expect(html).toContain('<a href="/" class="sted-tilbake">Tilbake</a>')
    expect(html).not.toContain('class="kart"')
  })

  it('shows "Ufullstendige data" as text, with no badge and no sub-scores, for an incomplete place', () => {
    const html = render(demoResult, { name: 'sted', id: 'trondheim' })
    expect(html).toContain('<span class="score-incomplete">Ufullstendige data</span>')
    expect(html).not.toContain('score-badge')
    expect(html).not.toContain('Nysnøpotensial')
    expect(html).not.toContain(' av 60')
    expect(html.replace(/<[^>]+>/g, '|')).toContain('Temperatur, snitt||–')
  })

  it('marks a place older than 3 h as «Utdatert» with its time, on the page and in the list row', () => {
    const page = render(demoResult, { name: 'sted', id: 'kirkenes' })
    expect(page).toContain('<p class="utdatert">Utdatert · data fra 7. oktober 2026 kl. 18:30</p>')

    const s = '<span class="visually-hidden">, </span>'
    const list = render(demoResult, LISTE)
    expect(list).toContain(
      `<span class="score-badge score-badge--0">0 · Lite</span>${s}<span class="utdatert">Utdatert · data fra 7. oktober 2026 kl. 18:30</span>${s}`,
    )
    // Only Kirkenes is stale in the demo data.
    expect(list.match(/class="utdatert"/g)).toHaveLength(1)
  })

  it('says the MET forecast is missing when the source time is unknown, without a stale mark', () => {
    const steder = demo.steder.map((sted) => (sted.id === 'trondheim' ? { ...sted, kildeTidspunkt: null } : sted))
    const result = medFerskhet({ status: 'ok', data: { ...demo, steder }, source: 'demo' })
    const page = render(result, { name: 'sted', id: 'trondheim' })
    expect(page).toContain('Prognosen fra MET mangler for dette stedet.')
    expect(page).not.toContain('class="utdatert"')
    expect(page).not.toContain('oppdatert –')
  })

  it('removes a place older than 12 h from the list and explains it on its own page', () => {
    const tooOld = new Date(Date.parse(demo.referenceTime) - FJERNES_ETTER_MS - 1).toISOString()
    const steder = demo.steder.map((sted) => (sted.id === 'oslo' ? { ...sted, kildeTidspunkt: tooOld } : sted))
    const result = medFerskhet({ status: 'ok', data: { ...demo, steder }, source: 'demo' })

    const list = render(result, LISTE)
    expect(list).not.toContain('/sted/oslo')
    expect(list.match(/class="liste-rad"/g)).toHaveLength(demo.steder.length - 1)

    const page = render(result, { name: 'sted', id: 'oslo' })
    expect(page).toContain('Dataene for dette stedet er for gamle til å vises')
    expect(page).toContain('<a href="/">Gå til kartet</a>')
    expect(page).not.toContain('Fant ikke stedet')
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

  it.each([
    ['loading', null],
    ['failed', { status: 'error', message: LOAD_ERROR_MESSAGE }],
    ['loaded', demoResult],
  ] as const)('shows the explanation page at once when data is %s, without skeleton or error', (_, result) => {
    const html = render(result, { name: 'forklaring' })
    // The app's own result reaches the quality panel, in every state, with every line of its report.
    const linjer = kvalitetLinjer(result)
    expect(linjer.length).toBeGreaterThan(0)
    expect(html).toContain(`<div class="datakvalitet" role="status">${linjer.map((linje) => `<p>${linje}</p>`).join('')}</div>`)
    expect(html).toContain('<h1 class="forklaring-tittel">Slik beregner vi SnowScore</h1>')
    expect(html).toContain('Kort fortalt')
    expect(html).not.toContain('skeleton')
    expect(html).not.toContain(LOAD_ERROR_MESSAGE)
    expect(html).not.toContain('role="alert"')
    // The nav marks the explanation as the current page, and the product name no longer.
    expect(html).toContain(
      '<a href="/slik-beregner-vi-snowscore" class="toppnav-lenke" aria-current="page">Slik beregner vi SnowScore</a>',
    )
    expect(html).toContain('<a href="/" class="app-title">SnowFinder</a>')
  })

  it('has a closed ☰ menu button that controls the nav links', () => {
    const html = render(demoResult)
    expect(html).toContain(
      '<button type="button" class="toppnav-knapp" aria-label="Meny" aria-expanded="false" aria-controls="toppnav-lenker">☰</button>',
    )
    expect(html).toContain('<ul id="toppnav-lenker" class="toppnav-lenker">')
  })

  it.each(['gaustatoppen', 'trondheim'])('links the SnowScore card on the place page %s to the explanation', (id) => {
    const html = render(demoResult, { name: 'sted', id })
    const kort = /<section class="sted-kort" aria-labelledby="sted-snowscore">(.*?)<\/section>/.exec(html)?.[1] ?? ''
    expect(kort).toContain('<a href="/slik-beregner-vi-snowscore" class="forklaring-lenke">Slik beregner vi SnowScore</a>')
    expect(html).not.toContain('aria-current="page"')
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
