// In dev, Vite proxies relative /api calls to the local backend (vite.config.js).
// In production the frontend and backend are deployed separately, so this
// needs to point at wherever the backend actually lives.
const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`)
  }
  return data
}
