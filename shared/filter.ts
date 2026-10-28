import { avstandKm, type Posisjon } from './avstand'
import { rundTilEnDesimal } from './avrunding'
import { STED_TYPES, type StedType } from './contracts/catalog'
import type { Sted } from './contracts/published'

// AD-6: the only filter logic (FR-20). Map and list both show filtrerSteder's result; the golden table in
// tests/golden/filter.json locks the rules. Pure, so it runs the same in the browser and in Vitest.

/** One limit per requirement; `null` means the requirement is off. Combined with AND. */
export interface FilterParams {
  /** New snow at least this many cm (inclusive). */
  minNysnoCm: number | null
  /** Highest wind in the window at most this many m/s (inclusive). */
  maksVindMs: number | null
  /** Mean temperature in the window at most this many °C (inclusive). */
  maksTemperaturC: number | null
  /** Story 3.5 (FR-22): mean cloud cover in the daylight hours at most this many % (inclusive). */
  maksSkydekkeDagslys: number | null
  /**
   * Story 3.6 (FR-23): distance from the user's own position at most this many km (inclusive). Without a
   * known position (never asked, refused or unavailable) this requirement has no effect (NFR-Privacy):
   * it never hides a place, unlike a place that is missing a value.
   */
  maksAvstandKm: number | null
  /**
   * Story 3.7 (FR-24, decided 2026-10-27, Sena): only places of these types. `null` (nothing ticked) means
   * «Alle»; otherwise never empty, and always in STED_TYPES order so the same choice gives the same address.
   */
  stedstyper: readonly StedType[] | null
}

/**
 * The requirements that are a limit along a slider. The place type is a set, not a scale, so it has its
 * own field and stays out of FILTER_GRENSER and the slider walk.
 */
export type FilterKrav = Exclude<keyof FilterParams, 'stedstyper'>

export interface KravGrense {
  min: number
  max: number
  steg: number
  /** The end of the range that means "no limit"; the slider shows «Alle» there. */
  standard: number
}

/** Ranges decided 2026-10-22; each requirement starts at the end that hides nothing. */
export const FILTER_GRENSER: Readonly<Record<FilterKrav, KravGrense>> = {
  minNysnoCm: { min: 0, max: 30, steg: 1, standard: 0 },
  maksVindMs: { min: 0, max: 25, steg: 1, standard: 25 },
  maksTemperaturC: { min: -20, max: 10, steg: 1, standard: 10 },
  // Story 3.5 (decided 2026-10-23): 0–100 % in steps of 10, where 100 means «Alle».
  maksSkydekkeDagslys: { min: 0, max: 100, steg: 10, standard: 100 },
  // Story 3.6 (decided 2026-10-25, Kelly): 0–200 km in steps of 10, where 200 means «Alle». A day-trip
  // span, not 500 km, which would rarely exclude anything since most catalog places lie within that of
  // each other.
  maksAvstandKm: { min: 0, max: 200, steg: 10, standard: 200 },
}

export const FILTER_KRAV: readonly FilterKrav[] = [
  'minNysnoCm',
  'maksVindMs',
  'maksTemperaturC',
  'maksSkydekkeDagslys',
  'maksAvstandKm',
]

/** A named, fixed combination of requirements (FR-15). A requirement it does not mention is «Alle». */
export interface Hurtigvalg {
  navn: string
  verdier: FilterParams
}

/**
 * Story 3.4 (FR-15, decided 2026-10-25, Joseph: «A: Ekte pudder»): the two fixed, documented combinations.
 * One choice sets the whole filter in one action; a requirement it does not mention goes to «Alle», so the
 * same choice always gives the same result. The only source of these values; the panel, the README and the
 * tests read this constant rather than writing the numbers themselves.
 */
export const HURTIGVALG: readonly Hurtigvalg[] = [
  {
    navn: 'Pudderdag',
    verdier: {
      minNysnoCm: 10,
      maksVindMs: 8,
      maksTemperaturC: -2,
      maksSkydekkeDagslys: null,
      maksAvstandKm: null,
      stedstyper: null,
    },
  },
  {
    navn: 'Sol etter snøfall',
    verdier: {
      minNysnoCm: 5,
      maksVindMs: null,
      maksTemperaturC: null,
      maksSkydekkeDagslys: 30,
      maksAvstandKm: null,
      stedstyper: null,
    },
  },
]

export const STANDARD_FILTER: FilterParams = {
  minNysnoCm: null,
  maksVindMs: null,
  maksTemperaturC: null,
  maksSkydekkeDagslys: null,
  maksAvstandKm: null,
  stedstyper: null,
}

/** The fields filtrerSteder reads, so the golden table can use small hand-written places. */
export type Filtrerbar = Pick<Sted, 'nysnoCm' | 'vindMaks' | 'temperatur' | 'skydekkeDagslys' | 'lat' | 'lon' | 'type'>

/**
 * The place's value each requirement is compared with. Distance (Story 3.6) depends on the user's
 * position, not on a fixed field of the place, so it is handled separately in `oppfyller` and left out
 * of this lookup.
 */
const FELT: Readonly<Record<Exclude<FilterKrav, 'maksAvstandKm'>, Exclude<keyof Filtrerbar, 'type'>>> = {
  minNysnoCm: 'nysnoCm',
  maksVindMs: 'vindMaks',
  maksTemperaturC: 'temperatur',
  maksSkydekkeDagslys: 'skydekkeDagslys',
}

/** Each active requirement with its limit: set, and not at the "no limit" end of its range. */
function aktiveGrenser(params: FilterParams): [FilterKrav, number][] {
  return FILTER_KRAV.flatMap((krav): [FilterKrav, number][] => {
    const verdi = params[krav]
    return verdi !== null && verdi !== FILTER_GRENSER[krav].standard ? [[krav, verdi]] : []
  })
}

/** The slider requirements that can hide a place, in panel order. The place type is checked on its own. */
export function aktiveKrav(params: FilterParams): FilterKrav[] {
  return aktiveGrenser(params).map(([krav]) => krav)
}

/** Whether any requirement is on, slider or place type: what «Nullstill» and the chips are shown for. */
export function harAktiveKrav(params: FilterParams): boolean {
  return aktiveGrenser(params).length > 0 || params.stedstyper !== null
}

/** Story 3.7: the ticked types in STED_TYPES order, without repeats; nothing ticked is «Alle» (`null`). */
export function normaliserStedstyper(typer: readonly StedType[]): readonly StedType[] | null {
  const valgte = STED_TYPES.filter((type) => typer.includes(type))
  return valgte.length > 0 ? valgte : null
}

function oppfyller(sted: Filtrerbar, krav: FilterKrav, grense: number, posisjon?: Posisjon): boolean {
  if (krav === 'maksAvstandKm') {
    // Story 3.6 (FR-23, NFR-Privacy): without a known position the requirement has no effect, so it
    // never hides a place, unlike a place with a missing value for one of the other requirements.
    return !posisjon || avstandKm(posisjon, sted) <= grense
  }
  const verdi = sted[FELT[krav]]
  // A missing value cannot be shown to meet the requirement, so the place is left out.
  if (verdi === null) return false
  // Compared as the app shows it (src/lib/format.ts `tall` rounds the same way).
  const vist = rundTilEnDesimal(verdi)
  return krav === 'minNysnoCm' ? vist >= grense : vist <= grense
}

/**
 * The places that meet every active requirement, in their original order. No active requirement keeps
 * all. `posisjon` is the user's own position for the distance requirement (Story 3.6); omit it, or leave
 * it `undefined`, when the position is not known.
 */
export function filtrerSteder<T extends Filtrerbar>(steder: readonly T[], params: FilterParams, posisjon?: Posisjon): T[] {
  const aktive = aktiveGrenser(params)
  const { stedstyper } = params
  return steder.filter(
    (sted) =>
      (stedstyper === null || stedstyper.includes(sted.type)) &&
      aktive.every(([krav, grense]) => oppfyller(sted, krav, grense, posisjon)),
  )
}

/**
 * One requirement eased to `verdi` (`null` means without it), which gives `antall` places. The place type
 * (Story 3.7) is only ever eased all the way, so its `verdi` is always `null`.
 */
export type Forslag =
  | { krav: FilterKrav; verdi: number | null; antall: number }
  | { krav: 'stedstyper'; verdi: null; antall: number }

/**
 * Story 3.3 (FR-14): which single requirement to ease when the filter gives no places. For each active
 * requirement it finds the nearest slider step towards «Alle» that gives at least one place while the
 * others stay, and picks the one that gives the most places; on a tie the fewest steps, then panel order.
 * `null` when there are places already, or when no single change gives any (the app then offers «Nullstill»).
 * `posisjon` is passed through to the trial `filtrerSteder` calls, so the distance requirement (Story 3.6)
 * can be eased like any other when a position is known. The place type (Story 3.7, decided 2026-10-27,
 * Sena) comes last in panel order and is tried as one step straight to «Alle».
 */
export function forslagVedNullTreff(steder: readonly Filtrerbar[], params: FilterParams, posisjon?: Posisjon): Forslag | null {
  if (filtrerSteder(steder, params, posisjon).length > 0) return null
  let best: Kandidat | null = null
  for (const [krav, grense] of aktiveGrenser(params)) {
    const { min, max, steg, standard } = FILTER_GRENSER[krav]
    // A limit the slider cannot set gets no suggestion; the bound below keeps the walk finite for any range.
    if (!Number.isFinite(grense) || !(steg > 0)) continue
    const retning = standard > grense ? steg : -steg
    const flestSteg = Math.ceil((max - min) / steg) + 1
    for (let antallSteg = 1; antallSteg <= flestSteg; antallSteg++) {
      const verdi = grense + retning * antallSteg
      // Reaching (or passing) the «Alle» end means trying without the requirement, which always ends the walk.
      const forsok = (retning > 0 ? verdi >= standard : verdi <= standard) ? null : verdi
      const antall = filtrerSteder(steder, { ...params, [krav]: forsok }, posisjon).length
      if (antall > 0) {
        best = bedre({ forslag: { krav, verdi: forsok, antall }, steg: antallSteg }, best)
        break
      }
      if (forsok === null) break
    }
  }
  if (params.stedstyper !== null) {
    const antall = filtrerSteder(steder, { ...params, stedstyper: null }, posisjon).length
    if (antall > 0) best = bedre({ forslag: { krav: 'stedstyper', verdi: null, antall }, steg: 1 }, best)
  }
  return best && best.forslag
}

type Kandidat = { forslag: Forslag; steg: number }

/** The better of two suggestions: more places, then fewer steps. Strictly better only, so an equal
 * candidate earlier in panel order stays. */
function bedre(kandidat: Kandidat, best: Kandidat | null): Kandidat {
  if (!best) return kandidat
  const { antall } = kandidat.forslag
  return antall > best.forslag.antall || (antall === best.forslag.antall && kandidat.steg < best.steg) ? kandidat : best
}

// AD-12 (Story 3.2, FR-21): the only translation between the address and the filter. The router carries
// the query to these two functions and never reads the requirements itself.

/** The query parameter of each requirement, in the fixed order serializeFilter writes them. */
const FILTER_PARAMETRE: Readonly<Record<FilterKrav, string>> = {
  minNysnoCm: 'nysno',
  maksVindMs: 'vind',
  maksTemperaturC: 'temp',
  maksSkydekkeDagslys: 'sky',
  // Story 3.6 (AD-12): the limit itself is a normal filter parameter and rides along in a shared link;
  // the position it is measured from never does (NFR-Privacy).
  maksAvstandKm: 'avstand',
}

const HELTALL = /^-?\d+$/

/** One requirement from the address. Anything the panel could not have set means «Alle» (`null`). */
function parseKrav(krav: FilterKrav, search: URLSearchParams): number | null {
  const verdier = search.getAll(FILTER_PARAMETRE[krav])
  // The app never writes a parameter twice, so two values are ambiguous and turn the requirement off.
  if (verdier.length !== 1 || !HELTALL.test(verdier[0])) return null
  // `|| 0` turns "-0" into 0, so the value equals what the slider would have set.
  const verdi = Number(verdier[0]) || 0
  const { min, max, steg, standard } = FILTER_GRENSER[krav]
  if (verdi < min || verdi > max || (verdi - min) % steg !== 0 || verdi === standard) return null
  return verdi
}

/** Story 3.7: the place types as one comma-separated parameter, written after every slider requirement. */
const STEDSTYPE_PARAMETER = 'type'

/**
 * The place types from the address, in STED_TYPES order. An unknown or repeated type, an empty item or a
 * repeated parameter could not have come from the panel, so the requirement is «Alle».
 */
function parseStedstyper(search: URLSearchParams): readonly StedType[] | null {
  const verdier = search.getAll(STEDSTYPE_PARAMETER)
  if (verdier.length !== 1) return null
  const deler = verdier[0].split(',')
  const typer = deler.filter((del): del is StedType => (STED_TYPES as readonly string[]).includes(del))
  if (typer.length !== deler.length || new Set(typer).size !== typer.length) return null
  return normaliserStedstyper(typer)
}

/** The filter in a query. Invalid or missing values give «Alle»; the page never fails on a bad link. */
export function parseFilter(search: URLSearchParams): FilterParams {
  return {
    minNysnoCm: parseKrav('minNysnoCm', search),
    maksVindMs: parseKrav('maksVindMs', search),
    maksTemperaturC: parseKrav('maksTemperaturC', search),
    maksSkydekkeDagslys: parseKrav('maksSkydekkeDagslys', search),
    maksAvstandKm: parseKrav('maksAvstandKm', search),
    stedstyper: parseStedstyper(search),
  }
}

/** The active requirements as query pairs, in panel order, so the same filter always gives the same address. */
export function serializeFilter(params: FilterParams): [string, string][] {
  const par = aktiveGrenser(params).map(([krav, verdi]): [string, string] => [FILTER_PARAMETRE[krav], String(verdi)])
  // Normalised again, so a hand-built filter in another order still gives the one address.
  const stedstyper = params.stedstyper && normaliserStedstyper(params.stedstyper)
  if (stedstyper) par.push([STEDSTYPE_PARAMETER, stedstyper.join(',')])
  return par
}
