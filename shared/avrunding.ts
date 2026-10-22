// One rounding for numbers the user sees and for numbers the filter compares (shared/filter.ts), so a
// place the filter keeps always shows a number that meets the requirement.

/** Rounds to one decimal as Math.round(verdi × 10) / 10. Adding 0 turns −0 into 0. */
export function rundTilEnDesimal(verdi: number): number {
  return Math.round(verdi * 10) / 10 + 0
}
