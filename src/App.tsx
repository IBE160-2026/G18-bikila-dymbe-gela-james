import DemoBanner from './components/DemoBanner'
import Lenke from './components/Lenke'
import { useSteder, type StederResult } from './hooks/useSteder'
import { useRoute, type Route } from './lib/router'
import IkkeFunnet from './pages/IkkeFunnet'
import Sted from './pages/Sted'
import Utforsk from './pages/Utforsk'

function Innhold({ result, route }: { result: StederResult | null; route: Route }) {
  if (route.name === 'ikke-funnet') return <IkkeFunnet melding="Fant ikke siden" />
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
    return <Utforsk steder={result.data.steder} utdatert={result.utdatert} visning={route.visning} />
  }
  // NFR-3: a place removed for being older than 12 h says so, instead of "not found".
  if (result.fjernet.has(route.id)) return <IkkeFunnet melding="Dataene for dette stedet er for gamle til å vises" />
  const sted = result.data.steder.find(({ id }) => id === route.id)
  if (!sted) return <IkkeFunnet melding="Fant ikke stedet" />
  return <Sted sted={sted} utdatert={result.utdatert.has(sted.id)} />
}

/** The shell's rendering, kept pure so it can be tested without a browser. `null` means loading. */
export function AppView({ result, route }: { result: StederResult | null; route: Route }) {
  return (
    <>
      <header className="app-header">
        <Lenke to={{ name: 'utforsk', visning: 'kart' }} className="app-title">
          SnowFinder
        </Lenke>
      </header>
      {result?.status === 'ok' && result.data.mode === 'demo' && <DemoBanner />}
      <main className="app">
        <Innhold result={result} route={route} />
      </main>
    </>
  )
}

export default function App() {
  return <AppView result={useSteder()} route={useRoute()} />
}
