export type Priority = 'low' | 'medium' | 'high'

export type PomodoroType = 'work' | 'shortBreak' | 'longBreak'

export type RepeatFrequency = 'daily' | 'weekly' | 'monthly'

export interface Reminder {
  enabled: boolean
  time?: string // ISO date string
}

export interface RepeatConfig {
  enabled: boolean
  frequency: RepeatFrequency
  interval: number // e.g., every 2 days
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string // ISO date string
  priority: Priority
  projectId?: string
  subtasks?: Subtask[]
  reminder?: Reminder
  repeat?: RepeatConfig
  order: number
  createdAt: string
  updatedAt: string
  completedPomodoros: number
}

export interface Pomodoro {
  id: string
  taskId?: string
  duration: number // minutes
  type: PomodoroType
  completedAt: string
}

export interface Project {
  id: string
  name: string
  color?: string
  order: number
  createdAt: string
}

export interface TimerSettings {
  workDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  longBreakInterval: number // number of work sessions before long break
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  disableBreak: boolean
}

export interface Statistics {
  totalPomodoros: number
  totalTime: number // minutes
  todayPomodoros: number
  todayTime: number // minutes
  weekPomodoros: number
  weekTime: number // minutes
  completedTasks: number
  tasksByProject: Record<string, number>
}
