import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PublishedData } from '../../shared/contracts/published'
import { MIN_VALID_SHARE, publish, writeRunReport } from './publish'
import { score } from './score'
import { metResponse, nveResponse, rawContext, REFERENCE_TIME, snowyDay } from './testing'
import { validate } from './validate'

/** `total` places, of which the first `invalid` have a broken MET response and `incomplete` miss hours. */
function context(total: number, invalid: number, incomplete = 0) {
  const raw = Array.from({ length: total }, (_, i) => {
    const id = `sted-${String(i).padStart(2, '0')}`
    if (i < invalid) return { id, met: { broken: true }, nve: nveResponse() }
    const hours = i < invalid + incomplete ? snowyDay().slice(0, 12) : snowyDay()
    return { id, met: metResponse(hours), nve: nveResponse() }
  })
  return score(validate(rawContext(raw)))
}

let dir: string
let outPath: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'snowfinder-publish-'))
  outPath = join(dir, 'data', 'demo.json')
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('publish', () => {
  it('writes a file that parses as PublishedData, with the report embedded', async () => {
    const ctx = await publish(context(24, 0), { outPath, now: REFERENCE_TIME })
    const data = PublishedData.parse(JSON.parse(await readFile(outPath, 'utf8')))
    expect(data.steder).toHaveLength(24)
    expect(data.report).toEqual(ctx.report)
    expect(data.report).toMatchObject({ publisert: true, ikkePublisertFordi: null, antallSteder: 24, andelGyldige: 1 })
  })

  it('publishes at exactly 95 % valid; the failed place appears as incomplete', async () => {
    // 19 of 20 = 95 %.
    const ctx = await publish(context(20, 1), { outPath, now: REFERENCE_TIME })
    expect(ctx.report).toMatchObject({ publisert: true, andelGyldige: 0.95, avvistePerKilde: { met: 1, nve: 0 } })
    const data = PublishedData.parse(JSON.parse(await readFile(outPath, 'utf8')))
    expect(data.steder[0].snowScore).toEqual({ kind: 'incomplete', missingShare: 1 })
    expect(data.report.avviste).toEqual([expect.objectContaining({ stedId: 'sted-00', kilde: 'met' })])
  })

  it('counts incomplete places as valid towards the threshold', async () => {
    const ctx = await publish(context(24, 0, 6), { outPath, now: REFERENCE_TIME })
    expect(ctx.report).toMatchObject({ publisert: true, andelGyldige: 1, antallUfullstendige: 6 })
  })

  it('writes nothing and leaves the previous file untouched below 95 %', async () => {
    await publish(context(24, 0), { outPath, now: REFERENCE_TIME })
    const previous = await readFile(outPath, 'utf8')

    // 22 of 24 = 91.7 %.
    const ctx = await publish(context(24, 2), { outPath, now: '2026-10-07T21:30:00Z' })
    expect(ctx.report).toMatchObject({ publisert: false, avvistePerKilde: { met: 2, nve: 0 } })
    expect(ctx.report?.ikkePublisertFordi).toContain(`${MIN_VALID_SHARE * 100} %`)
    expect(await readFile(outPath, 'utf8')).toBe(previous)
    expect(await readdir(join(dir, 'data'))).toEqual(['demo.json'])
  })

  it('does not publish an empty catalog', async () => {
    const ctx = await publish(context(0, 0), { outPath, now: REFERENCE_TIME })
    expect(ctx.report?.publisert).toBe(false)
    await expect(readFile(outPath)).rejects.toThrow()
  })

  it('writes atomically: no temporary file is left, and a failed write keeps the old file', async () => {
    await publish(context(24, 0), { outPath, now: REFERENCE_TIME })
    expect(await readdir(join(dir, 'data'))).toEqual(['demo.json'])

    // A directory where the file should be makes the rename fail after the temporary file is written.
    const blocked = join(dir, 'blocked.json')
    await writeFile(join(dir, 'keep.txt'), 'x')
    await mkdir(blocked)
    await expect(publish(context(24, 0), { outPath: blocked, now: REFERENCE_TIME })).rejects.toThrow()
    expect((await readdir(dir)).sort()).toEqual(['blocked.json', 'data', 'keep.txt'])
  })

  it('refuses to write a file that does not match PublishedData', async () => {
    const ctx = context(24, 0)
    const bad = { ...ctx, steder: ctx.steder.map((s) => ({ ...s, vindMaks: -1 })) }
    await expect(publish(bad, { outPath, now: REFERENCE_TIME })).rejects.toThrow()
    await expect(readFile(outPath)).rejects.toThrow()
  })
})

describe('writeRunReport', () => {
  it('returns the published report and logs a summary', async () => {
    const ctx = await publish(context(24, 0), { outPath, now: REFERENCE_TIME })
    const lines: string[] = []
    expect(writeRunReport(ctx, undefined, REFERENCE_TIME, (l) => lines.push(l))).toBe(ctx.report)
    expect(lines.join('\n')).toContain('Publisert')
  })

  it('gives a neutral reason when there is no report and no error object', () => {
    const report = writeRunReport(context(3, 0), undefined, REFERENCE_TIME, () => {})
    expect(report.publisert).toBe(false)
    expect(report.ikkePublisertFordi).not.toContain('undefined')
  })

  it('counts only valid places with missing hours as incomplete, not rejected ones', async () => {
    // 1 rejected (shown as incomplete) and 2 with too few hours, out of 24.
    const ctx = await publish(context(24, 1, 2), { outPath, now: REFERENCE_TIME })
    expect(ctx.report).toMatchObject({ antallUfullstendige: 2, avvistePerKilde: { met: 1 } })
  })

  it('reports a crashed run with the reason and logs the whole report', () => {
    const lines: string[] = []
    const report = writeRunReport(context(3, 0), new Error('disk full'), REFERENCE_TIME, (l) => lines.push(l))
    expect(report).toMatchObject({ publisert: false, antallSteder: 3, varighetMs: 0 })
    expect(report.ikkePublisertFordi).toContain('disk full')
    expect(lines.join('\n')).toContain('"publisert": false')
  })
})
