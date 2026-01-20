import { useEffect, useState, useCallback } from 'react'
import type { Task } from '@shared/types'
import { useTasksStore } from '../stores/tasksStore'

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { setTasks, getTasks } = useTasksStore()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const saveTasks = useCallback(
    (tasks: Task[]) => {
      setTasks(tasks)
    },
    [setTasks]
  )

  return {
    isOnline,
    saveTasks,
    getTasks,
  }
}
