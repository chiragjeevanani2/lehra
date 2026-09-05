import { useEffect, useState } from 'react'
import { useHistoryState } from '../../hooks/useHistoryState'
import { useSavedLehras } from '../../hooks/useSavedLehras'
import { useEditorPreview } from '../../hooks/useEditorPreview'
import { BLANK_PATTERN, convertPresetToPattern, deleteStepRange, resizePattern, shiftStepRange, toggleNote } from '../../editor/patternOps'
import { PRESET_LEHRAS } from '../../audio/lehraPatterns'
import { INSTRUMENT_LIST, INSTRUMENTS } from '../../audio/instruments'
import { QUANTIZATION_OPTIONS, TAAL_PRESETS } from '../../editor/taals'
import { SequencerGrid } from './SequencerGrid'
import { EditToolsBar } from './EditToolsBar'
import { SaveDialog } from './SaveDialog'
import { LoadDialog } from './LoadDialog'
import { AuthDialog } from '../AuthDialog'
import { CustomDropdown } from '../CustomDropdown'
import { ErrorBanner } from '../ErrorBanner'

export const INSTRUMENT_OPTIONS = [
  { id: 'harmonium', label: 'Harmonium', icon: '🎹', sub: 'Traditional Reed Key' },
  { id: 'sitar', label: 'Sitar', icon: '🪕', sub: 'Classical Plucked Strings' },
  { id: 'sarangi', label: 'Sarangi', icon: '🎻', sub: 'Bowed Classical Strings' },
  { id: 'bansuriHigh', label: 'Bansuri (High)', icon: '🪈', sub: 'High Bamboo Flute' },
  { id: 'bansuriLow', label: 'Bansuri (Low)', icon: '🪈', sub: 'Deep Bass Bamboo Flute' },
  { id: 'santur', label: 'Santur', icon: '🎼', sub: 'Hammered Dulcimer' },
  { id: 'shehnai', label: 'Shehnai', icon: '🎺', sub: 'Double-reed Woodwind' },
  { id: 'benjo', label: 'Benjo', icon: '🎸', sub: 'Folk Keyed Zither' },
  { id: 'chimta', label: 'Chimta', icon: '🥢', sub: 'Percussive Folk Tongs' },
  { id: 'tumbi', label: 'Tumbi', icon: '🪕', sub: 'High Single-string' },
]

function normalizeSelection(a, b) {
  return { start: Math.min(a, b), end: Math.max(a, b) }
}

const ROOT_NOTES = ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5']

export function LehraEditor({ onBack }) {
  const history = useHistoryState(BLANK_PATTERN)
  const pattern = history.present
  const [selection, setSelection] = useState(null)
  const [currentLehraId, setCurrentLehraId] = useState(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [toolMode, setToolMode] = useState('draw')
  const [selectedPresetId, setSelectedPresetId] = useState('')

  const [instrumentId, setInstrumentId] = useState('harmonium')
  const [variant, setVariant] = useState('dry')
  const [bpm, setBpm] = useState(100)
  const [swingPercent, setSwingPercent] = useState(0)
  const [rootNote, setRootNote] = useState('C4')

  const {
    lehras,
    saveLehra,
    updateLehra,
    error: lehrasError,
    setError: setLehrasError,
    loading: lehrasLoading,
    isAuthenticated,
  } = useSavedLehras()

  const preview = useEditorPreview(pattern, instrumentId, variant, bpm, swingPercent, rootNote)

  const hasSelection = selection != null

  const handleToggleNote = (step, semitone) => {
    history.set((p) => toggleNote(p, step, semitone))
  }

  const handleBeatsChange = (delta) => {
    const nextBeats = Math.min(64, Math.max(1, pattern.beatCount + delta))
    const matchingPreset = TAAL_PRESETS.find((t) => t.beatCount === nextBeats)
    history.set((p) => resizePattern(p, { beatCount: nextBeats, taal: matchingPreset ? matchingPreset.name : 'Custom' }))
    setSelection(null)
  }

  const handleQuantizeChange = (q) => {
    history.set((p) => resizePattern(p, { subdivision: Number(q) }))
    setSelection(null)
  }

  const handleRootChange = (delta) => {
    const idx = ROOT_NOTES.indexOf(rootNote)
    const nextIdx = Math.min(ROOT_NOTES.length - 1, Math.max(0, idx + delta))
    setRootNote(ROOT_NOTES[nextIdx])
  }

  const handleDeleteSelected = () => {
    history.set((p) => deleteStepRange(p, selection))
  }

  const handleShiftSelected = (delta) => {
    history.set((p) => shiftStepRange(p, selection, delta))
    setSelection((s) => (s ? normalizeSelection(s.start + delta, s.end + delta) : s))
  }

  const handleLoadPresetOrCopy = (presetId) => {
    if (!presetId) return
    const foundPreset = PRESET_LEHRAS.find((p) => p.id === presetId)
    if (foundPreset) {
      preview.stop()
      const newPattern = convertPresetToPattern(foundPreset)
      history.reset(newPattern)
      setSelection(null)
      setCurrentLehraId(null)
      setSelectedPresetId(presetId)

      const taalTempoMap = {
        Teentaal: 100,
        Keherwa: 115,
        Dadra: 110,
        Jhaptal: 85,
        Ektaal: 120,
        Rupak: 90,
      }
      if (taalTempoMap[foundPreset.taal]) {
        setBpm(taalTempoMap[foundPreset.taal])
      }

      // Automatically play the imported lehra pattern so user immediately hears it
      setTimeout(() => {
        preview.play()
      }, 100)
      return
    }
    const foundSaved = lehras.find((l) => l.id === presetId)
    if (foundSaved) {
      preview.stop()
      const newPattern = convertPresetToPattern(foundSaved)
      history.reset(newPattern)
      setSelection(null)
      setCurrentLehraId(null)
      setSelectedPresetId(presetId)
      setTimeout(() => {
        preview.play()
      }, 100)
    }
  }

  const handleSave = async ({ name, isPublic, asNew }) => {
    const payload = {
      name,
      taal: pattern.taal,
      beatCount: pattern.beatCount,
      subdivision: pattern.subdivision,
      notes: pattern.notes,
      isPublic,
    }
    if (!asNew && currentLehraId) {
      await updateLehra(currentLehraId, payload)
    } else {
      const record = await saveLehra(payload)
      setCurrentLehraId(record.id)
    }
    history.set((p) => ({ ...p, name }), { record: false })
  }

  const openSave = () => {
    if (!isAuthenticated) {
      setAuthOpen(true)
      return
    }
    setSaveOpen(true)
  }

  const openLoad = () => {
    if (!isAuthenticated) {
      setAuthOpen(true)
      return
    }
    setLoadOpen(true)
  }

  const handleLoad = (saved) => {
    preview.stop()
    history.reset({
      name: saved.name,
      taal: saved.taal,
      beatCount: saved.beatCount,
      subdivision: saved.subdivision,
      notes: saved.notes,
    })
    setSelection(null)
    setCurrentLehraId(saved.id)
  }

  useEffect(() => {
    function onKeyDown(e) {
      const isEditable = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
      if (isEditable) return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) history.redo()
        else history.undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        history.redo()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection) {
        e.preventDefault()
        handleDeleteSelected()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.undo, history.redo, hasSelection, selection])

  return (
    <div className="space-y-4 sm:space-y-5 w-full min-w-0">
      <ErrorBanner message={lehrasError} onDismiss={() => setLehrasError(null)} />

      {/* Top Title & Subtitle Matching Reference */}
      <div>
        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-0.5">
          Advance view
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          MIDI-style editor (4 octaves)
        </h1>
      </div>

      {/* Load Existing Lehra as Copy Full-Width Card */}
      <div className="soft-card px-4 sm:px-6 py-3.5 sm:py-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
          <label className="block text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">
            Load existing lehra as copy
          </label>
          <button
            type="button"
            onClick={() => {
              preview.stop()
              history.reset(BLANK_PATTERN)
              setSelection(null)
              setCurrentLehraId(null)
              setSelectedPresetId('')
            }}
            className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            + New Blank Pattern
          </button>
        </div>
        <CustomDropdown
          value={selectedPresetId}
          placeholder="Select a lehra to load as copy..."
          onChange={(val) => handleLoadPresetOrCopy(val)}
          options={[
            {
              group: 'Presets',
              items: PRESET_LEHRAS.map((p) => ({
                id: p.id,
                label: p.name,
                sub: `${p.taal} · ${p.beatCount} beats`,
                icon: '🎵',
              })),
            },
            ...(lehras.length > 0
              ? [
                  {
                    group: 'My Saved Lehras',
                    items: lehras.map((l) => ({
                      id: l.id,
                      label: l.name,
                      sub: `${l.taal} · ${l.beatCount} beats`,
                      icon: '💾',
                    })),
                  },
                ]
              : []),
          ]}
          className="w-full"
          triggerClassName="w-full justify-between"
          menuWidth="w-full sm:w-96"
        />
      </div>

      {/* Horizontal DAW Controls Bar (Beats, Quantize, Instrument, Root, Play, BPM, Swing, Save, Back) */}
      <div className="flex flex-wrap items-end gap-2.5 sm:gap-3.5 w-full min-w-0">
        
        {/* Beats Widget */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pl-1">Beats</span>
          <div className="neumorph-pill h-11 px-3 rounded-full flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100 w-5 text-center">
              {pattern.beatCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleBeatsChange(-1)}
                disabled={pattern.beatCount <= 1}
                className="neumorph-circle-btn h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 disabled:opacity-30 cursor-pointer"
                title="Decrease beats"
              >
                &minus;
              </button>
              <button
                type="button"
                onClick={() => handleBeatsChange(1)}
                disabled={pattern.beatCount >= 64}
                className="neumorph-circle-btn h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 disabled:opacity-30 cursor-pointer"
                title="Increase beats"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Quantize Widget */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pl-1">Quantize</span>
          <div className="neumorph-pill h-11 px-3 rounded-full flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100 w-7 text-center">
              1/{pattern.subdivision * 4}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const currIdx = QUANTIZATION_OPTIONS.indexOf(pattern.subdivision * 4)
                  if (currIdx > 0) handleQuantizeChange(QUANTIZATION_OPTIONS[currIdx - 1] / 4)
                }}
                disabled={pattern.subdivision * 4 <= 4}
                className="neumorph-circle-btn h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 disabled:opacity-30 cursor-pointer"
                title="Quantize coarser"
              >
                &minus;
              </button>
              <button
                type="button"
                onClick={() => {
                  const currIdx = QUANTIZATION_OPTIONS.indexOf(pattern.subdivision * 4)
                  if (currIdx < QUANTIZATION_OPTIONS.length - 1) handleQuantizeChange(QUANTIZATION_OPTIONS[currIdx + 1] / 4)
                }}
                disabled={pattern.subdivision * 4 >= 32}
                className="neumorph-circle-btn h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 disabled:opacity-30 cursor-pointer"
                title="Quantize finer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Instrument Widget */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pl-1">Instrument</span>
          <CustomDropdown
            value={instrumentId}
            onChange={(newId) => setInstrumentId(newId)}
            options={INSTRUMENT_OPTIONS}
            menuWidth="w-60"
          />
        </div>

        {/* Root Note Widget */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pl-1">Root</span>
          <div className="neumorph-pill h-11 px-3 rounded-full flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100 w-8 text-center">
              {rootNote}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleRootChange(-1)}
                className="neumorph-circle-btn h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 cursor-pointer"
                title="Root note semitone down"
              >
                &minus;
              </button>
              <button
                type="button"
                onClick={() => handleRootChange(1)}
                className="neumorph-circle-btn h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 cursor-pointer"
                title="Root note semitone up"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Play Button Widget */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pl-1">Play</span>
          <button
            type="button"
            onClick={() => (preview.isPlaying ? preview.pause() : preview.play())}
            disabled={preview.instrumentLoading}
            className={`h-11 px-5 rounded-full flex items-center justify-center transition-all cursor-pointer font-semibold ${
              preview.isPlaying
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30 scale-105 animate-pulse'
                : 'neumorph-pill text-red-600 dark:text-red-400 hover:scale-105 active:scale-95'
            }`}
            title={preview.isPlaying ? 'Pause preview' : 'Play preview'}
          >
            {preview.isPlaying ? (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* BPM Widget */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pl-1">BPM</span>
          <div className="neumorph-pill h-11 px-3 rounded-full flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100 w-8 text-center">
              {bpm}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBpm((b) => Math.max(40, b - 5))}
                className="neumorph-circle-btn h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 cursor-pointer"
                title="Decrease BPM by 5"
              >
                &minus;
              </button>
              <button
                type="button"
                onClick={() => setBpm((b) => Math.min(220, b + 5))}
                className="neumorph-circle-btn h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 cursor-pointer"
                title="Increase BPM by 5"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Swing Widget with Neumorphic Inset Groove */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">Swing</span>
            <span className="text-[10px] font-medium text-neutral-400">{swingPercent}%</span>
          </div>
          <div className="neumorph-pill h-11 px-3 rounded-full flex items-center justify-center">
            <div className="neumorph-inset h-6 w-24 rounded-full px-1.5 flex items-center relative">
              <input
                type="range"
                min={0}
                max={100}
                value={swingPercent}
                onChange={(e) => setSwingPercent(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg cursor-pointer appearance-none bg-transparent focus:outline-none"
                title={`Swing: ${swingPercent}%`}
              />
            </div>
          </div>
        </div>

        {/* Save Widget */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pl-1">Save</span>
          <button
            type="button"
            onClick={openSave}
            className="neumorph-pill h-11 px-4 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Save lehra to library"
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </button>
        </div>

        {/* Back Widget */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pl-1">Back</span>
          <button
            type="button"
            onClick={onBack}
            className="neumorph-pill h-11 px-4 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs group"
            title="Back to Playback"
          >
            <svg className="w-4 h-4 fill-none stroke-current group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Edit Toolbar Above Grid */}
      <div className="flex justify-end pt-1 w-full min-w-0 overflow-x-auto scrollbar-none">
        <EditToolsBar
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={history.undo}
          onRedo={history.redo}
          hasSelection={hasSelection}
          onDeleteSelected={handleDeleteSelected}
          onShiftSelected={handleShiftSelected}
          onClearSelection={() => setSelection(null)}
          mode={toolMode}
          onModeChange={setToolMode}
        />
      </div>

      {/* 4-Octave Piano Roll Sequencer Grid */}
      <SequencerGrid
        beatCount={pattern.beatCount}
        subdivision={pattern.subdivision}
        notes={pattern.notes}
        selection={selection}
        toolMode={toolMode}
        onToggleNote={handleToggleNote}
        onSelectRange={(a, b) => setSelection(normalizeSelection(a, b))}
        playheadStep={preview.playheadStep}
        onPreviewNote={preview.previewNote}
      />

      {/* Dialogs */}
      <SaveDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        defaultName={pattern.name}
        taal={pattern.taal}
        beatCount={pattern.beatCount}
        hasExisting={currentLehraId != null}
        onSave={handleSave}
      />

      <LoadDialog
        open={loadOpen}
        onClose={() => setLoadOpen(false)}
        savedLehras={lehras}
        onLoad={handleLoad}
        isAuthenticated={isAuthenticated}
        loading={lehrasLoading}
      />

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}

