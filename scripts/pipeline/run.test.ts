import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PublishedData } from '../../shared/contracts/published'
import type { FetchFn } from './fetch'
import { DEMO_OUT_PATH, liveRunId, runDemo, runLive } from './run'
import { DEFAULT_FIXTURES_DIR } from './sources/fixtures'
import { catalogEntry, metResponse, nveResponse, REFERENCE_TIME, snowyDay } from './testing'

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

describe('runLive', () => {
  const END = '2026-10-07T20:31:15Z'

  async function writeCatalog(ids: string[]): Promise<string> {
    const path = join(dir, 'catalog.json')
    await writeFile(path, JSON.stringify({ generert: REFERENCE_TIME, steder: ids.map(catalogEntry) }))
    return path
  }

  /** start, then end for every later reading, so the duration is known. */
  const clock = () => {
    let readings = 0
    return () => (readings++ === 0 ? REFERENCE_TIME : END)
  }

  const valid: FetchFn = async (url) =>
    new Response(JSON.stringify(url.startsWith('https://api.met.no/') ? metResponse(snowyDay()) : nveResponse()))

  /** MET fails with 503 for the given places; everything else answers validly. */
  const metFailsFor =
    (ids: string[]): FetchFn =>
    async (url, init) =>
      ids.some((id) => url.includes(`lat=${catalogEntry(id).lat}&`)) ? new Response('', { status: 503 }) : valid(url, init)

  const ids = (n: number) => Array.from({ length: n }, (_, i) => `sted-${i}`)

  it('publishes latest.json atomically with mode live, the run ID and the source timestamp on every place', async () => {
    const catalogPath = await writeCatalog(ids(4))
    const outPath = join(dir, 'latest.json')
    const lines: string[] = []
    const report = await runLive({ catalogPath, outPath, fetchFn: valid, clock: clock(), log: (l) => lines.push(l) })

    expect(report).toMatchObject({
      mode: 'live',
      start: REFERENCE_TIME,
      varighetMs: 75_000,
      antallSteder: 4,
      andelGyldige: 1,
      avvistePerKilde: { met: 0, nve: 0 },
      antallUfullstendige: 0,
      publisert: true,
      ikkePublisertFordi: null,
      avviste: [],
    })
    expect(report.runId).toMatch(/^20261007T203000Z-[0-9a-f]{8}$/)

    const data = PublishedData.parse(JSON.parse(await readFile(outPath, 'utf8')))
    expect(data).toMatchObject({ mode: 'live', referenceTime: REFERENCE_TIME, runId: report.runId, generert: END, report })
    expect(data.steder).toHaveLength(4)
    for (const sted of data.steder) {
      expect(sted.runId).toBe(report.runId)
      expect(sted.kildeTidspunkt).toBe(REFERENCE_TIME)
      expect(sted.snowScore.kind).toBe('score')
    }
    // Written to a temporary name and renamed, so no temporary file is left behind.
    expect((await readdir(dir)).sort()).toEqual(['catalog.json', 'latest.json'])
    expect(lines.join('\n')).toContain('Publisert (live')
  })

  it('publishes at exactly 95 % valid, showing a failed place as incomplete with no values from an earlier run', async () => {
    const catalogPath = await writeCatalog(ids(20))
    const outPath = join(dir, 'latest.json')
    await writeFile(outPath, 'previous run')
    const report = await runLive({ catalogPath, outPath, fetchFn: metFailsFor(['sted-3']), clock: clock(), log: silent })

    expect(report).toMatchObject({ publisert: true, andelGyldige: 0.95, avvistePerKilde: { met: 1, nve: 0 } })
    expect(report.avviste).toEqual([{ stedId: 'sted-3', kilde: 'met', arsak: 'HTTP 503' }])
    // The failed place counts as rejected, not as incomplete hours.
    expect(report.antallUfullstendige).toBe(0)

    const data = PublishedData.parse(JSON.parse(await readFile(outPath, 'utf8')))
    expect(data.steder.find((s) => s.id === 'sted-3')).toMatchObject({
      runId: report.runId,
      kildeTidspunkt: null,
      snowScore: { kind: 'incomplete', missingShare: 1 },
      nysnoCm: null,
      temperatur: null,
      vindMaks: null,
      skydekke: null,
    })
  })

  it('leaves the previous file untouched below 95 % valid and logs the report with the reason', async () => {
    const catalogPath = await writeCatalog(ids(4))
    const outPath = join(dir, 'latest.json')
    await writeFile(outPath, 'previous run')
    const lines: string[] = []
    const report = await runLive({
      catalogPath,
      outPath,
      fetchFn: metFailsFor(['sted-1']),
      clock: clock(),
      log: (l) => lines.push(l),
    })

    expect(report).toMatchObject({ publisert: false, andelGyldige: 0.75, avvistePerKilde: { met: 1, nve: 0 } })
    expect(report.ikkePublisertFordi).toBe('Bare 75.0 % av stedene har gyldige data; minst 95 % kreves')
    expect(await readFile(outPath, 'utf8')).toBe('previous run')
    expect((await readdir(dir)).sort()).toEqual(['catalog.json', 'latest.json'])
    expect(lines.join('\n')).toContain('"andelGyldige": 0.75')
  })

  it('records NVE «no cell» per place without stopping publication, and logs each reason', async () => {
    const catalogPath = await writeCatalog(ids(4))
    const outPath = join(dir, 'latest.json')
    const fetchFn: FetchFn = async (url, init) =>
      url.startsWith('https://gts.nve.no/') ? new Response('{"Error":"No cell exists"}', { status: 400 }) : valid(url, init)
    const lines: string[] = []
    const report = await runLive({ catalogPath, outPath, fetchFn, clock: clock(), log: (l) => lines.push(l) })

    expect(report).toMatchObject({ publisert: true, andelGyldige: 1, avvistePerKilde: { met: 0, nve: 4 } })
    expect(lines).toContain('  Avvist NVE for sted-0: HTTP 400: {"Error":"No cell exists"}')
    expect(report.avviste).toContainEqual({ stedId: 'sted-0', kilde: 'nve', arsak: 'HTTP 400: {"Error":"No cell exists"}' })
    const data = PublishedData.parse(JSON.parse(await readFile(outPath, 'utf8')))
    expect(data.steder.every((s) => s.nveNysnoSisteDognMm === null && s.snowScore.kind === 'score')).toBe(true)
  })

  it('gives every run its own run ID, even with the same start time', () => {
    expect(liveRunId(REFERENCE_TIME)).not.toBe(liveRunId(REFERENCE_TIME))
  })

  it('still writes a report, and no file, when the catalog cannot be read', async () => {
    const lines: string[] = []
    const outPath = join(dir, 'latest.json')
    const report = await runLive({ catalogPath: join(dir, 'missing.json'), outPath, fetchFn: valid, log: (l) => lines.push(l) })
    expect(report.publisert).toBe(false)
    expect(report.ikkePublisertFordi).toContain('Kjøringen feilet')
    expect(lines.length).toBeGreaterThan(0)
    expect(await readdir(dir)).toEqual([])
  })
})
