import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

// Get initial theme from system preference or localStorage
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') {
    return saved
  }

  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          // Apply theme to DOM
          const root = document.documentElement
          if (newTheme === 'dark') {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
          return { theme: newTheme }
        })
      },

      setTheme: (theme: Theme) => {
        set({ theme })
        // Apply theme to DOM
        const root = document.documentElement
        if (theme === 'dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      },
    }),
    {
      name: 'theme',
      // Apply theme on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          const root = document.documentElement
          if (state.theme === 'dark') {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
        }
      },
    }
  )
)
