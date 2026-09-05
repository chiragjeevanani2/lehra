export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-red-500 hover:text-red-700 dark:hover:text-red-200"
          aria-label="Dismiss error"
        >
          &times;
        </button>
      )}
    </div>
  )
}
