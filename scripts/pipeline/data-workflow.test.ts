import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { GAMLE_DATA_ETTER_MS } from '../../shared/freshness'

// data.yml is read as text: the project has no YAML parser, and these lines are simple enough to match.
const workflow = await readFile(new URL('../../.github/workflows/data.yml', import.meta.url), 'utf8')

const minutes = (workflow.match(/- cron: '([\d,]+) \* \* \* \*'/)?.[1] ?? '').split(',').map(Number)
const skipBelow = Number(workflow.match(/SKIP_YOUNGER_THAN_MINUTES: (\d+)/)?.[1])
const bannerMinutes = GAMLE_DATA_ETTER_MS / 60_000

describe('data.yml schedule and gate', () => {
  it('tries several times an hour, since GitHub drops many scheduled runs', () => {
    expect(minutes.length).toBeGreaterThanOrEqual(4)
    expect(minutes).not.toContain(0)
  })

  it('leaves at least two tries between the gate and the stale data banner', () => {
    const sorted = [...minutes].sort((a, b) => a - b)
    const gaps = sorted.map((m, i) => (i === sorted.length - 1 ? sorted[0]! + 60 : sorted[i + 1]!) - m)
    const longestGap = Math.max(...gaps)
    expect(skipBelow).toBeGreaterThan(0)
    expect(bannerMinutes - skipBelow).toBeGreaterThanOrEqual(2 * longestGap)
  })

  it('still fetches about once an hour, so MET is not asked more often than FR-2 says', () => {
    expect(skipBelow).toBeGreaterThanOrEqual(45)
  })

  it('lets only scheduled runs skip, and runs the data program behind the gate', () => {
    expect(workflow).toContain('if [ "$EVENT" != schedule ]; then')
    expect(workflow).toMatch(/\n {2}data:\r?\n {4}needs: gate\r?\n {4}if: needs\.gate\.outputs\.run == 'true'\r?\n/)
  })
})
