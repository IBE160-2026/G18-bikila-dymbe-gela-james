import { readFileSync } from 'node:fs'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { PublishedData } from './contracts/published'
import { MAKS_FORSLAG, normaliserNavn, sokSteder } from './sok'

// Story 3.9 (FR-32): the golden table locks the search rule (AD-4), the demo data the matrix in the spec.

type GoldenSted = { id: string; navn: string }
type GoldenCase = { navn: string; tekst: string; forventet: string[] }

const golden = JSON.parse(readFileSync(new URL('../tests/golden/sok.json', import.meta.url), 'utf8')) as {
  regel: string
  steder: GoldenSted[]
  tilfeller: GoldenCase[]
}

const demo = PublishedData.parse(JSON.parse(readFileSync(new URL('../public/data/demo.json', import.meta.url), 'utf8')))

const ids = (steder: { id: string }[]) => steder.map(({ id }) => id)

describe('sokSteder golden table', () => {
  it.each(golden.tilfeller.map((c) => [c.navn, c] as const))('%s', (_navn, { tekst, forventet }) => {
    expect(ids(sokSteder(golden.steder, tekst))).toEqual(forventet)
  })

  it('does not depend on the order of the places', () => {
    const omvendt = [...golden.steder].reverse()
    for (const { tekst, forventet } of golden.tilfeller) expect(ids(sokSteder(omvendt, tekst)), tekst).toEqual(forventet)
  })
})

describe('sokSteder on the demo data', () => {
  it.each([
    ['gaus', ['gaustatoppen']],
    ['tromso', ['tromso', 'tromso-alpinpark']],
    ['skisenter', ['hemsedal-skisenter', 'oppdal-skisenter', 'sirdal-skisenter']],
    ['TRYSIL', ['trysil']],
    ['jiehkkevarri', ['jiehkkevarri']],
    ['sen', []],
    ['t', ['tromso', 'tromso-alpinpark', 'trondheim', 'trysil']],
    ['oslo', ['oslo']],
    ['trondheim', ['trondheim']],
    ['xyz', []],
    ['   ', []],
  ])('«%s»', (tekst, forventet) => {
    expect(ids(sokSteder(demo.steder, tekst))).toEqual(forventet)
  })
})

describe('normaliserNavn', () => {
  it('lowers case, writes æ, ø and å as ae, o and a, drops other accents and collapses whitespace', () => {
    expect(normaliserNavn('Jiehkkevárri')).toBe('jiehkkevarri')
    expect(normaliserNavn('Tromsø')).toBe('tromso')
    expect(normaliserNavn('ÆRØ Ålesund')).toBe('aero alesund')
    expect(normaliserNavn('  Mo \t i   Rana ')).toBe('mo i rana')
    expect(normaliserNavn('Čáhppesčohkka')).toBe('cahppescohkka')
  })
})

// Letters with and without Norwegian characters and accents, a digit, plus space, hyphen, parentheses and «&»,
// so the generated names have several words. No ß or dotless ı, whose upper case is not a single letter of the same kind.
const tegn = fc.constantFrom(...'abcdeorstæøåáéöü ÆØÅTRS-()&2'.split(''))
const navn = fc.string({ unit: tegn, minLength: 1, maxLength: 14 })
const steder = fc.uniqueArray(fc.record({ id: fc.string({ minLength: 1, maxLength: 6 }), navn }), {
  selector: ({ id }) => id,
  maxLength: 30,
})
const tekst = fc.string({ unit: tegn, maxLength: 5 })

/** The rule in FR-32, written the slow way: at the start of the name, or after a non-letter, non-digit. */
function matcher(stedNavn: string, sok: string): boolean {
  const n = normaliserNavn(stedNavn)
  const s = normaliserNavn(sok)
  if (s === '') return false
  return Array.from({ length: n.length }, (_, i) => i).some((i) => n.startsWith(s, i) && (i === 0 || !/[\p{L}\p{N}]/u.test(n[i - 1])))
}

describe('sokSteder properties', () => {
  it('never gives more than 8 suggestions, or more than asked for', () => {
    fc.assert(
      fc.property(steder, tekst, fc.integer({ min: 0, max: 12 }), (liste, sok, maks) => {
        expect(sokSteder(liste, sok).length).toBeLessThanOrEqual(MAKS_FORSLAG)
        expect(sokSteder(liste, sok, maks).length).toBeLessThanOrEqual(maks)
      }),
    )
  })

  it('gives exactly the matching places, once each, with matches at the start of the name first', () => {
    fc.assert(
      fc.property(steder, tekst, (liste, sok) => {
        const treff = sokSteder(liste, sok, Infinity)
        expect(new Set(ids(treff)).size).toBe(treff.length)
        expect(ids(treff).sort()).toEqual(ids(liste.filter((sted) => matcher(sted.navn, sok))).sort())
        const iStarten = treff.map((sted) => normaliserNavn(sted.navn).startsWith(normaliserNavn(sok)))
        expect(iStarten).toEqual([...iStarten].sort((a, b) => Number(b) - Number(a)))
      }),
    )
  })

  it('gives the same answer whatever the case, the Norwegian letters, the accents and the spacing', () => {
    const utenSaertegn = (s: string) => s.replaceAll('æ', 'ae').replaceAll('ø', 'o').replaceAll('å', 'a').replaceAll('Æ', 'AE').replaceAll('Ø', 'O').replaceAll('Å', 'A')
    fc.assert(
      fc.property(steder, tekst, (liste, sok) => {
        const svar = ids(sokSteder(liste, sok))
        expect(ids(sokSteder(liste, sok.toUpperCase()))).toEqual(svar)
        expect(ids(sokSteder(liste, sok.toLowerCase()))).toEqual(svar)
        expect(ids(sokSteder(liste, utenSaertegn(sok)))).toEqual(svar)
        expect(ids(sokSteder(liste, sok.normalize('NFD').replace(/\p{M}/gu, '')))).toEqual(svar)
        expect(ids(sokSteder(liste, `  ${sok.replaceAll(' ', '   ')} `))).toEqual(svar)
      }),
    )
  })
})
