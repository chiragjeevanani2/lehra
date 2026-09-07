import { useEffect, useRef } from 'react'
import { SARGAM_ROWS } from '../../editor/sargam'

const MIN_CELL_WIDTH = 15
const PIANO_COL_WIDTH = 64
const HEADER_HEIGHT = 28
const ROW_HEIGHT = 22

function inSelection(step, selection) {
  return selection != null && step >= selection.start && step <= selection.end
}

export function SequencerGrid({
  beatCount,
  subdivision,
  notes,
  selection,
  toolMode = 'draw',
  onToggleNote,
  onSelectRange,
  playheadStep,
  onPreviewNote,
}) {
  const totalSteps = beatCount * subdivision
  const scrollContainerRef = useRef(null)

  // Drag interaction refs for both drawing notes and range selection
  const isDraggingRef = useRef(false)
  const dragTypeRef = useRef(null) // 'ruler' | 'cells-select' | 'cells-draw'
  const dragActionRef = useRef('add') // 'add' | 'remove' (for draw mode)
  const dragStartStepRef = useRef(null)
  const lastCellKeyRef = useRef('')

  // Clean global pointer release listener
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      isDraggingRef.current = false
      dragTypeRef.current = null
      dragStartStepRef.current = null
      lastCellKeyRef.current = ''
    }
    window.addEventListener('pointerup', handleGlobalPointerUp)
    window.addEventListener('pointercancel', handleGlobalPointerUp)
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp)
      window.removeEventListener('pointercancel', handleGlobalPointerUp)
    }
  }, [])

  // Auto-scroll to center on active notes or Madhya Saptak (C4) so user immediately sees imported notes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scrollContainerRef.current) return
      let targetRow = null
      if (notes && notes.length > 0) {
        const semitones = notes.map((n) => n.semitone)
        const avg = Math.round(semitones.reduce((a, b) => a + b, 0) / semitones.length)
        targetRow = scrollContainerRef.current.querySelector(`[data-semitone="${avg}"]`)
      }
      if (!targetRow) {
        targetRow = scrollContainerRef.current.querySelector('[data-madhya-sa="true"]')
      }
      if (targetRow) {
        const containerHeight = scrollContainerRef.current.clientHeight || 500
        const targetTop = targetRow.offsetTop
        scrollContainerRef.current.scrollTo({
          top: Math.max(0, targetTop - containerHeight / 2 + 25),
          behavior: 'smooth',
        })
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [notes, beatCount, subdivision])

  const noteAt = (step, semitone) => notes.some((n) => n.step === step && n.semitone === semitone)

  // Ruler pointer down handler
  const handleRulerPointerDown = (e, step) => {
    e.preventDefault()
    isDraggingRef.current = true
    dragTypeRef.current = 'ruler'
    dragStartStepRef.current = step
    onSelectRange(step, step)
  }

  // Ruler pointer enter during drag
  const handleRulerPointerEnter = (step) => {
    if (!isDraggingRef.current) return
    if (dragTypeRef.current === 'ruler' || dragTypeRef.current === 'cells-select') {
      onSelectRange(dragStartStepRef.current, step)
    }
  }

  // Cell pointer down handler (supports click-to-toggle or drag-to-draw/select)
  const handleCellPointerDown = (e, step, semitone, isActive) => {
    e.preventDefault()
    isDraggingRef.current = true

    if (toolMode === 'select') {
      dragTypeRef.current = 'cells-select'
      dragStartStepRef.current = step
      onSelectRange(step, step)
    } else {
      dragTypeRef.current = 'cells-draw'
      const willAdd = !isActive
      dragActionRef.current = willAdd ? 'add' : 'remove'
      lastCellKeyRef.current = `${step}-${semitone}`
      onToggleNote(step, semitone)
      if (willAdd && onPreviewNote) {
        onPreviewNote(semitone)
      }
    }
  }

  // Cell pointer enter during drag
  const handleCellPointerEnter = (step, semitone) => {
    if (!isDraggingRef.current) return

    if (dragTypeRef.current === 'cells-select' || dragTypeRef.current === 'ruler') {
      onSelectRange(dragStartStepRef.current, step)
      return
    }

    if (dragTypeRef.current === 'cells-draw') {
      const key = `${step}-${semitone}`
      if (lastCellKeyRef.current === key) return
      lastCellKeyRef.current = key

      const currentlyActive = noteAt(step, semitone)
      if (dragActionRef.current === 'add' && !currentlyActive) {
        onToggleNote(step, semitone)
        if (onPreviewNote) onPreviewNote(semitone)
      } else if (dragActionRef.current === 'remove' && currentlyActive) {
        onToggleNote(step, semitone)
      }
    }
  }

  return (
    <div className="soft-card rounded-3xl p-3 sm:p-6 overflow-hidden shadow-xl border border-neutral-200/80 dark:border-neutral-800/80 transition-all w-full min-w-0">
      {/* Scrollable Container with custom scrollbars & touch containment */}
      <div
        ref={scrollContainerRef}
        style={{ overscrollBehavior: 'contain', touchAction: 'pan-x pan-y' }}
        className="relative max-h-[520px] overflow-auto custom-scrollbar touch-scroll rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-[#11121a] w-full min-w-0 select-none"
      >
        <div
          className="grid select-none"
          style={{
            gridTemplateColumns: `${PIANO_COL_WIDTH}px repeat(${totalSteps}, minmax(${MIN_CELL_WIDTH}px, 1fr))`,
            minWidth: 'max-content',
          }}
        >
          {/* Top-Left Corner Header (Sticky Top & Left) */}
          <div
            className="sticky top-0 left-0 z-30 flex items-center justify-center font-bold text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 bg-[#f6f8fb] dark:bg-[#161722] border-b border-r border-neutral-200/80 dark:border-neutral-800 shadow-xs select-none"
            style={{ height: `${HEADER_HEIGHT}px` }}
          >
            Key
          </div>

          {/* Step / Beat Numbers Ruler (Sticky Top) */}
          {Array.from({ length: totalSteps }, (_, step) => {
            const isBeatStart = step % subdivision === 0
            const beatNum = Math.floor(step / subdivision) + 1
            const isSam = step === 0

            return (
              <div
                key={`ruler-${step}`}
                data-step={step}
                onPointerDown={(e) => handleRulerPointerDown(e, step)}
                onPointerEnter={() => handleRulerPointerEnter(step)}
                style={{ height: `${HEADER_HEIGHT}px`, touchAction: 'none' }}
                className={`sticky top-0 z-20 flex items-center justify-center text-[10px] font-semibold cursor-pointer border-b border-neutral-200 dark:border-neutral-800 transition-colors select-none ${
                  isBeatStart
                    ? isSam
                      ? 'border-l-[3px] border-l-red-500 bg-red-50/60 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold'
                      : 'border-l-2 border-l-neutral-300 dark:border-l-neutral-700 bg-[#f8fafc] dark:bg-[#161722] text-neutral-700 dark:text-neutral-300'
                    : 'border-l border-l-neutral-150/60 dark:border-l-neutral-850 bg-[#fafbfc] dark:bg-[#13141f] text-neutral-400 dark:text-neutral-500'
                } ${inSelection(step, selection) ? 'bg-red-100 dark:bg-red-900/40 text-red-700' : ''}`}
                title={isSam ? 'Sam (Beat 1)' : `Beat ${beatNum}`}
              >
                {isBeatStart ? (
                  isSam ? (
                    <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      1
                    </span>
                  ) : (
                    beatNum
                  )
                ) : (
                  <span className="text-[8px] text-neutral-300 dark:text-neutral-600">&middot;</span>
                )}
              </div>
            )
          })}

          {/* Multi-Octave Rows */}
          {SARGAM_ROWS.map((row, rowIndex) => {
            const isOctaveStart =
              rowIndex === 0 || SARGAM_ROWS[rowIndex - 1]?.octave !== row.octave

            return (
              <FragmentRow
                key={row.semitone}
                row={row}
                isOctaveStart={isOctaveStart}
                totalSteps={totalSteps}
                subdivision={subdivision}
                selection={selection}
                playheadStep={playheadStep}
                active={(step) => noteAt(step, row.semitone)}
                onCellPointerDown={(e, step, isActive) => handleCellPointerDown(e, step, row.semitone, isActive)}
                onCellPointerEnter={(step) => handleCellPointerEnter(step, row.semitone)}
                onPreviewNote={onPreviewNote}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FragmentRow({
  row,
  isOctaveStart,
  totalSteps,
  subdivision,
  selection,
  playheadStep,
  active,
  onCellPointerDown,
  onCellPointerEnter,
  onPreviewNote,
}) {
  // Zebra striping: black-key (accidental) rows shaded matching reference DAW piano roll
  const isAccidental = row.isAccidental
  const rowBg = isAccidental
    ? 'bg-[#edf1f8] dark:bg-[#171826]'
    : 'bg-white dark:bg-[#10111a]'
  const isC = row.isSa

  return (
    <>
      {/* Piano Key Cell (e.g. C4, C#4, D4...) - Sticky Left, styled as a piano key */}
      <div
        data-semitone={row.semitone}
        data-madhya-sa={row.isMadhyaSa ? 'true' : undefined}
        onClick={() => onPreviewNote?.(row.semitone)}
        className={`relative sticky left-0 z-10 border-b cursor-pointer select-none transition-colors ${
          isOctaveStart ? 'border-b-neutral-400 dark:border-b-neutral-600' : 'border-b-neutral-200/60 dark:border-b-neutral-800/60'
        } ${isAccidental ? 'bg-[#f4f6fa] dark:bg-[#20212f]' : 'bg-white dark:bg-[#2e2f42]'}`}
        style={{ height: `${ROW_HEIGHT}px` }}
        title={`${row.pitch} (${row.saptak} ${row.label}) - Click to audition`}
      >
        {isAccidental ? (
          /* Black key: short dark tab overlaying the white lane */
          <div
            className="absolute inset-y-0 left-0 flex items-center pl-1.5 rounded-r-[3px] bg-neutral-900 dark:bg-black shadow-sm hover:bg-neutral-700 dark:hover:bg-neutral-800 transition-colors"
            style={{ width: '62%' }}
          >
            <span className="text-[9px] font-medium text-neutral-300">{row.pitch}</span>
          </div>
        ) : (
          /* White key: full-width label, root (C) note called out in red */
          <div className="h-full flex items-center justify-end pr-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            <span
              className={`text-[10px] flex items-center gap-1 ${
                isC ? 'font-bold text-red-600 dark:text-red-400' : 'font-medium text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {isC && <span className="w-1 h-1 rounded-full bg-red-500" />}
              {row.pitch}
            </span>
          </div>
        )}
      </div>

      {/* Grid Step Cells */}
      {Array.from({ length: totalSteps }, (_, step) => {
        const isActive = active(step)
        const isBeatStart = step % subdivision === 0
        const isSam = step === 0
        const isPlayhead = playheadStep === step
        const isSelected = inSelection(step, selection)

        return (
          <div
            key={step}
            role="button"
            tabIndex={0}
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            onPointerDown={(e) => onCellPointerDown(e, step, isActive)}
            onPointerEnter={() => onCellPointerEnter(step)}
            style={{ height: `${ROW_HEIGHT}px`, touchAction: 'none' }}
            className={`relative border-b border-neutral-100 dark:border-neutral-850/60 transition-all cursor-pointer select-none ${rowBg} ${
              isSam
                ? 'border-l-[3px] border-l-red-500/90'
                : isBeatStart
                ? 'border-l-2 border-l-neutral-300 dark:border-l-neutral-750'
                : 'border-l border-l-neutral-150/50 dark:border-l-neutral-900/40'
            } ${
              isSelected && !isActive ? 'bg-red-50 dark:bg-red-950/20' : ''
            } hover:brightness-95 dark:hover:brightness-125 focus:outline-none`}
            aria-label={`${row.label} at step ${step + 1}`}
            aria-pressed={isActive}
          >
            {/* Active Note Brick */}
            {isActive && (
              <span className="absolute inset-0.5 rounded-[4px] bg-gradient-to-r from-red-600 to-rose-500 shadow-sm shadow-red-500/40 ring-1 ring-white/35 flex items-center justify-center animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs" />
              </span>
            )}

            {/* Playhead Cursor Highlight */}
            {isPlayhead && (
              <span className="absolute inset-0 border-x-2 border-red-500 bg-red-500/20 pointer-events-none z-10 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
            )}
          </div>
        )
      })}
    </>
  )
}
