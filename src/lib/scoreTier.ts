import type { Sted } from '../../shared/contracts/published'

// DESIGN.md SnowScore scale: four tiers, snowscore-0..snowscore-3, each with a text label so a score
// is never shown as colour alone. Tier bounds decided by the group on 2026-10-08.

export type Tier = 0 | 1 | 2 | 3

export type TierInfo = { tier: Tier; label: string }

export const INCOMPLETE_LABEL = 'Ufullstendige data'

/** Highest tier first; the explanation page lists them from here so the bounds live in one place. */
export const TIERS: readonly { min: number; info: TierInfo }[] = [
  { min: 70, info: { tier: 3, label: 'Svært godt' } },
  { min: 45, info: { tier: 2, label: 'Godt' } },
  { min: 20, info: { tier: 1, label: 'Middels' } },
  { min: 0, info: { tier: 0, label: 'Lite' } },
]

function tierFor(score: number): TierInfo {
  // The contract limits score to 0..100, so the last tier (min 0) always matches.
  return (TIERS.find(({ min }) => score >= min) ?? TIERS[TIERS.length - 1]).info
}

/** The tier for a computed score, or 'incomplete' so missing data is never shown as 0. */
export function scoreTier(snowScore: Sted['snowScore']): TierInfo | 'incomplete' {
  return snowScore.kind === 'incomplete' ? 'incomplete' : tierFor(snowScore.score)
}

/** "82 · Svært godt", or "Ufullstendige data". */
export function scoreText(snowScore: Sted['snowScore']): string {
  if (snowScore.kind === 'incomplete') return INCOMPLETE_LABEL
  return `${snowScore.score} · ${tierFor(snowScore.score).label}`
}
