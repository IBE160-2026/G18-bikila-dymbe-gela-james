import { useState, type CSSProperties } from 'react'
import {
  aktiveKrav,
  FILTER_GRENSER,
  FILTER_KRAV,
  STANDARD_FILTER,
  type FilterKrav,
  type FilterParams,
  type Forslag,
} from '../../shared/filter'
import { tall } from '../lib/format'

// Story 3.1 (FR-20): new snow, wind and temperature, combined with AND. A fixed left side panel from
// 768px, a bottom sheet below. The sheet opens with a button rather than a drag (decided 2026-10-22),
// so it works with the keyboard and a screen reader. Story 3.3 (FR-14, UX-DR4) shows the hit count in the
// panel and on the closed sheet.

export const ALLE = 'Alle'
export const KNAPP_ID = 'filter-knapp'
const INNHOLD_ID = 'filter-innhold'
const feltId = (krav: FilterKrav) => `filter-${krav}`

const KRAV_TEKST: Record<FilterKrav, { navn: string; retning: string; enhet: string; kravet: string }> = {
  minNysnoCm: { navn: 'Nysnø', retning: 'minst', enhet: 'cm', kravet: 'nysnøkravet' },
  maksVindMs: { navn: 'Vind', retning: 'høyst', enhet: 'm/s', kravet: 'vindkravet' },
  maksTemperaturC: { navn: 'Temperatur', retning: 'høyst', enhet: '°C', kravet: 'temperaturkravet' },
}

/** The value as words: «minst 10 cm», «høyst −5 °C», or «Alle» when the requirement is off. */
export function verdiTekst(krav: FilterKrav, verdi: number | null): string {
  if (verdi === null || verdi === FILTER_GRENSER[krav].standard) return ALLE
  const { retning, enhet } = KRAV_TEKST[krav]
  return `${retning} ${tall(verdi)} ${enhet}`
}

/** A chip for an active requirement: «Nysnø minst 10 cm». */
export function kravTekst(krav: FilterKrav, verdi: number | null): string {
  return `${KRAV_TEKST[krav].navn} ${verdiTekst(krav, verdi)}`
}

/** Story 3.3 (FR-14, UX-DR4): «24 treff», «1 treff», or «Ingen treff». */
export function antallTekst(antall: number): string {
  return antall === 0 ? 'Ingen treff' : `${antall} treff`
}

/** What to try at zero hits, in the panel's words: «Prøv vind høyst 8 m/s.», «Prøv uten vindkravet.» */
export function forslagTekst(forslag: Forslag | null): string {
  if (!forslag) return 'Det hjelper ikke å endre bare ett krav. Prøv «Nullstill».'
  const { krav, verdi } = forslag
  if (verdi === null) return `Prøv uten ${KRAV_TEKST[krav].kravet}.`
  return `Prøv ${KRAV_TEKST[krav].navn.toLowerCase()} ${verdiTekst(krav, verdi)}.`
}

/**
 * After «Nullstill» or «Bruk forslaget» the button is gone, so focus moves to the slider of the requirement
 * (the first one by default), or to «Filter» when the sheet is closed.
 */
export function fokuserFilteret(krav: FilterKrav = FILTER_KRAV[0]): void {
  const felt = document.getElementById(feltId(krav))
  const mal = felt && felt.offsetParent !== null ? felt : document.getElementById(KNAPP_ID)
  mal?.focus()
}

type FeltProps = { krav: FilterKrav; verdi: number | null; onEndre: (verdi: number | null) => void }

function Filterfelt({ krav, verdi, onEndre }: FeltProps) {
  const { min, max, steg, standard } = FILTER_GRENSER[krav]
  const id = feltId(krav)
  const tekst = verdiTekst(krav, verdi)
  const vist = verdi ?? standard
  // The accent part of the track is the range the requirement lets through: above the thumb for
  // «minst», below it for «høyst». «Alle» fills the whole track.
  const tommel = ((vist - min) / (max - min)) * 100
  const fylt = krav === 'minNysnoCm' ? { '--fra': `${tommel}%`, '--til': '100%' } : { '--fra': '0%', '--til': `${tommel}%` }
  return (
    <div className="filter-felt">
      <div className="filter-felt-topp">
        <label htmlFor={id}>{KRAV_TEKST[krav].navn}</label>
        {/* The slider's aria-valuetext says the same to a screen reader, so this is hidden from it. */}
        <span className="filter-verdi" aria-hidden="true">
          {tekst}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={steg}
        value={vist}
        aria-valuetext={tekst}
        style={fylt as CSSProperties}
        onChange={(event) => {
          const ny = Number(event.target.value)
          onEndre(ny === standard ? null : ny)
        }}
      />
    </div>
  )
}

type Props = { params: FilterParams; onEndre: (params: FilterParams) => void; antall: number }

/** The number of places the filter gives. Shown, not announced: Utforsk has the one live region. */
function Antall({ antall }: Pick<Props, 'antall'>) {
  return <span className="filter-antall">{antallTekst(antall)}</span>
}

/** Sets every requirement back to «Alle». Shown whenever at least one is active, also on the closed sheet. */
export function Nullstill({ onEndre }: Pick<Props, 'onEndre'>) {
  return (
    <button
      type="button"
      className="filter-nullstill"
      onClick={() => {
        onEndre(STANDARD_FILTER)
        fokuserFilteret()
      }}
    >
      Nullstill
    </button>
  )
}

export default function FilterPanel({ params, onEndre, antall }: Props) {
  const [apen, setApen] = useState(false)
  const aktive = aktiveKrav(params)

  return (
    <aside className={`filter kort${apen ? ' filter--apen' : ''}`} aria-label="Filter">
      {/* Under 768px only: the closed sheet shows this bar. From 768px the panel is always open. */}
      <div className="filter-linje">
        <button
          id={KNAPP_ID}
          type="button"
          className="filter-knapp"
          aria-expanded={apen}
          aria-controls={INNHOLD_ID}
          onClick={() => setApen(!apen)}
        >
          Filter
        </button>
        <Antall antall={antall} />
        {!apen && aktive.length > 0 && (
          <>
            <ul className="filter-chips" aria-label="Aktive krav">
              {aktive.map((krav) => (
                <li key={krav} className="filter-chip">
                  {kravTekst(krav, params[krav])}
                </li>
              ))}
            </ul>
            <Nullstill onEndre={onEndre} />
          </>
        )}
      </div>
      <div id={INNHOLD_ID} className="filter-innhold">
        <div className="filter-tittel-linje">
          <h2 className="filter-tittel">Filter</h2>
          <Antall antall={antall} />
        </div>
        {FILTER_KRAV.map((krav) => (
          <Filterfelt key={krav} krav={krav} verdi={params[krav]} onEndre={(verdi) => onEndre({ ...params, [krav]: verdi })} />
        ))}
        {aktive.length > 0 && <Nullstill onEndre={onEndre} />}
      </div>
    </aside>
  )
}
