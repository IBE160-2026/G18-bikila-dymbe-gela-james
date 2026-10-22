import { useState, type CSSProperties } from 'react'
import { aktiveKrav, FILTER_GRENSER, FILTER_KRAV, STANDARD_FILTER, type FilterKrav, type FilterParams } from '../../shared/filter'
import { tall } from '../lib/format'

// Story 3.1 (FR-20): new snow, wind and temperature, combined with AND. A fixed left side panel from
// 768px, a bottom sheet below. The sheet opens with a button rather than a drag (decided 2026-10-22),
// so it works with the keyboard and a screen reader.

export const ALLE = 'Alle'
export const KNAPP_ID = 'filter-knapp'
const INNHOLD_ID = 'filter-innhold'
const feltId = (krav: FilterKrav) => `filter-${krav}`

const KRAV_TEKST: Record<FilterKrav, { navn: string; retning: string; enhet: string }> = {
  minNysnoCm: { navn: 'Nysnø', retning: 'minst', enhet: 'cm' },
  maksVindMs: { navn: 'Vind', retning: 'høyst', enhet: 'm/s' },
  maksTemperaturC: { navn: 'Temperatur', retning: 'høyst', enhet: '°C' },
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

/** After «Nullstill» the button is gone, so focus moves to the first slider, or to «Filter» when the sheet is closed. */
export function fokuserFilteret(): void {
  const felt = document.getElementById(feltId(FILTER_KRAV[0]))
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

type Props = { params: FilterParams; onEndre: (params: FilterParams) => void }

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

export default function FilterPanel({ params, onEndre }: Props) {
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
        <h2 className="filter-tittel">Filter</h2>
        {FILTER_KRAV.map((krav) => (
          <Filterfelt key={krav} krav={krav} verdi={params[krav]} onEndre={(verdi) => onEndre({ ...params, [krav]: verdi })} />
        ))}
        {aktive.length > 0 && <Nullstill onEndre={onEndre} />}
      </div>
    </aside>
  )
}
