export function Stepper({ label, value, min = 1, max = 999, step = 1, onChange }) {
  const dec = () => onChange(Math.max(min, value - step))
  const inc = () => onChange(Math.min(max, value + step))

  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-500 dark:text-neutral-400">
      {label}
      <div className="flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 px-1 py-1">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="h-6 w-6 rounded text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Decrease ${label}`}
        >
          &minus;
        </button>
        <span className="w-8 text-center text-sm font-medium text-neutral-900 dark:text-neutral-100">{value}</span>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="h-6 w-6 rounded text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </label>
  )
}
