import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PublishedData } from '../shared/contracts/published'
import { AppView } from './App'
import { LOAD_ERROR_MESSAGE } from './lib/data/loadPublishedData'

const demo = PublishedData.parse(
  JSON.parse(readFileSync(new URL('../public/data/demo.json', import.meta.url), 'utf8')),
)

describe('AppView', () => {
  it('shows the demo banner and the number of places for the committed demo.json', () => {
    const html = renderToStaticMarkup(<AppView result={{ status: 'ok', data: demo, source: 'demo' }} />)
    expect(html).toContain('<h1 class="app-title">SnowFinder</h1>')
    expect(html).toContain('Demodata – ikke ekte prognoser')
    expect(html).toContain('24 steder lastet')
  })

  it('shows no demo banner for live data', () => {
    const live = { ...demo, mode: 'live' as const }
    const html = renderToStaticMarkup(<AppView result={{ status: 'ok', data: live, source: 'latest' }} />)
    expect(html).not.toContain('Demodata')
    expect(html).toContain('24 steder lastet')
  })

  it('shows the error message in an alert', () => {
    const html = renderToStaticMarkup(<AppView result={{ status: 'error', message: LOAD_ERROR_MESSAGE }} />)
    expect(html).toContain(`<p class="error" role="alert">${LOAD_ERROR_MESSAGE}</p>`)
    expect(html).not.toContain('steder lastet')
  })

  it('announces loading as a status', () => {
    const html = renderToStaticMarkup(<AppView result={null} />)
    expect(html).toContain('role="status"')
    expect(html).toContain('Laster stedsdata')
  })
})
