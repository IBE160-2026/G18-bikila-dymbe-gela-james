import { useEffect, useState } from 'react'
import DemoBanner from './components/DemoBanner'
import { loadPublishedData, type LoadResult } from './lib/data/loadPublishedData'

/** The shell's rendering, kept pure so it can be tested without a browser. `null` means loading. */
export function AppView({ result }: { result: LoadResult | null }) {
  return (
    <>
      <header className="app-header">
        <h1 className="app-title">SnowFinder</h1>
      </header>
      {result?.status === 'ok' && result.data.mode === 'demo' && <DemoBanner />}
      <main className="app">
        {result === null && (
          <div className="skeleton" role="status">
            <span className="visually-hidden">Laster stedsdata</span>
          </div>
        )}
        {result?.status === 'error' && (
          <p className="error" role="alert">
            {result.message}
          </p>
        )}
        {result?.status === 'ok' && <p>{result.data.steder.length} steder lastet</p>}
      </main>
    </>
  )
}

// A minimal shell until Utforsk (map and list) is built in Story 1.7.
export default function App() {
  const [result, setResult] = useState<LoadResult | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadPublishedData(undefined, import.meta.env.BASE_URL).then((loaded) => {
      if (!cancelled) setResult(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return <AppView result={result} />
}
