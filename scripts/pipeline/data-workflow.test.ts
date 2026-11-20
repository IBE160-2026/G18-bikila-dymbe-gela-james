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

// Story 1.11g: GitHub started 7 of about 290 scheduled tries in 49 hours, so each run that fetched starts a timer.
const timer = await readFile(new URL('../../.github/workflows/data-timer.yml', import.meta.url), 'utf8')
const timerMinutes = (name: string) => Number(timer.match(new RegExp(`${name}: (\\d+)`))?.[1])
const targetAge = timerMinutes('TARGET_AGE_MINUTES')
const minWait = timerMinutes('MIN_WAIT_MINUTES')
const timerSkipBelow = timerMinutes('SKIP_YOUNGER_THAN_MINUTES')
const timerTimeout = timerMinutes('timeout-minutes')

describe('data.yml starts the timer, and data-timer.yml starts data.yml', () => {
  it('starts the timer at the end of every run on main that fetched, even a rejected or failed one', () => {
    const job = workflow.split(/\n {2}timer:\r?\n/)[1] ?? ''
    expect(job).toMatch(/^ {4}needs: \[gate, data, branch, verify\]/)
    const condition = job.match(/^ {4}if: \$\{\{ (.+) \}\}/m)?.[1] ?? ''
    expect(condition).toContain('always()')
    expect(condition).toContain("github.ref == 'refs/heads/main'")
    expect(condition).toContain("github.event_name != 'pull_request'")
    // Not a scheduled try the gate stopped, but a gate that failed (empty output) still starts one.
    expect(condition).toContain("needs.gate.outputs.run != 'false'")
    expect(job).toMatch(/^ {4}permissions:\r?\n {6}actions: write\r?\n/m)
    // A dispatch that fails is a warning, so a published run stays green.
    expect(job).toContain('if ! gh workflow run data-timer.yml --ref main; then')
  })

  it('is only started by a dispatch, only one timer waits at a time, and data.yml can be dispatched', () => {
    expect(timer).toMatch(/\non:\r?\n {2}workflow_dispatch:\r?\n\r?\n/)
    expect(timer).toMatch(/group: data-timer\r?\n {2}cancel-in-progress: true/)
    expect(timer).toMatch(/\n {4}permissions:\r?\n {6}actions: write\r?\n/)
    expect(timer).toContain('gh workflow run data.yml --ref main')
    expect(workflow).toMatch(/\n {2}workflow_dispatch:\r?\n/)
  })

  it('starts the next run before the stale data banner, with room for the queue and the run itself', () => {
    expect(bannerMinutes - targetAge).toBeGreaterThanOrEqual(20)
    expect(targetAge).toBeGreaterThanOrEqual(skipBelow)
  })

  it('waits a while after a rejected run, so a source that is down is not asked in a tight loop', () => {
    expect(minWait).toBeGreaterThanOrEqual(30)
    expect(minWait).toBeLessThanOrEqual(targetAge)
  })

  it('starts nothing when the data is fresh, with the same limit as the gate', () => {
    expect(timerSkipBelow).toBe(skipBelow)
    expect(timerSkipBelow).toBeLessThan(targetAge)
  })

  it('outlasts the longest wait', () => {
    expect(timerTimeout).toBeGreaterThan(Math.max(targetAge, minWait))
  })
})
