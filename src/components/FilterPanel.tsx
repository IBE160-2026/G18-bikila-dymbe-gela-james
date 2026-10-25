import { useState, type CSSProperties } from 'react'
import {
  aktiveKrav,
  FILTER_GRENSER,
  FILTER_KRAV,
  HURTIGVALG,
  STANDARD_FILTER,
  type FilterKrav,
  type FilterParams,
  type Forslag,
} from '../../shared/filter'
import { tall } from '../lib/format'

// Story 3.1 (FR-20): new snow, wind and temperature, and from Story 3.5 (FR-22) cloud cover in daylight,
// combined with AND. A fixed left side panel from 768px, a bottom sheet below. The sheet opens with a
// button rather than a drag (decided 2026-10-22), so it works with the keyboard and a screen reader.
// Story 3.3 (FR-14, UX-DR4) shows the hit count in the panel and on the closed sheet.

export const ALLE = 'Alle'
export const KNAPP_ID = 'filter-knapp'
const INNHOLD_ID = 'filter-innhold'
const feltId = (krav: FilterKrav) => `filter-${krav}`

/**
 * Story 3.5: why places vanish when the sun requirement is on. A place without daylight hours in the
 * next 24 hours (polar night), or from a data file older than the field, has no value and is hidden.
 */
const HINT: Partial<Record<FilterKrav, string>> = {
  maksSkydekkeDagslys: 'Steder uten dagslys de neste 24 timene (mørketid) vises ikke når kravet er på.',
}

const KRAV_TEKST: Record<FilterKrav, { navn: string; retning: string; enhet: string; kravet: string }> = {
  minNysnoCm: { navn: 'Nysnø', retning: 'minst', enhet: 'cm', kravet: 'nysnøkravet' },
  maksVindMs: { navn: 'Vind', retning: 'høyst', enhet: 'm/s', kravet: 'vindkravet' },
  maksTemperaturC: { navn: 'Temperatur', retning: 'høyst', enhet: '°C', kravet: 'temperaturkravet' },
  // Story 3.5 (FR-22): the mean over the hours with the sun above the horizon, not the whole day.
  maksSkydekkeDagslys: { navn: 'Skydekke i dagslys', retning: 'høyst', enhet: '%', kravet: 'skydekkekravet' },
  // Story 3.6 (FR-23): distance from the user's own position, never shown on the map.
  maksAvstandKm: { navn: 'Avstand', retning: 'høyst', enhet: 'km', kravet: 'avstandskravet' },
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

/** Story 3.4 (FR-15): a quick pick's description, in the same words as the active-requirement chips. */
function hurtigvalgBeskrivelse(verdier: FilterParams): string {
  return aktiveKrav(verdier)
    .map((krav) => kravTekst(krav, verdier[krav]))
    .join(', ')
}

/** Whether the filter is exactly this quick pick's combination, so its chip can show up as pressed. */
function erHurtigvalgAktiv(params: FilterParams, verdier: FilterParams): boolean {
  return FILTER_KRAV.every((krav) => params[krav] === verdier[krav])
}

/**
 * Story 3.4 (FR-15): «Pudderdag» and «Sol etter snøfall» fill the whole filter in one action, with no
 * dialog. A chip is pressed only when the filter is exactly its combination; moving a slider afterwards
 * un-presses it. The description sits next to, not inside, the button, so the accessible name stays the
 * short name while a screen reader still gets the combination through aria-describedby.
 */
function Hurtigvalgene({ params, onEndre }: Pick<Props, 'params' | 'onEndre'>) {
  return (
    <ul className="filter-hurtigvalg" aria-label="Hurtigvalg">
      {HURTIGVALG.map(({ navn, verdier }, i) => {
        const id = `hurtigvalg-${i}`
        const beskrivelseId = `${id}-beskrivelse`
        return (
          <li key={navn} className="filter-hurtigvalg-element">
            <button
              type="button"
              id={id}
              className="filter-hurtigvalg-chip"
              aria-pressed={erHurtigvalgAktiv(params, verdier)}
              aria-describedby={beskrivelseId}
              onClick={() => onEndre({ ...verdier })}
            >
              {navn}
            </button>
            <span id={beskrivelseId} className="filter-hurtigvalg-beskrivelse">
              {hurtigvalgBeskrivelse(verdier)}
            </span>
          </li>
        )
      })}
    </ul>
  )
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

type FeltProps = {
  krav: FilterKrav
  verdi: number | null
  onEndre: (verdi: number | null) => void
  hint?: string
  /** Story 3.6: the distance slider's hint is a dynamic status (fetching/refused), unlike the cloud cover
   * slider's fixed explanatory text, so only this one gets `role="status"` to announce it changing. */
  hintErStatus?: boolean
}

function Filterfelt({ krav, verdi, onEndre, hint, hintErStatus }: FeltProps) {
  const { min, max, steg, standard } = FILTER_GRENSER[krav]
  const id = feltId(krav)
  const tekst = verdiTekst(krav, verdi)
  const hintId = `${id}-hint`
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
        aria-describedby={hint ? hintId : undefined}
        style={fylt as CSSProperties}
        onChange={(event) => {
          const ny = Number(event.target.value)
          onEndre(ny === standard ? null : ny)
        }}
      />
      {hint && (
        <p id={hintId} className="filter-hint" role={hintErStatus ? 'status' : undefined}>
          {hint}
        </p>
      )}
    </div>
  )
}

type Props = {
  params: FilterParams
  onEndre: (params: FilterParams) => void
  antall: number
  /** Story 3.6: whether the distance filter's own position is known (not the map/list sort's). */
  posisjonKjent: boolean
  /** The distance filter's status text: fetching, refused/unavailable, or empty when there is none. */
  posisjonStatus: string
  /** Asks for the position; called only when the user moves the distance slider away from «Alle». */
  beOmPosisjon: () => void
}

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

export default function FilterPanel({ params, onEndre, antall, posisjonKjent, posisjonStatus, beOmPosisjon }: Props) {
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
        <Hurtigvalgene params={params} onEndre={onEndre} />
        {FILTER_KRAV.map((krav) => (
          <Filterfelt
            key={krav}
            krav={krav}
            verdi={params[krav]}
            // Story 3.6 (FR-23, NFR-Privacy): the position is asked for only here, on the user's own
            // move away from «Alle», never automatically from a link or on load.
            hint={krav === 'maksAvstandKm' ? posisjonStatus || undefined : HINT[krav]}
            hintErStatus={krav === 'maksAvstandKm'}
            onEndre={(verdi) => {
              onEndre({ ...params, [krav]: verdi })
              if (krav === 'maksAvstandKm' && verdi !== null && !posisjonKjent) beOmPosisjon()
            }}
          />
        ))}
        {aktive.length > 0 && <Nullstill onEndre={onEndre} />}
      </div>
    </aside>
  )
}
