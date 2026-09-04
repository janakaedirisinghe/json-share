import { ref, onMounted } from 'vue'

const THEME_KEY = 'jsonshare_theme'
const currentTheme = ref('dark')

export function useTheme() {
  function applyTheme(theme) {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }

  function toggleTheme() {
    const next = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(next)
  }

  onMounted(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) {
      applyTheme(saved)
    } else {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      applyTheme(prefersLight ? 'light' : 'dark')
    }
  })

  return {
    currentTheme,
    toggleTheme,
    applyTheme
  }
}
