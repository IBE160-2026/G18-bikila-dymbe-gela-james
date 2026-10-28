import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Sted } from '../../shared/contracts/published'
import Skivindukort from './Skivindukort'

const tekst = (props: Pick<Sted, 'skivindu' | 'skivinduUtenDagslys'>) =>
  renderToStaticMarkup(<Skivindukort {...props} />)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const vindu = { start: '2026-10-09T11:00:00Z', timer: 4, snittVindMs: 2.475, snittSkydekke: 0.525, etterSnofall: false }

describe('Skivindukort', () => {
  it('shows the span in Norwegian time and the reason with wind and cloud in whole numbers', () => {
    expect(tekst({ skivindu: vindu, skivinduUtenDagslys: false })).toBe(
      'Beste skivindu fredag 13–17 Snittvind 2 m/s, skydekke 1 %',
    )
  })

  it('says when the window comes after the snowfall', () => {
    expect(tekst({ skivindu: { ...vindu, etterSnofall: true }, skivinduUtenDagslys: false })).toContain(
      'skydekke 1 %, etter snøfallet',
    )
  })

  it('says how many consecutive daylight hours a short window has', () => {
    expect(tekst({ skivindu: { ...vindu, timer: 2 }, skivinduUtenDagslys: false })).toContain(
      'fredag 13–15 Snittvind 2 m/s, skydekke 1 % Bare 2 sammenhengende dagslystimer',
    )
    expect(tekst({ skivindu: { ...vindu, timer: 1 }, skivinduUtenDagslys: false })).toContain(
      'Bare 1 sammenhengende dagslystime',
    )
  })

  it('reads the polar night flag from the data and says the window ignores daylight', () => {
    const morketid = tekst({ skivindu: { ...vindu, timer: 3 }, skivinduUtenDagslys: true })
    expect(morketid).toContain('Mørketid – vindu vist uten dagslys')
    expect(morketid).toContain('Bare 3 sammenhengende timer')
    expect(tekst({ skivindu: vindu, skivinduUtenDagslys: false })).not.toContain('Mørketid')
  })

  it('stays with a message when there is no window', () => {
    expect(tekst({ skivindu: null, skivinduUtenDagslys: false })).toBe(
      'Beste skivindu Fant ikke noe skivindu de neste 48 timene.',
    )
  })
})
