import { useState, type ChangeEvent } from 'react'
import type { Sted } from '../../shared/contracts/published'
import { medEnhet, utdatertTekst } from '../lib/format'
import { SORTERINGER, avstandKm, sorterSteder, type Posisjon, type Sortering } from '../lib/sortering'
import Lenke from './Lenke'
import ScoreBadge from './ScoreBadge'

export const POSISJON_AVSLATT = 'Fikk ikke tilgang til posisjonen din. Listen er sortert etter score.'
export const POSISJON_HENTES = 'Henter posisjonen din …'
const POSISJON_TIMEOUT_MS = 10_000

const SORTERINGSTEKST: Record<Sortering, string> = { score: 'Score', avstand: 'Avstand', navn: 'Navn' }

const kmFormat = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 })

// Read by screen readers only, so a row's link is announced as "Gaustatoppen, 58 · Godt, Nysnø 10 cm, …".
const Skille = () => <span className="visually-hidden">, </span>

type Props = { steder: Sted[]; utdatert: ReadonlySet<string> }

/**
 * Story 1.8: the accessible alternative to the map (FR-13, NFR-7). Each row is one link to the place
 * page. The position is asked for only when the user picks distance, kept in memory and never sent.
 */
export default function ListeVisning({ steder, utdatert }: Props) {
  const [sortering, setSortering] = useState<Sortering>('score')
  const [posisjon, setPosisjon] = useState<Posisjon | null>(null)
  const [status, setStatus] = useState('')

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const valg = SORTERINGER.find((verdi) => verdi === event.target.value)
    if (!valg) return
    setSortering(valg)
    setStatus('')
    if (valg !== 'avstand' || posisjon) return
    if (!('geolocation' in navigator)) {
      setSortering('score')
      setStatus(POSISJON_AVSLATT)
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
        setSortering((current) => (current === 'avstand' ? 'score' : current))
        setStatus((current) => (current === POSISJON_HENTES ? POSISJON_AVSLATT : current))
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
            `Nysnø ${medEnhet(sted.nysnoCm, 'cm')}`,
            `Vind ${medEnhet(sted.vindMaks, 'm/s')}`,
            `Temp ${medEnhet(sted.temperatur, '°C')}`,
            ...(avstandFra ? [`${kmFormat.format(avstandKm(avstandFra, sted))} km unna`] : []),
          ]
          return (
            <li key={sted.id}>
              <Lenke to={{ name: 'sted', id: sted.id }} className="liste-rad">
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
