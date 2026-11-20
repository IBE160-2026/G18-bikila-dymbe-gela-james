import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PublishedData } from '../../shared/contracts/published'
import { utforsk } from '../lib/router'
import BestAkkuratNaa, { BEST_BLANT_TREFFENE, BEST_NAA } from './BestAkkuratNaa'

const demo = PublishedData.parse(
  JSON.parse(readFileSync(new URL('../../public/data/demo.json', import.meta.url), 'utf8')),
)
const tre = demo.steder.slice(0, 3)

describe('BestAkkuratNaa', () => {
  it('is a section with an h2 and an ordered list of links, «Best akkurat nå» without a filter', () => {
    const html = renderToStaticMarkup(<BestAkkuratNaa steder={tre} filterAktiv={false} sok={utforsk()} />)
    expect(html).toMatch(/^<section class="best-naa" aria-labelledby="best-naa-overskrift">/)
    expect(html).toContain(`<h2 id="best-naa-overskrift" class="best-naa-overskrift">${BEST_NAA}</h2>`)
    expect(html.match(/<li>/g)).toHaveLength(3)
    expect(html).toContain(`<a href="/sted/${encodeURIComponent(tre[0].id)}" class="best-naa-rad">`)
    // In the given order, each with its name, the hidden separator a screen reader hears, and the badge.
    const tekst = html.replace(/<[^>]+>/g, '|').replace(/\|+/g, '|')
    for (const [i, s] of tre.entries()) {
      const score = s.snowScore.kind === 'score' ? s.snowScore.score : null
      expect(tekst).toContain(`|${s.navn}|, |${score} · `)
      if (i > 0) expect(tekst.indexOf(`|${s.navn}|`)).toBeGreaterThan(tekst.indexOf(`|${tre[i - 1].navn}|`))
    }
  })

  it('says «Best blant treffene» with an active filter, and carries the search into each link', () => {
    const sok = { ...utforsk('liste'), filter: { ...utforsk().filter, minNysnoCm: 2 } }
    const html = renderToStaticMarkup(<BestAkkuratNaa steder={tre} filterAktiv sok={sok} />)
    expect(html).toContain(`>${BEST_BLANT_TREFFENE}</h2>`)
    expect(html).toContain(`href="/sted/${encodeURIComponent(tre[0].id)}?visning=liste&amp;nysno=2"`)
  })

  it('renders nothing when there are no places to show', () => {
    expect(renderToStaticMarkup(<BestAkkuratNaa steder={[]} filterAktiv={false} sok={utforsk()} />)).toBe('')
  })
})
