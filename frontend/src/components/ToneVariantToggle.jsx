const OPTIONS = [
  { id: 'dry', label: 'Dry' },
  { id: 'wet', label: 'Wet' },
]

export function ToneVariantToggle({ value, onChange }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Tone</h3>
      <div className="inline-flex rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-4 py-1.5 text-sm transition-colors ${
              value === opt.id
                ? 'bg-red-600 text-white'
                : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
