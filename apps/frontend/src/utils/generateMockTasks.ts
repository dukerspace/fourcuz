import type { Task } from '@shared/types'
import { useTasksStore } from '../stores/tasksStore'

/**
 * Generate 100 mock tasks and save them to Zustand store
 */
export function generateAndSaveMockTasks(): void {
  const now = new Date()
  const daysAgo = (days: number, hour?: number, minute?: number) => {
    const date = new Date(now)
    date.setDate(now.getDate() - days)
    if (hour !== undefined) {
      date.setHours(hour, minute !== undefined ? minute : 0, 0, 0)
    }
    return date.toISOString()
  }

  const priorities: Task['priority'][] = ['low', 'medium', 'high']
  const projectIds = [
    'project-work',
    'project-study',
    'project-life',
    'project-health',
    'project-hobby',
    undefined, // uncategorized
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
    { title: 'Design mockup', desc: 'Create UI designs' },
    { title: 'Write documentation', desc: 'Update project docs' },
    { title: 'Fix bug', desc: 'Resolve reported issues' },
    { title: 'Team meeting', desc: 'Sync with team' },
    { title: 'Learn new skill', desc: 'Online course' },
  ]

  const mockTasks: Task[] = []
  const totalTasks = 100
  let order = 0

  // Helper functions
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  // Distribute tasks across the last 90 days
  const daysToSpread = 90

  for (let taskIndex = 0; taskIndex < totalTasks; taskIndex += 1) {
    const templateIndex = taskIndex % taskTemplates.length
    const projectId = randomChoice(projectIds)
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

    // Distribute tasks across the last 90 days with different hours
    const daysAgoForTask = randomInt(0, daysToSpread)
    const createdAtHour = randomInt(0, 23)
    const createdAtMinute = randomInt(0, 59)
    const createdAt = daysAgo(daysAgoForTask + randomInt(0, 2), createdAtHour, createdAtMinute)

    // UpdatedAt can be same day or up to 3 days later for completed tasks
    // Distribute across different hours (0-23) for better visualization
    const daysSinceUpdate = completed ? randomInt(0, 3) : randomInt(0, daysAgoForTask)
    const updatedAtHour = randomInt(0, 23) // Random hour for better distribution
    const updatedAtMinute = randomInt(0, 59)
    const updatedAt = daysAgo(
      Math.max(0, daysAgoForTask - daysSinceUpdate),
      updatedAtHour,
      updatedAtMinute
    )

    mockTasks.push({
      id: `task-${taskIndex + 1}`,
      title: `${taskTemplates[templateIndex].title} #${taskIndex + 1}`,
      description: taskTemplates[templateIndex].desc,
      completed,
      priority,
      projectId,
      order,
      createdAt,
      updatedAt,
      completedPomodoros,
    })

    order += 1
  }

  // Save to Zustand store
  console.log(`[Mock Tasks] Generating ${mockTasks.length} tasks...`)
  useTasksStore.getState().setTasks(mockTasks)

  // Verify data was saved
  const verifyTasks = useTasksStore.getState().tasks
  console.log(`[Mock Tasks] ✅ Saved ${verifyTasks.length} tasks to Zustand store`)
}

/**
 * Generate mock tasks and return them (without saving)
 */
export function generateMockTasks(): Task[] {
  const now = new Date()
  const daysAgo = (days: number, hour?: number, minute?: number) => {
    const date = new Date(now)
    date.setDate(now.getDate() - days)
    if (hour !== undefined) {
      date.setHours(hour, minute !== undefined ? minute : 0, 0, 0)
    }
    return date.toISOString()
  }

  const priorities: Task['priority'][] = ['low', 'medium', 'high']
  const projectIds = [
    'project-work',
    'project-study',
    'project-life',
    'project-health',
    'project-hobby',
    undefined,
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
    { title: 'Design mockup', desc: 'Create UI designs' },
    { title: 'Write documentation', desc: 'Update project docs' },
    { title: 'Fix bug', desc: 'Resolve reported issues' },
    { title: 'Team meeting', desc: 'Sync with team' },
    { title: 'Learn new skill', desc: 'Online course' },
  ]

  const mockTasks: Task[] = []
  const totalTasks = 100
  let order = 0

  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  const daysToSpread = 90

  for (let taskIndex = 0; taskIndex < totalTasks; taskIndex += 1) {
    const templateIndex = taskIndex % taskTemplates.length
    const projectId = randomChoice(projectIds)
    const priority = randomChoice(priorities)

    const completionChance = 0.5
    const completed = Math.random() < completionChance

    let completedPomodoros = 0
    if (completed) {
      const pomodoroWeights = [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8]
      completedPomodoros = randomChoice(pomodoroWeights)
    } else {
      completedPomodoros = randomInt(0, 3)
    }

    const daysAgoForTask = randomInt(0, daysToSpread)
    const createdAtHour = randomInt(0, 23)
    const createdAtMinute = randomInt(0, 59)
    const createdAt = daysAgo(daysAgoForTask + randomInt(0, 2), createdAtHour, createdAtMinute)

    // Distribute across different hours (0-23) for better visualization
    const daysSinceUpdate = completed ? randomInt(0, 3) : randomInt(0, daysAgoForTask)
    const updatedAtHour = randomInt(0, 23) // Random hour for better distribution
    const updatedAtMinute = randomInt(0, 59)
    const updatedAt = daysAgo(
      Math.max(0, daysAgoForTask - daysSinceUpdate),
      updatedAtHour,
      updatedAtMinute
    )

    mockTasks.push({
      id: `task-${taskIndex + 1}`,
      title: `${taskTemplates[templateIndex].title} #${taskIndex + 1}`,
      description: taskTemplates[templateIndex].desc,
      completed,
      priority,
      projectId,
      order,
      createdAt,
      updatedAt,
      completedPomodoros,
    })

    order += 1
  }

  return mockTasks
}
