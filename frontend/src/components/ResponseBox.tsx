import type { ApiResponse } from '../types'

interface Props {
  response: ApiResponse | null
  loading: boolean
  label: string
}

function statusClass(status: number) {
  if (status >= 200 && status < 300) return 'status-2xx'
  if (status >= 400 && status < 500) return 'status-4xx'
  if (status >= 500) return 'status-5xx'
  return 'status-0'
}

export default function ResponseBox({ response, loading, label }: Props) {
  if (!response && !loading) return null

  return (
    <div className="response-box">
      <div className="resp-header">
        <span>{label}</span>
        <span className={`status-code ${response ? statusClass(response.status) : 'status-0'}`}>
          {loading ? '⏳' : `${response!.status} ${response!.statusText} (${response!.elapsed}s)`}
        </span>
      </div>
      <pre className="resp-body">
        {loading
          ? 'Esperando respuesta...'
          : response!.error
            ? `🌐 CORS / Network Error: ${response!.error}`
            : JSON.stringify(response!.data, null, 2)}
      </pre>
    </div>
  )
}
