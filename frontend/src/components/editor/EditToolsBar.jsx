export function EditToolsBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasSelection,
  onDeleteSelected,
  onShiftSelected,
  onClearSelection,
  mode = 'draw',
  onModeChange,
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full neumorph-pill shadow-md border border-neutral-200/80 dark:border-neutral-800/80 max-w-full overflow-x-auto select-none touch-pan-x">
      {/* Draw / Pencil Tool */}
      <button
        type="button"
        onClick={() => onModeChange?.('draw')}
        className={`h-8 px-3 rounded-full flex items-center gap-1.5 transition-all cursor-pointer text-xs font-semibold ${
          mode === 'draw'
            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-500/30'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
        title="Pencil / Draw Tool"
      >
        <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <span className="hidden sm:inline">Draw</span>
      </button>

      {/* Select / Marquee Range Tool */}
      <button
        type="button"
        onClick={() => onModeChange?.('select')}
        className={`h-8 px-3 rounded-full flex items-center gap-1.5 transition-all cursor-pointer text-xs font-semibold ${
          mode === 'select'
            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-500/30'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
        title="Range Select Tool"
      >
        <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M4 8V4h4m8 0h4v4m0 8v4h-4m-8 0H4v-4" />
        </svg>
        <span className="hidden sm:inline">Select</span>
      </button>

      <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

      {/* Undo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2m-15-7l4-4m-4 4l4 4" />
        </svg>
      </button>

      {/* Redo */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
        title="Redo (Ctrl+Y)"
      >
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
        </svg>
      </button>

      {/* Shift Left/Right when range selected */}
      {hasSelection && (
        <>
          <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />
          <button
            type="button"
            onClick={() => onShiftSelected(-1)}
            className="h-8 px-2.5 rounded-full flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 cursor-pointer transition-colors"
            title="Shift selection left by 1 step"
          >
            &larr; 1
          </button>
          <button
            type="button"
            onClick={() => onShiftSelected(1)}
            className="h-8 px-2.5 rounded-full flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 cursor-pointer transition-colors"
            title="Shift selection right by 1 step"
          >
            1 &rarr;
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="h-8 px-2.5 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            title="Clear selection range"
          >
            Deselect
          </button>
        </>
      )}

      <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

      {/* Delete / Trash Icon */}
      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          hasSelection
            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:scale-105 active:scale-95'
            : 'text-neutral-400 dark:text-neutral-600 opacity-30 cursor-not-allowed'
        }`}
        title="Delete Selected Notes"
      >
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

