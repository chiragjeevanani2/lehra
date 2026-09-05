import { apiFetch } from './client'

export const listFavorites = (token) => apiFetch('/favorites', { token })
export const createFavorite = (payload, token) => apiFetch('/favorites', { method: 'POST', body: payload, token })
export const deleteFavorite = (id, token) => apiFetch(`/favorites/${id}`, { method: 'DELETE', token })
