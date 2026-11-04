import { useEffect, useId, useMemo, useReducer, useRef, type KeyboardEvent } from 'react'
import type { Sted } from '../../shared/contracts/published'
import { normaliserNavn, sokSteder } from '../../shared/sok'
import { navigate, sted as stedRoute, type UtforskRoute } from '../lib/router'
import ScoreBadge from './ScoreBadge'

// Story 3.9 (FR-32, UJ-4): a search field with suggestions (the ARIA combobox pattern with
// aria-activedescendant). The search text lives only here: it never touches the filter, the hit count or
// the address. Choosing a suggestion opens the place page with the search in the address, as a list row does.

export const SOK_ETIKETT = 'Søk etter sted'
export const OPPFYLLER_IKKE = 'Oppfyller ikke filteret'

/** The announcement of how many suggestions there are. */
export function antallForslagTekst(antall: number): string {
  return antall === 1 ? '1 sted' : `${antall} steder`
}

/** No suggestions: what was searched for, and how many places SnowFinder covers. */
export function ingenTreffTekst(tekst: string, totalt: number): string {
  return `Fant ingen steder som heter «${tekst.trim().replace(/\s+/g, ' ')}». SnowFinder dekker ${totalt} steder i Norge.`
}

export type SokTilstand = {
  tekst: string
  /** Whether the list may show; it shows only with search text too. */
  apen: boolean
  /** Index of the highlighted suggestion, or null when none is. */
  markert: number | null
}

export const START_TILSTAND: SokTilstand = { tekst: '', apen: false, markert: null }

export type SokHandling =
  | { type: 'skriv'; tekst: string }
  | { type: 'tast'; tast: string; antall: number }
  | { type: 'lukk' }

/** Whether the list (or the text for no hits) is shown: it is open, and there is search text. */
export function listeVises(tilstand: SokTilstand): boolean {
  return tilstand.apen && normaliserNavn(tilstand.tekst) !== ''
}

/**
 * The keyboard and typing rules, pure so they are tested without a browser. Arrow down and up open the
 * list and move the highlight (wrapping round); Escape closes the list, and the press after (or the
 * first, when no list is shown) clears the field; typing opens the list with nothing highlighted; leaving the field closes it.
 */
export function sokReducer(tilstand: SokTilstand, handling: SokHandling): SokTilstand {
  switch (handling.type) {
    case 'skriv':
      return { tekst: handling.tekst, apen: true, markert: null }
    case 'lukk':
      return tilstand.apen || tilstand.markert !== null ? { ...tilstand, apen: false, markert: null } : tilstand
    case 'tast': {
      const { tast, antall } = handling
      // Based on what is shown: with only spaces in the field there is no list to close, so it clears at once.
      if (tast === 'Escape') return listeVises(tilstand) ? { ...tilstand, apen: false, markert: null } : { ...START_TILSTAND }
      if (tast !== 'ArrowDown' && tast !== 'ArrowUp') return tilstand
      if (antall === 0) return { ...tilstand, apen: true, markert: null }
      const { markert } = tilstand
      const neste =
        tast === 'ArrowDown'
          ? !tilstand.apen || markert === null ? 0 : (markert + 1) % antall
          : !tilstand.apen || markert === null ? antall - 1 : (markert - 1 + antall) % antall
      return { ...tilstand, apen: true, markert: neste }
    }
  }
}

/** The suggestion Enter opens: the highlighted one, or the first when none is; null when the list is not shown. */
export function enterIndeks(tilstand: SokTilstand, antall: number): number | null {
  if (!tilstand.apen || antall === 0) return null
  return tilstand.markert !== null && tilstand.markert < antall ? tilstand.markert : 0
}

/** Opens a suggestion's place page with the current search in the address, as a list row does (Story 3.2b). */
export function apneForslag(stedId: string, route: UtforskRoute, gaTil: typeof navigate = navigate): void {
  gaTil(stedRoute(stedId, route))
}

// Read by screen readers only, so a suggestion is announced as "Oslo, 41 · Middels, Oppfyller ikke filteret".
const Skille = () => <span className="visually-hidden">, </span>

type Props = {
  /** Every fresh place, before the filter: the same places as the map and the list (AD-8). */
  steder: Sted[]
  /** The ids of the places the filter shows, so a hidden one can say so. */
  treffIds: ReadonlySet<string>
  /** The current search, carried into the place page's address (Story 3.2b). */
  route: UtforskRoute
  /** Initial state, for tests of the markup. */
  start?: SokTilstand
}

export default function StedSok({ steder, treffIds, route, start = START_TILSTAND }: Props) {
  const [tilstand, dispatch] = useReducer(sokReducer, start)
  const id = useId()
  const listeId = `${id}-forslag`
  const forslagId = (indeks: number) => `${id}-forslag-${indeks}`
  const forslag = useMemo(() => sokSteder(steder, tilstand.tekst), [steder, tilstand.tekst])
  // Empty search text gives no list at all, not an empty one.
  const vises = listeVises(tilstand)
  const markert = vises && tilstand.markert !== null && tilstand.markert < forslag.length ? tilstand.markert : null
  const listeRef = useRef<HTMLUListElement>(null)
  // The list scrolls (max-height 60vh), so a highlight moved by the arrows is brought into view.
  useEffect(() => {
    if (markert === null) return
    listeRef.current?.children[markert]?.scrollIntoView({ block: 'nearest' })
  }, [markert])

  const apne = (stedId: string) => apneForslag(stedId, route)

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      const indeks = enterIndeks({ ...tilstand, apen: vises }, forslag.length)
      if (indeks === null) return
      event.preventDefault()
      apne(forslag[indeks].id)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Escape') return
    // Keeps the caret where it is, and stops the browser clearing the field on the first Escape.
    event.preventDefault()
    dispatch({ type: 'tast', tast: event.key, antall: forslag.length })
  }

  return (
    <div className="sted-sok">
      <label htmlFor={id} className="sted-sok-etikett">
        {SOK_ETIKETT}
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="go"
        aria-autocomplete="list"
        aria-expanded={vises && forslag.length > 0}
        aria-controls={listeId}
        aria-activedescendant={markert === null ? undefined : forslagId(markert)}
        value={tilstand.tekst}
        onChange={(event) => dispatch({ type: 'skriv', tekst: event.target.value })}
        onKeyDown={onKeyDown}
        onBlur={() => dispatch({ type: 'lukk' })}
      />
      {/* Kept in the page while closed, so aria-controls always points at an element. A mouse press on a
          suggestion must not take the focus from the field first, or the blur would close the list before
          the click lands. */}
      <ul
        ref={listeRef}
        id={listeId}
        role="listbox"
        aria-label="Forslag"
        className="sted-sok-forslag"
        hidden={!vises || forslag.length === 0}
        onMouseDown={(event) => event.preventDefault()}
      >
        {vises &&
          forslag.map((sted, indeks) => (
            <li
              key={sted.id}
              id={forslagId(indeks)}
              role="option"
              aria-selected={indeks === markert}
              className="sted-sok-forslag-rad"
              onClick={() => apne(sted.id)}
            >
              <span className="sted-sok-navn">{sted.navn}</span>
              <Skille />
              <ScoreBadge snowScore={sted.snowScore} />
              {!treffIds.has(sted.id) && (
                <>
                  <Skille />
                  <span className="sted-sok-status">{OPPFYLLER_IKKE}</span>
                </>
              )}
            </li>
          ))}
      </ul>
      {vises && forslag.length === 0 && (
        <p className="sted-sok-ingen">{ingenTreffTekst(tilstand.tekst, steder.length)}</p>
      )}
      {/* The count in its own polite region, apart from the filter's role="status" hit count. */}
      <p className="visually-hidden" aria-live="polite">
        {vises ? (forslag.length > 0 ? antallForslagTekst(forslag.length) : ingenTreffTekst(tilstand.tekst, steder.length)) : ''}
      </p>
    </div>
  )
}
