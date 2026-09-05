const MIN_BPM = 40
const MAX_BPM = 220

export function BpmControl({ bpm, onChange }) {
  const clamp = (v) => Math.min(MAX_BPM, Math.max(MIN_BPM, v))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tempo</h3>
        <input
          type="number"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={(e) => onChange(clamp(Number(e.target.value) || MIN_BPM))}
          className="w-16 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm text-right text-neutral-900 dark:text-neutral-100"
        />
      </div>
      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        aria-label="BPM"
      />
    </div>
  )
}
