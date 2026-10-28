import { useEffect, useState, type ChangeEvent } from 'react'
import type { Sted } from '../../shared/contracts/published'
import type { NysnoKilde } from '../../shared/filter'
import { mmToCm } from '../../shared/snowscore'
import { medEnhet, utdatertTekst } from '../lib/format'
import { sted as stedRoute, type UrlSortering, type UtforskRoute } from '../lib/router'
import { SORTERINGER, avstandKm, sorterSteder, type Posisjon, type Sortering } from '../lib/sortering'
import Lenke from './Lenke'
import ScoreBadge from './ScoreBadge'

export const POSISJON_HENTES = 'Henter posisjonen din …'
const POSISJON_TIMEOUT_MS = 10_000

const SORTERINGSTEKST: Record<Sortering, string> = { score: 'Score', avstand: 'Avstand', navn: 'Navn' }

/** Without a position the list keeps the order in the address, and says which one. */
export function posisjonAvslatt(sortering: UrlSortering): string {
  return `Fikk ikke tilgang til posisjonen din. Listen er sortert etter ${SORTERINGSTEKST[sortering].toLowerCase()}.`
}

const kmFormat = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 })

// Read by screen readers only, so a row's link is announced as "Gaustatoppen, 58 · Godt, Nysnø 10 cm, …".
const Skille = () => <span className="visually-hidden">, </span>

/**
 * Story 3.8 (decided 2026-10-27, Sena): the new snow the filter compares with, so a row that meets
 * «Nysnø siste 24 t minst 5 cm» never shows a lower forecast value. NVE's mm are converted like the filter.
 */
function nysnoTekst(sted: Sted, kilde: NysnoKilde): string {
  if (kilde !== 'nve') return `Nysnø ${medEnhet(sted.nysnoCm, 'cm')}`
  const cm = sted.nveNysnoSisteDognMm === null ? null : mmToCm(sted.nveNysnoSisteDognMm)
  return `Nysnø siste 24 t ${medEnhet(cm, 'cm')}`
}

type Props = {
  steder: Sted[]
  utdatert: ReadonlySet<string>
  /** The order kept in the address (Story 3.2). */
  sortering: UrlSortering
  onSortering: (sortering: UrlSortering) => void
  /** The current search, carried into each place's address (Story 3.2b). */
  sok: UtforskRoute
}

/**
 * Story 1.8: the accessible alternative to the map (FR-13, NFR-7). Each row is one link to the place
 * page. The position is asked for only when the user picks distance, kept in memory and never sent.
 * Story 3.2: «Score» and «Navn» live in the address; «Avstand» stays here with the position. Once the
 * list is actually sorted by distance, the address drops its order; if the position is refused, the
 * address and its order are left as they were, and the list falls back to that order.
 */
export default function ListeVisning({ steder, utdatert, sortering: urlSortering, onSortering, sok }: Props) {
  // The distance sort lives here, not in the address, so a shared link never asks for a position. Going
  // Back or Forward to another list keeps it until the page reloads; accepted 2026-10-23, since the address
  // never shows it and telling the browser's Back apart from our own address changes would cost more.
  const [avstandValgt, setAvstandValgt] = useState(false)
  const [posisjon, setPosisjon] = useState<Posisjon | null>(null)
  const [status, setStatus] = useState('')
  const sortering: Sortering = avstandValgt ? 'avstand' : urlSortering

  // «Avstand» is never written to the address, so while it is in use the address holds the default order.
  useEffect(() => {
    if (avstandValgt && posisjon && urlSortering !== 'score') onSortering('score')
  }, [avstandValgt, posisjon, urlSortering, onSortering])

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const valg = SORTERINGER.find((verdi) => verdi === event.target.value)
    if (!valg) return
    setStatus('')
    setAvstandValgt(valg === 'avstand')
    if (valg !== 'avstand') onSortering(valg)
    if (valg !== 'avstand' || posisjon) return
    const avslatt = posisjonAvslatt(urlSortering)
    if (!('geolocation' in navigator)) {
      setAvstandValgt(false)
      setStatus(avslatt)
      return
    }
    setStatus(POSISJON_HENTES)
    // The answer can come late; by then the user may have picked another order, which must win.
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosisjon({ lat: coords.latitude, lon: coords.longitude })
        setStatus((current) => (current === POSISJON_HENTES ? '' : current))
      },
      () => {
        // Back to the order in the address, which a refusal leaves unchanged.
        setAvstandValgt(false)
        setStatus((current) => (current === POSISJON_HENTES ? avslatt : current))
      },
      { timeout: POSISJON_TIMEOUT_MS },
    )
  }

  const avstandFra = sortering === 'avstand' ? posisjon : null
  const sortert = sorterSteder(steder, sortering, posisjon ?? undefined)

  return (
    <section className="liste">
      <div className="liste-sortering">
        <label htmlFor="sortering">Sorter etter</label>
        <select id="sortering" value={sortering} onChange={onChange}>
          {SORTERINGER.map((verdi) => (
            <option key={verdi} value={verdi}>
              {SORTERINGSTEKST[verdi]}
            </option>
          ))}
        </select>
      </div>
      <p className="liste-status" role="status">
        {status}
      </p>
      <ol className="liste-rader" aria-label="Steder">
        {sortert.map((sted) => {
          const detaljer = [
            nysnoTekst(sted, sok.filter.nysnoKilde),
            `Vind ${medEnhet(sted.vindMaks, 'm/s')}`,
            `Temp ${medEnhet(sted.temperatur, '°C')}`,
            ...(avstandFra ? [`${kmFormat.format(avstandKm(avstandFra, sted))} km unna`] : []),
          ]
          return (
            <li key={sted.id}>
              <Lenke to={stedRoute(sted.id, sok)} className="liste-rad">
                <span className="liste-navn">{sted.navn}</span>
                <Skille />
                <ScoreBadge snowScore={sted.snowScore} />
                <Skille />
                {utdatert.has(sted.id) && (
                  <>
                    <span className="utdatert">{utdatertTekst(sted.kildeTidspunkt)}</span>
                    <Skille />
                  </>
                )}
                <span className="liste-detaljer">
                  {detaljer.map((tekst, i) => (
                    <span key={tekst}>
                      {i > 0 && <Skille />}
                      {tekst}
                    </span>
                  ))}
                </span>
              </Lenke>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
