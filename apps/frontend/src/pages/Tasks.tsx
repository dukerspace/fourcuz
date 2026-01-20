import { Project, Task } from '@shared/types'
import { generateId } from '@shared/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmModal from '../components/ConfirmModal'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'
import { useProjectsStore } from '../stores/projectsStore'
import { useTasksStore } from '../stores/tasksStore'

export default function Tasks() {
  const { t } = useTranslation()
  // Subscribe to tasks array directly from Zustand store for reactivity
  const tasks = useTasksStore((state: { tasks: Task[] }) => state.tasks)
  const updateTaskStore = useTasksStore(
    (state: { updateTask: (taskId: string, updates: Partial<Task>) => void }) => state.updateTask
  )
  // Tasks are already sorted by order in the Zustand store
  const sortedTasks = tasks
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const handleTaskComplete = async (taskId: string) => {
    const task = sortedTasks.find((t: Task) => t.id === taskId)
    if (task) {
      updateTaskStore(taskId, { completed: !task.completed, updatedAt: new Date().toISOString() })
    }
  }

  const ProjectsManagement = () => {
    const { t } = useTranslation()
    const addProject = useProjectsStore(
      (state: { addProject: (project: Project) => void }) => state.addProject
    )
    const updateProjectStore = useProjectsStore(
      (state: { updateProject: (projectId: string, updates: Partial<Project>) => void }) =>
        state.updateProject
    )
    const removeProjectStore = useProjectsStore(
      (state: { removeProject: (projectId: string) => void }) => state.removeProject
    )
    const reorderProjectsStore = useProjectsStore(
      (state: {
        reorderProjects: (projectOrders: { id: string; order: number }[]) => Promise<void>
      }) => state.reorderProjects
    )
    const projects = useProjectsStore((state: { projects: Project[] }) => state.projects)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [newProjectName, setNewProjectName] = useState('')
    const [isExpanded, setIsExpanded] = useState(true)
    const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

    const handleCreateProject = async () => {
      const trimmedName = newProjectName.trim()
      if (!trimmedName) return

      const newProject: Project = {
        id: generateId(),
        name: trimmedName,
        order: projects.length,
        createdAt: new Date().toISOString(),
      }
      addProject(newProject)
      setNewProjectName('')
    }

    const handleStartEdit = (project: Project) => {
      setEditingId(project.id)
      setEditName(project.name)
    }

    const handleCancelEdit = () => {
      setEditingId(null)
      setEditName('')
    }

    const handleSaveEdit = async (id: string) => {
      if (!editName.trim()) return

      updateProjectStore(id, { name: editName.trim() })
      setEditingId(null)
      setEditName('')
    }

    const handleDeleteClick = (id: string) => {
      setProjectToDelete(id)
      setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
      if (!projectToDelete) return

      const id = projectToDelete
      setIsDeleteModalOpen(false)
      setProjectToDelete(null)

      removeProjectStore(id)
    }

    const handleDeleteCancel = () => {
      setIsDeleteModalOpen(false)
      setProjectToDelete(null)
    }

    const handleProjectDragStart = (e: React.DragEvent, projectId: string) => {
      setDraggedProjectId(projectId)
      e.dataTransfer.effectAllowed = 'move'
      ;(e.currentTarget as HTMLElement).style.opacity = '0.5'
    }

    const handleProjectDragEnd = (e: React.DragEvent) => {
      ;(e.currentTarget as HTMLElement).style.opacity = '1'
      setDraggedProjectId(null)
    }

    const handleProjectDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }

    const handleProjectDrop = async (e: React.DragEvent, dropProjectId: string) => {
      e.preventDefault()
      if (!draggedProjectId || draggedProjectId === dropProjectId) return

      const draggedIndex = projects.findIndex((p: Project) => p.id === draggedProjectId)
      const dropIndex = projects.findIndex((p: Project) => p.id === dropProjectId)

      if (draggedIndex === -1 || dropIndex === -1) return

      const newProjects = [...projects]
      const [draggedProject] = newProjects.splice(draggedIndex, 1)
      newProjects.splice(dropIndex, 0, draggedProject)

      // Update order for all projects
      const projectOrders = newProjects.map((project: Project, index) => ({
        id: project.id,
        order: index,
      }))

      reorderProjectsStore(projectOrders)
    }

    return (
      <>
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title={t('tasks.deleteProject')}
          message={t('tasks.deleteProjectConfirm')}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          variant="danger"
        />
        <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
          <div
            className="flex justify-between items-center cursor-pointer mb-4 p-2 rounded-lg transition-colors hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="m-0 text-gray-800 dark:text-gray-100 text-xl">{t('tasks.projects')}</h3>
            <span className="text-xs text-gray-600 dark:text-gray-400 transition-transform">
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>

          {isExpanded && (
            <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 mb-2">
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
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 dark:bg-[#2a2a3e] dark:text-gray-100 rounded-md text-sm font-inherit transition-colors focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCreateProject()
                  }}
                  className="w-8 h-8 rounded-md bg-emerald-400 text-white border-none text-xl font-semibold cursor-pointer flex items-center justify-center transition-all flex-shrink-0 hover:bg-emerald-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newProjectName.trim()}
                  title={t('tasks.createProject')}
                  type="button"
                >
                  +
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="text-base text-gray-500 dark:text-gray-400 text-center py-2">
                  {t('tasks.noProjects')}
                </p>
              ) : (
                <div
                  className="flex flex-col gap-2 max-h-[300px] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {projects.map((project: Project) => (
                    <div
                      key={project.id}
                      className={`flex items-center gap-2 px-2.5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-transparent dark:border-gray-700 transition-all text-sm hover:bg-gray-200 dark:hover:bg-[#2d2d44] hover:border-emerald-400/20 dark:hover:border-emerald-400/30 hover:translate-x-0.5 ${
                        draggedProjectId === project.id ? 'opacity-50' : ''
                      }`}
                      draggable={editingId !== project.id}
                      onDragStart={(e) =>
                        editingId !== project.id && handleProjectDragStart(e, project.id)
                      }
                      onDragEnd={handleProjectDragEnd}
                      onDragOver={handleProjectDragOver}
                      onDrop={(e) => handleProjectDrop(e, project.id)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingId === project.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(project.id)
                              if (e.key === 'Escape') handleCancelEdit()
                            }}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 dark:bg-[#2a2a3e] dark:text-gray-100 rounded-md text-sm font-inherit transition-colors focus:outline-none focus:border-emerald-400 m-0"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveEdit(project.id)}
                              className="w-7 h-7 rounded-md text-sm border-none cursor-pointer flex items-center justify-center transition-all bg-emerald-400 text-white hover:bg-emerald-500 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!editName.trim()}
                              title={t('common.save')}
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="w-7 h-7 rounded-md text-sm border-none cursor-pointer flex items-center justify-center transition-all bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                              title={t('common.cancel')}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span
                            className="flex items-center justify-center p-1 cursor-grab opacity-50 transition-opacity flex-shrink-0 hover:opacity-100 active:cursor-grabbing"
                            title={t('tasks.dragToReorder')}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <span className="text-sm leading-none -tracking-[2px] select-none">
                              ⋮⋮
                            </span>
                          </span>
                          <span className="flex-1 text-gray-800 dark:text-gray-100 font-medium text-base overflow-hidden text-ellipsis whitespace-nowrap">
                            {project.name}
                          </span>
                          <div className="flex gap-1 items-center flex-shrink-0">
                            <button
                              onClick={() => handleStartEdit(project)}
                              className="w-7 h-7 rounded-md text-base cursor-pointer flex items-center justify-center transition-all bg-transparent p-0 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 hover:scale-110"
                              title={t('common.edit')}
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDeleteClick(project.id)}
                              className="w-7 h-7 rounded-md text-base cursor-pointer flex items-center justify-center transition-all bg-transparent p-0 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:scale-110"
                              title={t('common.delete')}
                            >
                              ×
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </>
    )
  }

  const filteredTasks = sortedTasks.filter((task: Task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
    ;(e.currentTarget as HTMLElement).style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    ;(e.currentTarget as HTMLElement).style.opacity = '1'
    setDraggedTaskId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const reorderTasks = useTasksStore(
    (state: { reorderTasks: (taskOrders: { id: string; order: number }[]) => Promise<void> }) =>
      state.reorderTasks
  )

  const handleDrop = async (e: React.DragEvent, dropTaskId: string) => {
    e.preventDefault()
    if (!draggedTaskId || draggedTaskId === dropTaskId) return

    const draggedIndex = filteredTasks.findIndex((t: Task) => t.id === draggedTaskId)
    const dropIndex = filteredTasks.findIndex((t: Task) => t.id === dropTaskId)

    if (draggedIndex === -1 || dropIndex === -1) return

    // Reorder within the filtered view
    const newFilteredTasks = [...filteredTasks]
    const [draggedTask] = newFilteredTasks.splice(draggedIndex, 1)
    newFilteredTasks.splice(dropIndex, 0, draggedTask)

    // Get all tasks sorted by current order (use tasks from store)
    const allTasksSorted = tasks
    const filteredTaskIds = new Set(filteredTasks.map((t: Task) => t.id))

    // If filter is 'all', simply reorder all tasks
    if (filter === 'all') {
      const taskOrders = newFilteredTasks.map((task, index) => ({
        id: task.id,
        order: index,
      }))

      try {
        await reorderTasks(taskOrders)
      } catch (error) {
        console.error('Failed to reorder tasks:', error)
      }
      return
    }

    // For filtered views, we need to merge reordered filtered tasks with non-filtered tasks
    // Strategy: place reordered filtered tasks at the top, then non-filtered tasks
    const nonFilteredTasks = allTasksSorted.filter((t: Task) => !filteredTaskIds.has(t.id))

    // If filter is 'completed', place completed tasks at the top
    // If filter is 'active', place active tasks at the top
    const result: Task[] = [...newFilteredTasks, ...nonFilteredTasks]

    // Assign sequential orders starting from 0
    const taskOrders = result.map((task, index) => ({
      id: task.id,
      order: index,
    }))

    try {
      await reorderTasks(taskOrders)
    } catch (error) {
      console.error('Failed to reorder tasks:', error)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8 transition-all duration-300 flex justify-between items-center">
        <h2 className="text-gray-800 dark:text-gray-100 text-3xl">{t('tasks.title')}</h2>
        <div className="flex gap-2">
          <button
            className={`px-5 py-2.5 rounded-[10px] font-medium border transition-all duration-250 ${
              filter === 'all'
                ? 'bg-emerald-400 text-white border-emerald-400 shadow-[0_2px_8px_rgba(102,126,234,0.3)]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#2d2d44] hover:border-emerald-400/20 dark:hover:border-emerald-400/30 hover:-translate-y-px'
            }`}
            onClick={() => setFilter('all')}
          >
            {t('common.all')}
          </button>
          <button
            className={`px-5 py-2.5 rounded-[10px] font-medium border transition-all duration-250 ${
              filter === 'active'
                ? 'bg-emerald-400 text-white border-emerald-400 shadow-[0_2px_8px_rgba(102,126,234,0.3)]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#2d2d44] hover:border-emerald-400/20 dark:hover:border-emerald-400/30 hover:-translate-y-px'
            }`}
            onClick={() => setFilter('active')}
          >
            {t('common.active')}
          </button>
          <button
            className={`px-5 py-2.5 rounded-[10px] font-medium border transition-all duration-250 ${
              filter === 'completed'
                ? 'bg-emerald-400 text-white border-emerald-400 shadow-[0_2px_8px_rgba(102,126,234,0.3)]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#2d2d44] hover:border-emerald-400/20 dark:hover:border-emerald-400/30 hover:-translate-y-px'
            }`}
            onClick={() => setFilter('completed')}
          >
            {t('common.completed')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-8 max-md:grid-cols-1">
        <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8 transition-all duration-300 h-fit sticky top-8 max-md:static">
          <div className="mb-4">
            <h3 className="text-gray-800 dark:text-gray-100 text-xl">{t('tasks.createTask')}</h3>
          </div>
          <div className="relative mb-8">
            <TaskForm onTaskCreated={() => {}} />
          </div>

          <ProjectsManagement />
        </div>

        <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8 transition-all duration-300">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-base">{t('tasks.noTasks')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredTasks.map((task: Task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation()
                    handleDragStart(e, task.id)
                  }}
                  onDragEnd={(e) => {
                    e.stopPropagation()
                    handleDragEnd(e)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDragOver(e)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDrop(e, task.id)
                  }}
                  className={`transition-transform duration-200 relative hover:translate-x-0.5 ${
                    draggedTaskId === task.id ? 'opacity-50' : ''
                  }`}
                  data-task-id={task.id}
                >
                  <TaskItem
                    task={task}
                    isSelected={task.id === selectedTaskId}
                    onSelect={() => setSelectedTaskId(task.id)}
                    onComplete={handleTaskComplete}
                    onUpdate={() => {}}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
