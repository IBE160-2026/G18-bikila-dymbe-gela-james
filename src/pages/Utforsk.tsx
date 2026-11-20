import { useEffect, useMemo, useState } from 'react'
import type { Sted } from '../../shared/contracts/published'
import { aktiveKrav, filtrerSteder, forslagVedNullTreff, type FilterParams } from '../../shared/filter'
import BestAkkuratNaa from '../components/BestAkkuratNaa'
import FilterPanel, { antallTekst, fokuserFilteret, forslagTekst, Nullstill, NVE_MANGLER } from '../components/FilterPanel'
import KartVisning from '../components/KartVisning'
import ListeVisning from '../components/ListeVisning'
import StedSok from '../components/StedSok'
import Tegnforklaring from '../components/Tegnforklaring'
import VisningVeksler from '../components/VisningVeksler'
import { href, replace, type UrlSortering, type UtforskRoute } from '../lib/router'
import { besteSteder, type Posisjon } from '../lib/sortering'

// Story 3.6 (FR-23, NFR-Privacy): the distance filter's own position, independent of ListeVisning's for
// its distance sort. Fetched only on the user's own move of the slider (see FilterPanel), never from an
// effect on the filter or the address, so a shared `?avstand=` link never asks on its own.
const AVSTAND_POSISJON_HENTES = 'Henter posisjonen din …'
const AVSTAND_POSISJON_AVSLATT = 'Fikk ikke tilgang til posisjonen din. Avstandskravet har ingen effekt.'
const AVSTAND_POSISJON_TIMEOUT_MS = 10_000

// AD-8: one route for map and list; both show the same places from the shared useSteder() store.
export const INGEN_FERSKE = 'Ingen ferske data'
export const INGEN_STEDER = 'Ingen steder har ferske nok data akkurat nå. Last inn siden på nytt for å hente de nyeste dataene.'

/** `oppdatert` is «Oppdatert kl. 17:29» for the data file, or null when its time is invalid (no line then). */
type Props = { steder: Sted[]; utdatert: ReadonlySet<string>; route: UtforskRoute; oppdatert: string | null }

export default function Utforsk({ steder, utdatert, route, oppdatert }: Props) {
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
  // Story 1.12 (FR-33): the best three among the hits, in the list's score order, without incomplete data.
  const beste = useMemo(() => besteSteder(treff), [treff])
  // Story 3.9: the search reads every fresh place, before the filter, and only marks the ones it hides.
  const treffIds = useMemo(() => new Set(treff.map(({ id }) => id)), [treff])
  const nullTreff = treff.length === 0 ? `${antallTekst(0)}. ${forslagTekst(forslag, filter.nysnoKilde)}` : null
  // Story 3.8 (review round 1, Sena 2A): over all fresh places, not the hits, since NVE missing for the
  // whole run is what the message explains. Memoised, as it walks every place.
  const nveMangler = useMemo(() => steder.every((sted) => sted.nveNysnoSisteDognMm === null), [steder])
  // Review round 2 (Sena): the zero hits come from NVE missing only while new snow is on and NVE is the
  // source, so only then does the banner say so. Shown below 768px, where the closed sheet hides the panel's
  // own message; from 768px the panel is always open and says it already.
  const nveForklaring = nullTreff !== null && filter.nysnoKilde === 'nve' && aktiveKrav(filter).includes('minNysnoCm') && nveMangler
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
          {/* Change proposal 2026-11-18: below 768px the explanation link moved from here to the heading line of
              «Best akkurat nå» (BestAkkuratNaa), so on a phone the map gets the line it used to take. */}
          <div className="utforsk-verktoy">
            <VisningVeksler route={route} />
            {/* Review 2026-11-18: how fresh the data is, on the front page and not only on a place page. */}
            {oppdatert !== null && <p className="utforsk-oppdatert">{oppdatert}</p>}
          </div>
          {/* Story 3.9 (FR-32): between the switch and the map or list on every width, never in the sheet. */}
          <StedSok steder={steder} treffIds={treffIds} route={route} />
          <div className="utforsk">
            <FilterPanel
              params={filter}
              onEndre={settFilter}
              antall={treff.length}
              posisjonKjent={avstandPosisjon !== null}
              posisjonStatus={avstandStatus}
              beOmPosisjon={beOmAvstandPosisjon}
              nveMangler={nveMangler}
            />
            {/* Change proposal 2026-11-20 (solution 1): the modifier lets CSS put «Best akkurat nå» under the map
                below 768px. Only the visual order changes; the DOM, and so the reading order, stays the same. */}
            <div className={visning === 'liste' ? 'utforsk-resultat' : 'utforsk-resultat utforsk-resultat--kart'}>
              {/* Story 3.3 (FR-14, UX-DR4): the one live region for the hit count and the suggestion. It is
                  always rendered, so a screen reader hears each new count once; the panel and the banner only
                  show the same words. */}
              <p className="visually-hidden" role="status">
                {nullTreff ?? antallTekst(treff.length)}
              </p>
              {/* Story 1.12: at the top of the result column, between the search and the list on every width and
                  above the map from 768px. Below 768px CSS moves it under the map (change proposal 2026-11-20), so a
                  small phone sees the map above the sheet. Inside .utforsk, not above it, so the sticky bottom sheet
                  still pins to the bottom of a short phone's screen. At zero hits `beste` is empty and the zero-hit
                  card alone explains it. */}
              <BestAkkuratNaa steder={beste} filterAktiv={aktiveKrav(filter).length > 0} sok={route} />
              {/* Never an empty surface: say which requirement to ease, and offer the way back. */}
              {nullTreff && (
                <div className="ingen-treff kort">
                  <p>{nullTreff}</p>
                  {nveForklaring && <p className="ingen-treff-nve">{NVE_MANGLER}</p>}
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
                <>
                  {/* FR-12, SRS-F-15: the colour legend in a strip above the map, so it never covers a marker
                      (Finnmark is top right) or sits under the bottom sheet (review 2026-11-18). */}
                  {treff.length > 0 && <Tegnforklaring />}
                  <KartVisning steder={treff} sok={route} />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
