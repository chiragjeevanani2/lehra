import { apiFetch } from './client'

export function listLehras(params = {}, token) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ).toString()
  return apiFetch(`/lehras${qs ? `?${qs}` : ''}`, { token })
}

export const getLehra = (id, token) => apiFetch(`/lehras/${id}`, { token })
export const createLehra = (payload, token) => apiFetch('/lehras', { method: 'POST', body: payload, token })
export const updateLehra = (id, payload, token) => apiFetch(`/lehras/${id}`, { method: 'PUT', body: payload, token })
export const forkLehra = (id, payload, token) =>
  apiFetch(`/lehras/${id}/fork`, { method: 'POST', body: payload ?? {}, token })
