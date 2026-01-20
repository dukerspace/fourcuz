import type { Project } from '@shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
interface ProjectsStore {
  projects: Project[]
  lastSync: string | null
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  removeProject: (projectId: string) => void
  getProjects: () => Project[]
  reorderProjects: (projectOrders: { id: string; order: number }[]) => Promise<void>
}

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set, get) => ({
      projects: [],
      lastSync: null,

      setProjects: (projects: Project[]) => {
        // Sort projects by order when setting
        const sortedProjects = [...projects].sort((a, b) => {
          const orderA = a.order ?? 0
          const orderB = b.order ?? 0
          if (orderA !== orderB) {
            return orderA - orderB
          }
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateA - dateB
        })
        set({
          projects: sortedProjects,
          lastSync: new Date().toISOString(),
        })
      },

      addProject: (project: Project) => {
        set((state) => {
          // Get max order and add 1 for new project
          const maxOrder =
            state.projects.length > 0 ? Math.max(...state.projects.map((p) => p.order || 0)) : -1
          const newProject = {
            ...project,
            order: project.order !== undefined ? project.order : maxOrder + 1,
          }
          return {
            projects: [...state.projects, newProject],
          }
        })
      },

      updateProject: (projectId: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId ? { ...project, ...updates } : project
          ),
        }))
      },

      removeProject: (projectId: string) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== projectId),
        }))
      },

      getProjects: () => {
        const projects = get().projects
        // Sort by order field, then by createdAt as fallback
        return [...projects].sort((a, b) => {
          const orderA = a.order ?? 0
          const orderB = b.order ?? 0
          if (orderA !== orderB) {
            return orderA - orderB
          }
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateA - dateB
        })
      },

      reorderProjects: async (projectOrders: { id: string; order: number }[]) => {
        // Update local state immediately for optimistic UI
        const currentProjects = get().projects
        const projectsMap = new Map(currentProjects.map((p) => [p.id, p]))

        // Update orders in the map
        projectOrders.forEach(({ id, order }) => {
          const project = projectsMap.get(id)
          if (project) {
            projectsMap.set(id, { ...project, order })
          }
        })

        // Convert back to array and sort
        const updatedProjects = Array.from(projectsMap.values()).sort((a, b) => {
          const orderA = a.order ?? 0
          const orderB = b.order ?? 0
          if (orderA !== orderB) {
            return orderA - orderB
          }
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateA - dateB
        })

        set({ projects: updatedProjects })
      },
    }),
    {
      name: 'focus-todo-projects',
    }
  )
)
