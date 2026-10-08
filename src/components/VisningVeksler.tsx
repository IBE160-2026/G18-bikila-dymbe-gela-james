import type { Visning } from '../lib/router'
import Lenke from './Lenke'

const VALG: readonly { visning: Visning; tekst: string }[] = [
  { visning: 'kart', tekst: 'Kart' },
  { visning: 'liste', tekst: 'Liste' },
]

/** Two links, not a JS-only switch: the choice lives in the URL, so Back and shared links keep it. */
export default function VisningVeksler({ valgt }: { valgt: Visning }) {
  return (
    <nav className="visning-veksler" aria-label="Visning">
      {VALG.map(({ visning, tekst }) => (
        <Lenke key={visning} to={{ name: 'utforsk', visning }} className="visning-valg" current={visning === valgt}>
          {tekst}
        </Lenke>
      ))}
    </nav>
  )
}
