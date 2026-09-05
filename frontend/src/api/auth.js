import { apiFetch } from './client'

export const register = (username, email, password) =>
  apiFetch('/auth/register', { method: 'POST', body: { username, email, password } })

export const login = (email, password) => apiFetch('/auth/login', { method: 'POST', body: { email, password } })
