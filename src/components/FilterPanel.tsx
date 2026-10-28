import { Fragment, useState, type CSSProperties, type ReactNode } from 'react'
import { STED_TYPES, type StedType } from '../../shared/contracts/catalog'
import {
  aktiveKrav,
  FILTER_GRENSER,
  FILTER_KRAV,
  harAktiveKrav,
  HURTIGVALG,
  normaliserStedstyper,
  NYSNO_KILDER,
  STANDARD_FILTER,
  type FilterKrav,
  type FilterParams,
  type Forslag,
  type NysnoKilde,
} from '../../shared/filter'
import { tall } from '../lib/format'

// Story 3.1 (FR-20): new snow, wind and temperature, and from Story 3.5 (FR-22) cloud cover in daylight,
// combined with AND. A fixed left side panel from 768px, a bottom sheet below. The sheet opens with a
// button rather than a drag (decided 2026-10-22), so it works with the keyboard and a screen reader.
// Story 3.3 (FR-14, UX-DR4) shows the hit count in the panel and on the closed sheet. Story 3.7 (FR-24)
// adds the place type as three checkboxes after the sliders, and Story 3.8 (FR-25) the new snow source as
// two radio buttons under the new snow slider.

export const ALLE = 'Alle'
export const KNAPP_ID = 'filter-knapp'
const INNHOLD_ID = 'filter-innhold'
const feltId = (krav: FilterKrav) => `filter-${krav}`
const stedstypeId = (type: StedType) => `filter-stedstyper-${type}`

/** Story 3.7: the checkbox labels; the chip uses them in lower case, the address the type itself. */
const STEDSTYPE_NAVN: Record<StedType, string> = { skisted: 'Skisted', fjelltopp: 'Fjelltopp', by: 'By' }
const STEDSTYPE_HINT_ID = 'filter-stedstyper-hint'
const STEDSTYPE_HINT = 'Ingen avkrysset viser alle stedstyper.'

/**
 * Story 3.8 (decided 2026-10-27, Sena): the labels say which source and that NVE's values are modelled,
 * and the hint says it in plain words, so nobody reads them as measured snow.
 */
const NYSNO_KILDE_NAVN: Record<NysnoKilde, string> = {
  met: 'Prognose (MET, neste 24 t)',
  nve: 'Siste 24 t (NVE, modellert)',
}
const nysnoKildeId = (kilde: NysnoKilde) => `filter-nysnokilde-${kilde}`
const NYSNO_KILDE_HINT_ID = 'filter-nysnokilde-hint'
// Review round 1 (Sena, 3A): the conversion in her own words, word for word.
const NYSNO_KILDE_HINT =
  'NVEs nysnø siste døgn er modellerte verdier fra seNorge, ikke målt snø. NVE-verdiene er modellerte ' +
  'estimater. SnowFinder bruker en forenklet omregning der 1 mm vannekvivalent tilsvarer omtrent 1 cm snø. ' +
  'Faktisk snødybde kan variere. Med «Siste 24 t» valgt og nysnøkravet på skjules steder uten NVE-verdi. ' +
  'Står nysnø på «Alle», har valget ingen effekt.'
/** Review round 1 (Sena, 2A): NVE was missing from the whole run, so the source cannot filter on anything. */
export const NVE_MANGLER = 'NVE-data mangler i denne kjøringen. Velg «Prognose» for å filtrere på nysnø.'
/** The closed sheet's chip for a source chosen while new snow is «Alle», so «Nullstill» has a visible reason. */
export const KILDE_CHIP = 'Datagrunnlag siste 24 t (NVE)'

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

/** The requirement's name, with the source for new snow from NVE (Story 3.8): «Nysnø siste 24 t». */
function kravNavn(krav: FilterKrav, kilde: NysnoKilde): string {
  return krav === 'minNysnoCm' && kilde === 'nve' ? 'Nysnø siste 24 t' : KRAV_TEKST[krav].navn
}

/** A chip for an active requirement: «Nysnø minst 10 cm», or «Nysnø siste 24 t minst 10 cm» from NVE. */
export function kravTekst(krav: FilterKrav, verdi: number | null, kilde: NysnoKilde = NYSNO_KILDER[0]): string {
  return `${kravNavn(krav, kilde)} ${verdiTekst(krav, verdi)}`
}

/** Story 3.7: the place type chip, «Stedstype skisted, by». */
export function stedstypeTekst(stedstyper: readonly StedType[]): string {
  return `Stedstype ${stedstyper.map((type) => STEDSTYPE_NAVN[type].toLowerCase()).join(', ')}`
}

/** Story 3.4 (FR-15): a quick pick's description, in the same words as the active-requirement chips. */
function hurtigvalgBeskrivelse(verdier: FilterParams): string {
  return aktiveKrav(verdier)
    .map((krav) => kravTekst(krav, verdier[krav], verdier.nysnoKilde))
    .join(', ')
}

/** Whether the filter is exactly this quick pick's combination, so its chip can show up as pressed. */
function erHurtigvalgAktiv(params: FilterParams, verdier: FilterParams): boolean {
  return (
    FILTER_KRAV.every((krav) => params[krav] === verdier[krav]) &&
    String(params.stedstyper) === String(verdier.stedstyper) &&
    params.nysnoKilde === verdier.nysnoKilde
  )
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

/**
 * What to try at zero hits, in the panel's words: «Prøv vind høyst 8 m/s.», «Prøv uten vindkravet.», and
 * with the source for new snow from NVE (Story 3.8): «Prøv nysnø siste 24 t minst 15 cm.»
 */
export function forslagTekst(forslag: Forslag | null, kilde: NysnoKilde = NYSNO_KILDER[0]): string {
  if (!forslag) return 'Det hjelper ikke å endre bare ett krav. Prøv «Nullstill».'
  // Story 3.7 (decided 2026-10-27, Sena): the place type is only ever eased all the way to «Alle».
  if (forslag.krav === 'stedstyper') return 'Prøv uten stedstypekravet.'
  const { krav, verdi } = forslag
  if (verdi === null) return `Prøv uten ${KRAV_TEKST[krav].kravet}.`
  return `Prøv ${kravNavn(krav, kilde).toLowerCase()} ${verdiTekst(krav, verdi)}.`
}

/**
 * After «Nullstill» or «Bruk forslaget» the button is gone, so focus moves to the slider of the requirement
 * (the first one by default), the first place type checkbox, or to «Filter» when the sheet is closed.
 */
export function fokuserFilteret(krav: FilterKrav | 'stedstyper' = FILTER_KRAV[0]): void {
  const felt = document.getElementById(krav === 'stedstyper' ? stedstypeId(STED_TYPES[0]) : feltId(krav))
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
  /** Story 3.6 («Hele Norge»): an extra action shown next to this slider's label and value. */
  ekstraKnapp?: ReactNode
}

function Filterfelt({ krav, verdi, onEndre, hint, hintErStatus, ekstraKnapp }: FeltProps) {
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
        {ekstraKnapp}
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

/**
 * Story 3.7 (FR-24, decided 2026-10-27, Sena): nothing ticked is «Alle», ticking narrows to those types,
 * and unticking the last one gives «Alle» again, never zero hits. Ordinary checkboxes, so a screen reader
 * gets the group name from the legend and each state from the box itself.
 */
function Stedstyper({ params, onEndre }: Pick<Props, 'params' | 'onEndre'>) {
  const valgte = params.stedstyper ?? []
  return (
    // The note says what the sliders' «Alle» says, so a screen reader also hears that nothing ticked hides nothing.
    <fieldset className="filter-felt filter-stedstyper" aria-describedby={STEDSTYPE_HINT_ID}>
      <legend>Stedstype</legend>
      <p id={STEDSTYPE_HINT_ID} className="filter-hint">
        {STEDSTYPE_HINT}
      </p>
      {STED_TYPES.map((type) => (
        <label key={type} className="filter-stedstype">
          <input
            id={stedstypeId(type)}
            type="checkbox"
            checked={valgte.includes(type)}
            onChange={(event) => {
              const typer = event.target.checked ? [...valgte, type] : valgte.filter((valgt) => valgt !== type)
              onEndre({ ...params, stedstyper: normaliserStedstyper(typer) })
            }}
          />
          {STEDSTYPE_NAVN[type]}
        </label>
      ))}
    </fieldset>
  )
}

/**
 * Story 3.8 (FR-25, decided 2026-10-27, Sena): which value the new snow slider compares with. Both choices
 * are always shown and never disabled; the choice stays while new snow is «Alle», where it has no effect.
 * The hint is linked to the group, so a screen reader also hears that NVE's values are modelled.
 */
function Nysnokilde({ params, onEndre, nveMangler }: Pick<Props, 'params' | 'onEndre' | 'nveMangler'>) {
  return (
    <fieldset className="filter-felt filter-nysnokilde" aria-describedby={NYSNO_KILDE_HINT_ID}>
      <legend>Datagrunnlag for nysnø</legend>
      {NYSNO_KILDER.map((kilde) => (
        <label key={kilde} className="filter-valg">
          <input
            id={nysnoKildeId(kilde)}
            type="radio"
            name="nysnokilde"
            value={kilde}
            checked={params.nysnoKilde === kilde}
            onChange={() => onEndre({ ...params, nysnoKilde: kilde })}
          />
          {NYSNO_KILDE_NAVN[kilde]}
        </label>
      ))}
      {/* Always in the page and only its text changes, since many screen readers announce a live region's
          new text but not a region that arrives already filled. The source is never switched for the user. */}
      <p className="filter-hint" role="status">
        {params.nysnoKilde === 'nve' && nveMangler ? NVE_MANGLER : ''}
      </p>
      <p id={NYSNO_KILDE_HINT_ID} className="filter-hint">
        {NYSNO_KILDE_HINT}
      </p>
    </fieldset>
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
  /** Story 3.8: no place in the data has an NVE value, so «Siste 24 t» says why it can show nothing. */
  nveMangler: boolean
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

export default function FilterPanel({
  params,
  onEndre,
  antall,
  posisjonKjent,
  posisjonStatus,
  beOmPosisjon,
  nveMangler,
}: Props) {
  const [apen, setApen] = useState(false)
  const aktive = aktiveKrav(params)
  const harAktive = harAktiveKrav(params)

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
        {!apen && harAktive && (
          <>
            <ul className="filter-chips" aria-label="Aktive krav">
              {aktive.map((krav) => (
                <li key={krav} className="filter-chip">
                  {kravTekst(krav, params[krav], params.nysnoKilde)}
                </li>
              ))}
              {/* Story 3.8: with new snow at «Alle» the new snow chip is gone, so the source gets its own,
                  and «Nullstill» next to it always has a visible reason. */}
              {params.nysnoKilde === 'nve' && !aktive.includes('minNysnoCm') && <li className="filter-chip">{KILDE_CHIP}</li>}
              {params.stedstyper && <li className="filter-chip">{stedstypeTekst(params.stedstyper)}</li>}
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
          <Fragment key={krav}>
          <Filterfelt
            krav={krav}
            verdi={params[krav]}
            // Story 3.6 (FR-23, NFR-Privacy): the position is asked for only here, on the user's own
            // move away from «Alle», never automatically from a link or on load.
            hint={krav === 'maksAvstandKm' ? posisjonStatus || undefined : HINT[krav]}
            hintErStatus={krav === 'maksAvstandKm'}
            // «Hele Norge» (Kelly, 2026-10-25): only when the distance requirement is active, so the
            // user can get back to a national search without touching the other four requirements.
            ekstraKnapp={
              krav === 'maksAvstandKm' && params.maksAvstandKm !== null ? (
                <button
                  type="button"
                  className="filter-hele-norge"
                  onClick={() => {
                    onEndre({ ...params, maksAvstandKm: null })
                    fokuserFilteret('maksAvstandKm')
                  }}
                >
                  Hele Norge
                </button>
              ) : undefined
            }
            onEndre={(verdi) => {
              onEndre({ ...params, [krav]: verdi })
              if (krav === 'maksAvstandKm' && verdi !== null && !posisjonKjent) beOmPosisjon()
            }}
          />
          {/* Story 3.8: the source belongs to the new snow requirement, so it sits right under its slider. */}
          {krav === 'minNysnoCm' && <Nysnokilde params={params} onEndre={onEndre} nveMangler={nveMangler} />}
          </Fragment>
        ))}
        <Stedstyper params={params} onEndre={onEndre} />
        {harAktive && <Nullstill onEndre={onEndre} />}
      </div>
    </aside>
  )
}
