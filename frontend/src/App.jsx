import { useState, useEffect } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import { useAuth } from './hooks/useAuth'
import { DarkModeToggle } from './components/DarkModeToggle'
import { PlaybackScreen } from './components/PlaybackScreen'
import { LehraEditor } from './components/editor/LehraEditor'
import { AuthWidget } from './components/AuthWidget'
import { AuthDialog } from './components/AuthDialog'

const TABS = [
  { id: 'playback', label: 'Playback' },
  { id: 'editor', label: 'Editor' },
]

function App() {
  const { theme, toggle } = useDarkMode()
  const { user } = useAuth()
  const [tab, setTab] = useState('playback')
  const [authModalOpen, setAuthModalOpen] = useState(!user)

  // Automatically prompt for login if user is not authenticated
  useEffect(() => {
    if (!user) {
      setAuthModalOpen(true)
    } else {
      setAuthModalOpen(false)
    }
  }, [user])

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f4f6fb] dark:bg-[#0c0e16] text-neutral-900 dark:text-neutral-100 transition-colors flex flex-col">
      <header className="sticky top-0 z-30 w-full max-w-full bg-white/80 dark:bg-[#0f1017]/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 font-bold text-base">
              L
            </div>
            <span className="font-semibold tracking-tight text-neutral-800 dark:text-neutral-100 text-base sm:text-lg">
              Lehra Flow
            </span>
          </div>

          <nav className="flex items-center p-1 rounded-full recessed-box order-3 sm:order-2 w-full sm:w-auto justify-center">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (!user) {
                    setAuthModalOpen(true)
                  } else {
                    setTab(t.id)
                  }
                }}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  !user
                    ? 'opacity-50 text-neutral-400 dark:text-neutral-500 cursor-pointer hover:opacity-80'
                    : tab === t.id
                    ? 'bg-red-600 text-white shadow-sm cursor-pointer'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer'
                }`}
                title={!user ? 'Sign in required' : undefined}
              >
                <span>{t.label}</span>
                {!user && (
                  <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 order-2 sm:order-3 shrink-0">
            <AuthWidget onOpenAuth={() => setAuthModalOpen(true)} />
            <DarkModeToggle theme={theme} onToggle={toggle} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full min-w-0">
        {!user ? (
          <div className="max-w-lg mx-auto mt-8 sm:mt-14 text-center px-4">
            <div className="neumorphic-card p-8 sm:p-10 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-500/25 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-3">
                Authentication Required
              </h1>
              
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-7 max-w-sm mx-auto leading-relaxed">
                Lehra Flow is protected. Sign in or create a free account to unlock Indian classical lehras, tempo and pitch controls, and the sequence editor.
              </p>

              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-red-600 hover:bg-red-500 active:scale-98 text-white font-semibold text-sm shadow-lg shadow-red-500/30 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Sign in / Register to Continue</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
                <div className="p-2">
                  <div className="text-red-500 text-lg mb-1">🎵</div>
                  <div className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">20+ Lehras</div>
                </div>
                <div className="p-2">
                  <div className="text-red-500 text-lg mb-1">⚡</div>
                  <div className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">BPM & Pitch</div>
                </div>
                <div className="p-2">
                  <div className="text-red-500 text-lg mb-1">🎼</div>
                  <div className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Custom Editor</div>
                </div>
              </div>
            </div>
          </div>
        ) : tab === 'playback' ? (
          <PlaybackScreen onOpenEditor={() => setTab('editor')} />
        ) : (
          <LehraEditor onBack={() => setTab('playback')} />
        )}
      </main>

      <AuthDialog open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}

export default App
