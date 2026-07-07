import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { applyTheme, getTheme } from '../lib/theme'

function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(getTheme)
  const isDark = theme === 'dark'

  function toggleTheme() {
    const nextTheme = applyTheme(isDark ? 'light' : 'dark')
    setTheme(nextTheme)
  }

  return (
    <button
      type="button"
      className={`grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:text-teal-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 ${className}`}
      onClick={toggleTheme}
      title={isDark ? 'Usar modo claro' : 'Usar modo oscuro'}
      aria-label={isDark ? 'Usar modo claro' : 'Usar modo oscuro'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export default ThemeToggle
