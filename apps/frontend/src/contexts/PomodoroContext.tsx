import { PomodoroType } from '@shared/types'
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef } from 'react'
import { useMusicStore } from '../stores/musicStore'
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
  const musicStore = useMusicStore()

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

    // Update timer duration if not running and type matches
    const getDurationForType = (timerType: PomodoroType): number => {
      switch (timerType) {
        case 'work':
          return settings.workDuration
        case 'shortBreak':
          return settings.shortBreakDuration
        case 'longBreak':
          return settings.longBreakDuration
      }
    }

    // Only update timeLeft if timer is not running
    // Only reset to full duration if timer hasn't been started (timeLeft == full duration)
    // or if timer completed (timeLeft == 0)
    // This prevents resetting the time when pausing (when timeLeft is between 0 and full duration)
    if (!currentState.isRunning) {
      const desiredTimeLeft = getDurationForType(currentState.type) * 60
      // Only update if timer is at initial state (hasn't been started) or completed
      // Don't reset if the timer was paused (timeLeft is between 0 and full duration)
      if (currentState.timeLeft === desiredTimeLeft || currentState.timeLeft === 0) {
        // Timer is at initial state or completed, safe to update when settings change
        if (currentState.timeLeft !== desiredTimeLeft) {
          store.setTimeLeft(desiredTimeLeft)
        }
      }
      // If timeLeft is between 0 and desiredTimeLeft, don't touch it (timer was paused)
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
          // Trigger completion handler
          setTimeout(() => {
            handleComplete(currentState)
          }, 0)
          store.setTimeLeft(0)
          store.pause()
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

  const playBreakSound = () => {
    if (!store.settings.soundEnabled) return

    // Pause LofiMusic if it's playing
    const wasMusicPlaying = musicStore.isPlaying
    if (wasMusicPlaying) {
      musicStore.toggle() // This will pause the music
    }

    try {
      // Use Web Audio API to create a lofi chord sound (3 seconds total)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Lofi chord: C major 7th chord (C, E, G, B) - soft and mellow
      // Using lower frequencies for a warmer, more mellow sound
      const chordNotes = [
        261.63, // C4
        329.63, // E4
        392.0, // G4
        493.88, // B4
      ]

      const duration = 3.0 // 3 seconds total
      const startTime = audioContext.currentTime

      // Create master gain for overall volume control
      const masterGain = audioContext.createGain()
      masterGain.connect(audioContext.destination)
      masterGain.gain.setValueAtTime(0.25, startTime)

      // Play all notes simultaneously as a chord with slight detuning for lofi character
      chordNotes.forEach((frequency, index) => {
        // Slight detuning for each note to create a more organic, lofi sound
        const detuneAmount = (index - 1.5) * 2 // Small detuning in cents
        const detunedFreq = frequency * Math.pow(2, detuneAmount / 1200)

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        const biquadFilter = audioContext.createBiquadFilter()

        // Use triangle wave for softer, warmer sound (more lofi)
        oscillator.type = 'triangle'
        oscillator.frequency.value = detunedFreq

        // Apply low-pass filter for that characteristic lofi sound (warmth)
        biquadFilter.type = 'lowpass'
        biquadFilter.frequency.value = 2000 // Cut high frequencies for warmth
        biquadFilter.Q.value = 1

        oscillator.connect(biquadFilter)
        biquadFilter.connect(gainNode)
        gainNode.connect(masterGain)

        // Soft attack and decay for a mellow chord
        const noteGain = 0.15 / chordNotes.length // Distribute volume across notes
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(noteGain, startTime + 0.1) // Soft attack
        gainNode.gain.setValueAtTime(noteGain, startTime + duration - 0.3)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration) // Soft decay

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      })

      // Resume LofiMusic after 3 seconds if it was playing
      if (wasMusicPlaying) {
        setTimeout(() => {
          if (!musicStore.isPlaying) {
            musicStore.toggle() // Resume the music
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to play break sound:', error)
      // Resume music even if sound fails
      if (wasMusicPlaying && !musicStore.isPlaying) {
        musicStore.toggle()
      }
    }
  }

  const playLongBreakSound = () => {
    if (!store.settings.soundEnabled) return

    // Pause LofiMusic if it's playing
    const wasMusicPlaying = musicStore.isPlaying
    if (wasMusicPlaying) {
      musicStore.toggle() // This will pause the music
    }

    try {
      // Use Web Audio API to create a riptide chord sound (5 seconds total)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Riptide chord: A minor chord (A, C, E) - characteristic of the riptide progression
      // Using warmer frequencies for a more mellow, relaxing sound
      const chordNotes = [
        220.0, // A3
        261.63, // C4
        329.63, // E4
      ]

      const duration = 5.0 // 5 seconds total
      const startTime = audioContext.currentTime

      // Create master gain for overall volume control
      const masterGain = audioContext.createGain()
      masterGain.connect(audioContext.destination)
      masterGain.gain.setValueAtTime(0.25, startTime)

      // Play all notes simultaneously as a chord with slight detuning for lofi character
      chordNotes.forEach((frequency, index) => {
        // Slight detuning for each note to create a more organic, lofi sound
        const detuneAmount = (index - 1) * 3 // Small detuning in cents for warmth
        const detunedFreq = frequency * Math.pow(2, detuneAmount / 1200)

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        const biquadFilter = audioContext.createBiquadFilter()

        // Use triangle wave for softer, warmer sound (more lofi)
        oscillator.type = 'triangle'
        oscillator.frequency.value = detunedFreq

        // Apply low-pass filter for that characteristic lofi sound (warmth)
        biquadFilter.type = 'lowpass'
        biquadFilter.frequency.value = 1800 // Slightly lower for more warmth
        biquadFilter.Q.value = 1

        oscillator.connect(biquadFilter)
        biquadFilter.connect(gainNode)
        gainNode.connect(masterGain)

        // Soft attack and long sustain for a mellow riptide chord
        const noteGain = 0.18 / chordNotes.length // Distribute volume across notes
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(noteGain, startTime + 0.2) // Gentle attack
        gainNode.gain.setValueAtTime(noteGain, startTime + duration - 0.5)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration) // Long, soft decay

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      })

      // Resume LofiMusic after 5 seconds if it was playing
      if (wasMusicPlaying) {
        setTimeout(() => {
          if (!musicStore.isPlaying) {
            musicStore.toggle() // Resume the music
          }
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to play long break sound:', error)
      // Resume music even if sound fails
      if (wasMusicPlaying && !musicStore.isPlaying) {
        musicStore.toggle()
      }
    }
  }

  const handleComplete = async (completedState: PomodoroState) => {
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

      // Skip breaks if disabled
      if (completedState.settings.disableBreak) {
        store.setType('work')
        store.setTimeLeft(completedState.settings.workDuration * 60)
        store.pause()
        if (completedState.settings.autoStartPomodoros) {
          store.start()
        }
      } else {
        const nextType =
          newWorkSessionsCompleted >= completedState.settings.longBreakInterval
            ? 'longBreak'
            : 'shortBreak'

        const getDurationForTypeLocal = (timerType: PomodoroType): number => {
          switch (timerType) {
            case 'work':
              return completedState.settings.workDuration
            case 'shortBreak':
              return completedState.settings.shortBreakDuration
            case 'longBreak':
              return completedState.settings.longBreakDuration
          }
        }

        store.setType(nextType)
        store.setTimeLeft(getDurationForTypeLocal(nextType) * 60)
        store.pause()
        if (completedState.settings.autoStartBreaks) {
          store.start()
        }

        // Play break sound when break starts
        if (completedState.settings.soundEnabled) {
          if (nextType === 'longBreak') {
            setTimeout(() => playLongBreakSound(), 100)
          } else {
            setTimeout(() => playBreakSound(), 100)
          }
        }
      }
    } else {
      // Break completed - transition back to work
      // Reset work sessions after long break
      const shouldReset = completedState.type === 'longBreak'

      store.setType('work')
      store.setTimeLeft(completedState.settings.workDuration * 60)
      if (shouldReset) {
        store.setWorkSessionsCompleted(0)
      }
      store.pause()
      if (completedState.settings.autoStartPomodoros) {
        store.start()
      }

      // Play sound when break ends (time to get back to work)
      if (completedState.settings.soundEnabled) {
        if (completedState.type === 'shortBreak') {
          // Play break sound when short break ends
          setTimeout(() => playBreakSound(), 100)
        } else if (completedState.type === 'longBreak') {
          // Play long break sound when long break ends
          setTimeout(() => playLongBreakSound(), 100)
        } else {
          // Fallback to notification sound
          setTimeout(() => playNotificationSound(), 100)
        }
      }
    }
  }

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
