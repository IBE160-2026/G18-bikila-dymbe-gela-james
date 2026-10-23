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
}

export const FILTER_KRAV: readonly FilterKrav[] = ['minNysnoCm', 'maksVindMs', 'maksTemperaturC']

export const STANDARD_FILTER: FilterParams = { minNysnoCm: null, maksVindMs: null, maksTemperaturC: null }

/** The fields filtrerSteder reads, so the golden table can use small hand-written places. */
export type Filtrerbar = Pick<Sted, 'nysnoCm' | 'vindMaks' | 'temperatur'>


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
  const verdi = krav === 'minNysnoCm' ? sted.nysnoCm : krav === 'maksVindMs' ? sted.vindMaks : sted.temperatur
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

// AD-12 (Story 3.2, FR-21): the only translation between the address and the filter. The router carries
// the query to these two functions and never reads the requirements itself.

/** The query parameter of each requirement, in the fixed order serializeFilter writes them. */
const FILTER_PARAMETRE: Readonly<Record<FilterKrav, string>> = {
  minNysnoCm: 'nysno',
  maksVindMs: 'vind',
  maksTemperaturC: 'temp',
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
  }
}

/** The active requirements as query pairs, in panel order, so the same filter always gives the same address. */
export function serializeFilter(params: FilterParams): [string, string][] {
  return aktiveGrenser(params).map(([krav, verdi]): [string, string] => [FILTER_PARAMETRE[krav], String(verdi)])
}
