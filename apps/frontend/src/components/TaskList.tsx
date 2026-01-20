import { Task } from '@shared/types'
import { useTranslation } from 'react-i18next'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (taskId: string) => void
  onTaskComplete: (taskId: string) => void
  onTaskUpdate: () => void
}

export default function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  onTaskComplete,
  onTaskUpdate,
}: TaskListProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl text-gray-800 dark:text-gray-200">{t('tasks.activeTasks')}</h3>
        <TaskForm onTaskCreated={onTaskUpdate} />
      </div>
      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-lg">{t('tasks.noActiveTasks')}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={task.id === selectedTaskId}
              onSelect={() => onSelectTask(task.id)}
              onComplete={onTaskComplete}
              onUpdate={onTaskUpdate}
            />
          ))
        )}
      </div>
    </div>
  )
}
