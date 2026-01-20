import type { Task } from '@shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
interface TasksStore {
  tasks: Task[]
  lastSync: string | null
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  removeTask: (taskId: string) => void
  getTasks: () => Task[]
  reorderTasks: (taskOrders: { id: string; order: number }[]) => Promise<void>
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      lastSync: null,

      setTasks: (tasks: Task[]) => {
        // Sort tasks by order to maintain Zustand store order
        const sortedTasks = [...tasks].sort((a, b) => {
          const orderA = a.order ?? 0
          const orderB = b.order ?? 0
          return orderA - orderB
        })
        set({
          tasks: sortedTasks,
          lastSync: new Date().toISOString(),
        })
      },

      addTask: (task: Task) => {
        set((state) => {
          // Ensure the task has the correct order (should be set by caller, but ensure it's at the end)
          const updatedTask = { ...task, order: task.order ?? state.tasks.length }
          // Add task at the end, maintaining order
          return {
            tasks: [...state.tasks, updatedTask],
          }
        })
      },

      updateTask: (taskId: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        }))
      },

      removeTask: (taskId: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }))
      },

      getTasks: () => {
        const tasks = get().tasks
        // Return tasks in the order they appear in the Zustand store
        return [...tasks]
      },

      reorderTasks: async (taskOrders: { id: string; order: number }[]) => {
        // Update local state immediately for optimistic UI
        const currentTasks = get().tasks
        const tasksMap = new Map(currentTasks.map((t) => [t.id, t]))

        // Update orders and create order map
        const taskOrderMap = new Map(taskOrders.map((to) => [to.id, to.order]))
        taskOrders.forEach(({ id, order }) => {
          const task = tasksMap.get(id)
          if (task) {
            tasksMap.set(id, { ...task, order })
          }
        })

        // Reorder tasks based on the order values (maintaining Zustand store order)
        // Sort by the new order values, which represent the desired Zustand store positions
        const updatedTasks = currentTasks
          .map((t) => tasksMap.get(t.id)!)
          .sort((a, b) => {
            const orderA = taskOrderMap.get(a.id) ?? a.order ?? 0
            const orderB = taskOrderMap.get(b.id) ?? b.order ?? 0
            return orderA - orderB
          })

        set({ tasks: updatedTasks })
      },
    }),
    {
      name: 'focus-todo-tasks',
    }
  )
)
