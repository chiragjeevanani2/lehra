export function PitchControl({ semitones, rootNote, onShift }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Root note (Sa)</h3>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onShift(-1)}
          disabled={semitones <= -12}
          className="h-9 w-9 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
          aria-label="Shift pitch down one semitone"
        >
          &minus;
        </button>
        <div className="w-20 text-center">
          <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{rootNote}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {semitones > 0 ? `+${semitones}` : semitones} st
          </div>
        </div>
        <button
          type="button"
          onClick={() => onShift(1)}
          disabled={semitones >= 12}
          className="h-9 w-9 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
          aria-label="Shift pitch up one semitone"
        >
          +
        </button>
      </div>
    </div>
  )
}
