import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AuthDialog } from './AuthDialog'

export function AuthWidget({ onOpenAuth }) {
  const { user, logout } = useAuth()
  const [internalOpen, setInternalOpen] = useState(false)

  const handleOpen = () => {
    if (onOpenAuth) {
      onOpenAuth()
    } else {
      setInternalOpen(true)
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span
          className="px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 shadow-xs max-w-[100px] sm:max-w-none truncate"
          title={`Signed in as ${user.username}`}
        >
          Hi {user.username}
        </span>
        <button
          type="button"
          onClick={logout}
          className="soft-btn px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer shrink-0"
          title="Logout"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="soft-btn px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer hover:border-red-400 hover:text-red-600"
      >
        Sign in
      </button>
      {!onOpenAuth && <AuthDialog open={internalOpen} onClose={() => setInternalOpen(false)} />}
    </>
  )
}
