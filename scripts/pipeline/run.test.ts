import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PublishedData } from '../../shared/contracts/published'
import { DEMO_OUT_PATH, runDemo } from './run'
import { DEFAULT_FIXTURES_DIR } from './sources/fixtures'

const HOUR_MS = 3_600_000
const silent = () => {}

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'snowfinder-run-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('runDemo', () => {
  it('is deterministic: two runs give byte-identical files, equal to the committed demo.json', async () => {
    const first = join(dir, 'first.json')
    const second = join(dir, 'second.json')
    await runDemo({ outPath: first, log: silent })
    await runDemo({ outPath: second, log: silent })
    const a = await readFile(first)
    expect(a.equals(await readFile(second))).toBe(true)
    // Fails when the fixtures or the pipeline changed without `npm run data:demo` being re-run.
    expect(a.toString('utf8')).toBe(await readFile(DEMO_OUT_PATH, 'utf8'))
  })

  it('produces the demo data set the app and later stories rely on', async () => {
    const outPath = join(dir, 'demo.json')
    const report = await runDemo({ outPath, log: silent })
    const data = PublishedData.parse(JSON.parse(await readFile(outPath, 'utf8')))

    expect(report.publisert).toBe(true)
    expect(data.mode).toBe('demo')
    expect(data.runId).toBe('demo')
    expect(data.report.varighetMs).toBe(0)
    expect(data.steder).toHaveLength(24)
    expect(data.steder.every((s) => s.runId === 'demo')).toBe(true)

    // referenceTime is the newest source timestamp.
    const times = data.steder.map((s) => Date.parse(s.kildeTidspunkt ?? ''))
    expect(Date.parse(data.referenceTime)).toBe(Math.max(...times))

    // At least one incomplete place, and one stale (more than 3 h old) place that is still published.
    expect(data.steder.filter((s) => s.snowScore.kind === 'incomplete').length).toBeGreaterThanOrEqual(1)
    const stale = data.steder.filter((s) => Date.parse(data.referenceTime) - Date.parse(s.kildeTidspunkt ?? '') > 3 * HOUR_MS)
    expect(stale.length).toBeGreaterThanOrEqual(1)
    expect(stale.every((s) => s.snowScore.kind === 'score')).toBe(true)
  })

  it('rejects broken fixtures into the report and does not publish below 95 %, leaving the old file', async () => {
    const fixtures = join(dir, 'fixtures')
    await cp(DEFAULT_FIXTURES_DIR, fixtures, { recursive: true })
    await writeFile(join(fixtures, 'met', 'oslo.json'), '{"type": "Feature"}')
    await rm(join(fixtures, 'met', 'bergen.json'))

    const outPath = join(dir, 'demo.json')
    await writeFile(outPath, 'previous')
    const lines: string[] = []
    const report = await runDemo({ fixturesDir: fixtures, outPath, log: (l) => lines.push(l) })

    // 22 of 24 = 91.7 %.
    expect(report.publisert).toBe(false)
    expect(report.avviste).toEqual([
      { stedId: 'bergen', kilde: 'met', arsak: 'Mangler svar' },
      expect.objectContaining({ stedId: 'oslo', kilde: 'met' }),
    ])
    expect(await readFile(outPath, 'utf8')).toBe('previous')
    expect(lines.join('\n')).toContain('Ikke publisert')
  })

  it('still writes a report when the run crashes before scoring', async () => {
    const lines: string[] = []
    const report = await runDemo({ fixturesDir: join(dir, 'does-not-exist'), outPath: join(dir, 'x.json'), log: (l) => lines.push(l) })
    expect(report.publisert).toBe(false)
    expect(report.ikkePublisertFordi).toContain('Kjøringen feilet')
    expect(lines.length).toBeGreaterThan(0)
  })
})
