import { useEffect, useState } from 'react'

const STORAGE_KEY = 'lehra-theme'

function getInitial() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useDarkMode() {
  const [theme, setTheme] = useState(getInitial)

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    const bgColor = isDark ? '#0c0e16' : '#f4f6fb'
    document.documentElement.style.backgroundColor = bgColor
    document.body.style.backgroundColor = bgColor

    const metaThemeColor = document.getElementById('theme-color-meta')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', bgColor)
    }

    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle }
}
