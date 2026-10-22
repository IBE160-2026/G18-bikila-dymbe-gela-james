import { useState } from 'react'
import { href, type Route } from '../lib/router'
import Lenke from './Lenke'

/**
 * Story 2.1, EXPERIENCE.md navigation: «SnowFinder» · «Slik beregner vi SnowScore» on every width.
 * The product name stays visible; under 768px the other links fold behind a ☰ button (CSS hides the
 * button from that width up). The menu belongs to the route type and address it was opened on, so moving
 * to another route type or to another address the app links to closes it: a nav link, a link in the page,
 * or Back and Forward. Two unknown addresses count as one, since «Fant ikke siden» has a single key.
 */
export default function Toppnavigasjon({ route }: { route: Route }) {
  // The route name is part of the key: «Fant ikke siden» links to the root like the map does, so the
  // address alone would not change when the user goes from there to the map, and the menu would stay open.
  const nokkel = `${route.name} ${href(route, import.meta.env.BASE_URL)}`
  const [meny, setMeny] = useState({ apen: false, nokkel })
  // Adjusting state while rendering (React's pattern for resetting on a prop change): the stored key
  // moves on with the route and the menu closes, so returning to the route later does not reopen it.
  if (meny.nokkel !== nokkel) setMeny({ apen: false, nokkel })
  const apen = meny.apen && meny.nokkel === nokkel

  return (
    <nav className="toppnav" aria-label="Hovedmeny">
      {/* «SnowFinder» opens the map, so only the map is its page. The list has no nav link of its own,
          so nothing in the nav is current there. */}
      <Lenke
        to={{ name: 'utforsk', visning: 'kart' }}
        className="app-title"
        current={route.name === 'utforsk' && route.visning === 'kart'}
      >
        SnowFinder
      </Lenke>
      <button
        type="button"
        className="toppnav-knapp"
        aria-label="Meny"
        aria-expanded={apen}
        aria-controls="toppnav-lenker"
        onClick={() => setMeny({ apen: !apen, nokkel })}
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
