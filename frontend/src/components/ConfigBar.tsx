import { useState } from 'react'
import { setBaseUrl, setToken, getToken, getBaseUrl } from '../api'

export default function ConfigBar({ onTokenChange }: { onTokenChange: () => void }) {
  const [url, setUrl] = useState(getBaseUrl())
  const [tok, setTok] = useState(getToken())

  function handleUrlChange(v: string) {
    setUrl(v)
    setBaseUrl(v)
  }

  function handleTokenChange(v: string) {
    setTok(v)
    setToken(v)
    onTokenChange()
  }

  function clear() {
    setTok('')
    setToken('')
    onTokenChange()
  }

  const authed = !!tok

  return (
    <div className="config-bar">
      <label>
        Backend URL
        <input value={url} onChange={e => handleUrlChange(e.target.value)} placeholder="http://localhost:3000" />
      </label>
      <label>
        Token
        <input
          value={tok}
          onChange={e => handleTokenChange(e.target.value)}
          placeholder="Pegar token JWT..."
          style={{ minWidth: 320 }}
        />
      </label>
      <button className="btn btn-ghost btn-sm" onClick={clear}>
        Limpiar
      </button>
      <div className="auth-status">
        <span className={`dot ${authed ? 'green' : 'red'}`} />
        <span>{authed ? `Autenticado (${tok.slice(0, 20)}...)` : 'No autenticado'}</span>
      </div>
    </div>
  )
}
