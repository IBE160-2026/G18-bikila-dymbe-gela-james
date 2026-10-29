import DemoBanner from './components/DemoBanner'
import GamleDataBanner from './components/GamleDataBanner'
import Toppnavigasjon from './components/Toppnavigasjon'
import { useSteder, type StederResult } from './hooks/useSteder'
import { now } from './lib/clock'
import { useRoute, type Route } from './lib/router'
import IkkeFunnet from './pages/IkkeFunnet'
import SlikBeregnerViSnowScore from './pages/SlikBeregnerViSnowScore'
import Sted from './pages/Sted'
import Utforsk, { INGEN_FERSKE } from './pages/Utforsk'

function Innhold({ result, route }: { result: StederResult | null; route: Route }) {
  if (route.name === 'ikke-funnet') return <IkkeFunnet melding="Fant ikke siden" />
  // The explanation shows at once, also while loading and when loading failed; only its quality panel uses the data.
  if (route.name === 'forklaring') return <SlikBeregnerViSnowScore result={result} />
  if (result === null) {
    // On Utforsk the skeleton takes the map's or the list's shape, so the layout does not jump when data arrives.
    const shape = route.name === 'utforsk' ? ` ${route.visning}-skeleton` : ''
    return (
      <div className={`skeleton${shape}`} role="status">
        <span className="visually-hidden">Laster stedsdata</span>
      </div>
    )
  }
  if (result.status === 'error') {
    return (
      <p className="error" role="alert">
        {result.message}
      </p>
    )
  }
  if (route.name === 'utforsk') {
    return <Utforsk steder={result.data.steder} utdatert={result.utdatert} route={route} />
  }
  // NFR-3: a place removed for being older than 12 h says so, instead of "not found".
  if (result.fjernet.has(route.id)) return <IkkeFunnet melding="Dataene for dette stedet er for gamle til å vises" sok={route.sok} />
  const sted = result.data.steder.find(({ id }) => id === route.id)
  if (!sted) return <IkkeFunnet melding="Fant ikke stedet" sok={route.sok} />
  return <Sted sted={sted} utdatert={result.utdatert.has(sted.id)} sok={route.sok} />
}

/** What the page-wide status region says; empty unless Utforsk has no places left to show. */
export function statusMelding(result: StederResult | null, route: Route): string {
  return route.name === 'utforsk' && result?.status === 'ok' && result.data.steder.length === 0 ? INGEN_FERSKE : ''
}

/** The shell's rendering, kept pure so it can be tested without a browser. `null` means loading. */
export function AppView({ result, route }: { result: StederResult | null; route: Route }) {
  return (
    <>
      <header className="app-header">
        <Toppnavigasjon route={route} />
      </header>
      {/* Story 1.6: an old data file is flagged on the pages that show its places, not on the explanation. */}
      {result?.status === 'ok' && (route.name === 'utforsk' || route.name === 'sted') && (
        <GamleDataBanner generert={result.data.generert} naa={now(result.data)} vis={result.gamleData} />
      )}
      {result?.status === 'ok' && result.data.mode === 'demo' && <DemoBanner />}
      <main className="app">
        {/* Rendered from the first paint, also while loading, so a screen reader hears the message when it
            is filled in, both when the data first arrives and when places run out on an open page. */}
        <p className="visually-hidden" role="status">
          {statusMelding(result, route)}
        </p>
        <Innhold result={result} route={route} />
      </main>
    </>
  )
}

export default function App() {
  return <AppView result={useSteder()} route={useRoute()} />
}
