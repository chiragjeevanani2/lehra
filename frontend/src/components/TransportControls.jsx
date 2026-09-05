export function TransportControls({ isPlaying, isLoading, onPlay, onPause, onStop }) {
  return (
    <div className="flex items-center gap-3">
      {isPlaying ? (
        <button
          type="button"
          onClick={onPause}
          className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors"
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          onClick={onPlay}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Play
        </button>
      )}
      <button
        type="button"
        onClick={onStop}
        className="px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        Stop
      </button>
      {isLoading && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Loading samples&hellip;</span>
      )}
    </div>
  )
}
