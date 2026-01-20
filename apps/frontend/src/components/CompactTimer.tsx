import { formatTimeFromSeconds } from '@shared/utils'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { usePomodoroTimer } from '../contexts/PomodoroContext'

export default function CompactTimer() {
  const { t } = useTranslation()
  const { state, start, pause } = usePomodoroTimer()

  // Show timer if:
  // - It's running
  // - Time is not at default (work session started)
  // - It's a break session
  // - Work sessions have been completed
  const isDefaultState =
    !state.isRunning &&
    state.timeLeft === state.settings.workDuration * 60 &&
    state.type === 'work' &&
    state.workSessionsCompleted === 0

  if (isDefaultState) {
    return null
  }

  const getTypeLabel = () => {
    switch (state.type) {
      case 'work':
        return t('pomodoro.work')
      case 'shortBreak':
        return t('pomodoro.shortBreak')
      case 'longBreak':
        return t('pomodoro.longBreak')
    }
  }

  const getTypeColor = () => {
    switch (state.type) {
      case 'work':
        return '#34d399'
      case 'shortBreak':
        return '#f6ad55'
      case 'longBreak':
        return '#48bb78'
    }
  }

  const timerColor = getTypeColor()

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (state.isRunning) {
      pause()
    } else {
      // Resume the timer from where it was paused
      start()
    }
  }

  return (
    <div className="inline-block ml-3 max-md:ml-2">
      <Link
        to="/"
        className="no-underline text-inherit"
        onClick={(e) => {
          // Prevent navigation when clicking on timer controls
          const target = e.target as HTMLElement
          if (target.closest('button') || target.closest('[data-timer-control]')) {
            e.preventDefault()
          }
        }}
      >
        <div
          data-timer-control
          className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(102,126,234,0.12)] rounded-lg border-2 transition-all duration-250 min-w-[140px] max-md:min-w-[120px] max-md:px-2 max-md:py-1 max-md:gap-1.5 backdrop-blur-sm hover:bg-[rgba(102,126,234,0.18)] hover:-translate-y-px hover:shadow-[0_2px_12px_rgba(102,126,234,0.25)] hover:border-emerald-500 cursor-pointer"
          style={{ borderColor: timerColor } as React.CSSProperties}
          onClick={handleToggle}
        >
          <div className="text-base leading-none max-md:text-sm">
            {state.isRunning ? '⏱️' : '⏸️'}
          </div>
          <div className="flex-1 text-left">
            <div
              className="text-sm font-bold leading-tight max-md:text-xs"
              style={{ color: timerColor } as React.CSSProperties}
            >
              {formatTimeFromSeconds(state.timeLeft)}
            </div>
            <div className="text-[0.65rem] text-gray-600 dark:text-gray-300 uppercase tracking-wider max-md:text-[0.6rem]">
              {getTypeLabel()}
            </div>
          </div>
          <button
            className="bg-emerald-400 text-white border-none rounded-md w-6 h-6 max-md:w-5 max-md:h-5 flex items-center justify-center cursor-pointer text-xs max-md:text-[0.65rem] transition-all flex-shrink-0 hover:opacity-90 hover:scale-105 active:scale-95"
            style={{ backgroundColor: timerColor } as React.CSSProperties}
            onClick={handleToggle}
          >
            {state.isRunning ? '⏸' : '▶'}
          </button>
        </div>
      </Link>
    </div>
  )
}
