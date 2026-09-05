import { useState } from 'react'
import { Modal } from '../Modal'

export function SaveDialog({ open, onClose, defaultName, taal, beatCount, hasExisting, onSave }) {
  const [name, setName] = useState(defaultName)
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (asNew) => {
    if (!name.trim()) return
    setError(null)
    setSubmitting(true)
    try {
      await onSave({ name: name.trim(), isPublic, asNew })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Save lehra">
      <div className="space-y-4">
        <label className="flex flex-col gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          Name
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100"
          />
        </label>

        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {taal}
          </span>
          <span className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {beatCount} beats
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Share publicly with the community
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          {hasExisting && (
            <button
              type="button"
              onClick={() => submit(true)}
              disabled={submitting}
              className="px-3 py-1.5 rounded-md border border-red-600 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
            >
              Save as new
            </button>
          )}
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={submitting}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-500 disabled:opacity-50"
          >
            {hasExisting ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
