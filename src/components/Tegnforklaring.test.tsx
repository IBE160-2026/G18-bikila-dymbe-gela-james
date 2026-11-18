import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TIERS } from '../lib/scoreTier'
import Tegnforklaring, { tegnforklaringRader } from './Tegnforklaring'

describe('Tegnforklaring', () => {
  it('gives each tier its range from TIERS, highest first, with no gaps or overlaps', () => {
    expect(tegnforklaringRader().map(({ tekst }) => tekst)).toEqual([
      '70–100 Svært godt',
      '45–69 Godt',
      '20–44 Middels',
      '0–19 Lite',
    ])
    expect(tegnforklaringRader()).toHaveLength(TIERS.length)
  })

  it('names incomplete data in text, and hides the colour dots from screen readers', () => {
    const html = renderToStaticMarkup(<Tegnforklaring />)
    expect(html).toContain('Ufullstendige data')
    expect(html).toContain('aria-label="Fargeforklaring"')
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(TIERS.length + 1)
  })
})
