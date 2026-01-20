import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PomodoroTimer from '../components/PomodoroTimer'
import TaskList from '../components/TaskList'
import { usePomodoroTimer } from '../contexts/PomodoroContext'
import { useNotifications } from '../hooks/useNotifications'
import { useOfflineStorage } from '../hooks/useOfflineStorage'
import { useTasksStore } from '../stores/tasksStore'

export default function Dashboard() {
  const { t } = useTranslation()
  const { tasks, updateTask } = useTasksStore()
  const { setSelectedTaskId, state } = usePomodoroTimer()
  const { checkReminders } = useNotifications()
  const { isOnline } = useOfflineStorage()

  useEffect(() => {
    // Check reminders every minute
    const interval = setInterval(() => {
      checkReminders(tasks)
    }, 60000)

    // Check immediately
    checkReminders(tasks)

    return () => clearInterval(interval)
  }, [tasks, checkReminders])

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    updateTask(taskId, {
      completed: !task.completed,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
      <div className="text-center text-white/95 py-3 md:py-4">
        <h2 className="text-xl md:text-2xl lg:text-[2rem] mb-2 md:mb-3 font-semibold tracking-tight text-shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          {t('dashboard.title')}
        </h2>
        <p className="opacity-85 text-base md:text-lg font-normal leading-relaxed px-4">
          {t('dashboard.description')}
        </p>
        {!isOnline && (
          <div className="mt-4 py-3 px-5 bg-[rgba(255,193,7,0.15)] border border-[rgba(255,193,7,0.3)] rounded-[10px] text-[#ffc107] text-sm font-medium backdrop-blur-[8px] inline-block">
            {t('dashboard.offlineMode')}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 items-start">
        <div className="flex justify-center items-start">
          <PomodoroTimer
            selectedTaskId={state.selectedTaskId}
            selectedTask={tasks.find((t) => t.id === state.selectedTaskId) || null}
            onPomodoroComplete={() => {}}
          />
        </div>
        <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-4 md:p-6 lg:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/8 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.25)] dark:text-gray-200">
          <TaskList
            tasks={tasks.filter((t) => !t.completed)}
            selectedTaskId={state.selectedTaskId}
            onSelectTask={setSelectedTaskId}
            onTaskComplete={handleTaskComplete}
            onTaskUpdate={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
