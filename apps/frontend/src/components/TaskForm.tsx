import { Priority, Project, Task } from '@shared/types'
import { generateId } from '@shared/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsStore } from '../stores/projectsStore'
import { useTasksStore } from '../stores/tasksStore'

interface TaskFormProps {
  onTaskCreated: () => void
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const { t } = useTranslation()
  const { addTask, getTasks } = useTasksStore()
  const projects = useProjectsStore((state: { projects: Project[] }) => state.projects)
  const { addProject } = useProjectsStore()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [projectId, setProjectId] = useState<string>('')
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    const newProject: Project = {
      id: generateId(),
      name: newProjectName.trim(),
      order: projects.length,
      createdAt: new Date().toISOString(),
    }
    addProject(newProject)
    setProjectId(newProject.id) // Select the newly created project
    setNewProjectName('')
    setShowCreateProject(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const existingTasks = getTasks()
    const newTask: Task = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      projectId: projectId || undefined,
      order: existingTasks.length, // Add at the end
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedPomodoros: 0,
    }
    addTask(newTask)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setProjectId('')
    setIsOpen(false)
    onTaskCreated()
  }

  const handleClose = () => {
    setIsOpen(false)
    setTitle('')
    setDescription('')
    setProjectId('')
    setShowCreateProject(false)
    setNewProjectName('')
  }

  return (
    <>
      {!isOpen ? (
        <button
          className="py-2 px-4 bg-[#34d399] text-white rounded-lg font-medium transition-all duration-200 border-none cursor-pointer hover:bg-[#10b981] hover:-translate-y-0.5"
          onClick={() => setIsOpen(true)}
        >
          + {t('tasks.createTask')}
        </button>
      ) : (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          onClick={handleClose}
        >
          <form
            className="flex flex-col bg-white/98 dark:bg-gray-800 rounded-[20px] max-w-[500px] w-full shadow-[0_8px_32px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.1)] border border-black/5 backdrop-blur-[12px] dark:text-gray-200"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center py-6 px-6 border-b-2 border-gray-200 dark:border-gray-700">
              <h3 className="m-0 text-gray-800 dark:text-gray-200 text-xl">
                {t('tasks.createTask')}
              </h3>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-2xl leading-none flex items-center justify-center cursor-pointer border-none transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={handleClose}
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-4 py-6 px-6">
              <input
                type="text"
                placeholder={t('common.title') + '...'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="py-3.5 px-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-base bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-250 focus:border-[#34d399] focus:outline-none focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(52,211,153,0.2)] focus:bg-gray-50 dark:focus:bg-[#2d2d44]"
                autoFocus
              />
              <textarea
                placeholder={t('common.description') + ' (optional)...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="py-3.5 px-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-base bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-250 focus:border-[#34d399] focus:outline-none focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(52,211,153,0.2)] focus:bg-gray-50 dark:focus:bg-[#2d2d44] resize-y font-inherit"
                rows={2}
              />
              <div className="flex gap-2">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="flex-1 py-2 px-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-base cursor-pointer bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="low">
                    {t('common.low')} {t('common.priority')}
                  </option>
                  <option value="medium">
                    {t('common.medium')} {t('common.priority')}
                  </option>
                  <option value="high">
                    {t('common.high')} {t('common.priority')}
                  </option>
                </select>
                <div className="flex-1 flex gap-2 items-center">
                  {!showCreateProject ? (
                    <>
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="flex-1 py-2 px-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-base cursor-pointer bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      >
                        <option value="">{t('common.project')}</option>
                        {projects.map((project: Project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="w-9 h-9 rounded-lg bg-[#34d399] text-white border-none text-xl font-semibold cursor-pointer flex items-center justify-center transition-all duration-200 flex-shrink-0 hover:bg-[#10b981] hover:-translate-y-0.5"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCreateProject(true)
                        }}
                        title={t('tasks.createProject')}
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder={t('tasks.newProject')}
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateProject()
                          }
                        }}
                        className="py-2 px-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-base bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-[#34d399] focus:outline-none focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="py-1.5 px-3 rounded-md text-sm font-medium border-none cursor-pointer transition-all duration-200 bg-[#34d399] text-white hover:bg-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleCreateProject}
                          disabled={!newProjectName.trim()}
                        >
                          {t('common.create')}
                        </button>
                        <button
                          type="button"
                          className="py-1.5 px-3 rounded-md text-sm font-medium border-none cursor-pointer transition-all duration-200 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={(e) => {
                            e.preventDefault()
                            setShowCreateProject(false)
                            setNewProjectName('')
                          }}
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end py-6 px-6 border-t-2 border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={handleClose}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-[#34d399] text-white hover:bg-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!title.trim()}
              >
                {t('common.create')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
