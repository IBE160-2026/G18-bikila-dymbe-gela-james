// Story 3.9 (FR-32): search for a place by name. Pure and shared (AD-6), locked by tests/golden/sok.json (AD-4).

/** The most suggestions shown while the user types. */
export const MAKS_FORSLAG = 8

// Same comparison as the «Navn» sort (src/lib/sortering.ts). shared/ cannot import from src/, so the
// collator is made here with the same locale.
const navnCollator = new Intl.Collator('nb')

/**
 * Name and search text are normalised alike: lower case, æ → ae, ø → o, å → a, every other accent
 * removed («Jiehkkevárri» → «jiehkkevarri»), and runs of whitespace trimmed and collapsed to one space.
 */
export function normaliserNavn(tekst: string): string {
  return tekst
    .toLowerCase()
    .replaceAll('æ', 'ae')
    .replaceAll('ø', 'o')
    .replaceAll('å', 'a')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .replace(/\s+/g, ' ')
}

type Sokbar = { id: string; navn: string }

const BOKSTAV_ELLER_TALL = /[\p{L}\p{N}]/u

/** True when `sok` stands somewhere in `navn` right after a character that is not a letter or a digit. */
function iOrdstart(navn: string, sok: string): boolean {
  for (let i = navn.indexOf(sok, 1); i !== -1; i = navn.indexOf(sok, i + 1)) {
    if (!BOKSTAV_ELLER_TALL.test(navn[i - 1])) return true
  }
  return false
}

/**
 * The places whose name has the search text at the start of the name, or right after any character
 * that is not a letter or a digit (a space, a hyphen, a parenthesis, «&» and the like). Matches at the start of the whole name come first, then the rest; each group in Norwegian
 * alphabetical order (the id breaks ties), and at most `maks`. Empty search text gives no suggestions.
 */
export function sokSteder<T extends Sokbar>(steder: readonly T[], tekst: string, maks = MAKS_FORSLAG): T[] {
  const sok = normaliserNavn(tekst)
  if (sok === '') return []
  const forst: T[] = []
  const ellers: T[] = []
  for (const sted of steder) {
    const navn = normaliserNavn(sted.navn)
    if (navn.startsWith(sok)) forst.push(sted)
    else if (iOrdstart(navn, sok)) ellers.push(sted)
  }
  const etterNavn = (a: T, b: T) => navnCollator.compare(a.navn, b.navn) || a.id.localeCompare(b.id)
  return [...forst.sort(etterNavn), ...ellers.sort(etterNavn)].slice(0, Math.max(0, maks))
}
