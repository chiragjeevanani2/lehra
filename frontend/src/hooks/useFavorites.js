import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import * as favoritesApi from '../api/favorites'

export function useFavorites() {
  const { token } = useAuth()
  const [rawFavorites, setRawFavorites] = useState([])
  const [resolvedToken, setResolvedToken] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    favoritesApi
      .listFavorites(token)
      .then((data) => {
        if (cancelled) return
        setRawFavorites(data)
        setResolvedToken(token)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setResolvedToken(token)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const favorites = token ? rawFavorites : []
  const loading = !!token && resolvedToken !== token

  const addFavorite = async (favorite) => {
    const created = await favoritesApi.createFavorite(favorite, token)
    setRawFavorites((prev) => [created, ...prev])
  }

  const removeFavorite = async (id) => {
    await favoritesApi.deleteFavorite(id, token)
    setRawFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  return { favorites, addFavorite, removeFavorite, error, setError, loading, isAuthenticated: !!token }
}
