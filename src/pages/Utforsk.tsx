import { useEffect, useMemo, useState } from 'react'
import type { Sted } from '../../shared/contracts/published'
import { filtrerSteder, forslagVedNullTreff, type FilterParams } from '../../shared/filter'
import FilterPanel, { antallTekst, fokuserFilteret, forslagTekst, Nullstill } from '../components/FilterPanel'
import KartVisning from '../components/KartVisning'
import Lenke from '../components/Lenke'
import ListeVisning from '../components/ListeVisning'
import VisningVeksler from '../components/VisningVeksler'
import { href, replace, type UrlSortering, type UtforskRoute } from '../lib/router'
import type { Posisjon } from '../lib/sortering'

// Story 3.6 (FR-23, NFR-Privacy): the distance filter's own position, independent of ListeVisning's for
// its distance sort. Fetched only on the user's own move of the slider (see FilterPanel), never from an
// effect on the filter or the address, so a shared `?avstand=` link never asks on its own.
const AVSTAND_POSISJON_HENTES = 'Henter posisjonen din …'
const AVSTAND_POSISJON_AVSLATT = 'Fikk ikke tilgang til posisjonen din. Avstandskravet har ingen effekt.'
const AVSTAND_POSISJON_TIMEOUT_MS = 10_000

// AD-8: one route for map and list; both show the same places from the shared useSteder() store.
export const INGEN_FERSKE = 'Ingen ferske data'
export const INGEN_STEDER = 'Ingen steder har ferske nok data akkurat nå. Last inn siden på nytt for å hente de nyeste dataene.'

type Props = { steder: Sted[]; utdatert: ReadonlySet<string>; route: UtforskRoute }

export default function Utforsk({ steder, utdatert, route }: Props) {
  // Story 3.2 (FR-21, AD-12): the address is the only copy of the filter and the list order, so a shared
  // link, Back from a place page and the map/list switch all show the same search. A change replaces the
  // address instead of adding a history step, so Back leaves the page rather than undoing a slider step.
  const { visning, filter } = route
  const settSortering = (sortering: UrlSortering) => replace({ ...route, sortering })
  // A link with invalid, default or non-canonical values (`?nysno=abc`, `?nysno=0`, `?temp=05`) is
  // rewritten to the address this search would have, so copying it does not share the junk again.
  useEffect(() => {
    if (href(route, import.meta.env.BASE_URL) !== window.location.pathname + window.location.search) replace(route)
  }, [route])
  // Story 3.6: the distance filter's own position, never automatic, never sent or stored (NFR-Privacy).
  const [avstandPosisjon, setAvstandPosisjon] = useState<Posisjon | null>(null)
  const [avstandStatus, setAvstandStatus] = useState('')
  const beOmAvstandPosisjon = () => {
    // Also skip while a request is already in flight, so moving the slider repeatedly before the
    // browser answers fires navigator.geolocation.getCurrentPosition once, not once per move.
    if (avstandPosisjon || avstandStatus === AVSTAND_POSISJON_HENTES) return
    if (!('geolocation' in navigator)) {
      setAvstandStatus(AVSTAND_POSISJON_AVSLATT)
      return
    }
    setAvstandStatus(AVSTAND_POSISJON_HENTES)
    // The answer can come late; by then the user may have moved the slider back to «Alle» already.
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setAvstandPosisjon({ lat: coords.latitude, lon: coords.longitude })
        setAvstandStatus((current) => (current === AVSTAND_POSISJON_HENTES ? '' : current))
      },
      () => {
        setAvstandStatus((current) => (current === AVSTAND_POSISJON_HENTES ? AVSTAND_POSISJON_AVSLATT : current))
      },
      { timeout: AVSTAND_POSISJON_TIMEOUT_MS },
    )
  }
  // Every change to the filter (slider, «Nullstill», a Hurtigvalg chip or the zero-hit suggestion) goes
  // through here, so clearing the distance status the moment the requirement goes back to «Alle» cannot
  // miss a path: otherwise a stale status text (typically the refusal explanation) would keep rendering
  // under an inactive slider.
  const settFilter = (ny: FilterParams) => {
    if (ny.maksAvstandKm === null) setAvstandStatus('')
    replace({ ...route, filter: ny })
  }
  // Places older than 12 h are already gone from `steder`; the filter only narrows what is left. Memoised,
  // so other re-renders reuse the same array. Every filter change gives a new one, and the map then
  // rebuilds all its markers while keeping its zoom and position.
  const treff = useMemo(
    () => filtrerSteder(steder, filter, avstandPosisjon ?? undefined),
    [steder, filter, avstandPosisjon],
  )
  // Story 3.3 (FR-14): at zero hits, the single requirement to ease, worked out by the same filter.
  const forslag = useMemo(
    () => (treff.length === 0 ? forslagVedNullTreff(steder, filter, avstandPosisjon ?? undefined) : null),
    [treff, steder, filter, avstandPosisjon],
  )
  const nullTreff = treff.length === 0 ? `${antallTekst(0)}. ${forslagTekst(forslag)}` : null
  // The suggestion goes the same way as a slider change, so the address is replaced as for any other step.
  const brukForslaget = () => {
    if (!forslag) return
    settFilter({ ...filter, [forslag.krav]: forslag.verdi })
    fokuserFilteret(forslag.krav)
  }

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
            <FilterPanel
              params={filter}
              onEndre={settFilter}
              antall={treff.length}
              posisjonKjent={avstandPosisjon !== null}
              posisjonStatus={avstandStatus}
              beOmPosisjon={beOmAvstandPosisjon}
            />
            <div className="utforsk-resultat">
              {/* Story 3.3 (FR-14, UX-DR4): the one live region for the hit count and the suggestion. It is
                  always rendered, so a screen reader hears each new count once; the panel and the banner only
                  show the same words. */}
              <p className="visually-hidden" role="status">
                {nullTreff ?? antallTekst(treff.length)}
              </p>
              {/* Never an empty surface: say which requirement to ease, and offer the way back. */}
              {nullTreff && (
                <div className="ingen-treff kort">
                  <p>{nullTreff}</p>
                  <div className="ingen-treff-knapper">
                    {forslag && (
                      <button type="button" className="filter-forslag" onClick={brukForslaget}>
                        Bruk forslaget
                      </button>
                    )}
                    <Nullstill onEndre={settFilter} />
                  </div>
                </div>
              )}
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
