import { useState, useCallback } from 'react'
import ConfigBar from './components/ConfigBar'
import EndpointCard from './components/EndpointCard'
import { MODULES } from './data/endpoints'

export default function App() {
  const [activeTab, setActiveTab] = useState(MODULES[0]?.id ?? '')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTokenChange = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  const activeModule = MODULES.find(m => m.id === activeTab)

  return (
    <div className="container">
      <h1>StockMaster — CORS Test</h1>
      <p className="subtitle">Panel de prueba para verificar endpoints REST y configuración CORS</p>

      <ConfigBar onTokenChange={handleTokenChange} key={refreshKey} />

      <div className="nav-tabs">
        {MODULES.map(m => (
          <button key={m.id} className={activeTab === m.id ? 'active' : ''} onClick={() => setActiveTab(m.id)}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid">
        {activeModule?.endpoints.map((ep, i) => (
          <EndpointCard key={`${activeModule.id}-${i}`} endpoint={ep} index={i} />
        ))}
      </div>
    </div>
  )
}
