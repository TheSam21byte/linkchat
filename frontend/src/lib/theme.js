const THEME_STORAGE_KEY = 'linkchat-theme'

export function getTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) ?? 'dark'
}

export function applyTheme(theme) {
  const normalizedTheme = theme === 'light' ? 'light' : 'dark'

  document.documentElement.classList.toggle('dark', normalizedTheme === 'dark')
  document.documentElement.dataset.theme = normalizedTheme
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme)

  return normalizedTheme
}

export function initializeTheme() {
  applyTheme(getTheme())
}
