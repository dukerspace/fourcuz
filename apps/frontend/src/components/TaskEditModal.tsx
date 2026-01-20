import type { Priority, Project, Task } from '@shared/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsStore } from '../stores/projectsStore'

interface TaskEditModalProps {
  task: Task
  onClose: () => void
  onSave: (updatedTask: Partial<Task>) => void
}

export default function TaskEditModal({ task, onClose, onSave }: TaskEditModalProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [projectId, setProjectId] = useState(task.projectId || '')
  const [dueDate, setDueDate] = useState(task.dueDate?.split('T')[0] || '')
  const projects = useProjectsStore((state: { projects: Project[] }) => state.projects)

  const handleSave = () => {
    onSave({
      title,
      description: description || undefined,
      priority,
      projectId: projectId || undefined,
      dueDate: dueDate || undefined,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.1)] border border-black/5 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b-2 border-gray-200 dark:border-gray-700">
          <h3 className="m-0 text-gray-800 dark:text-gray-100 text-2xl">
            {t('common.edit')} {t('common.tasks')}
          </h3>
          <button
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-2xl leading-none flex items-center justify-center cursor-pointer transition-all border-none hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-600 dark:text-gray-400 text-sm">
              {t('common.title')} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('common.title')}
              className="px-3.5 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-base font-inherit bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all focus:outline-none focus:border-emerald-400 focus:bg-gray-50 dark:focus:bg-[#2d2d44] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-600 dark:text-gray-400 text-sm">
              {t('common.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('common.description')}
              rows={3}
              className="px-3.5 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-base font-inherit bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all focus:outline-none focus:border-emerald-400 focus:bg-gray-50 dark:focus:bg-[#2d2d44] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-600 dark:text-gray-400 text-sm">
                {t('common.priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="px-3.5 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-base font-inherit bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all focus:outline-none focus:border-emerald-400 focus:bg-gray-50 dark:focus:bg-[#2d2d44] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)]"
              >
                <option value="low">{t('common.low')}</option>
                <option value="medium">{t('common.medium')}</option>
                <option value="high">{t('common.high')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-600 dark:text-gray-400 text-sm">
                {t('common.project')}
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="px-3.5 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-base font-inherit bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all focus:outline-none focus:border-emerald-400 focus:bg-gray-50 dark:focus:bg-[#2d2d44] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)]"
              >
                <option value="">{t('common.project')}</option>
                {projects.map((project: Project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-600 dark:text-gray-400 text-sm">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3.5 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-base font-inherit bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all focus:outline-none focus:border-emerald-400 focus:bg-gray-50 dark:focus:bg-[#2d2d44] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 p-6 border-t-2 border-gray-200 dark:border-gray-700">
          <button
            className="px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-none hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            {t('common.cancel')}
          </button>
          <button
            className="px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all bg-emerald-400 text-white border-none hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
