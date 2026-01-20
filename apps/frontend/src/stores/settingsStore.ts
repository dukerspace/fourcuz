import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  focusTimeGoalHours: number
  setFocusTimeGoalHours: (hours: number) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      focusTimeGoalHours: 3, // Default: 3 hours per day

      setFocusTimeGoalHours: (hours: number) => {
        set({ focusTimeGoalHours: Math.max(0.5, Math.min(24, hours)) }) // Clamp between 0.5 and 24 hours
      },
    }),
    {
      name: 'focus-todo-settings',
    }
  )
)
