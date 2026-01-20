import type { Task } from '@shared/types'
import { useMemo } from 'react'

interface PomodoroRecordsTimelineProps {
  tasks: Task[]
  workDuration: number
}

export default function PomodoroRecordsTimeline({
  tasks,
  workDuration: _workDuration,
}: PomodoroRecordsTimelineProps) {
  // Generate dates for the last 10 days
  const dates = useMemo(() => {
    const datesList = []
    const now = new Date()
    for (let i = 0; i < 10; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      datesList.push(date)
    }
    return datesList.reverse()
  }, [])

  // Generate time slots (0:00 to 22:00, every hour)
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 0; hour <= 22; hour++) {
      slots.push(hour)
    }
    return slots
  }, [])

  // Calculate pomodoro sessions by date and hour
  const sessionsByDateHour = useMemo(() => {
    const sessions: Record<string, Record<number, number>> = {}

    tasks.forEach((task) => {
      if (!task.updatedAt || !task.completedPomodoros || task.completedPomodoros === 0) return

      const updatedAt = new Date(task.updatedAt)
      if (isNaN(updatedAt.getTime())) return

      const dateKey = updatedAt.toISOString().split('T')[0]
      const hour = updatedAt.getHours()

      if (!sessions[dateKey]) {
        sessions[dateKey] = {}
      }
      sessions[dateKey][hour] = (sessions[dateKey][hour] || 0) + (task.completedPomodoros || 0)
    })

    return sessions
  }, [tasks])

  const formatDateLabel = (date: Date): string => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (dateOnly.getTime() === today.getTime()) {
      return 'Today'
    }
    if (dateOnly.getTime() === yesterday.getTime()) {
      return 'Yesterday'
    }
    return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`
  }

  const getSessionCount = (date: Date, hour: number): number => {
    const dateKey = date.toISOString().split('T')[0]
    return sessionsByDateHour[dateKey]?.[hour] || 0
  }

  const getBarColor = (count: number): string => {
    if (count === 0) return 'transparent'
    if (count >= 5) return 'bg-blue-600 dark:bg-blue-500'
    if (count >= 3) return 'bg-blue-500 dark:bg-blue-400'
    if (count >= 2) return 'bg-blue-400 dark:bg-blue-300'
    return 'bg-gray-400 dark:bg-gray-500'
  }

  const getBarHeight = (count: number): string => {
    if (count === 0) return 'h-0'
    if (count >= 5) return 'h-full'
    if (count >= 3) return 'h-3'
    if (count >= 2) return 'h-2'
    return 'h-1'
  }

  return (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8">
      <h3 className="text-gray-800 dark:text-gray-100 mb-4 text-lg font-semibold">
        Pomodoro Records
      </h3>
      <div className="overflow-x-auto -mx-2 px-2 max-h-[600px] overflow-y-auto">
        <div className="inline-block min-w-full">
          {/* Time axis header */}
          <div className="flex mb-2 sticky top-0 bg-white/98 dark:bg-[rgba(30,30,46,0.95)] z-10 pb-2">
            <div className="w-20 sm:w-24 shrink-0"></div>
            <div
              className="flex-1 grid gap-0.5 min-w-[460px]"
              style={{ gridTemplateColumns: 'repeat(23, minmax(0, 1fr))' }}
            >
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="text-xs text-gray-500 dark:text-gray-400 text-center truncate"
                >
                  {hour % 2 === 0 ? `${hour}:00` : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Date rows */}
          <div className="space-y-1">
            {dates.map((date) => (
              <div key={date.toISOString()} className="flex items-center">
                <div className="w-20 sm:w-24 shrink-0 text-sm text-gray-700 dark:text-gray-300 pr-2">
                  {formatDateLabel(date)}
                </div>
                <div
                  className="flex-1 grid gap-0.5 min-w-[460px]"
                  style={{ gridTemplateColumns: 'repeat(23, minmax(0, 1fr))' }}
                >
                  {timeSlots.map((hour) => {
                    const count = getSessionCount(date, hour)
                    return (
                      <div
                        key={`${date.toISOString()}-${hour}`}
                        className="h-4 relative group cursor-pointer flex items-end"
                        title={count > 0 ? `${count} pomodoro(s) at ${hour}:00` : ''}
                      >
                        {count > 0 && (
                          <div
                            className={`${getBarColor(count)} ${getBarHeight(count)} w-full rounded-sm transition-all hover:opacity-80`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
