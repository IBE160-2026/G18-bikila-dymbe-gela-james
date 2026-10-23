import type { UtforskRoute, Visning } from '../lib/router'
import Lenke from './Lenke'

const VALG: readonly { visning: Visning; tekst: string }[] = [
  { visning: 'kart', tekst: 'Kart' },
  { visning: 'liste', tekst: 'Liste' },
]

/**
 * Two links, not a JS-only switch: the choice lives in the URL, so Back and shared links keep it.
 * Story 3.2: each link keeps the current filter and list order, so switching views loses neither.
 */
export default function VisningVeksler({ route }: { route: UtforskRoute }) {
  return (
    <nav className="visning-veksler" aria-label="Visning">
      {VALG.map(({ visning, tekst }) => (
        <Lenke key={visning} to={{ ...route, visning }} className="visning-valg" current={visning === route.visning}>
          {tekst}
        </Lenke>
      ))}
    </nav>
  )
}
