import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PublishedData } from '../../shared/contracts/published'
import type { StederResult } from '../hooks/useSteder'
import Datakilder, { VARSOM_URL } from './Datakilder'
import Datakvalitet, { KVALITET_FEIL, KVALITET_LASTER, kvalitetLinjer } from './Datakvalitet'

// Story 2.3: sources and limits, and the last run's quality report in plain words (FR-11, NFR-DQ2).

const demo = PublishedData.parse(
  JSON.parse(readFileSync(new URL('../../public/data/demo.json', import.meta.url), 'utf8')),
)

function ok(data: PublishedData): StederResult {
  return { status: 'ok', data, source: 'latest', utdatert: new Set(), fjernet: new Set() }
}

const live = PublishedData.parse({
  ...demo,
  mode: 'live',
  generert: '2026-10-09T12:05:00Z',
  report: {
    ...demo.report,
    runId: 'run-1',
    mode: 'live',
    antallSteder: 300,
    andelGyldige: 0.99,
    avvistePerKilde: { met: 3, nve: 1 },
    antallUfullstendige: 2,
  },
})

describe('kvalitetLinjer', () => {
  it('describes a live run: time, valid places, rejections per source and incomplete places', () => {
    expect(kvalitetLinjer(ok(live))).toEqual([
      'Siste publiserte kjøring: 9. oktober 2026 kl. 14:05.',
      '297 av 300 steder hadde gyldige data fra MET.',
      'Avviste svar: 3 fra MET og 1 fra NVE.',
      // The contract counts incomplete places as valid, so they are part of the 297, not extra.
      '2 steder av de gyldige har ufullstendige data og vises uten poengsum.',
    ])
  })

  it('says «ingen» instead of zeros for a clean run', () => {
    const ren = { ...live, report: { ...live.report, andelGyldige: 1, avvistePerKilde: { met: 0, nve: 0 }, antallUfullstendige: 0 } }
    expect(kvalitetLinjer(ok(ren)).slice(1)).toEqual([
      '300 av 300 steder hadde gyldige data fra MET.',
      'Ingen svar fra MET eller NVE ble avvist.',
      'Ingen steder har ufullstendige data.',
    ])
  })

  it('describes the demo data set instead of a run in demo mode', () => {
    expect(kvalitetLinjer(ok(demo))).toEqual([
      'Du ser demodata: innspilte svar fra MET og NVE, ikke ferske prognoser.',
      'Datasettet ble bygget 7. oktober 2026 kl. 22:30 og har 24 steder.',
      '1 sted har ufullstendige data og vises uten poengsum.',
    ])
  })

  it('says the report is loading, or could not be loaded', () => {
    expect(kvalitetLinjer(null)).toEqual([KVALITET_LASTER])
    expect(kvalitetLinjer({ status: 'error', message: 'x' })).toEqual([KVALITET_FEIL])
  })
})

describe('Datakvalitet', () => {
  it.each([
    ['a live run', ok(live)],
    ['a failed load', { status: 'error', message: 'x' } as const],
  ])('shows %s as plain text in a status region, without score colours or danger red', (_, result) => {
    const html = renderToStaticMarkup(<Datakvalitet result={result} />)
    expect(html).toMatch(/^<section aria-labelledby="datakvalitet"><h2 id="datakvalitet">Datakvalitet<\/h2><div class="datakvalitet" role="status">(<p>[^<]+<\/p>)+<\/div><\/section>$/)
  })
})

describe('Datakilder', () => {
  const html = renderToStaticMarkup(<Datakilder />)

  it('lists MET and NVE with their licences, and Kartverket and OpenStreetMap', () => {
    expect(html).toMatch(/MET Norway \(Meteorologisk institutt\).*Lisens: <a href="https:\/\/api.met.no\/doc\/License">CC BY 4.0<\/a>/)
    expect(html).toMatch(/NVE seNorge.*Lisens: <a href="https:\/\/data.norge.no\/nlod\/no\/2.0">NLOD<\/a>/)
    expect(html).toContain('Kartverket')
    expect(html).toMatch(/© OpenStreetMap contributors.*ODbL/)
  })

  it('says SnowScore is a forecast and SnowFinder is no avalanche assessment, linking to Varsom', () => {
    expect(html).toContain('SnowScore er en prognose og en modell')
    expect(html).toContain('verken målt snø eller en garanti')
    expect(html).toContain('SnowFinder er ikke en skredfarevurdering')
    expect(html).toContain(`<a href="${VARSOM_URL}">Varsom.no</a>`)
  })
})
