import { useState } from 'react'
import { Modal } from './Modal'
import { useAuth } from '../hooks/useAuth'

export function AuthDialog({ open, onClose }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(username, email, password)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === 'login' ? 'Sign in' : 'Create an account'}>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'register' && (
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Username
            <input
              type="text"
              required
              minLength={3}
              value={username}
              placeholder="e.g. classical_artist"
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border border-neutral-300/90 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-900/60 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          Email
          <input
            type="email"
            required
            value={email}
            placeholder="name@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-neutral-300/90 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-900/60 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            placeholder="At least 8 characters"
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-neutral-300/90 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-900/60 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </label>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-medium text-red-600 dark:text-red-400 leading-relaxed">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError(null)
            }}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-full bg-red-600 text-white text-xs sm:text-sm font-semibold hover:bg-red-500 active:scale-98 disabled:opacity-50 shadow-md shadow-red-500/25 cursor-pointer transition-all"
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Register'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
