import { useEffect, useMemo } from 'react'
import type { Sted } from '../../shared/contracts/published'
import { filtrerSteder, type FilterParams } from '../../shared/filter'
import FilterPanel, { Nullstill } from '../components/FilterPanel'
import KartVisning from '../components/KartVisning'
import Lenke from '../components/Lenke'
import ListeVisning from '../components/ListeVisning'
import VisningVeksler from '../components/VisningVeksler'
import { href, replace, type UrlSortering, type UtforskRoute } from '../lib/router'

// AD-8: one route for map and list; both show the same places from the shared useSteder() store.
export const INGEN_FERSKE = 'Ingen ferske data'
export const INGEN_STEDER = 'Ingen steder har ferske nok data akkurat nå. Last inn siden på nytt for å hente de nyeste dataene.'
export const INGEN_TREFF = 'Ingen steder oppfyller alle kravene.'

type Props = { steder: Sted[]; utdatert: ReadonlySet<string>; route: UtforskRoute }

export default function Utforsk({ steder, utdatert, route }: Props) {
  // Story 3.2 (FR-21, AD-12): the address is the only copy of the filter and the list order, so a shared
  // link, Back from a place page and the map/list switch all show the same search. A change replaces the
  // address instead of adding a history step, so Back leaves the page rather than undoing a slider step.
  const { visning, filter } = route
  const settFilter = (ny: FilterParams) => replace({ ...route, filter: ny })
  const settSortering = (sortering: UrlSortering) => replace({ ...route, sortering })
  // A link with invalid, default or non-canonical values (`?nysno=abc`, `?nysno=0`, `?temp=05`) is
  // rewritten to the address this search would have, so copying it does not share the junk again.
  useEffect(() => {
    if (href(route, import.meta.env.BASE_URL) !== window.location.pathname + window.location.search) replace(route)
  }, [route])
  // Places older than 12 h are already gone from `steder`; the filter only narrows what is left. Memoised,
  // so other re-renders reuse the same array. Every filter change gives a new one, and the map then
  // rebuilds all its markers while keeping its zoom and position.
  const treff = useMemo(() => filtrerSteder(steder, filter), [steder, filter])

  return (
    <>
      <h1 className="visually-hidden">Snøforhold i Norge</h1>
      {steder.length === 0 ? (
        // EXPERIENCE.md: never an empty surface without an explanation and an action. There is nothing
        // to switch between or filter, so the map/list switch and the filter are left out.
        <section className="tom-tilstand" aria-labelledby="tom-overskrift">
          <h2 id="tom-overskrift">{INGEN_FERSKE}</h2>
          <p>{INGEN_STEDER}</p>
          <button type="button" className="knapp" onClick={() => window.location.reload()}>
            Last inn på nytt
          </button>
        </section>
      ) : (
        <>
          {/* Story 2.1: one link next to the switch covers both map and list. The map tooltip is hover text
              and a list row is already a link, so the link cannot go inside either. */}
          <div className="utforsk-verktoy">
            <VisningVeksler route={route} />
            <Lenke to={{ name: 'forklaring' }} className="forklaring-lenke">
              Slik beregner vi SnowScore
            </Lenke>
          </div>
          <div className="utforsk">
            <FilterPanel params={filter} onEndre={settFilter} />
            <div className="utforsk-resultat">
              {/* Never an empty surface: say why, and offer the way back. Story 3.3 adds which requirement to
                  ease and a live hit count. The status region is always rendered, so a screen reader hears the
                  message when it is filled in. */}
              <div role="status">
                {treff.length === 0 && (
                  <div className="ingen-treff kort">
                    <p>{INGEN_TREFF}</p>
                    <Nullstill onEndre={settFilter} />
                  </div>
                )}
              </div>
              {visning === 'liste' ? (
                <ListeVisning steder={treff} utdatert={utdatert} sortering={route.sortering} onSortering={settSortering} sok={route} />
              ) : (
                <KartVisning steder={treff} sok={route} />
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
