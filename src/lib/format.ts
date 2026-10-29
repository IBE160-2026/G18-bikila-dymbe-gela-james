import { rundTilEnDesimal } from '../../shared/avrunding'

// Norwegian number and time formatting for the UI. Timestamps are stored in UTC and shown in Norwegian
// local time only here (architecture conventions).

const tallFormat = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 })
const enDesimal = new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const tidFormat = new Intl.DateTimeFormat('nb-NO', {
  timeZone: 'Europe/Oslo',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** A number in Norwegian with at most one decimal and a real minus sign: "0,5", "−14". */
export function tall(verdi: number): string {
  // The filter compares with the same rounding (shared/avrunding.ts), so a place it keeps shows a
  // matching number. Rounding first also shows -0.04 as "0" and not "−0".
  return tallFormat.format(rundTilEnDesimal(verdi))
}

/** A value with its unit, or "–" when the data file has none. */
export function medEnhet(verdi: number | null, enhet: string): string {
  if (verdi === null) return '–'
  return `${tall(verdi)} ${enhet}`
}

/** A sub-score out of its maximum with one decimal: "19,2 av 60". */
export function delpoeng(verdi: number, maks: number): string {
  return `${enDesimal.format(verdi)} av ${maks}`
}

/** An ISO timestamp in Norwegian local time: "7. oktober 2026 kl. 22:30", or "–" when missing. */
export function norskTid(iso: string | null): string {
  if (iso === null) return '–'
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? tidFormat.format(ms) : '–'
}

const timeFormat = new Intl.DateTimeFormat('nb-NO', {
  timeZone: 'Europe/Oslo',
  weekday: 'long',
  hour: '2-digit',
  hourCycle: 'h23',
})

/** Weekday and two-digit hour in Norwegian local time, from formatToParts so the order is fixed. */
function dagOgTime(ms: number): { dag: string; time: string } {
  const parts = timeFormat.formatToParts(ms)
  const del = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return { dag: del('weekday'), time: del('hour') }
}

const HOUR_MS = 3_600_000

/**
 * Story 4.2: the ski window as a span of whole hours in Norwegian local time: "lørdag 10–14". A window
 * ending at midnight ends at "24"; one that crosses midnight names both days: "lørdag 22–søndag 02".
 */
export function tidsrom(startIso: string, timer: number): string {
  const startMs = Date.parse(startIso)
  if (!Number.isFinite(startMs)) return '–'
  const start = dagOgTime(startMs)
  const slutt = dagOgTime(startMs + timer * HOUR_MS)
  if (slutt.dag === start.dag) return `${start.dag} ${start.time}–${slutt.time}`
  if (slutt.time === '00') return `${start.dag} ${start.time}–24`
  return `${start.dag} ${start.time}–${slutt.dag} ${slutt.time}`
}

/** The «Utdatert» mark with the source time (EXPERIENCE: small meta text with a timestamp). */
export function utdatertTekst(kildeTidspunkt: string | null): string {
  return `Utdatert · data fra ${norskTid(kildeTidspunkt)}`
}

const klokkeFormat = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const datoFormat = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', day: 'numeric', month: 'long' })
/** YYYY-MM-DD in Norwegian local time, only to tell whether two instants fall on the same day. */
const dagFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo' })

/**
 * Story 1.6 (UX-DR10): the banner for an old data file, «Viser siste kjente data fra kl. 14:05».
 * When the file is from another day than now, the date is added: «… fra 7. oktober kl. 22:30».
 */
export function gamleDataTekst(generert: string, naa: Date): string {
  const ms = Date.parse(generert)
  if (!Number.isFinite(ms)) return 'Viser siste kjente data'
  const klokke = `kl. ${klokkeFormat.format(ms)}`
  const sammeDag = Number.isFinite(naa.getTime()) && dagFormat.format(ms) === dagFormat.format(naa)
  return `Viser siste kjente data fra ${sammeDag ? klokke : `${datoFormat.format(ms)} ${klokke}`}`
}
