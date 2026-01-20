import { Task } from '@shared/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmModal from './ConfirmModal'
import TaskEditModal from './TaskEditModal'
import { useTasksStore } from '../stores/tasksStore'

interface TaskItemProps {
  task: Task
  isSelected: boolean
  onSelect: () => void
  onComplete: (taskId: string) => void
  onUpdate: () => void
}

export default function TaskItem({
  task,
  isSelected,
  onSelect,
  onComplete,
  onUpdate,
}: TaskItemProps) {
  const { t } = useTranslation()
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { removeTask, updateTask } = useTasksStore()

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false)
    removeTask(task.id)
    onUpdate()
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
  }

  const handleEdit = async (updatedTask: Partial<Task>) => {
    updateTask(task.id, {
      ...updatedTask,
      updatedAt: new Date().toISOString(),
    })
    onUpdate()
  }

  const priorityColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
  }

  return (
    <div
      className={`flex justify-between items-center py-[18px] px-[18px] bg-gray-50 dark:bg-gray-800 rounded-xl border-2 cursor-pointer transition-all duration-250 ${
        isSelected
          ? 'border-[#34d399] bg-[rgba(52,211,153,0.12)] dark:bg-[rgba(52,211,153,0.18)] shadow-[0_2px_12px_rgba(52,211,153,0.2)] dark:shadow-[0_2px_12px_rgba(52,211,153,0.3)]'
          : 'border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-[#2d2d44] hover:border-[rgba(52,211,153,0.4)] dark:hover:border-[rgba(52,211,153,0.5)] hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.25)]'
      } ${task.completed ? 'opacity-60 pointer-events-auto' : ''}`}
      onClick={() => {
        // Don't trigger select if dragging
        if (!isDragging) {
          onSelect()
        }
      }}
      onMouseDown={() => {
        // Reset dragging state when mouse is pressed
        setIsDragging(false)
      }}
    >
      <div
        className="flex items-center justify-center py-1 px-2 cursor-grab opacity-50 hover:opacity-100 transition-opacity duration-200 flex-shrink-0 text-gray-500 dark:text-gray-400 active:cursor-grabbing"
        title={t('tasks.dragToReorder')}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          // Don't stop propagation on mousedown - allow drag to start
          // Only prevent if it's a right-click or middle-click
          if (e.button !== 0) {
            e.stopPropagation()
          }
        }}
      >
        <span className="text-base leading-none -tracking-[2px] select-none">⋮⋮</span>
      </div>
      <div className="flex items-start gap-4 flex-1">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onComplete(task.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 cursor-pointer mt-0.5"
        />
        <div className="flex-1">
          <div
            className={`font-semibold text-base text-gray-800 dark:text-gray-200 mb-1 ${task.completed ? 'line-through' : ''}`}
          >
            {task.title}
          </div>
          {task.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</div>
          )}
          <div className="flex gap-4 items-center text-xs">
            {task.priority && (
              <span
                className="uppercase font-semibold text-xs"
                style={{ color: priorityColors[task.priority] }}
              >
                {task.priority}
              </span>
            )}
            {task.completedPomodoros > 0 && (
              <span className="text-[#34d399] font-medium">
                🍅 {task.completedPomodoros} {t('tasks.pomodoros')}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          className="w-7 h-7 rounded-full text-xl leading-none flex items-center justify-center transition-all duration-200 cursor-pointer bg-[#34d399] text-white hover:bg-[#10b981] hover:scale-110"
          onClick={(e) => {
            e.stopPropagation()
            setShowEditModal(true)
          }}
          aria-label="Edit task"
        >
          ✎
        </button>
        <button
          className="w-7 h-7 rounded-full text-xl leading-none flex items-center justify-center transition-all duration-200 cursor-pointer bg-[#ff4444] text-white hover:bg-[#cc0000] hover:scale-110"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteClick()
          }}
          aria-label="Delete task"
        >
          ×
        </button>
      </div>
      {showEditModal && (
        <TaskEditModal task={task} onClose={() => setShowEditModal(false)} onSave={handleEdit} />
      )}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={t('tasks.deleteTask')}
        message={t('tasks.deleteTaskConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </div>
  )
}
