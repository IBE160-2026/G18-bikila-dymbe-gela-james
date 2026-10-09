import { useState } from 'react'
import { href, type Route } from '../lib/router'
import Lenke from './Lenke'

/**
 * Story 2.1, EXPERIENCE.md navigation: «SnowFinder» · «Slik beregner vi SnowScore» on every width.
 * The product name stays visible; under 768px the other links fold behind a ☰ button (CSS hides the
 * button from that width up). The menu belongs to the address it was opened on, so any route change
 * closes it: a nav link, a link in the page, or Back and Forward.
 */
export default function Toppnavigasjon({ route }: { route: Route }) {
  const adresse = href(route, import.meta.env.BASE_URL)
  const [meny, setMeny] = useState({ apen: false, adresse })
  // Adjusting state while rendering (React's pattern for resetting on a prop change): the stored address
  // moves on with the route and the menu closes, so returning to the address later does not reopen it.
  if (meny.adresse !== adresse) setMeny({ apen: false, adresse })
  const apen = meny.apen && meny.adresse === adresse

  return (
    <nav className="toppnav" aria-label="Hovedmeny">
      <Lenke to={{ name: 'utforsk', visning: 'kart' }} className="app-title" current={route.name === 'utforsk'}>
        SnowFinder
      </Lenke>
      <button
        type="button"
        className="toppnav-knapp"
        aria-label="Meny"
        aria-expanded={apen}
        aria-controls="toppnav-lenker"
        onClick={() => setMeny({ apen: !apen, adresse })}
      >
        ☰
      </button>
      <ul id="toppnav-lenker" className={apen ? 'toppnav-lenker toppnav-lenker--apen' : 'toppnav-lenker'}>
        <li>
          <Lenke to={{ name: 'forklaring' }} className="toppnav-lenke" current={route.name === 'forklaring'}>
            Slik beregner vi SnowScore
          </Lenke>
        </li>
      </ul>
    </nav>
  )
}
