import { INSTRUMENT_LIST } from '../audio/instruments'

export function InstrumentSelector({ value, onChange }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Instrument</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {INSTRUMENT_LIST.map((inst) => (
          <button
            key={inst.id}
            type="button"
            onClick={() => onChange(inst.id)}
            className={`flex min-h-[2.5rem] items-center justify-center px-2 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-center leading-tight border transition-colors ${
              value === inst.id
                ? 'bg-red-600 border-red-600 text-white'
                : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span className="truncate max-w-full" title={inst.label}>
              {inst.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
