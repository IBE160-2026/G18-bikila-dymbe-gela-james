import DemoBanner from './components/DemoBanner'
import Lenke from './components/Lenke'
import { useSteder } from './hooks/useSteder'
import type { LoadResult } from './lib/data/loadPublishedData'
import { useRoute, type Route } from './lib/router'
import IkkeFunnet from './pages/IkkeFunnet'
import Sted from './pages/Sted'
import Utforsk from './pages/Utforsk'

function Innhold({ result, route }: { result: LoadResult | null; route: Route }) {
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
  if (route.name === 'utforsk') return <Utforsk steder={result.data.steder} visning={route.visning} />
  const sted = result.data.steder.find(({ id }) => id === route.id)
  return sted ? <Sted sted={sted} /> : <IkkeFunnet melding="Fant ikke stedet" />
}

/** The shell's rendering, kept pure so it can be tested without a browser. `null` means loading. */
export function AppView({ result, route }: { result: LoadResult | null; route: Route }) {
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
