import { useState, useMemo } from 'react'
import type { Task } from '@shared/types'

type FilterType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Today'

interface FocusTimeChartProps {
  tasks: Task[]
  workDuration: number
  getProjectName: (projectId: string) => string
}

export default function FocusTimeChart({
  tasks,
  workDuration,
  getProjectName: _getProjectName,
}: FocusTimeChartProps) {
  const [filter, setFilter] = useState<FilterType>('Today')

  const formatTime = (minutes: number): string => {
    if (!Number.isFinite(minutes) || minutes < 0) return '0m'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const chartData = useMemo(() => {
    const now = new Date()
    let startDate: Date
    let dataPoints: Array<{ date: Date; time: number }> = []

    switch (filter) {
      case 'Today': {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todayTasks = tasks.filter((task) => {
          if (!task.updatedAt) return false
          const updatedAt = new Date(task.updatedAt)
          return !isNaN(updatedAt.getTime()) && updatedAt >= startDate
        })
        const totalTime = todayTasks.reduce(
          (sum, task) => sum + (task.completedPomodoros || 0) * workDuration,
          0
        )
        dataPoints = [
          {
            date: startDate,
            time: totalTime,
          },
        ]
        break
      }
      case 'Daily': {
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 6) // Last 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate)
          date.setDate(startDate.getDate() + i)
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
          const dayEnd = new Date(dayStart)
          dayEnd.setDate(dayEnd.getDate() + 1)

          const dayTasks = tasks.filter((task) => {
            if (!task.updatedAt) return false
            const updatedAt = new Date(task.updatedAt)
            return !isNaN(updatedAt.getTime()) && updatedAt >= dayStart && updatedAt < dayEnd
          })
          const dayTime = dayTasks.reduce(
            (sum, task) => sum + (task.completedPomodoros || 0) * workDuration,
            0
          )
          dataPoints.push({
            date,
            time: dayTime,
          })
        }
        break
      }
      case 'Weekly': {
        startDate = new Date(now)
        startDate.setDate(now.getDate() - (now.getDay() + 6 * 7)) // 7 weeks ago
        for (let i = 0; i < 7; i++) {
          const weekStart = new Date(startDate)
          weekStart.setDate(startDate.getDate() + i * 7)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 7)

          const weekTasks = tasks.filter((task) => {
            if (!task.updatedAt) return false
            const updatedAt = new Date(task.updatedAt)
            return !isNaN(updatedAt.getTime()) && updatedAt >= weekStart && updatedAt < weekEnd
          })
          const weekTime = weekTasks.reduce(
            (sum, task) => sum + (task.completedPomodoros || 0) * workDuration,
            0
          )
          dataPoints.push({
            date: weekStart,
            time: weekTime,
          })
        }
        break
      }
      case 'Monthly': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        for (let i = 0; i < 7; i++) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - (6 - i) + 1, 1)

          const monthTasks = tasks.filter((task) => {
            if (!task.updatedAt) return false
            const updatedAt = new Date(task.updatedAt)
            return !isNaN(updatedAt.getTime()) && updatedAt >= monthStart && updatedAt < monthEnd
          })
          const monthTime = monthTasks.reduce(
            (sum, task) => sum + (task.completedPomodoros || 0) * workDuration,
            0
          )
          dataPoints.push({
            date: monthStart,
            time: monthTime,
          })
        }
        break
      }
      case 'Yearly': {
        startDate = new Date(now.getFullYear() - 6, 0, 1)
        for (let i = 0; i < 7; i++) {
          const yearStart = new Date(now.getFullYear() - (6 - i), 0, 1)
          const yearEnd = new Date(now.getFullYear() - (6 - i) + 1, 0, 1)

          const yearTasks = tasks.filter((task) => {
            if (!task.updatedAt) return false
            const updatedAt = new Date(task.updatedAt)
            return !isNaN(updatedAt.getTime()) && updatedAt >= yearStart && updatedAt < yearEnd
          })
          const yearTime = yearTasks.reduce(
            (sum, task) => sum + (task.completedPomodoros || 0) * workDuration,
            0
          )
          dataPoints.push({
            date: yearStart,
            time: yearTime,
          })
        }
        break
      }
    }

    return dataPoints
  }, [tasks, workDuration, filter])

  const totalTime = useMemo(() => chartData.reduce((sum, d) => sum + d.time, 0), [chartData])
  const maxTime = useMemo(() => Math.max(...chartData.map((d) => d.time), 1), [chartData])

  const formatDateLabel = (date: Date, filterType: FilterType): string => {
    switch (filterType) {
      case 'Today':
        return 'Today'
      case 'Daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case 'Weekly':
        return `Week ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      case 'Monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      case 'Yearly':
        return date.getFullYear().toString()
      default:
        return date.toLocaleDateString()
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-gray-800 dark:text-gray-100 text-lg font-semibold">Focus Time</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Total focus time: {formatTime(totalTime)}
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['Daily', 'Weekly', 'Monthly', 'Yearly', 'Today'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
              filter === f
                ? 'bg-emerald-400 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {chartData.map((data, index) => (
          <div key={index} className="flex items-center gap-3 flex-wrap">
            <div className="w-20 sm:w-24 text-sm text-gray-600 dark:text-gray-400 shrink-0">
              {formatDateLabel(data.date, filter)}
            </div>
            <div className="flex-1 min-w-0 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
              {data.time > 0 && (
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-end px-3 text-white text-sm font-medium transition-all min-w-fit"
                  style={{ width: `${Math.max((data.time / maxTime) * 100, 5)}%` }}
                >
                  {formatTime(data.time)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
