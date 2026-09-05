import { useCallback, useState } from 'react'

const MAX_HISTORY = 100

// Generic undo/redo stack. `set` records the previous value before applying
// an update; `undo`/`redo` walk that stack. Pass `{ record: false }` for
// updates that shouldn't create an undo step (e.g. loading a fresh lehra).
export function useHistoryState(initial) {
  const [present, setPresent] = useState(initial)
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])

  const set = useCallback(
    (updater, { record = true } = {}) => {
      const next = typeof updater === 'function' ? updater(present) : updater
      if (next === present) return
      if (record) {
        setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), present])
        setFuture([])
      }
      setPresent(next)
    },
    [present],
  )

  const undo = useCallback(() => {
    if (past.length === 0) return
    const prevState = past[past.length - 1]
    setPast(past.slice(0, -1))
    setFuture([present, ...future])
    setPresent(prevState)
  }, [past, present, future])

  const redo = useCallback(() => {
    if (future.length === 0) return
    const nextState = future[0]
    setFuture(future.slice(1))
    setPast([...past, present])
    setPresent(nextState)
  }, [past, present, future])

  const reset = useCallback((value) => {
    setPresent(value)
    setPast([])
    setFuture([])
  }, [])

  return {
    present,
    set,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}
