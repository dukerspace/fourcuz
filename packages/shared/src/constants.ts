import type { TimerSettings } from './types'

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundEnabled: true,
  disableBreak: false,
}

export const POMODORO_DURATIONS = {
  WORK: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
} as const

export const STORAGE_KEYS = {
  TASKS: 'focus-todo-tasks',
  POMODOROS: 'focus-todo-pomodoros',
  PROJECTS: 'focus-todo-projects',
  SETTINGS: 'focus-todo-settings',
} as const
