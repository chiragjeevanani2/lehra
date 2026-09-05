export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[100] flex items-center justify-center min-h-screen w-full max-w-full bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
      style={{ margin: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#13141c] border border-neutral-200/90 dark:border-neutral-800 shadow-2xl p-6 transition-all my-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-normal">
            {title}
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 bg-neutral-100/90 hover:bg-neutral-200/90 dark:bg-neutral-800/90 dark:hover:bg-neutral-700/90 border border-neutral-200/80 dark:border-neutral-700/80 cursor-pointer transition-colors shrink-0"
              aria-label="Close"
            >
              <svg className="w-3.5 h-3.5 block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
