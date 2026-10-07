import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { colors, rounded, spacing, typography } from './theme'

// AD-9: theme.ts is the source of truth; tokens.css must define exactly the same variables and values.

type Vars = Map<string, string>
type ParsedCss = { vars: Vars; duplicates: string[] }

function parseCssVars(css: string): ParsedCss {
  const vars: Vars = new Map()
  const duplicates: string[] = []
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const match of withoutComments.matchAll(/--([A-Za-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const name = `--${match[1]}`
    // A second declaration silently overrides the first, so it counts as drift instead of being checked.
    if (vars.has(name)) duplicates.push(name)
    else vars.set(name, match[2].trim())
  }
  return { vars, duplicates }
}

function kebab(prop: string): string {
  return prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function themeVars(): Vars {
  const vars: Vars = new Map()
  for (const [key, value] of Object.entries(colors)) vars.set(`--color-${key}`, value)
  for (const [style, props] of Object.entries(typography)) {
    for (const [prop, value] of Object.entries(props)) vars.set(`--typography-${style}-${kebab(prop)}`, value)
  }
  for (const [key, value] of Object.entries(rounded)) vars.set(`--rounded-${key}`, value)
  for (const [key, value] of Object.entries(spacing)) vars.set(`--spacing-${key}`, value)
  return vars
}

/** Returns one message per drift, each naming the variable; empty when in sync. */
function compareTokens(expected: Vars, { vars: actual, duplicates }: ParsedCss): string[] {
  const problems: string[] = duplicates.map((name) => `duplicate variable ${name}`)
  for (const [name, value] of expected) {
    const cssValue = actual.get(name)
    if (cssValue === undefined) problems.push(`missing variable ${name}`)
    else if (cssValue !== value.trim()) problems.push(`value drift in ${name}: expected ${value}, got ${cssValue}`)
  }
  for (const name of actual.keys()) {
    if (!expected.has(name)) problems.push(`extra variable ${name}`)
  }
  return problems
}

const tokensCss = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8')

describe('design tokens (AD-9)', () => {
  it('tokens.css matches theme.ts exactly', () => {
    expect(compareTokens(themeVars(), parseCssVars(tokensCss))).toEqual([])
  })

  it('reports a value drift naming the variable', () => {
    const expected: Vars = new Map([['--spacing-1', '4px']])
    const problems = compareTokens(expected, parseCssVars(':root { --spacing-1: 5px; }'))
    expect(problems).toEqual(['value drift in --spacing-1: expected 4px, got 5px'])
  })

  it('reports a missing variable by name', () => {
    const expected: Vars = new Map([
      ['--spacing-1', '4px'],
      ['--color-accent', '#0B6FB8'],
    ])
    const problems = compareTokens(expected, parseCssVars(':root { --spacing-1: 4px; }'))
    expect(problems).toEqual(['missing variable --color-accent'])
  })

  it('reports an extra variable by name', () => {
    const expected: Vars = new Map([['--spacing-1', '4px']])
    const problems = compareTokens(expected, parseCssVars(':root { --spacing-1: 4px; --spacing-99: 1px; }'))
    expect(problems).toEqual(['extra variable --spacing-99'])
  })

  it('reports a duplicate variable by name', () => {
    const expected: Vars = new Map([['--spacing-1', '4px']])
    const problems = compareTokens(expected, parseCssVars(':root { --spacing-1: 4px; --spacing-1: 5px; }'))
    expect(problems).toEqual(['duplicate variable --spacing-1'])
  })
})
