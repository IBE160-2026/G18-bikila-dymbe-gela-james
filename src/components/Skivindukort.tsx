import type { Sted } from '../../shared/contracts/published'
import { SKIVINDU } from '../../shared/skivindu'
import { medEnhet, tidsrom } from '../lib/format'

type Props = Pick<Sted, 'skivindu' | 'skivinduUtenDagslys'>

export const MORKETID_TEKST = 'Mørketid – vindu vist uten dagslys'
export const SKIVINDU_FORKLARING = 'Gjelder været (vind, skydekke og dagslys), ikke snøen. Snøen står i SnowScore.'

/**
 * Story 4.2 (FR-17): when it is best to go. Only reads what the pipeline wrote (AD-2): the window and
 * the polar night flag, never counting daylight hours itself. The card is always shown, also with no window.
 */
export default function Skivindukort({ skivindu, skivinduUtenDagslys }: Props) {
  // The ranking compares wind in whole m/s, so the card shows it that way too.
  const grunn =
    skivindu === null
      ? null
      : `Snittvind ${medEnhet(Math.round(skivindu.snittVindMs), 'm/s')}, skydekke ${medEnhet(Math.round(skivindu.snittSkydekke), '%')}` +
        (skivindu.etterSnofall ? ', etter snøfallet' : '')
  const timeord = skivinduUtenDagslys ? 'time' : 'dagslystime'

  return (
    <section className="sted-kort kort skivindu" aria-labelledby="sted-skivindu">
      <h2 id="sted-skivindu">Beste skivindu</h2>
      {/* Review 2026-11-18: a good window next to «0 · Lite» looked like a contradiction. */}
      <p className="skivindu-forklaring">{SKIVINDU_FORKLARING}</p>
      {skivindu === null ? (
        <p className="skivindu-mangler">Fant ikke noe skivindu de neste 48 timene.</p>
      ) : (
        <>
          <p className="skivindu-tid">{tidsrom(skivindu.start, skivindu.timer)}</p>
          <p className="skivindu-grunn">{grunn}</p>
          {skivindu.timer < SKIVINDU.vinduTimer && (
            <p className="skivindu-grunn">
              Bare {skivindu.timer} sammenhengende {skivindu.timer === 1 ? timeord : `${timeord}r`}
            </p>
          )}
        </>
      )}
      {skivinduUtenDagslys && <p className="skivindu-grunn">{MORKETID_TEKST}</p>}
    </section>
  )
}
