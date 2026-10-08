import type { Sted as StedData } from '../../shared/contracts/published'
import Lenke from '../components/Lenke'
import ScoreBadge from '../components/ScoreBadge'

// Story 1.7 shows only name and score; the full place page comes in Story 1.9.
export default function Sted({ sted }: { sted: StedData }) {
  return (
    <article className="sted">
      <h1 className="sted-navn">{sted.navn}</h1>
      <p>
        SnowScore: <ScoreBadge snowScore={sted.snowScore} />
      </p>
      <Lenke to={{ name: 'utforsk' }}>Tilbake til kartet</Lenke>
    </article>
  )
}
