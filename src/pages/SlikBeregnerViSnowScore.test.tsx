import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SNOWSCORE, SNOWSCORE_VERSION } from '../lib/snowscore'
import SlikBeregnerViSnowScore, { ENDRINGSLOGG } from './SlikBeregnerViSnowScore'

/** The page's text without tags, with entities for quotes decoded. */
function tekst(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/\s+/g, ' ')
}

function imgLabels(html: string): string[] {
  return [...html.matchAll(/<svg[^>]*role="img"[^>]*aria-label="([^"]*)"/g)].map((match) => match[1])
}

describe('SlikBeregnerViSnowScore', () => {
  const html = renderToStaticMarkup(<SlikBeregnerViSnowScore result={null} />)

  it('has one h1 and the six sections in order', () => {
    expect(html.match(/<h1/g)).toHaveLength(1)
    const sections = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((match) => match[1])
    expect(sections).toEqual(['Kort fortalt', 'Steg for steg', 'Regneeksempel', 'Datakilder og begrensninger', 'Datakvalitet', 'Endringslogg'])
  })

  it('shows the formula with the current parameters and the 24-hour window', () => {
    const text = tekst(html)
    expect(text).toContain('neste 24 timene')
    expect(text).toContain('f(T) = min(1, max(0, (2 − T) / 2))')
    expect(text).toContain('A = 60 · min(1, S / 20)')
    expect(text).toContain('B = 25 · min(1, max(0, (2 − T̄) / 16))')
    expect(text).toContain('C = 15 · S / P')
    expect(text).toContain('mindre enn 0,5 mm nedbør')
    expect(text).toContain('full poengsum kommer ved −14 °C eller kaldere')
    expect(text).toContain('1 mm vann tilsvarer omtrent 1 cm snø')
  })

  it('has three graphs, A, B and C, each an image with a text alternative', () => {
    const labels = imgLabels(html)
    expect(labels).toHaveLength(3)
    expect(labels[0]).toContain('A Nysnøpotensial')
    expect(labels[0]).toContain('60 poeng ved 20 mm')
    expect(labels[1]).toContain('B Kuldebonus')
    expect(labels[1]).toContain('0 poeng når snittemperaturen (T̄) er 2 °C eller varmere')
    expect(labels[1]).toContain('25 poeng ved −14 °C eller kaldere')
    expect(labels[2]).toContain('C Snøandel')
    expect(labels[2]).toContain('15 poeng når all nedbøren kommer som snø')
  })

  it('explains the four tiers with badges and the incomplete label as text', () => {
    const text = tekst(html)
    expect(text).toContain('70 · Svært godt betyr en score fra 70 til 100')
    expect(text).toContain('45 · Godt betyr en score fra 45 til 69')
    expect(text).toContain('20 · Middels betyr en score fra 20 til 44')
    expect(text).toContain('0 · Lite betyr en score fra 0 til 19')
    expect(html).toContain('<span class="score-incomplete">Ufullstendige data</span>')
    expect(text).toContain('mer enn 10 % av timene')
  })

  it('has a change log whose newest row is the current version, with the B denominator change', () => {
    expect(ENDRINGSLOGG[0].versjon).toBe(SNOWSCORE_VERSION)
    expect(new Set(ENDRINGSLOGG.map(({ versjon }) => versjon)).size).toBe(ENDRINGSLOGG.length)
    const rows = [...html.matchAll(/<tr><th scope="row">([^<]+)<\/th><td>([^<]+)<\/td>/g)]
    expect(rows[0][1]).toBe(SNOWSCORE_VERSION)
    expect(rows.at(-1)?.[1]).toBe('1.0')
    expect(rows.at(-1)?.[2]).toBe('Nevneren i B (Kuldebonus) endret fra 6 til 16.')
    expect(tekst(html)).toContain('Full kuldebonus kommer først ved T̄ ≈ −14 °C i stedet for −4 °C.')
  })
})

describe('SlikBeregnerViSnowScore follows the constants', () => {
  afterEach(() => {
    vi.doUnmock('../../shared/snowscore')
    vi.resetModules()
  })

  it('changes every number on the page when SNOWSCORE changes, but keeps the change log as recorded', async () => {
    vi.resetModules()
    // Values that appear nowhere else on the page.
    const endret = {
      ...SNOWSCORE,
      maxA: 63,
      maxB: 27,
      maxC: 11,
      fullSnowMm: 23,
      allSnowAtOrBelowC: -1,
      noSnowAtOrAboveC: 3,
      coldRangeC: 19,
      minPrecipitationMm: 0.7,
      maxMissingShare: 0.13,
      cmPerMm: 1.2,
    }
    vi.doMock('../../shared/snowscore', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../../shared/snowscore')>()),
      SNOWSCORE: endret,
      WINDOW_HOURS: 30,
    }))
    const { default: Side } = await import('./SlikBeregnerViSnowScore')
    const html = renderToStaticMarkup(<Side result={null} />)
    const [forklaring, logg] = html.split('<section aria-labelledby="endringslogg">')
    // The sources section names NVE's own fixed period («nysnø siste døgn»), which is not the SnowScore window.
    const [formel, kilder = ''] = forklaring.split('<section aria-labelledby="datakilder">')
    const kvalitet = kilder.indexOf('<section aria-labelledby="datakvalitet">')
    // Fail loudly if a section moved, rather than silently checking less text.
    expect(kilder).not.toBe('')
    expect(kvalitet).toBeGreaterThan(0)
    const text = tekst(formel + kilder.slice(kvalitet))

    for (const ny of [
      'et tall fra 0 til 101',
      'neste 30 timene',
      'Ved −1 °C eller kaldere',
      'ved 3 °C eller varmere',
      'f(T) = min(1, max(0, (3 − T) / 4))',
      'omtrent 1,2 cm snø',
      'A = 63 · min(1, S / 23)',
      'full poengsum ved 23 mm nysnø',
      'B = 27 · min(1, max(0, (3 − T̄) / 19))',
      'full poengsum kommer ved −16 °C eller kaldere',
      'C = 11 · S / P',
      'mindre enn 0,7 mm nedbør til sammen i de 30 timene',
      'for alle 30 timene',
      'mer enn 13 % av timene',
      'fra 70 til 101',
    ]) {
      expect(text).toContain(ny)
    }
    for (const gammel of ['24 timene', '(2 − T', '0 °C eller kaldere', '−14', '0,5 mm', '10 %', '1 cm snø', 'fra 0 til 100', 'døgn']) {
      expect(text).not.toContain(gammel)
    }
    // The old maxima as whole numbers (−16 is the new cold point, so a minus sign does not count).
    for (const tall of ['60', '25', '16']) expect(text).not.toMatch(new RegExp(`(^|[^0-9,−])${tall}([^0-9,]|$)`))

    const labels = imgLabels(forklaring)
    expect(labels[0]).toContain('63 poeng ved 23 mm')
    expect(labels[1]).toContain('er 3 °C eller varmere')
    expect(labels[1]).toContain('27 poeng ved −16 °C eller kaldere')
    expect(labels[2]).toContain('11 poeng når all nedbøren')

    // The change log is a record of what changed then; a later parameter change must not rewrite it.
    expect(tekst(logg)).toContain('Nevneren i B (Kuldebonus) endret fra 6 til 16.')
    expect(tekst(logg)).toContain('Full kuldebonus kommer først ved T̄ ≈ −14 °C i stedet for −4 °C.')
  })
})
