import { useState } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import { useSavedLehras } from '../hooks/useSavedLehras'
import { useLehraEngine } from '../hooks/useLehraEngine'
import { INSTRUMENT_LIST, INSTRUMENTS } from '../audio/instruments'
import { PRESET_LEHRAS } from '../audio/lehraPatterns'
import { CustomDropdown } from './CustomDropdown'
import { TANPURA_SCALE_OPTIONS } from '../audio/tanpura'
import { AuthDialog } from './AuthDialog'
import { ErrorBanner } from './ErrorBanner'

export function PlaybackScreen({ onOpenEditor }) {
  const {
    favorites,
    addFavorite,
    removeFavorite,
    error: favoritesError,
    setError: setFavoritesError,
    loading: favoritesLoading,
    isAuthenticated: hasAuth,
  } = useFavorites()
  const { lehras: savedLehras } = useSavedLehras()
  const engine = useLehraEngine()
  const [authOpen, setAuthOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)

  const handleSaveFavorite = async () => {
    if (!hasAuth) {
      setAuthOpen(true)
      return
    }
    try {
      await addFavorite({
        instrumentId: engine.instrumentId,
        variant: engine.variant,
        bpm: engine.bpm,
        semitones: engine.semitones,
        rootNote: engine.rootNote,
        lehraName: engine.lehra.name,
      })
    } catch (err) {
      setFavoritesError(err.message)
    }
  }

  const handleRemoveFavorite = async (id) => {
    try {
      await removeFavorite(id)
    } catch (err) {
      setFavoritesError(err.message)
    }
  }

  const handleLoadFavorite = (fav) => {
    engine.setInstrumentId(fav.instrumentId)
    engine.setVariant(fav.variant ?? 'dry')
    engine.setBpm(fav.bpm)
    const delta = fav.semitones - engine.semitones
    if (delta !== 0) engine.shiftSemitone(delta)
  }

  const beatCount = engine.lehra.beatCount || 16
  const currentBeat = Math.floor(engine.currentStep / (engine.lehra.subdivision || 1)) + 1

  return (
    <div className="space-y-6">
      <ErrorBanner message={favoritesError} onDismiss={() => setFavoritesError(null)} />

      {/* Main 3-Column Layout Matching Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full min-w-0">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="order-2 lg:order-1 lg:col-span-4 space-y-4 w-full min-w-0">
          {/* Choose Lehra Card */}
          <div className="soft-card p-5 rounded-3xl transition-all">
            <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
              Choose lehra
            </label>
            <CustomDropdown
              value={engine.currentLehra?.id || 'preset-teentaal'}
              onChange={(id) => {
                const foundSaved = savedLehras.find((s) => s.id === id)
                if (foundSaved) {
                  engine.setCurrentLehra(foundSaved)
                  return
                }
                const foundPreset = PRESET_LEHRAS.find((p) => p.id === id)
                if (foundPreset) {
                  engine.setCurrentLehra(foundPreset)
                }
              }}
              options={[
                ...(savedLehras.length > 0
                  ? [
                      {
                        group: 'My Saved Lehras',
                        items: savedLehras.map((s) => ({
                          id: s.id,
                          label: s.name,
                          sub: `${s.taal} · ${s.beatCount} beats (Custom)`,
                          icon: '🎼',
                        })),
                      },
                    ]
                  : []),
                {
                  group: 'Classical Presets',
                  items: PRESET_LEHRAS.map((p) => ({
                    id: p.id,
                    label: p.name,
                    sub: `${p.taal} · ${p.beatCount} beats`,
                    icon: '🎵',
                  })),
                },
              ]}
              placeholder="Select Lehra..."
              className="w-full"
              triggerClassName="w-full justify-between"
              menuWidth="w-full"
            />
          </div>

          {/* Instrument & Instrument Volume Card */}
          <div className="soft-card p-5 rounded-3xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                Instrument
              </label>
              <CustomDropdown
                value={engine.instrumentId}
                onChange={(id) => engine.setInstrumentId(id)}
                options={INSTRUMENT_LIST}
                className="w-full"
                triggerClassName="w-full justify-between"
                menuWidth="w-full"
              />
            </div>

            {/* Instrument Volume Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-medium text-neutral-600 dark:text-neutral-400">Instrument volume</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{engine.instrumentVolume}%</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={engine.instrumentVolume}
                  onChange={(e) => engine.setInstrumentVolume(Number(e.target.value))}
                  className="w-full h-2 rounded-lg cursor-pointer bg-neutral-200 dark:bg-neutral-800"
                />
              </div>
            </div>

            {/* Tone Dry/Wet toggle */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Reverb Tone</span>
              <div className="inline-flex rounded-full p-0.5 recessed-box">
                {['dry', 'wet'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => engine.setVariant(mode)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all cursor-pointer ${
                      engine.variant === mode
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Root Note Card */}
          <div className="soft-card p-5 rounded-3xl flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                Root note
              </label>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{engine.rootNote}</span>
                <span className="text-xs text-neutral-400">
                  {engine.semitones > 0 ? `+${engine.semitones}` : engine.semitones} st
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => engine.shiftSemitone(-1)}
                disabled={engine.semitones <= -12}
                className="soft-btn h-9 w-9 rounded-2xl flex items-center justify-center text-lg font-semibold text-neutral-700 dark:text-neutral-200 disabled:opacity-30 cursor-pointer"
                aria-label="Lower pitch"
              >
                &minus;
              </button>
              <button
                type="button"
                onClick={() => engine.shiftSemitone(1)}
                disabled={engine.semitones >= 12}
                className="soft-btn h-9 w-9 rounded-2xl flex items-center justify-center text-lg font-semibold text-neutral-700 dark:text-neutral-200 disabled:opacity-30 cursor-pointer"
                aria-label="Raise pitch"
              >
                +
              </button>
            </div>
          </div>

          {/* BPM / Tempo Card */}
          <div className="soft-card p-5 rounded-3xl flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                BPM / tempo
              </label>
              <div className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{engine.bpm}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => engine.setBpm(Math.max(40, engine.bpm - 5))}
                disabled={engine.bpm <= 40}
                className="soft-btn h-9 w-9 rounded-2xl flex items-center justify-center text-lg font-semibold text-neutral-700 dark:text-neutral-200 disabled:opacity-30 cursor-pointer"
                aria-label="Decrease BPM"
              >
                &minus;
              </button>
              <button
                type="button"
                onClick={() => engine.setBpm(Math.min(220, engine.bpm + 5))}
                disabled={engine.bpm >= 220}
                className="soft-btn h-9 w-9 rounded-2xl flex items-center justify-center text-lg font-semibold text-neutral-700 dark:text-neutral-200 disabled:opacity-30 cursor-pointer"
                aria-label="Increase BPM"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* ================= CENTER COLUMN (HERO PLAYER) ================= */}
        <div className="order-1 lg:order-2 lg:col-span-5 space-y-4 w-full min-w-0">
          <div className="soft-card rounded-3xl p-5 sm:p-8 flex flex-col items-center justify-between min-h-[380px] sm:min-h-[440px] relative text-center">
            {/* Ambient Background Aura */}
            {engine.isPlaying && (
              <div className="absolute inset-0 rounded-3xl bg-radial from-red-500/10 via-transparent to-transparent pointer-events-none animate-pulse" />
            )}

            {/* Current Lehra Header in Center Card */}
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                {engine.lehra.name} : {beatCount} beat
              </h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                {engine.lehra.taal} &middot; Root {engine.rootNote} &middot; {engine.bpm} BPM
              </p>
            </div>

            {/* Giant Elevated Play Button */}
            <div className="my-4 sm:my-6 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => (engine.isPlaying ? engine.pause() : engine.play())}
                disabled={engine.instrumentLoading || (engine.tanpuraOn && engine.tanpuraLoading)}
                aria-label={engine.isPlaying ? 'Pause lehra' : 'Play lehra'}
                className="hero-play-btn w-36 h-36 sm:w-48 sm:h-48 rounded-full flex items-center justify-center cursor-pointer relative group focus:outline-none"
              >
                {engine.isPlaying ? (
                  <svg className="w-16 h-16 text-red-600 fill-current drop-shadow-sm transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 text-red-600 fill-current ml-2 drop-shadow-sm transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
                {/* Active audio pulse ring */}
                {engine.isPlaying && (
                  <span className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping pointer-events-none" />
                )}
              </button>
              <div className="mt-5">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 tracking-wide">
                  {engine.isPlaying ? 'Playing • Tap to pause' : 'Tap to play'}
                </span>
              </div>
            </div>

            {/* Bottom Embedded Tanpura Controller inside Hero Card */}
            <div className="w-full recessed-box rounded-2xl p-4 space-y-3.5 text-left">
              {/* Top Row: Play/Active toggle, String tuning, Volume */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 tracking-wide uppercase">Tanpura</span>
                  <button
                    type="button"
                    onClick={() => engine.toggleTanpura()}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      engine.isTanpuraPlaying
                        ? 'bg-red-600 text-white shadow-md shadow-red-500/25 ring-2 ring-red-500/30'
                        : 'soft-btn text-neutral-700 dark:text-neutral-200 hover:border-red-400 hover:text-red-600'
                    }`}
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      {engine.isTanpuraPlaying ? (
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      ) : (
                        <path d="M8 5v14l11-7z" />
                      )}
                    </svg>
                    <span>{engine.isTanpuraPlaying ? 'Active' : 'Play'}</span>
                  </button>

                  {/* 1st String Tuning: Pa, Ma, Ni */}
                  <div className="flex items-center p-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800/80 text-[10px] font-bold">
                    {[
                      { id: 'pa', label: 'Pa' },
                      { id: 'ma', label: 'Ma' },
                      { id: 'ni', label: 'Ni' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => engine.setTanpuraTuning(t.id)}
                        className={`px-2.5 py-0.5 rounded-full uppercase transition-all cursor-pointer ${
                          engine.tanpuraTuning === t.id
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                        title={`1st String Tuning: ${t.label}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2.5 w-full sm:w-44 ml-auto">
                  <span className="text-xs text-neutral-400 font-medium">Vol</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={engine.tanpuraVolume}
                    onChange={(e) => engine.setTanpuraVolume(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg cursor-pointer bg-neutral-200 dark:bg-neutral-800"
                  />
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 w-8 text-right tabular-nums">
                    {engine.tanpuraVolume}%
                  </span>
                </div>
              </div>

              {/* Bottom Row: Scale Selector & Active Drone Status */}
              <div className="pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Scale:</span>
                  <CustomDropdown
                    value={engine.tanpuraScale}
                    onChange={(val) => engine.setTanpuraScale(val)}
                    options={TANPURA_SCALE_OPTIONS}
                    placeholder="Scale..."
                    menuWidth="w-72"
                    dropUp={true}
                    triggerClassName="h-8 px-3 text-xs font-semibold rounded-full"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                  <span>Drone:</span>
                  <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200/60 dark:border-red-900/60 px-2 py-0.5 rounded-md text-[11px]">
                    {engine.effectiveTanpuraRoot} ({engine.tanpuraTuning.toUpperCase()})
                  </span>
                  {engine.isTanpuraPlaying && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Drone Playing" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (BEATS & CREATE OWN LEHRA) ================= */}
        <div className="order-3 lg:order-3 lg:col-span-3 space-y-4 w-full min-w-0">
          {/* Beats Tracker Card */}
          <div className="soft-card p-4 sm:p-6 rounded-3xl min-h-[180px] sm:min-h-[200px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Beats
              </h3>
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                {beatCount}
              </span>
            </div>

            {/* Rhythm Beat Dots / Numbers Visualizer */}
            <div className="my-auto py-2">
              <div className="grid grid-cols-4 gap-2 text-center">
                {Array.from({ length: Math.min(beatCount, 16) }, (_, i) => {
                  const b = i + 1
                  const isActive = engine.isPlaying && currentBeat === b
                  const isSam = b === 1 // The 'Sam' in Indian Classical music is the first and heaviest beat
                  return (
                    <div
                      key={b}
                      className={`h-10 rounded-xl flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? 'bg-red-600 text-white font-bold scale-105 shadow-md shadow-red-500/30 ring-2 ring-red-400'
                          : isSam
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold border border-red-200/60 dark:border-red-800/40'
                          : 'recessed-box text-neutral-500 dark:text-neutral-400 text-xs'
                      }`}
                    >
                      <span className="text-xs">{b}</span>
                      {isSam && <span className="text-[9px] uppercase tracking-tighter -mt-0.5">Sam</span>}
                    </div>
                  )
                })}
              </div>
              {beatCount > 16 && (
                <p className="text-[11px] text-neutral-400 text-center mt-2">
                  Showing 16 of {beatCount} beats
                </p>
              )}
            </div>

            <div className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span>Current Matra:</span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {engine.isPlaying ? currentBeat : 'Ready'}
              </span>
            </div>
          </div>

          {/* Create Own Lehra CTA Card */}
          <div
            onClick={onOpenEditor}
            className="group relative cursor-pointer overflow-hidden rounded-3xl p-6 transition-all duration-300 bg-gradient-to-br from-red-50 via-white to-red-100/60 dark:from-[#1c1315] dark:via-[#151318] dark:to-[#221518] border border-red-200/70 dark:border-red-800/40 shadow-sm hover:shadow-xl hover:shadow-red-500/10 hover:border-red-400 min-h-[160px] flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-red-600 dark:text-red-400 mb-3 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              Create own lehra
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-[180px]">
              Design custom rhythmic patterns on the sequencer
            </p>
          </div>

          {/* Quick Favorites Drawer Opener */}
          <div className="soft-card p-4 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>Saved Presets ({favorites.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveFavorite}
                className="text-xs px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 font-medium hover:bg-red-100 dark:hover:bg-red-900 transition-colors cursor-pointer"
              >
                + Save current
              </button>
              <button
                type="button"
                onClick={() => setFavoritesOpen(!favoritesOpen)}
                className="soft-btn text-xs px-2.5 py-1 rounded-full text-neutral-600 dark:text-neutral-300 cursor-pointer"
              >
                {favoritesOpen ? 'Hide' : 'View'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Favorites Drawer */}
      {favoritesOpen && (
        <div className="soft-card rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
            Your Saved Presets
          </h3>
          {!hasAuth ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Sign in to sync your favorite speed, pitch, and instrument presets across devices.
            </p>
          ) : favoritesLoading ? (
            <p className="text-sm text-neutral-500">Loading presets&hellip;</p>
          ) : favorites.length === 0 ? (
            <p className="text-sm text-neutral-500">No saved presets yet. Click "+ Save current" above to save one!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="recessed-box rounded-2xl p-3 flex items-center justify-between hover:border-red-300 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleLoadFavorite(fav)}
                    className="text-left flex-1 cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-neutral-800 dark:text-neutral-100">
                      {INSTRUMENTS[fav.instrumentId]?.label ?? fav.instrumentId}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {fav.rootNote} &middot; {fav.bpm} BPM
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFavorite(fav.id)}
                    className="text-neutral-400 hover:text-red-500 text-sm ml-2 cursor-pointer p-1"
                    title="Delete preset"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
