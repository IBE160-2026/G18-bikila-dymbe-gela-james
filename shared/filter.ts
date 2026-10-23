import { rundTilEnDesimal } from './avrunding'
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
}

export type FilterKrav = keyof FilterParams

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
}

export const FILTER_KRAV: readonly FilterKrav[] = ['minNysnoCm', 'maksVindMs', 'maksTemperaturC', 'maksSkydekkeDagslys']

export const STANDARD_FILTER: FilterParams = {
  minNysnoCm: null,
  maksVindMs: null,
  maksTemperaturC: null,
  maksSkydekkeDagslys: null,
}

/** The fields filtrerSteder reads, so the golden table can use small hand-written places. */
export type Filtrerbar = Pick<Sted, 'nysnoCm' | 'vindMaks' | 'temperatur' | 'skydekkeDagslys'>

/** The place's value each requirement is compared with. */
const FELT: Readonly<Record<FilterKrav, keyof Filtrerbar>> = {
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

/** The requirements that can hide a place, in panel order. */
export function aktiveKrav(params: FilterParams): FilterKrav[] {
  return aktiveGrenser(params).map(([krav]) => krav)
}

function oppfyller(sted: Filtrerbar, krav: FilterKrav, grense: number): boolean {
  const verdi = sted[FELT[krav]]
  // A missing value cannot be shown to meet the requirement, so the place is left out.
  if (verdi === null) return false
  // Compared as the app shows it (src/lib/format.ts `tall` rounds the same way).
  const vist = rundTilEnDesimal(verdi)
  return krav === 'minNysnoCm' ? vist >= grense : vist <= grense
}

/** The places that meet every active requirement, in their original order. No active requirement keeps all. */
export function filtrerSteder<T extends Filtrerbar>(steder: readonly T[], params: FilterParams): T[] {
  const aktive = aktiveGrenser(params)
  return steder.filter((sted) => aktive.every(([krav, grense]) => oppfyller(sted, krav, grense)))
}

/** One requirement eased to `verdi` (`null` means without it), which gives `antall` places. */
export interface Forslag {
  krav: FilterKrav
  verdi: number | null
  antall: number
}

/**
 * Story 3.3 (FR-14): which single requirement to ease when the filter gives no places. For each active
 * requirement it finds the nearest slider step towards «Alle» that gives at least one place while the
 * others stay, and picks the one that gives the most places; on a tie the fewest steps, then panel order.
 * `null` when there are places already, or when no single change gives any (the app then offers «Nullstill»).
 */
export function forslagVedNullTreff(steder: readonly Filtrerbar[], params: FilterParams): Forslag | null {
  if (filtrerSteder(steder, params).length > 0) return null
  let best: (Forslag & { steg: number }) | null = null
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
      const antall = filtrerSteder(steder, { ...params, [krav]: forsok }).length
      if (antall > 0) {
        // Strictly better only, so an equal candidate earlier in panel order stays.
        if (!best || antall > best.antall || (antall === best.antall && antallSteg < best.steg)) {
          best = { krav, verdi: forsok, antall, steg: antallSteg }
        }
        break
      }
      if (forsok === null) break
    }
  }
  return best && { krav: best.krav, verdi: best.verdi, antall: best.antall }
}

// AD-12 (Story 3.2, FR-21): the only translation between the address and the filter. The router carries
// the query to these two functions and never reads the requirements itself.

/** The query parameter of each requirement, in the fixed order serializeFilter writes them. */
const FILTER_PARAMETRE: Readonly<Record<FilterKrav, string>> = {
  minNysnoCm: 'nysno',
  maksVindMs: 'vind',
  maksTemperaturC: 'temp',
  maksSkydekkeDagslys: 'sky',
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

/** The filter in a query. Invalid or missing values give «Alle»; the page never fails on a bad link. */
export function parseFilter(search: URLSearchParams): FilterParams {
  return {
    minNysnoCm: parseKrav('minNysnoCm', search),
    maksVindMs: parseKrav('maksVindMs', search),
    maksTemperaturC: parseKrav('maksTemperaturC', search),
    maksSkydekkeDagslys: parseKrav('maksSkydekkeDagslys', search),
  }
}

/** The active requirements as query pairs, in panel order, so the same filter always gives the same address. */
export function serializeFilter(params: FilterParams): [string, string][] {
  return aktiveGrenser(params).map(([krav, verdi]): [string, string] => [FILTER_PARAMETRE[krav], String(verdi)])
}
