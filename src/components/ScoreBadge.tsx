import type { Sted } from '../../shared/contracts/published'
import { scoreText, scoreTier } from '../lib/scoreTier'

/** DESIGN.md score-badge: number and label together; incomplete data is plain text, never a badge with 0. */
export default function ScoreBadge({ snowScore }: { snowScore: Sted['snowScore'] }) {
  const tier = scoreTier(snowScore)
  if (tier === 'incomplete') return <span className="score-incomplete">{scoreText(snowScore)}</span>
  return <span className={`score-badge score-badge--${tier.tier}`}>{scoreText(snowScore)}</span>
}
