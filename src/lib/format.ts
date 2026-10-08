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

/** A value with its unit, or "–" when the data file has none. */
export function medEnhet(verdi: number | null, enhet: string): string {
  if (verdi === null) return '–'
  // Round first and add 0, so -0.04 °C shows as "0 °C" and not "−0 °C".
  return `${tallFormat.format(Math.round(verdi * 10) / 10 + 0)} ${enhet}`
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

/** The «Utdatert» mark with the source time (EXPERIENCE: small meta text with a timestamp). */
export function utdatertTekst(kildeTidspunkt: string | null): string {
  return `Utdatert · data fra ${norskTid(kildeTidspunkt)}`
}
