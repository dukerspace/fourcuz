import type { Project, Task } from '@shared/types'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FocusTimeChart from '../components/FocusTimeChart'
import FocusTimeGoal from '../components/FocusTimeGoal'
import PomodoroRecordsTimeline from '../components/PomodoroRecordsTimeline'
import ProjectTimeDistribution from '../components/ProjectTimeDistribution'
import { usePomodoroStore } from '../stores/pomodoroStore'
import { useProjectsStore } from '../stores/projectsStore'
import { useTasksStore } from '../stores/tasksStore'
import { generateAndSaveMockTasks } from '../utils/generateMockTasks'

interface StatisticsData {
  totalPomodoros: number
  totalTime: number
  todayPomodoros: number
  todayTime: number
  weekPomodoros: number
  weekTime: number
  completedTasks: number
  totalTasks: number
  activeTasks: number
  completionRate: number
  avgPomodorosPerTask: number
  avgTimePerTask: number
  topProjectId: string | null
  topProjectCount: number
  topProjectShare: number
  todayShareOfWeek: number
  tasksByProject: Record<string, number>
}

// Function to generate mock data
const generateMockData = (): { tasks: Task[]; projects: Project[] } => {
  const now = new Date()
  const daysAgo = (days: number) => {
    const date = new Date(now)
    date.setDate(now.getDate() - days)
    return date.toISOString()
  }

  const mockProjects: Project[] = [
    { id: 'project-work', name: 'Work', order: 0, createdAt: daysAgo(60) },
    { id: 'project-study', name: 'Study', order: 1, createdAt: daysAgo(55) },
    { id: 'project-life', name: 'Personal', order: 2, createdAt: daysAgo(50) },
    { id: 'project-health', name: 'Health', order: 3, createdAt: daysAgo(45) },
    { id: 'project-hobby', name: 'Hobby', order: 4, createdAt: daysAgo(40) },
  ]

  const priorities: Task['priority'][] = ['low', 'medium', 'high']
  const projectIds = [
    'project-work',
    'project-study',
    'project-life',
    'project-health',
    'project-hobby',
    'uncategorized',
  ]
  const taskTemplates = [
    { title: 'Write summary', desc: 'Daily recap and notes' },
    { title: 'Code review', desc: 'Review recent changes' },
    { title: 'Study session', desc: 'Focus on core topics' },
    { title: 'Workout', desc: 'Strength or cardio' },
    { title: 'Read chapter', desc: 'Learning materials' },
    { title: 'Plan tasks', desc: 'Prioritize upcoming work' },
    { title: 'Practice problem', desc: 'Skill improvement' },
    { title: 'Clean inbox', desc: 'Email and follow-ups' },
    { title: 'Refactor module', desc: 'Improve code quality' },
    { title: 'Walk break', desc: 'Refresh and reset' },
  ]

  const mockTasks: Task[] = []
  const totalTasks = 100
  let order = 0

  // Helper to get random number in range
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  // Distribute tasks across the last 90 days
  const daysToSpread = 90
  for (let taskIndex = 0; taskIndex < totalTasks; taskIndex += 1) {
    const templateIndex = taskIndex % taskTemplates.length
    const projectIndex = taskIndex % projectIds.length
    const priority = randomChoice(priorities)

    // More realistic completion rate (40-60% completion)
    const completionChance = 0.5
    const completed = Math.random() < completionChance

    // More varied pomodoro counts
    let completedPomodoros = 0
    if (completed) {
      // Completed tasks: 1-8 pomodoros, weighted towards 2-5
      const pomodoroWeights = [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8]
      completedPomodoros = randomChoice(pomodoroWeights)
    } else {
      // Incomplete tasks: 0-3 pomodoros
      completedPomodoros = randomInt(0, 3)
    }

    // Distribute tasks across the last 90 days
    const daysAgoForTask = randomInt(0, daysToSpread)
    const createdAt = daysAgo(daysAgoForTask + randomInt(0, 2))
    // UpdatedAt can be same day or up to 3 days later for completed tasks
    const daysSinceUpdate = completed ? randomInt(0, 3) : randomInt(0, daysAgoForTask)
    const updatedAt = daysAgo(Math.max(0, daysAgoForTask - daysSinceUpdate))

    mockTasks.push({
      id: `task-${taskIndex + 1}`,
      title: `${taskTemplates[templateIndex].title} #${taskIndex + 1}`,
      description: taskTemplates[templateIndex].desc,
      completed,
      priority,
      projectId:
        projectIds[projectIndex] === 'uncategorized' ? undefined : projectIds[projectIndex],
      order,
      createdAt,
      updatedAt,
      completedPomodoros,
    })

    order += 1
  }

  return { tasks: mockTasks, projects: mockProjects }
}

export default function Statistics() {
  const { t } = useTranslation()
  const tasks = useTasksStore((state: { tasks: Task[] }) => state.tasks)
  const setTasks = useTasksStore((state: { setTasks: (tasks: Task[]) => void }) => state.setTasks)
  const settings = usePomodoroStore(
    (state: { settings: { workDuration?: number } }) => state.settings
  )
  // Use selector to get reactive updates
  const projects = useProjectsStore(
    (state: { projects: Array<{ id: string; name: string }> }) => state.projects
  )
  const setProjects = useProjectsStore(
    (state: { setProjects: (projects: Project[]) => void }) => state.setProjects
  )

  // Function to handle mock data generation
  const handleGenerateMockData = useCallback(() => {
    console.log('[Mock Data] Starting mock data generation...')

    // Generate and save 100 tasks to Zustand store
    generateAndSaveMockTasks()

    // Also generate projects if needed
    const currentProjects = useProjectsStore.getState().projects
    if (currentProjects.length === 0) {
      const { projects: mockProjects } = generateMockData()
      setProjects(mockProjects)
      console.log(`[Mock Data] Generated ${mockProjects.length} projects`)
    }

    // Verify data was saved
    const verifyTasks = useTasksStore.getState().tasks
    console.log(`[Mock Data] ✅ Verified: ${verifyTasks.length} tasks saved to Zustand store`)
  }, [setProjects])

  useEffect(() => {
    const isProd =
      typeof import.meta !== 'undefined' &&
      (import.meta as { env?: { MODE?: string } }).env?.MODE === 'production'
    if (isProd) return

    // Check if we should generate mock data (only if stores are empty)
    const currentTasks = useTasksStore.getState().tasks
    const currentProjects = useProjectsStore.getState().projects

    // Only generate if stores are empty
    if (currentTasks.length > 0 || currentProjects.length > 0) {
      console.log(
        `[Mock Data] Stores already have data: ${currentTasks.length} tasks, ${currentProjects.length} projects`
      )
      return
    }

    console.log('[Mock Data] Starting automatic mock data generation...')

    // Generate and save mock data
    const { tasks: mockTasks, projects: mockProjects } = generateMockData()
    setProjects(mockProjects)
    setTasks(mockTasks)
    console.log(
      `[Mock Data] Auto-generated ${mockTasks.length} tasks and ${mockProjects.length} projects`
    )
  }, [setProjects, setTasks])

  // Create project name mapping
  const projectNameMap = useMemo<Map<string, string>>(() => {
    const map = new Map<string, string>()
    projects.forEach((project) => {
      if (project?.id && project?.name) {
        map.set(project.id, project.name)
      }
    })
    return map
  }, [projects])

  // Get project name helper
  const getProjectName = useCallback(
    (projectId: string): string => {
      if (projectId === 'uncategorized') return t('tasks.uncategorized')
      return projectNameMap.get(projectId) || projectId
    },
    [projectNameMap, t]
  )

  const stats = useMemo<StatisticsData>(() => {
    const workDuration = settings.workDuration || 25
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)

    // Calculate totals
    const totalPomodoros = tasks.reduce(
      (sum: number, task: Task) => sum + (task.completedPomodoros || 0),
      0
    )
    const totalTime = totalPomodoros * workDuration

    // Calculate today and week stats (approximate using task updatedAt)
    // This is an approximation since we don't track exact pomodoro completion dates
    const todayTasks = tasks.filter((task: Task) => {
      if (!task.updatedAt) return false
      const updatedAt = new Date(task.updatedAt)
      return !isNaN(updatedAt.getTime()) && updatedAt >= todayStart
    })
    const todayPomodoros = todayTasks.reduce(
      (sum: number, task: Task) => sum + (task.completedPomodoros || 0),
      0
    )
    const todayTime = todayPomodoros * workDuration

    const weekTasks = tasks.filter((task: Task) => {
      if (!task.updatedAt) return false
      const updatedAt = new Date(task.updatedAt)
      return !isNaN(updatedAt.getTime()) && updatedAt >= weekStart
    })
    const weekPomodoros = weekTasks.reduce(
      (sum: number, task: Task) => sum + (task.completedPomodoros || 0),
      0
    )
    const weekTime = weekPomodoros * workDuration

    // Calculate completed tasks
    const completedTasks = tasks.filter((task: Task) => task.completed).length
    const totalTasks = tasks.length
    const activeTasks = totalTasks - completedTasks
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
    const avgPomodorosPerTask = totalTasks === 0 ? 0 : totalPomodoros / totalTasks
    const avgTimePerTask = totalTasks === 0 ? 0 : totalTime / totalTasks

    // Calculate tasks by project
    const tasksByProject: Record<string, number> = {}
    tasks.forEach((task: Task) => {
      const projectId = task.projectId || 'uncategorized'
      tasksByProject[projectId] = (tasksByProject[projectId] || 0) + 1
    })

    const projectEntries = Object.entries(tasksByProject)
    const topProject = projectEntries.reduce<{ id: string; count: number } | null>(
      (current, [projectId, count]) => {
        if (!current || count > current.count) {
          return { id: projectId, count }
        }
        return current
      },
      null
    )

    const topProjectId = topProject?.id || null
    const topProjectCount = topProject?.count || 0
    const topProjectShare = totalTasks === 0 ? 0 : Math.round((topProjectCount / totalTasks) * 100)
    const todayShareOfWeek = weekTime === 0 ? 0 : Math.round((todayTime / weekTime) * 100)

    return {
      totalPomodoros,
      totalTime,
      todayPomodoros,
      todayTime,
      weekPomodoros,
      weekTime,
      completedTasks,
      totalTasks,
      activeTasks,
      completionRate,
      avgPomodorosPerTask,
      avgTimePerTask,
      topProjectId,
      topProjectCount,
      topProjectShare,
      todayShareOfWeek,
      tasksByProject,
    }
  }, [tasks, settings.workDuration])

  const formatTime = (minutes: number): string => {
    if (!Number.isFinite(minutes) || minutes < 0) return '0m'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatPercent = (value: number): string => {
    if (!Number.isFinite(value) || value < 0) return '0%'
    return `${Math.round(value)}%`
  }

  const formatAverage = (value: number): string => {
    if (!Number.isFinite(value) || value < 0) return '0.0'
    return value.toFixed(1)
  }

  const escapeCsvValue = (value: string | number): string => {
    const str = String(value)
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const handleExport = () => {
    const csv = [
      [t('statistics.metric'), t('statistics.value')],
      [t('statistics.totalPomodoros'), stats.totalPomodoros],
      [`${t('statistics.totalTime')} (${t('common.time')})`, formatTime(stats.totalTime)],
      [`${t('statistics.totalTime')} (${t('common.minutes')})`, stats.totalTime],
      [t('statistics.todayPomodoros'), stats.todayPomodoros],
      [`${t('statistics.todayTime')} (${t('common.time')})`, formatTime(stats.todayTime)],
      [`${t('statistics.todayTime')} (${t('common.minutes')})`, stats.todayTime],
      [`${t('statistics.thisWeek')} ${t('statistics.totalPomodoros')}`, stats.weekPomodoros],
      [`${t('statistics.thisWeek')} ${t('common.time')}`, formatTime(stats.weekTime)],
      [`${t('statistics.thisWeek')} ${t('common.minutes')}`, stats.weekTime],
      [t('statistics.completedTasks'), stats.completedTasks],
      [t('statistics.activeTasks'), stats.activeTasks],
      [t('statistics.totalTasks'), stats.totalTasks],
      [t('statistics.completionRate'), formatPercent(stats.completionRate)],
      [t('statistics.avgPomodorosPerTask'), formatAverage(stats.avgPomodorosPerTask)],
      [t('statistics.avgTimePerTask'), formatTime(Math.round(stats.avgTimePerTask))],
      [
        t('statistics.topProject'),
        stats.topProjectId
          ? `${getProjectName(stats.topProjectId)} (${stats.topProjectShare}%)`
          : t('statistics.noProjectData'),
      ],
      [t('statistics.todayShareOfWeek'), formatPercent(stats.todayShareOfWeek)],
      ['', ''],
      ['=== Tasks by Project ===', ''],
      ...Object.entries(stats.tasksByProject).map(([project, count]) => [
        `${t('statistics.tasksByProject')} - ${getProjectName(project)}`,
        count,
      ]),
    ]

    // Calculate Focus Time data for CSV export
    const workDuration = settings.workDuration || 25
    const now = new Date()

    const calculateFocusTimeData = (period: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly') => {
      const dataPoints: Array<{ date: Date; time: number }> = []

      switch (period) {
        case 'Daily': {
          const startDate = new Date(now)
          startDate.setDate(now.getDate() - 6)
          for (let i = 0; i < 7; i++) {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + i)
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const dayEnd = new Date(dayStart)
            dayEnd.setDate(dayEnd.getDate() + 1)

            const dayTasks = tasks.filter((task: Task) => {
              if (!task.updatedAt) return false
              const updatedAt = new Date(task.updatedAt)
              return !isNaN(updatedAt.getTime()) && updatedAt >= dayStart && updatedAt < dayEnd
            })
            const dayTime = dayTasks.reduce(
              (sum: number, task: Task) => sum + (task.completedPomodoros || 0) * workDuration,
              0
            )
            dataPoints.push({ date, time: dayTime })
          }
          break
        }
        case 'Weekly': {
          const startDate = new Date(now)
          startDate.setDate(now.getDate() - (now.getDay() + 6 * 7))
          for (let i = 0; i < 7; i++) {
            const weekStart = new Date(startDate)
            weekStart.setDate(startDate.getDate() + i * 7)
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekEnd.getDate() + 7)

            const weekTasks = tasks.filter((task: Task) => {
              if (!task.updatedAt) return false
              const updatedAt = new Date(task.updatedAt)
              return !isNaN(updatedAt.getTime()) && updatedAt >= weekStart && updatedAt < weekEnd
            })
            const weekTime = weekTasks.reduce(
              (sum: number, task: Task) => sum + (task.completedPomodoros || 0) * workDuration,
              0
            )
            dataPoints.push({ date: weekStart, time: weekTime })
          }
          break
        }
        case 'Monthly': {
          for (let i = 0; i < 7; i++) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1)
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - (6 - i) + 1, 1)

            const monthTasks = tasks.filter((task: Task) => {
              if (!task.updatedAt) return false
              const updatedAt = new Date(task.updatedAt)
              return !isNaN(updatedAt.getTime()) && updatedAt >= monthStart && updatedAt < monthEnd
            })
            const monthTime = monthTasks.reduce(
              (sum: number, task: Task) => sum + (task.completedPomodoros || 0) * workDuration,
              0
            )
            dataPoints.push({ date: monthStart, time: monthTime })
          }
          break
        }
        case 'Yearly': {
          for (let i = 0; i < 7; i++) {
            const yearStart = new Date(now.getFullYear() - (6 - i), 0, 1)
            const yearEnd = new Date(now.getFullYear() - (6 - i) + 1, 0, 1)

            const yearTasks = tasks.filter((task: Task) => {
              if (!task.updatedAt) return false
              const updatedAt = new Date(task.updatedAt)
              return !isNaN(updatedAt.getTime()) && updatedAt >= yearStart && updatedAt < yearEnd
            })
            const yearTime = yearTasks.reduce(
              (sum: number, task: Task) => sum + (task.completedPomodoros || 0) * workDuration,
              0
            )
            dataPoints.push({ date: yearStart, time: yearTime })
          }
          break
        }
      }
      return dataPoints
    }

    const formatDate = (date: Date, period: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'): string => {
      switch (period) {
        case 'Daily':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        case 'Weekly':
          return `Week ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        case 'Monthly':
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        case 'Yearly':
          return date.getFullYear().toString()
        default:
          return date.toISOString().split('T')[0]
      }
    }

    const dailyData = calculateFocusTimeData('Daily')
    const weeklyData = calculateFocusTimeData('Weekly')
    const monthlyData = calculateFocusTimeData('Monthly')
    const yearlyData = calculateFocusTimeData('Yearly')

    // Add Focus Time data to CSV
    const focusTimeSections = [
      ['', ''],
      ['=== Focus Time - Daily (Last 7 Days) ===', ''],
      ['Date', 'Focus Time (minutes)'],
      ...dailyData.map(({ date, time }) => [formatDate(date, 'Daily'), time]),
      ['', ''],
      ['=== Focus Time - Weekly (Last 7 Weeks) ===', ''],
      ['Week', 'Focus Time (minutes)'],
      ...weeklyData.map(({ date, time }) => [formatDate(date, 'Weekly'), time]),
      ['', ''],
      ['=== Focus Time - Monthly (Last 7 Months) ===', ''],
      ['Month', 'Focus Time (minutes)'],
      ...monthlyData.map(({ date, time }) => [formatDate(date, 'Monthly'), time]),
      ['', ''],
      ['=== Focus Time - Yearly (Last 7 Years) ===', ''],
      ['Year', 'Focus Time (minutes)'],
      ...yearlyData.map(({ date, time }) => [formatDate(date, 'Yearly'), time]),
    ]

    const fullCsv = [...csv, ...focusTimeSections]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n')

    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `focus-todo-stats-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Reusable stat card component
  const StatCard = ({
    icon,
    value,
    label,
    subtitle,
  }: {
    icon: string
    value: string | number
    label: string
    subtitle?: string
  }) => (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-6 md:p-8 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.25)]">
      <div className="text-4xl md:text-5xl mb-3 md:mb-4">{icon}</div>
      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-400 mb-1 md:mb-2">
        {value}
      </div>
      {subtitle && (
        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">{subtitle}</div>
      )}
      <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-white/95 text-2xl md:text-3xl m-0 font-semibold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          {t('statistics.title')}
        </h2>
        <div className="flex gap-2 md:gap-3">
          {typeof import.meta !== 'undefined' &&
            (import.meta as { env?: { MODE?: string } }).env?.MODE !== 'production' && (
              <button
                className="px-3 md:px-4 py-2 md:py-2.5 bg-blue-500 text-white rounded-lg font-medium text-xs md:text-sm cursor-pointer transition-all hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                onClick={handleGenerateMockData}
                title="Generate 100 mock tasks"
              >
                Generate Mock Data
              </button>
            )}
          <button
            className="px-4 md:px-6 py-2 md:py-3 bg-white text-emerald-400 rounded-lg font-medium text-sm md:text-base cursor-pointer transition-all border-2 border-white hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            onClick={handleExport}
          >
            📥 {t('common.export')}
          </button>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        <StatCard icon="🍅" value={stats.totalPomodoros} label={t('statistics.totalPomodoros')} />
        <StatCard icon="⏱️" value={formatTime(stats.totalTime)} label={t('statistics.totalTime')} />
        <StatCard icon="📅" value={stats.todayPomodoros} label={t('statistics.todayPomodoros')} />
        <StatCard icon="⏰" value={formatTime(stats.todayTime)} label={t('statistics.todayTime')} />
        <StatCard icon="📊" value={stats.weekPomodoros} label={t('statistics.thisWeek')} />
        <StatCard icon="✅" value={stats.completedTasks} label={t('statistics.completedTasks')} />
      </div>

      {/* Additional Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        <StatCard
          icon="🎯"
          value={formatPercent(stats.completionRate)}
          label={t('statistics.completionRate')}
          subtitle={`${stats.completedTasks}/${stats.totalTasks || 0}`}
        />
        <StatCard icon="🧩" value={stats.activeTasks} label={t('statistics.activeTasks')} />
        <StatCard
          icon="🍅"
          value={formatAverage(stats.avgPomodorosPerTask)}
          label={t('statistics.avgPomodorosPerTask')}
        />
        <StatCard
          icon="⏳"
          value={formatTime(Math.round(stats.avgTimePerTask))}
          label={t('statistics.avgTimePerTask')}
        />
        <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-6 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.25)]">
          <div className="text-4xl md:text-5xl mb-3 md:mb-4">🏷️</div>
          <div className="text-lg md:text-xl font-semibold text-emerald-400 mb-1 truncate">
            {stats.topProjectId
              ? getProjectName(stats.topProjectId)
              : t('statistics.noProjectData')}
          </div>
          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">
            {stats.topProjectId
              ? `${stats.topProjectCount} • ${formatPercent(stats.topProjectShare)}`
              : '-'}
          </div>
          <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {t('statistics.topProject')}
          </div>
        </div>
        <StatCard
          icon="📈"
          value={formatPercent(stats.todayShareOfWeek)}
          label={t('statistics.todayShareOfWeek')}
          subtitle={`${formatTime(stats.todayTime)} / ${formatTime(stats.weekTime)}`}
        />
      </div>

      <div className="grid grid-cols-1">
        <PomodoroRecordsTimeline tasks={tasks} workDuration={settings.workDuration || 25} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1">
        <ProjectTimeDistribution
          tasks={tasks}
          workDuration={settings.workDuration || 25}
          getProjectName={getProjectName}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8">
          <FocusTimeChart
            tasks={tasks}
            workDuration={settings.workDuration || 25}
            getProjectName={getProjectName}
          />
        </div>
        <FocusTimeGoal tasks={tasks} workDuration={settings.workDuration || 25} />
      </div>
    </div>
  )
}
