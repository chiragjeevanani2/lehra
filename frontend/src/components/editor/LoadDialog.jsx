import { useState } from 'react'
import { Modal } from '../Modal'

export function LoadDialog({ open, onClose, savedLehras, onLoad, isAuthenticated, loading }) {
  const [query, setQuery] = useState('')

  const filtered = savedLehras.filter((l) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return l.name.toLowerCase().includes(q) || l.taal.toLowerCase().includes(q)
  })

  return (
    <Modal open={open} onClose={onClose} title="Load a lehra">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search by name or taal..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100"
        />

        <div>
          <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">My lehras</h3>
          {!isAuthenticated ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Sign in to see your saved lehras.</p>
          ) : loading ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading&hellip;</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {savedLehras.length === 0 ? 'Nothing saved yet.' : 'No matches.'}
            </p>
          ) : (
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {filtered.map((l) => (
                <li key={l.id} className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      onLoad(l)
                      onClose()
                    }}
                    className="text-left w-full"
                  >
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">{l.name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {l.taal} &middot; {l.beatCount} beats
                      {l.forkedFrom && ' · forked'}
                      {' · '}
                      {l.isPublic ? 'public' : 'private'}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Community</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Browsing and forking public lehras from other musicians is coming next.
          </p>
        </div>
      </div>
    </Modal>
  )
}
