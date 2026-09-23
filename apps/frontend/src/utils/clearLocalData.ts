import { DEFAULT_TIMER_SETTINGS, STORAGE_KEYS } from '@shared/constants'
import { useLanguageStore } from '../stores/languageStore'
import { usePomodoroStore } from '../stores/pomodoroStore'
import { useProjectsStore } from '../stores/projectsStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useTasksStore } from '../stores/tasksStore'
import { useThemeStore } from '../stores/themeStore'

export function clearLocalData(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key)
  }

  useTasksStore.setState({ tasks: [], lastSync: null })
  useProjectsStore.setState({ projects: [], lastSync: null })
  useSettingsStore.setState({ focusTimeGoalHours: 3 })
  usePomodoroStore.setState({
    timeLeft: DEFAULT_TIMER_SETTINGS.workDuration * 60,
    isRunning: false,
    type: 'work',
    workSessionsCompleted: 0,
    selectedTaskId: null,
    settings: DEFAULT_TIMER_SETTINGS,
    startTime: null,
  })
  useThemeStore.getState().setTheme('light')
  useLanguageStore.getState().setLanguage('en')

  window.location.reload()
}
