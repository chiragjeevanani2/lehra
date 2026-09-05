import { QUANTIZATION_OPTIONS, TAAL_PRESETS } from '../../editor/taals'
import { Stepper } from '../Stepper'

export function TaalControl({ taal, beatCount, subdivision, onChange }) {
  const handleTaalChange = (name) => {
    const next = TAAL_PRESETS.find((t) => t.name === name)
    onChange({ taal: name, beatCount: next?.beatCount ?? beatCount })
  }

  const handleBeatsChange = (value) => {
    const matchingPreset = TAAL_PRESETS.find((t) => t.beatCount === value)
    onChange({ beatCount: value, taal: matchingPreset ? matchingPreset.name : 'Custom' })
  }

  return (
    <div className="soft-card p-5 rounded-3xl flex flex-wrap items-center gap-6">
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        Taal
        <div className="relative">
          <select
            value={taal}
            onChange={(e) => handleTaalChange(e.target.value)}
            className="w-36 bg-transparent font-medium text-neutral-800 dark:text-neutral-100 py-1 pr-6 appearance-none cursor-pointer focus:outline-none text-sm"
          >
            {TAAL_PRESETS.map((t) => (
              <option key={t.name} value={t.name} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                {t.name}
              </option>
            ))}
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </label>

      <div className="h-8 w-px bg-neutral-100 dark:bg-neutral-800 hidden sm:block" />

      <div>
        <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
          Beats
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleBeatsChange(Math.max(1, beatCount - 1))}
            disabled={beatCount <= 1}
            className="soft-btn h-8 w-8 rounded-xl flex items-center justify-center text-sm font-semibold text-neutral-700 dark:text-neutral-200 disabled:opacity-30 cursor-pointer"
          >
            &minus;
          </button>
          <span className="w-8 text-center text-sm font-bold text-neutral-800 dark:text-neutral-100">{beatCount}</span>
          <button
            type="button"
            onClick={() => handleBeatsChange(Math.min(64, beatCount + 1))}
            disabled={beatCount >= 64}
            className="soft-btn h-8 w-8 rounded-xl flex items-center justify-center text-sm font-semibold text-neutral-700 dark:text-neutral-200 disabled:opacity-30 cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <div className="h-8 w-px bg-neutral-100 dark:bg-neutral-800 hidden sm:block" />

      <label className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        Subdivision
        <div className="relative">
          <select
            value={subdivision}
            onChange={(e) => onChange({ subdivision: Number(e.target.value) })}
            className="w-36 bg-transparent font-medium text-neutral-800 dark:text-neutral-100 py-1 pr-6 appearance-none cursor-pointer focus:outline-none text-sm"
          >
            {QUANTIZATION_OPTIONS.map((q) => (
              <option key={q} value={q} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                1/{q} per matra
              </option>
            ))}
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </label>
    </div>
  )
}
