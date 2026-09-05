import { useEffect, useRef, useState } from 'react'

export function CustomDropdown({
  value,
  onChange,
  options = [], // [{ id, label, sub, icon }] OR [{ group: 'Presets', items: [...] }]
  placeholder = 'Select...',
  className = '',
  triggerClassName = '',
  menuWidth = 'w-60',
  align = 'left',
  dropUp = false,
}) {
  const [open, setOpen] = useState(false)
  const [effectiveDropUp, setEffectiveDropUp] = useState(dropUp)
  const containerRef = useRef(null)
  const menuRef = useRef(null)

  // Compute drop direction on open
  useEffect(() => {
    if (open) {
      if (dropUp) {
        setEffectiveDropUp(true)
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        if (spaceBelow < 260 && spaceAbove > spaceBelow) {
          setEffectiveDropUp(true)
        } else {
          setEffectiveDropUp(false)
        }
      }
    }
  }, [open, dropUp])

  // Close on click outside or Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  // Flatten options to find selected
  const allItems = options.flatMap((opt) => (opt.group ? opt.items : [opt]))
  const selectedItem = allItems.find((item) => item.id === value)

  const handleSelect = (itemId) => {
    onChange(itemId)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`neumorph-pill h-11 px-4 rounded-full flex items-center justify-between gap-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${
          open ? 'ring-2 ring-red-500/30 shadow-md' : ''
        } ${triggerClassName}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedItem?.icon && <span className="text-base">{selectedItem.icon}</span>}
          <span className="truncate">{selectedItem ? selectedItem.label : placeholder}</span>
        </span>
        <svg
          className={`w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 shrink-0 ${
            open
              ? effectiveDropUp
                ? 'rotate-0 text-red-500'
                : 'rotate-180 text-red-500'
              : effectiveDropUp
              ? 'rotate-180'
              : 'rotate-0'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Glassmorphic Dropdown Panel */}
      {open && (
        <div
          ref={menuRef}
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            effectiveDropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${menuWidth} max-w-[calc(100vw-2rem)] max-h-72 overflow-y-auto custom-scrollbar z-50 rounded-2xl bg-white/95 dark:bg-[#141624]/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150`}
          role="listbox"
        >
          {options.map((groupOrItem, idx) => {
            if (groupOrItem.group) {
              return (
                <div key={groupOrItem.group} className="py-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {groupOrItem.group}
                  </div>
                  <div className="space-y-0.5">
                    {groupOrItem.items.map((item) => (
                      <DropdownItem
                        key={item.id}
                        item={item}
                        isSelected={item.id === value}
                        onSelect={() => handleSelect(item.id)}
                      />
                    ))}
                  </div>
                  {idx < options.length - 1 && (
                    <div className="my-1 border-b border-neutral-100 dark:border-neutral-800/60" />
                  )}
                </div>
              )
            }

            return (
              <DropdownItem
                key={groupOrItem.id}
                item={groupOrItem}
                isSelected={groupOrItem.id === value}
                onSelect={() => handleSelect(groupOrItem.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function DropdownItem({ item, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer select-none ${
        isSelected
          ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-semibold shadow-xs'
          : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
      }`}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-center gap-2.5 truncate">
        {item.icon && <span className="text-sm shrink-0">{item.icon}</span>}
        <div className="truncate">
          <div className="truncate">{item.label}</div>
          {item.sub && (
            <div className="text-[10px] font-normal text-neutral-400 dark:text-neutral-500 truncate">
              {item.sub}
            </div>
          )}
        </div>
      </div>
      {isSelected && (
        <svg
          className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}
