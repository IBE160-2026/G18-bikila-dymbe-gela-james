import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './App.css'
import './styles/filter.css'
import App from './App'
import { lastLeaflet } from './components/lastLeaflet'
import { forhandslastSteder } from './hooks/useSteder'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element in index.html')

// SM-12: start the data file and Leaflet now, in parallel with React, instead of after the first render.
// Both are loaded once and reused by useSteder and the map. A failed Leaflet load is shown by the map.
forhandslastSteder()
lastLeaflet().catch(() => {})

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
