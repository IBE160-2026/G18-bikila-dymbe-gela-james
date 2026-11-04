import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PublishedData } from '../../shared/contracts/published'
import type { FetchFn } from './fetch'
import { HENT_TIMEOUT_MS, HENT_URL, hentData } from './hent-data'

const demoText = await readFile(new URL('../../public/data/demo.json', import.meta.url), 'utf8')
const vercelText = await readFile(new URL('../../vercel.json', import.meta.url), 'utf8')
const demo = JSON.parse(demoText)
const live = (generert: string) => ({
  ...demo,
  mode: 'live',
  runId: 'run-1',
  generert,
  report: { ...demo.report, runId: 'run-1', mode: 'live' },
})
const ELDRE = '2026-10-31T10:00:00Z'
const NYERE = '2026-10-31T11:00:00Z'
// Formatting that a rewrite would change, so the tests prove the file is byte-identical.
const lokalTekst = (generert: string) => `${JSON.stringify(live(generert))}\n\n`
// A file written before Stories 3.5 and 4.2.
const utenNyereFelt = (generert: string) => ({
  ...live(generert),
  steder: demo.steder.map((sted: Record<string, unknown>) => {
    const kopi = { ...sted }
    delete kopi.skydekkeDagslys
    delete kopi.skivindu
    delete kopi.skivinduUtenDagslys
    return kopi
  }),
})

// What raw.githubusercontent.com answers.
const plain = (body: unknown) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })

describe('hentData', () => {
  let dir: string
  let outPath: string
  let lines: string[]
  const log = (line: string) => lines.push(line)
  const hent = (fetchFn: FetchFn) => hentData({ fetchFn, outPath, log })
  const answers = (response: () => Response): FetchFn => async () => response()

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'hent-data-'))
    outPath = join(dir, 'data', 'latest.json')
    await mkdir(join(dir, 'data'))
    lines = []
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await rm(dir, { recursive: true, force: true })
  })

  /** The local file stays byte-identical, nothing is left behind, and exactly one line says why. */
  async function expectUntouched(fetchFn: FetchFn, reason: RegExp) {
    const before = lokalTekst(NYERE)
    await writeFile(outPath, before, 'utf8')
    await expect(hent(fetchFn)).resolves.toBeUndefined()
    expect(await readFile(outPath, 'utf8')).toBe(before)
    expect(await readdir(join(dir, 'data'))).toEqual(['latest.json'])
    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatch(reason)
  }

  it('writes a valid file from the branch when there is no local file', async () => {
    const calls: string[] = []
    await hent(async (url) => {
      calls.push(url)
      return plain(live(NYERE))
    })
    expect(calls).toEqual([HENT_URL])
    expect(PublishedData.parse(JSON.parse(await readFile(outPath, 'utf8')))).toMatchObject({ mode: 'live', generert: NYERE })
    expect(await readdir(join(dir, 'data'))).toEqual(['latest.json'])
    expect(lines[0]).toContain('Hentet værdata')
  })

  it('creates the folder when it is missing', async () => {
    outPath = join(dir, 'ny', 'latest.json')
    await hent(answers(() => plain(live(NYERE))))
    expect(JSON.parse(await readFile(outPath, 'utf8')).generert).toBe(NYERE)
  })

  it('replaces the local file when the published one is newer', async () => {
    await writeFile(outPath, lokalTekst(ELDRE), 'utf8')
    await hent(answers(() => plain(live(NYERE))))
    expect(JSON.parse(await readFile(outPath, 'utf8')).generert).toBe(NYERE)
    expect(lines[0]).toContain('Hentet værdata')
  })

  it.each([
    ['equal', NYERE],
    ['older', ELDRE],
    // The same instant written differently must count as equal, not be compared as text.
    ['equal with milliseconds', '2026-10-31T11:00:00.000Z'],
  ])('leaves the local file byte-identical when the published one is %s', async (_name, generert) => {
    await expectUntouched(answers(() => plain(live(generert))), /like ny/)
  })

  it.each([
    ['not JSON', '{"mode": "live",'],
    // Newer than the published file, so only the schema check can get it replaced.
    ['the wrong schema', lokalTekst('2026-10-31T12:00:00Z').replace('"steder":[', '"steder":[{"id":"x"},')],
  ])('replaces a local file that is %s with a valid published file', async (_name, innhold) => {
    await writeFile(outPath, innhold, 'utf8')
    await hent(answers(() => plain(live(NYERE))))
    expect(JSON.parse(await readFile(outPath, 'utf8'))).toMatchObject({ mode: 'live', generert: NYERE })
  })

  it('accepts a published file without the newer fields, which the app can read', async () => {
    await hent(answers(() => plain(utenNyereFelt(NYERE))))
    const skrevet = PublishedData.parse(JSON.parse(await readFile(outPath, 'utf8')))
    expect(skrevet.generert).toBe(NYERE)
    expect(skrevet.steder.every((s) => s.skivindu === null)).toBe(true)
  })

  it('keeps a valid local file without the newer fields when the published one is older', async () => {
    const before = JSON.stringify(utenNyereFelt(NYERE))
    await writeFile(outPath, before, 'utf8')
    await hent(answers(() => plain(live(ELDRE))))
    expect(await readFile(outPath, 'utf8')).toBe(before)
    expect(lines[0]).toMatch(/like ny/)
  })

  it('leaves the local file and logs when the call is rejected (no network)', async () => {
    await expectUntouched(
      async () => {
        throw new TypeError('fetch failed')
      },
      /Klarte ikke å hente værdata: fetch failed/,
    )
  })

  describe('with a slow answer', () => {
    // AbortSignal.timeout is not moved by fake timers, so the test checks the 15 s and fires the signal itself.
    function utloptSignal() {
      const spy = vi
        .spyOn(AbortSignal, 'timeout')
        .mockReturnValue(AbortSignal.abort(new DOMException('Timed out', 'TimeoutError')))
      return () => expect(spy).toHaveBeenCalledWith(HENT_TIMEOUT_MS)
    }
    const avbrutt = (signal: AbortSignal | null | undefined) =>
      new Promise<never>((_resolve, reject) => {
        if (signal?.aborted) reject(signal.reason)
        signal?.addEventListener('abort', () => reject(signal.reason))
      })

    it('gives up after 15 s when the answer never starts', async () => {
      const sjekk15s = utloptSignal()
      await expectUntouched((_url, init) => avbrutt(init.signal), /Tidsavbrudd etter 15 s/)
      sjekk15s()
    })

    it('gives up after 15 s when the body stops arriving', async () => {
      const sjekk15s = utloptSignal()
      await expectUntouched(async (_url, init) => {
        const body = new ReadableStream({
          start(controller) {
            void avbrutt(init.signal).catch((reason: unknown) => controller.error(reason))
          },
        })
        return new Response(body, { status: 200 })
      }, /Tidsavbrudd etter 15 s/)
      sjekk15s()
    })
  })

  it('leaves the local file and logs when the branch has no file', async () => {
    await expectUntouched(answers(() => new Response('Not found', { status: 404 })), /Fant ingen publisert datafil/)
  })

  it('writes nothing when there is no local file and the branch has none', async () => {
    await hent(answers(() => new Response('Not found', { status: 404 })))
    expect(await readdir(join(dir, 'data'))).toEqual([])
  })

  it('leaves the local file and logs on another HTTP error', async () => {
    await expectUntouched(answers(() => new Response('Bad gateway', { status: 502 })), /HTTP 502/)
  })

  it.each([
    ['not JSON', () => plain('{"mode": "live",'), /ikke gyldig JSON/],
    ['the wrong schema', () => plain({ ...live(NYERE), steder: [{ id: 'x' }] }), /følger ikke PublishedData/],
    // Newer than the local file, so only the mode can stop it.
    ['demo data', () => plain({ ...demo, generert: '2026-10-31T12:00:00Z' }), /mode «demo»/],
  ])('leaves the local file and logs when the answer is %s', async (_name, response, reason) => {
    await expectUntouched(answers(response), reason)
  })

  it('logs instead of throwing when the file cannot be written', async () => {
    // A file where the parent folder should be makes the write fail on every platform.
    await writeFile(join(dir, 'fil'), 'x', 'utf8')
    outPath = join(dir, 'fil', 'latest.json')
    await expect(hent(answers(() => plain(live(NYERE))))).resolves.toBeUndefined()
    expect(lines[0]).toContain('Klarte ikke å hente værdata')
  })
})

describe('vercel.json', () => {
  const config = JSON.parse(vercelText) as {
    buildCommand: string
    rewrites: { source: string; destination: string }[]
    headers: { source: string; headers: { key: string; value: string }[] }[]
  }

  it('sends the data file to the same address npm run data:hent reads, so the site and dev agree', () => {
    expect(config.rewrites).toContainEqual({ source: '/data/latest.json', destination: HENT_URL })
  })

  it('overrides text/plain from GitHub, since the app counts anything but JSON as a missing file', () => {
    const data = config.headers.find(({ source }) => source === '/data/latest.json')
    expect(data?.headers.find(({ key }) => key === 'Content-Type')?.value).toContain('json')
  })

  it('sends direct links to the app, but not the assets or the data files', () => {
    expect(config.rewrites).toContainEqual({ source: '/((?!assets/|data/).*)', destination: '/index.html' })
  })

  it('builds without prebuild and without data files, which would go before the rewrite', () => {
    expect(config.buildCommand).toContain('--ignore-scripts')
    expect(config.buildCommand).toContain('dist/data/latest.json')
    expect(config.buildCommand).toContain('dist/data/demo.json')
  })
})
