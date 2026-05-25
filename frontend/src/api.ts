import type { ApiResponse } from './types'

let baseUrl = 'http://localhost:3000'
let token = ''

export function setBaseUrl(url: string) {
  baseUrl = url.replace(/\/+$/, '')
}

export function getBaseUrl() {
  return baseUrl
}

export function setToken(t: string) {
  token = t
}

export function getToken() {
  return token
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

export async function apiRequest(
  method: string,
  path: string,
  body: unknown = null,
): Promise<ApiResponse> {
  const url = `${baseUrl}${path}`
  const opts: RequestInit = { method, headers: headers() }
  if (body !== null) opts.body = JSON.stringify(body)

  const start = performance.now()
  try {
    const resp = await fetch(url, opts)
    const text = await resp.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
    const elapsed = ((performance.now() - start) / 1000).toFixed(2)
    return {
      status: resp.status,
      statusText: resp.statusText,
      data,
      error: null,
      elapsed,
    }
  } catch (e) {
    const elapsed = ((performance.now() - start) / 1000).toFixed(2)
    return {
      status: 0,
      statusText: 'Network Error',
      data: null,
      error: (e as Error).message,
      elapsed,
    }
  }
}
