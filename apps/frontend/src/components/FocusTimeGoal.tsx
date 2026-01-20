import type { Task } from '@shared/types'
import { useMemo, useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

interface FocusTimeGoalProps {
  tasks: Task[]
  workDuration: number
}

export default function FocusTimeGoal({ tasks, workDuration }: FocusTimeGoalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [tempGoalValue, setTempGoalValue] = useState('')
  const goalHours = useSettingsStore((state) => state.focusTimeGoalHours)
  const setFocusTimeGoalHours = useSettingsStore((state) => state.setFocusTimeGoalHours)

  // Calculate focus time by date
  const focusTimeByDate = useMemo(() => {
    const timeMap: Record<string, number> = {}
    tasks.forEach((task) => {
      if (!task.updatedAt || !task.completedPomodoros) return
      const updatedAt = new Date(task.updatedAt)
      if (isNaN(updatedAt.getTime())) return
      const dateKey = updatedAt.toISOString().split('T')[0]
      timeMap[dateKey] = (timeMap[dateKey] || 0) + (task.completedPomodoros || 0) * workDuration
    })
    return timeMap
  }, [tasks, workDuration])

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push(date)
    }
    return days
  }, [currentMonth])

  const getFocusTimeForDate = (date: Date | null): number => {
    if (!date) return 0
    const dateKey = date.toISOString().split('T')[0]
    return focusTimeByDate[dateKey] || 0
  }

  const isGoalMet = (date: Date | null): boolean => {
    const time = getFocusTimeForDate(date)
    return time >= goalHours * 60
  }

  const getProgressPercentage = (date: Date | null): number => {
    if (!date) return 0
    const time = getFocusTimeForDate(date)
    const goalMinutes = goalHours * 60
    return Math.min(100, Math.round((time / goalMinutes) * 100))
  }

  const handleGoalSave = () => {
    const value = parseFloat(tempGoalValue)
    if (!isNaN(value) && value > 0 && value <= 24) {
      setFocusTimeGoalHours(value)
      setIsEditingGoal(false)
      setTempGoalValue('')
    }
  }

  const handleGoalCancel = () => {
    setIsEditingGoal(false)
    setTempGoalValue('')
  }

  const isToday = (date: Date | null): boolean => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    let focusDays = 0
    let completedGoalDays = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const time = getFocusTimeForDate(date)
      if (time > 0) {
        focusDays++
        if (time >= goalHours * 60) {
          completedGoalDays++
        }
      }
    }

    // Goal completion rate: percentage of focus days that met the goal
    const goalCompletionRate = focusDays > 0 ? Math.round((completedGoalDays / focusDays) * 100) : 0

    return { focusDays, completedGoalDays, goalCompletionRate }
  }, [currentMonth, focusTimeByDate, goalHours])

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  return (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-800 dark:text-gray-100 text-lg font-semibold">Focus Time Goal</h3>
        {!isEditingGoal ? (
          <button
            onClick={() => {
              setTempGoalValue(goalHours.toString())
              setIsEditingGoal(true)
            }}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Goal: {goalHours}H
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={tempGoalValue}
              onChange={(e) => setTempGoalValue(e.target.value)}
              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGoalSave()
                if (e.key === 'Escape') handleGoalCancel()
              }}
            />
            <button
              onClick={handleGoalSave}
              className="px-2 py-1 text-xs bg-emerald-400 text-white rounded hover:bg-emerald-500 transition-colors"
            >
              ✓
            </button>
            <button
              onClick={handleGoalCancel}
              className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 space-y-1">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Focus Days:{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{stats.focusDays}</span>{' '}
          days
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Completed Goal Days:{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {stats.completedGoalDays}
          </span>{' '}
          days
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Goal Completion Rate:{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {stats.goalCompletionRate}%
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => changeMonth('prev')}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            ←
          </button>
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
          <button
            onClick={() => changeMonth('next')}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
              {day}
            </div>
          ))}
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="aspect-square" />
            }

            const progress = getProgressPercentage(date)
            const time = getFocusTimeForDate(date)
            const goalMet = isGoalMet(date)
            const today = isToday(date)
            const hasFocusTime = time > 0

            // Calculate stroke-dasharray for progress ring
            const circumference = 2 * Math.PI * 12 // radius = 12
            const strokeDasharray = `${circumference}`
            const strokeDashoffset = circumference - (progress / 100) * circumference

            return (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-sm rounded transition-colors relative ${
                  today ? 'ring-2 ring-red-500' : ''
                }`}
              >
                {hasFocusTime && (
                  <svg
                    className="absolute inset-0 w-full h-full transform -rotate-90"
                    viewBox="0 0 32 32"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className={`transition-all duration-300 ${
                        goalMet ? 'text-red-500' : 'text-red-400'
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                <span
                  className={`relative z-10 ${
                    today || goalMet
                      ? 'text-red-500 font-semibold'
                      : hasFocusTime
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
