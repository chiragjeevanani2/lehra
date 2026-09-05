export function SwingControl({ value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Swing</h3>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        aria-label="Swing percent"
      />
    </div>
  )
}
