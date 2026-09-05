export function TanpuraControl({ on, onToggle, volume, onVolumeChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tanpura drone</h3>
        <button
          type="button"
          onClick={() => onToggle(!on)}
          role="switch"
          aria-checked={on}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
            on ? 'bg-red-600' : 'bg-neutral-300 dark:bg-neutral-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              on ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        disabled={!on}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="w-full disabled:opacity-40"
        aria-label="Tanpura volume"
      />
    </div>
  )
}
