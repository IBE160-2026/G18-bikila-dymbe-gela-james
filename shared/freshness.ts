// NFR-3 / AD-10: how old a place's data is, measured against the caller's "now". shared/ has no clock,
// so the app passes now() from src/lib/clock.ts (the file's referenceTime in demo).

const HOUR_MS = 3_600_000

/** Older than this (strictly) is marked «Utdatert». Exactly 3 h is still fresh. */
export const UTDATERT_ETTER_MS = 3 * HOUR_MS
/** Older than this (strictly) is removed from map, list and place page. Exactly 12 h is only stale. */
export const FJERNES_ETTER_MS = 12 * HOUR_MS

export type Ferskhet = 'fersk' | 'utdatert' | 'for-gammel' | 'ukjent'

/** `now − kildeTidspunkt` in ms, or null when the source time is missing (MET failed) or unreadable. */
export function dataAlderMs(kildeTidspunkt: string | null, now: Date): number | null {
  if (kildeTidspunkt === null) return null
  const kilde = Date.parse(kildeTidspunkt)
  const naa = now.getTime()
  if (!Number.isFinite(kilde) || !Number.isFinite(naa)) return null
  return naa - kilde
}

/** Unknown age is neither marked nor removed; the place shows «Ufullstendige data» instead. */
export function ferskhet(kildeTidspunkt: string | null, now: Date): Ferskhet {
  const alder = dataAlderMs(kildeTidspunkt, now)
  if (alder === null) return 'ukjent'
  if (alder > FJERNES_ETTER_MS) return 'for-gammel'
  if (alder > UTDATERT_ETTER_MS) return 'utdatert'
  return 'fersk'
}
