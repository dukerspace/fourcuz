import { useState, useMemo } from 'react'
import type { Task } from '@shared/types'

type FilterType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Today'

interface ProjectTimeDistributionProps {
  tasks: Task[]
  workDuration: number
  getProjectName: (projectId: string) => string
}

export default function ProjectTimeDistribution({
  tasks,
  workDuration,
  getProjectName,
}: ProjectTimeDistributionProps) {
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

  const projectData = useMemo(() => {
    const now = new Date()
    let startDate: Date
    const endDate: Date = new Date()

    switch (filter) {
      case 'Today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'Daily':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 6)
        break
      case 'Weekly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - (now.getDay() + 6 * 7))
        break
      case 'Monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        break
      case 'Yearly':
        startDate = new Date(now.getFullYear() - 6, 0, 1)
        break
    }

    const filteredTasks = tasks.filter((task) => {
      if (!task.updatedAt) return false
      const updatedAt = new Date(task.updatedAt)
      return !isNaN(updatedAt.getTime()) && updatedAt >= startDate && updatedAt <= endDate
    })

    const projectTime: Record<string, number> = {}
    filteredTasks.forEach((task) => {
      const projectId = task.projectId || 'uncategorized'
      const time = (task.completedPomodoros || 0) * workDuration
      projectTime[projectId] = (projectTime[projectId] || 0) + time
    })

    const total = Object.values(projectTime).reduce((sum, time) => sum + time, 0)
    const entries = Object.entries(projectTime)
      .map(([projectId, time]) => ({
        projectId,
        time,
        percentage: total > 0 ? (time / total) * 100 : 0,
      }))
      .sort((a, b) => b.time - a.time)

    return { entries, total }
  }, [tasks, workDuration, filter])

  const colors = [
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
  ]

  // Calculate SVG path for donut chart
  const getDonutPath = (percentage: number, offset: number = 0) => {
    const radius = 60
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    const rotation = (offset / 100) * 360

    return {
      strokeDasharray,
      strokeDashoffset: strokeDashoffset - (offset / 100) * circumference,
      transform: `rotate(${rotation}deg)`,
      transformOrigin: 'center',
    }
  }

  let currentOffset = 0

  return (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-800 dark:text-gray-100 text-lg font-semibold">
          Project Time Distribution
        </h3>
        <div className="flex gap-2">
          {(['Daily', 'Weekly', 'Monthly', 'Yearly', 'Today'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                filter === f
                  ? 'bg-emerald-400 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {projectData.entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No data available</div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <svg
              width="140"
              height="140"
              viewBox="0 0 140 140"
              className="w-full max-w-[140px] h-auto"
            >
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
                className="dark:stroke-gray-700"
              />
              {projectData.entries.map((entry, index) => {
                const pathStyle = getDonutPath(entry.percentage, currentOffset)
                currentOffset += entry.percentage
                return (
                  <circle
                    key={entry.projectId}
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="20"
                    strokeLinecap="round"
                    style={pathStyle}
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formatTime(projectData.total)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2 min-w-0">
            {projectData.entries.map((entry, index) => (
              <div key={entry.projectId} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-4 h-4 rounded shrink-0"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {getProjectName(entry.projectId)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 shrink-0 whitespace-nowrap">
                  {formatTime(entry.time)} • {entry.percentage.toFixed(0)}%
                </div>
              </div>
            ))}
            {projectData.entries.length === 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatTime(projectData.total)} No Project
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
