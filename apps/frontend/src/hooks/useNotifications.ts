import { useEffect, useCallback } from 'react'
import type { Task } from '@shared/types'

export function useNotifications() {
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options,
      })
    }
  }, [])

  const checkReminders = useCallback(
    (tasks: Task[]) => {
      const now = new Date()

      tasks.forEach((task) => {
        if (task.completed || !task.reminder?.enabled || !task.reminder.time) {
          return
        }

        const reminderTime = new Date(task.reminder.time)
        const timeDiff = reminderTime.getTime() - now.getTime()

        // Show notification if reminder time is within the next minute
        if (timeDiff > 0 && timeDiff <= 60000) {
          showNotification(`Reminder: ${task.title}`, {
            body: task.description || 'Task reminder',
            tag: `task-${task.id}`,
          })
        }
      })

      // Check due dates
      tasks.forEach((task) => {
        if (task.completed || !task.dueDate) {
          return
        }

        const dueDate = new Date(task.dueDate)
        const timeDiff = dueDate.getTime() - now.getTime()
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

        // Alert if due today or overdue
        if (daysUntilDue <= 0) {
          showNotification(`Due Now: ${task.title}`, {
            body: 'This task is due or overdue',
            tag: `due-${task.id}`,
          })
        } else if (daysUntilDue === 1) {
          showNotification(`Due Tomorrow: ${task.title}`, {
            body: 'This task is due tomorrow',
            tag: `due-${task.id}`,
          })
        }
      })
    },
    [showNotification]
  )

  return { showNotification, checkReminders }
}
