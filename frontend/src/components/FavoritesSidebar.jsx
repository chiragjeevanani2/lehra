import { INSTRUMENTS } from '../audio/instruments'

export function FavoritesSidebar({ favorites, onSave, onLoad, onRemove, isAuthenticated, loading }) {
  return (
    <aside className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-800 pt-6 lg:pt-0 lg:pl-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Favorites</h2>
        <button
          type="button"
          onClick={onSave}
          className="text-xs px-2.5 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
        >
          Save current
        </button>
      </div>
      {!isAuthenticated ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Sign in to save and sync favorites.</p>
      ) : loading ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading favorites&hellip;</p>
      ) : favorites.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No favorites yet. Set up a lehra and click "Save current".
        </p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((fav) => (
            <li
              key={fav.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
            >
              <button type="button" onClick={() => onLoad(fav)} className="text-left flex-1">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {INSTRUMENTS[fav.instrumentId]?.label ?? fav.instrumentId}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {fav.rootNote} &middot; {fav.bpm} BPM
                </div>
              </button>
              <button
                type="button"
                onClick={() => onRemove(fav.id)}
                className="ml-2 shrink-0 text-neutral-400 hover:text-red-500"
                aria-label="Remove favorite"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
