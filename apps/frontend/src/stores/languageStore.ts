import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n/config'

interface LanguageState {
  language: string
  setLanguage: (lang: string) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: localStorage.getItem('language') || 'en',
      setLanguage: (lang: string) => {
        i18n.changeLanguage(lang)
        localStorage.setItem('language', lang)
        set({ language: lang })
      },
    }),
    {
      name: 'language-storage',
    }
  )
)
