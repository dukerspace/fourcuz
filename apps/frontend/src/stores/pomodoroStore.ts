import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PomodoroType, TimerSettings } from '@shared/types'
import { DEFAULT_TIMER_SETTINGS } from '@shared/constants'

interface PomodoroState {
  timeLeft: number
  isRunning: boolean
  type: PomodoroType
  workSessionsCompleted: number
  selectedTaskId: string | null
  settings: TimerSettings
  startTime: number | null // timestamp when timer started
}

interface PomodoroStore extends PomodoroState {
  start: () => void
  pause: () => void
  reset: () => void
  resetAll: () => void
  setType: (type: PomodoroType) => void
  setSelectedTaskId: (taskId: string | null) => void
  setSettings: (settings: TimerSettings) => void
  setTimeLeft: (timeLeft: number) => void
  decrementTime: () => void
  setWorkSessionsCompleted: (count: number) => void
}

// Helper to calculate remaining time if timer was running
function calculateRemainingTime(stored: Partial<PomodoroState>): Partial<PomodoroState> | null {
  if (!stored) return null

  // Check if timer was running and calculate remaining time
  if (stored.isRunning && stored.startTime) {
    const elapsed = Math.floor((Date.now() - stored.startTime) / 1000)
    const remaining = Math.max(0, (stored.timeLeft ?? 0) - elapsed)
    if (remaining > 0) {
      // Timer was running and still has time left - continue running
      return {
        ...stored,
        timeLeft: remaining,
        isRunning: true,
        startTime: Date.now(), // Reset start time to now for accurate counting
      }
    } else {
      // Timer expired while page was closed
      return {
        ...stored,
        timeLeft: 0,
        isRunning: false,
        startTime: null,
      }
    }
  }
  return stored
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      timeLeft: DEFAULT_TIMER_SETTINGS.workDuration * 60,
      isRunning: false,
      type: 'work',
      workSessionsCompleted: 0,
      selectedTaskId: null,
      settings: DEFAULT_TIMER_SETTINGS,
      startTime: null,

      start: () => {
        set({
          isRunning: true,
          startTime: Date.now(),
        })
      },

      pause: () => {
        set({
          isRunning: false,
          startTime: null,
        })
      },

      reset: () => {
        const state = get()
        const getDurationForType = (timerType: PomodoroType): number => {
          switch (timerType) {
            case 'work':
              return state.settings.workDuration
            case 'shortBreak':
              return state.settings.shortBreakDuration
            case 'longBreak':
              return state.settings.longBreakDuration
          }
        }
        set({
          isRunning: false,
          timeLeft: getDurationForType(state.type) * 60,
          startTime: null,
        })
      },

      resetAll: () => {
        set({
          isRunning: false,
          type: 'work',
          timeLeft: get().settings.workDuration * 60,
          workSessionsCompleted: 0,
          startTime: null,
        })
      },

      setType: (newType: PomodoroType) => {
        const state = get()
        if (!state.isRunning) {
          const getDurationForType = (timerType: PomodoroType): number => {
            switch (timerType) {
              case 'work':
                return state.settings.workDuration
              case 'shortBreak':
                return state.settings.shortBreakDuration
              case 'longBreak':
                return state.settings.longBreakDuration
            }
          }
          set({
            type: newType,
            timeLeft: getDurationForType(newType) * 60,
          })
        }
      },

      setSelectedTaskId: (taskId: string | null) => {
        set({ selectedTaskId: taskId })
      },

      setSettings: (settings: TimerSettings) => {
        set({ settings })
      },

      setTimeLeft: (timeLeft: number) => {
        set({ timeLeft })
      },

      decrementTime: () => {
        const state = get()
        if (state.timeLeft > 0) {
          set({ timeLeft: state.timeLeft - 1 })
        }
      },

      setWorkSessionsCompleted: (count: number) => {
        set({ workSessionsCompleted: count })
      },
    }),
    {
      name: 'pomodoro-timer-state',
      // Custom hydration to handle timer continuation
      onRehydrateStorage: () => (state) => {
        if (state) {
          const calculated = calculateRemainingTime(state)
          if (calculated) {
            Object.assign(state, calculated)
          }
        }
      },
    }
  )
)
