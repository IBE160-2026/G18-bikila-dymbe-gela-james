import type { Sted } from '../../shared/contracts/published'
import { sted as stedRoute, type UtforskRoute } from '../lib/router'
import Lenke from './Lenke'
import ScoreBadge from './ScoreBadge'

/** Read between the name and the badge, so a screen reader hears «Snota, 53 · Godt». */
const Skille = () => <span className="visually-hidden">, </span>

type Props = {
  /** The places to show, already chosen by `besteSteder` (at most three, best first). */
  steder: Sted[]
  /** True when a filter requirement is active, which changes the heading. */
  filterAktiv: boolean
  /** The current search, carried into each place's address (Story 3.2b). */
  sok: UtforskRoute
}

export const BEST_NAA = 'Best akkurat nå'
export const BEST_BLANT_TREFFENE = 'Best blant treffene'

/**
 * Story 1.12 (FR-33): the best places among the hits, above the map and the list, so the answer to
 * «where is it best today?» needs no searching. Not rendered when there is nothing to show.
 */
export default function BestAkkuratNaa({ steder, filterAktiv, sok }: Props) {
  if (steder.length === 0) return null
  return (
    <section className="best-naa" aria-labelledby="best-naa-overskrift">
      <h2 id="best-naa-overskrift" className="best-naa-overskrift">
        {filterAktiv ? BEST_BLANT_TREFFENE : BEST_NAA}
      </h2>
      <ol className="best-naa-liste">
        {steder.map((sted) => (
          <li key={sted.id}>
            <Lenke to={stedRoute(sted.id, sok)} className="best-naa-rad">
              {/* A name cut short with «…» can still be read in full on hover. */}
              <span className="best-naa-navn" title={sted.navn}>
                {sted.navn}
              </span>
              <Skille />
              <ScoreBadge snowScore={sted.snowScore} />
            </Lenke>
          </li>
        ))}
      </ol>
    </section>
  )
}
