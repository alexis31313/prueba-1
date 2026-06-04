import { useState, useCallback } from 'react'
import type { EndpointDef, ApiResponse } from '../types'
import { apiRequest, getBaseUrl } from '../api'
import ResponseBox from './ResponseBox'

interface Props {
  endpoint: EndpointDef
  index: number
}

function toNumber(v: string) {
  return v === '' ? v : isNaN(Number(v)) ? v : Number(v)
}

export default function EndpointCard({ endpoint }: Props) {
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const ep = endpoint

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    ep.fields?.forEach(f => {
      if (f.val !== undefined) init[f.name] = f.val
      else init[f.name] = ''
    })
    return init
  })

  const updateField = useCallback((name: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [name]: value }))
  }, [])

  async function handleCall() {
    setLoading(true)
    setResponse(null)

    let path = ep.path
    const body: Record<string, unknown> = {}

    for (const [name, val] of Object.entries(fieldValues)) {
      const trimmed = val.trim()
      if (path.includes(`:${name}`)) {
        path = path.replace(`:${name}`, trimmed)
      } else if (trimmed) {
        body[name] = toNumber(trimmed)
      }
    }

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(ep.method)
    const result = await apiRequest(ep.method, path, hasBody ? body : null)
    setResponse(result)
    setLoading(false)

    if (ep.onSuccess && result.status >= 200 && result.status < 300 && !result.error) {
      ep.onSuccess(result.data)
    }
  }

  function handleFieldChange(name: string, value: string) {
    updateField(name, value)
  }

  const epLabel = `${ep.method} ${ep.path}`
  const btnClass =
    ep.method === 'DELETE'
      ? 'btn-danger'
      : ep.method === 'POST' || ep.method === 'PUT' || ep.method === 'PATCH'
        ? 'btn-success'
        : 'btn-primary'

  return (
    <div className="card">
      <div className="card-header">
        {epLabel}
        {ep.raw && <span className="badge">raw</span>}
      </div>
      <div className="card-body">
        {ep.desc && <p className="desc">{ep.desc}</p>}
        {ep.fields && (
          <div className="form-row">
            {ep.fields.map(f =>
              f.type === 'select' ? (
                <select
                  key={f.name}
                  value={fieldValues[f.name] || ''}
                  onChange={e => handleFieldChange(f.name, e.target.value)}
                >
                  {f.opts?.map(o => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  key={f.name}
                  type={f.type || 'text'}
                  placeholder={f.ph || ''}
                  value={fieldValues[f.name] || ''}
                  onChange={e => handleFieldChange(f.name, e.target.value)}
                />
              ),
            )}
          </div>
        )}
        <div className="actions">
          <button className={`btn ${btnClass} btn-sm`} onClick={handleCall} disabled={loading}>
            {ep.method}
          </button>
          {ep.raw && (
            <button className="btn btn-warning btn-sm" onClick={() => window.open(`${getBaseUrl()}${ep.path}`, '_blank')}>
              Abrir
            </button>
          )}
        </div>
        <ResponseBox response={response} loading={loading} label={epLabel} />
      </div>
    </div>
  )
}
