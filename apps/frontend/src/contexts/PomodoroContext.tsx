import { PomodoroType } from '@shared/types'
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { usePomodoroStore } from '../stores/pomodoroStore'
import { useTasksStore } from '../stores/tasksStore'

interface PomodoroState {
  timeLeft: number
  isRunning: boolean
  type: PomodoroType
  workSessionsCompleted: number
  selectedTaskId: string | null
  settings: import('@shared/types').TimerSettings
  startTime: number | null
}

interface PomodoroContextType {
  state: PomodoroState
  start: () => void
  pause: () => void
  reset: () => void
  resetAll: () => void
  setType: (type: PomodoroType) => void
  setSelectedTaskId: (taskId: string | null) => void
  setOnCompleteCallback: (callback: (() => void) | null) => void
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const store = usePomodoroStore()
  const tasks = useTasksStore((state) => state.tasks)
  const updateTask = useTasksStore((state) => state.updateTask)
  const { t } = useTranslation()

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch((error) => {
          console.warn(t('pomodoro.notificationPermissionRequestFailed'), error)
        })
      }
    }
  }, [t])

  // Show browser native notification using Web Notifications API
  const showBrowserNotification = useCallback(
    (title: string, body: string, tag: string, options?: NotificationOptions) => {
      // Check if Web Notifications API is supported
      if (!('Notification' in window)) {
        console.warn(t('pomodoro.notificationNotSupported'))
        return
      }

      // Check if permission is granted
      if (Notification.permission !== 'granted') {
        // Try to request permission if not denied
        if (Notification.permission === 'default') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              showBrowserNotification(title, body, tag, options)
            }
          }).catch(() => {
            console.warn(t('pomodoro.notificationPermissionRequestFailed'))
          })
        }
        return
      }

      try {
        const notification = new Notification(title, {
          body,
          tag, // Prevents duplicate notifications with the same tag
          icon: '/vite.svg',
          badge: '/vite.svg',
          requireInteraction: false,
          silent: !store.settings.soundEnabled, // Silent if sound is disabled
          ...options,
        })

        // Handle notification click - focus the window
        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        // Handle notification errors
        notification.onerror = (error) => {
          console.error(t('pomodoro.notificationError'), error)
        }

        // Auto-close notification after 5 seconds if not interacted with
        setTimeout(() => {
          notification.close()
        }, 5000)
      } catch (error) {
        console.error(t('pomodoro.notificationError'), error)
      }
    },
    [store.settings.soundEnabled, t]
  )

  // Create state object from store for context compatibility
  const state: PomodoroState = {
    timeLeft: store.timeLeft,
    isRunning: store.isRunning,
    type: store.type,
    workSessionsCompleted: store.workSessionsCompleted,
    selectedTaskId: store.selectedTaskId,
    settings: store.settings,
    startTime: store.startTime,
  }

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const onCompleteCallbackRef = useRef<(() => void) | null>(null)
  const handleCompleteRef = useRef<((completedState: PomodoroState) => Promise<void>) | null>(null)

  // Helper to get duration for timer type
  const getDurationForType = (timerType: PomodoroType, settings: typeof store.settings): number => {
    switch (timerType) {
      case 'work':
        return settings.workDuration
      case 'shortBreak':
        return settings.shortBreakDuration
      case 'longBreak':
        return settings.longBreakDuration
    }
  }

  // Keep timer duration aligned when settings change
  useEffect(() => {
    const currentState = store
    const settings = store.settings

    // If break is disabled and we're on a break, switch to work
    if (
      settings.disableBreak &&
      (currentState.type === 'shortBreak' || currentState.type === 'longBreak')
    ) {
      store.setType('work')
      store.setTimeLeft(settings.workDuration * 60)
      store.pause()
      return
    }

    // Update timer duration if not running
    // Only reset to full duration if timer hasn't been started or completed
    // This prevents resetting the time when pausing
    if (!currentState.isRunning) {
      const desiredTimeLeft = getDurationForType(currentState.type, settings) * 60
      // Only update if timer is at initial state or completed (not paused)
      if (
        (currentState.timeLeft === desiredTimeLeft || currentState.timeLeft === 0) &&
        currentState.timeLeft !== desiredTimeLeft
      ) {
        store.setTimeLeft(desiredTimeLeft)
      }
    }
  }, [
    store.settings.workDuration,
    store.settings.shortBreakDuration,
    store.settings.longBreakDuration,
    store.type,
    // Removed store.isRunning and store.timeLeft from dependencies
    // to prevent resetting when pausing
  ])

  // Timer interval
  useEffect(() => {
    if (store.isRunning && store.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        const currentState = store
        if (currentState.timeLeft <= 1) {
          // Trigger completion handler - use ref to ensure latest version
          store.setTimeLeft(0)
          store.pause()
          setTimeout(() => {
            if (handleCompleteRef.current) {
              handleCompleteRef.current(currentState)
            }
          }, 0)
        } else {
          store.decrementTime()
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [store.isRunning, store.timeLeft])

  const playNotificationSound = () => {
    if (audioRef.current && store.settings.soundEnabled) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      })
    }
  }

  // Helper to create and play a chord sound
  const playChordSound = (
    chordNotes: number[],
    duration: number,
    filterFreq: number,
    noteGain: number,
    detuneMultiplier: number
  ) => {
    if (!store.settings.soundEnabled) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const startTime = audioContext.currentTime
      const masterGain = audioContext.createGain()

      masterGain.connect(audioContext.destination)
      masterGain.gain.setValueAtTime(0.25, startTime)

      chordNotes.forEach((frequency, index) => {
        const detuneAmount = (index - 1) * detuneMultiplier
        const detunedFreq = frequency * Math.pow(2, detuneAmount / 1200)

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        const biquadFilter = audioContext.createBiquadFilter()

        oscillator.type = 'triangle'
        oscillator.frequency.value = detunedFreq
        biquadFilter.type = 'lowpass'
        biquadFilter.frequency.value = filterFreq
        biquadFilter.Q.value = 1

        oscillator.connect(biquadFilter)
        biquadFilter.connect(gainNode)
        gainNode.connect(masterGain)

        const attackTime = duration === 3.0 ? 0.1 : 0.2
        const sustainEnd = duration === 3.0 ? duration - 0.3 : duration - 0.5

        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(noteGain, startTime + attackTime)
        gainNode.gain.setValueAtTime(noteGain, startTime + sustainEnd)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      })
    } catch (error) {
      console.error('Failed to play sound:', error)
    }
  }

  const playBreakSound = () => {
    playChordSound(
      [261.63, 329.63, 392.0, 493.88], // C major 7th chord
      3.0,
      2000,
      0.15 / 4,
      2
    )
  }

  const playLongBreakSound = () => {
    playChordSound(
      [220.0, 261.63, 329.63], // A minor chord
      5.0,
      1800,
      0.18 / 3,
      3
    )
  }

  // Helper to get notification content based on timer type
  const getNotificationContent = (type: PomodoroType) => {
    const notifications = {
      work: {
        title: t('pomodoro.workTimeUp'),
        body: t('pomodoro.workTimeUpBody'),
        tag: 'pomodoro-work-complete',
      },
      shortBreak: {
        title: t('pomodoro.shortBreakTimeUp'),
        body: t('pomodoro.shortBreakTimeUpBody'),
        tag: 'pomodoro-short-break-complete',
      },
      longBreak: {
        title: t('pomodoro.longBreakTimeUp'),
        body: t('pomodoro.longBreakTimeUpBody'),
        tag: 'pomodoro-long-break-complete',
      },
    }
    return notifications[type]
  }

  const handleComplete = async (completedState: PomodoroState) => {
    // Show notification when timer ends
    const notification = getNotificationContent(completedState.type)
    showBrowserNotification(notification.title, notification.body, notification.tag)

    // Record pomodoro locally
    if (completedState.type === 'work' && completedState.selectedTaskId) {
      const task = tasks.find((t) => t.id === completedState.selectedTaskId)
      if (task) {
        updateTask(task.id, {
          completedPomodoros: (task.completedPomodoros || 0) + 1,
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // Call the callback if set
    if (onCompleteCallbackRef.current) {
      onCompleteCallbackRef.current()
    }

    // Auto-start break or next work session
    if (completedState.type === 'work') {
      const newWorkSessionsCompleted = completedState.workSessionsCompleted + 1
      store.setWorkSessionsCompleted(newWorkSessionsCompleted)

      if (completedState.settings.disableBreak) {
        // Skip breaks if disabled
        store.setType('work')
        store.setTimeLeft(getDurationForType('work', completedState.settings) * 60)
        store.pause()
        if (completedState.settings.autoStartPomodoros) {
          store.start()
        }
      } else {
        // Determine next break type
        const nextType =
          newWorkSessionsCompleted >= completedState.settings.longBreakInterval
            ? 'longBreak'
            : 'shortBreak'

        store.setType(nextType)
        store.setTimeLeft(getDurationForType(nextType, completedState.settings) * 60)
        store.pause()

        if (completedState.settings.autoStartBreaks) {
          store.start()
        }

        // Play break sound when break starts
        if (completedState.settings.soundEnabled) {
          setTimeout(
            () => (nextType === 'longBreak' ? playLongBreakSound() : playBreakSound()),
            100
          )
        }
      }
    } else {
      // Break completed - transition back to work
      const shouldReset = completedState.type === 'longBreak'

      store.setType('work')
      store.setTimeLeft(getDurationForType('work', completedState.settings) * 60)
      if (shouldReset) {
        store.setWorkSessionsCompleted(0)
      }
      store.pause()

      if (completedState.settings.autoStartPomodoros) {
        store.start()
      }

      // Play sound when break ends
      if (completedState.settings.soundEnabled) {
        setTimeout(() => {
          if (completedState.type === 'shortBreak') {
            playBreakSound()
          } else if (completedState.type === 'longBreak') {
            playLongBreakSound()
          } else {
            playNotificationSound()
          }
        }, 100)
      }
    }
  }

  // Update ref whenever handleComplete dependencies change
  useEffect(() => {
    handleCompleteRef.current = handleComplete
  }, [handleComplete, showBrowserNotification, t, tasks, updateTask, store])

  const start = () => {
    store.start()
  }

  const pause = () => {
    store.pause()
  }

  const reset = () => {
    store.reset()
  }

  const resetAll = () => {
    store.resetAll()
  }

  const setType = (newType: PomodoroType) => {
    store.setType(newType)
  }

  const setSelectedTaskId = useCallback(
    (taskId: string | null) => {
      store.setSelectedTaskId(taskId)
    },
    [store]
  )

  const setOnCompleteCallback = useCallback((callback: (() => void) | null) => {
    onCompleteCallbackRef.current = callback
  }, [])

  return (
    <PomodoroContext.Provider
      value={{
        state,
        start,
        pause,
        reset,
        resetAll,
        setType,
        setSelectedTaskId,
        setOnCompleteCallback,
      }}
    >
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoroTimer() {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error('usePomodoroTimer must be used within a PomodoroProvider')
  }
  return context
}
