import type { PublishedData } from '../../shared/contracts/published'

// AD-10: the only source of "now" in src/. Lint forbids Date.now() and new Date() elsewhere.
// In demo mode "now" is the file's referenceTime, so data age does not depend on when the demo
// is opened; in live mode it is the wall clock.

export type ClockSource = Pick<PublishedData, 'mode' | 'referenceTime'>

export function now(data: ClockSource): Date {
  return data.mode === 'demo' ? new Date(data.referenceTime) : new Date()
}
