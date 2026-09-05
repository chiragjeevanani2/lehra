import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import * as lehrasApi from '../api/lehras'

// Notes round-trip through the backend as plain {step, semitone} pairs;
// the editor's local `id` (used for React keys and undo/redo) is added
// back in on load and stripped on the way out.
const toLocalNotes = (notes) => notes.map((n) => ({ id: crypto.randomUUID(), step: n.step, semitone: n.semitone }))
const toApiNotes = (notes) => notes.map(({ step, semitone }) => ({ step, semitone }))

function toLocalLehra(record) {
  return { ...record, notes: toLocalNotes(record.notes) }
}

export function useSavedLehras() {
  const { token, user } = useAuth()
  const [rawLehras, setRawLehras] = useState([])
  const [resolvedToken, setResolvedToken] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    lehrasApi
      .listLehras({ mine: 'true' }, token)
      .then((data) => {
        if (cancelled) return
        setRawLehras(data.map(toLocalLehra))
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

  const lehras = token ? rawLehras : []
  const loading = !!token && resolvedToken !== token

  const saveLehra = async (payload) => {
    const created = await lehrasApi.createLehra({ ...payload, notes: toApiNotes(payload.notes) }, token)
    const record = toLocalLehra(created)
    setRawLehras((prev) => [record, ...prev])
    return record
  }

  const updateLehra = async (id, payload) => {
    const updated = await lehrasApi.updateLehra(id, { ...payload, notes: toApiNotes(payload.notes) }, token)
    const record = toLocalLehra(updated)
    setRawLehras((prev) => prev.map((l) => (l.id === id ? record : l)))
    return record
  }

  return {
    lehras,
    saveLehra,
    updateLehra,
    error,
    setError,
    loading,
    isAuthenticated: !!token,
    username: user?.username,
  }
}
