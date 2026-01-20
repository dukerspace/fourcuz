import { PomodoroType } from '@shared/types'
import { formatTimeFromSeconds } from '@shared/utils'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePomodoroTimer } from '../contexts/PomodoroContext'

interface PomodoroTimerProps {
  selectedTaskId: string | null
  selectedTask?: { id: string; title: string } | null
  onPomodoroComplete: () => void
}

export default function PomodoroTimer({
  selectedTaskId,
  selectedTask,
  onPomodoroComplete,
}: PomodoroTimerProps) {
  const { t } = useTranslation()
  const {
    state,
    start,
    pause,
    reset,
    resetAll,
    setType,
    setSelectedTaskId,
    setOnCompleteCallback,
  } = usePomodoroTimer()

  // Sync selectedTaskId with context
  useEffect(() => {
    if (state.selectedTaskId !== selectedTaskId) {
      setSelectedTaskId(selectedTaskId)
    }
  }, [selectedTaskId, state.selectedTaskId, setSelectedTaskId])

  // Set completion callback
  useEffect(() => {
    setOnCompleteCallback(onPomodoroComplete)
    return () => setOnCompleteCallback(null)
  }, [onPomodoroComplete, setOnCompleteCallback])

  const getDurationForType = (timerType: PomodoroType): number => {
    switch (timerType) {
      case 'work':
        return state.settings.workDuration
      case 'shortBreak':
        return state.settings.shortBreakDuration
      case 'longBreak':
        return state.settings.longBreakDuration
    }
  }

  const handleTypeChange = (newType: PomodoroType) => {
    if (!state.isRunning) {
      setType(newType)
    }
  }

  const progress = 1 - state.timeLeft / (getDurationForType(state.type) * 60)
  const currentRound = state.workSessionsCompleted + (state.type === 'work' ? 1 : 0)
  const maxRounds = state.settings.longBreakInterval

  return (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] p-6 md:p-8 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-black/4 dark:border-white/8 text-center max-w-[400px] w-full transition-all duration-300">
      {/* Selected Task Info / Hint / Warning - Top */}
      {state.selectedTaskId && (
        <div className="my-4 p-3 bg-emerald-400/10 rounded-lg text-emerald-400 text-sm">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-base flex-shrink-0">✓</span>
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                <strong className="font-semibold mr-1">{t('pomodoro.selectedTask')}</strong>{' '}
                {selectedTask?.title || t('common.loading')}
              </span>
            </div>
            <button
              className="flex-shrink-0 w-6 h-6 rounded-full border-none bg-emerald-400/20 text-emerald-400 text-sm font-semibold cursor-pointer transition-all flex items-center justify-center leading-none hover:bg-emerald-500/30 hover:scale-110 active:scale-95"
              onClick={() => setSelectedTaskId(null)}
              title={t('pomodoro.deselectTask')}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {!state.selectedTaskId && state.type === 'work' && !state.isRunning && (
        <div className="my-4 p-3 bg-amber-400/10 rounded-lg text-amber-600 text-sm border border-amber-500/20">
          {t('pomodoro.selectTaskHint')}
        </div>
      )}

      {!state.selectedTaskId && state.isRunning && state.type === 'work' && (
        <div className="my-4 p-3 bg-red-500/10 rounded-lg text-red-500 text-sm font-medium border border-red-500/30 animate-pulse">
          {t('pomodoro.noTaskWarning')}
        </div>
      )}

      {/* Round Progress Indicator */}
      {state.type === 'work' && (
        <div className="mb-6 p-4 bg-emerald-500/5 rounded-xl">
          <div className="mb-3">
            <span className="block text-lg font-semibold text-emerald-400 mb-1">
              {t('pomodoro.round')} {currentRound} {t('pomodoro.of')} {maxRounds}
            </span>
          </div>
          <div className="flex gap-2 justify-center items-center">
            {Array.from({ length: maxRounds }).map((_, index) => (
              <div
                key={index}
                className={`rounded-full transition-all duration-300 ${
                  index < state.workSessionsCompleted
                    ? 'w-3 h-3 bg-emerald-400 shadow-[0_0_8px_rgba(102,126,234,0.5)]'
                    : index === state.workSessionsCompleted
                      ? 'w-4 h-4 bg-emerald-400 shadow-[0_0_12px_rgba(102,126,234,0.7)] animate-pulse'
                      : 'w-3 h-3 bg-gray-300 border-2 border-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {state.type !== 'work' && (
        <div
          className={`mb-6 p-4 rounded-xl border-2 ${
            state.type === 'longBreak'
              ? 'bg-emerald-500/10 border-emerald-500/40'
              : 'bg-amber-400/10 border-amber-400/30'
          }`}
        >
          {state.type === 'longBreak' ? (
            <>
              <div className="text-xl font-bold mb-1 text-emerald-600">
                {t('pomodoro.longBreak')}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {t('pomodoro.longBreak')} - {state.settings.longBreakDuration} {t('common.minutes')}
              </div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold mb-1 text-amber-500">
                {t('pomodoro.shortBreak')}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {t('pomodoro.shortBreak')} - {state.settings.shortBreakDuration}{' '}
                {t('common.minutes')}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-2 mb-8 justify-center flex-wrap max-md:gap-1.5 max-md:mb-6">
        <button
          className={`px-5 py-2.5 rounded-[10px] font-medium border transition-all duration-250 max-md:px-3.5 max-md:py-2 max-md:text-sm ${
            state.type === 'work'
              ? 'bg-emerald-400 text-white border-emerald-400 shadow-[0_2px_8px_rgba(52,211,153,0.3)]'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#2d2d44] hover:border-emerald-400/20 dark:hover:border-emerald-400/30 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
          onClick={() => handleTypeChange('work')}
          disabled={state.isRunning}
        >
          {t('pomodoro.work')}
        </button>
        {!state.settings.disableBreak && (
          <>
            <button
              className={`px-5 py-2.5 rounded-[10px] font-medium border transition-all duration-250 max-md:px-3.5 max-md:py-2 max-md:text-sm ${
                state.type === 'shortBreak'
                  ? 'bg-emerald-400 text-white border-emerald-400 shadow-[0_2px_8px_rgba(52,211,153,0.3)]'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#2d2d44] hover:border-emerald-400/20 dark:hover:border-emerald-400/30 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              onClick={() => handleTypeChange('shortBreak')}
              disabled={state.isRunning}
            >
              {t('pomodoro.shortBreak')}
            </button>
            <button
              className={`px-5 py-2.5 rounded-[10px] font-medium border transition-all duration-250 max-md:px-3.5 max-md:py-2 max-md:text-sm ${
                state.type === 'longBreak'
                  ? 'bg-emerald-400 text-white border-emerald-400 shadow-[0_2px_8px_rgba(52,211,153,0.3)]'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#2d2d44] hover:border-emerald-400/20 dark:hover:border-emerald-400/30 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              onClick={() => handleTypeChange('longBreak')}
              disabled={state.isRunning}
            >
              {t('pomodoro.longBreak')}
            </button>
          </>
        )}
      </div>

      <div className="relative w-[300px] h-[300px] mx-auto mb-8 max-md:w-[220px] max-md:h-[220px] max-md:mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
            className="transition-[stroke-dashoffset] duration-100 ease-linear"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={
              state.type === 'work' ? '#34d399' : state.type === 'longBreak' ? '#10b981' : '#6ee7b7'
            }
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className="transition-[stroke,stroke-dashoffset] duration-100 ease-linear"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-5xl font-bold text-emerald-400 leading-none mb-2 max-md:text-4xl">
            {formatTimeFromSeconds(state.timeLeft)}
          </div>
          <div className="text-base text-gray-500 uppercase tracking-wider max-md:text-sm">
            {state.type === 'work'
              ? t('pomodoro.work')
              : state.type === 'longBreak'
                ? t('pomodoro.longBreak')
                : t('pomodoro.shortBreak')}
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center flex-wrap max-md:gap-3">
        {!state.isRunning ? (
          <button
            className="px-8 py-3 rounded-lg text-base font-semibold transition-all bg-emerald-400 text-white hover:bg-emerald-500 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(52,211,153,0.35)] max-md:px-6 max-md:py-2.5 max-md:text-sm"
            onClick={start}
          >
            {t('pomodoro.start')}
          </button>
        ) : (
          <button
            className="px-8 py-3 rounded-lg text-base font-semibold transition-all bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#2d2d44] hover:border-emerald-400/20 dark:hover:border-emerald-400/30 max-md:px-6 max-md:py-2.5 max-md:text-sm"
            onClick={pause}
          >
            {t('pomodoro.pause')}
          </button>
        )}
        <button
          className="px-8 py-3 rounded-lg text-base font-semibold transition-all bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#2d2d44] hover:border-emerald-400/20 dark:hover:border-emerald-400/30 disabled:opacity-50 disabled:cursor-not-allowed max-md:px-6 max-md:py-2.5 max-md:text-sm"
          onClick={reset}
          disabled={state.isRunning}
        >
          {t('pomodoro.reset')}
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500/10 text-amber-600 border border-amber-500/30 cursor-pointer transition-all hover:bg-amber-500/20 hover:border-amber-500/50 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={resetAll}
          disabled={state.isRunning}
        >
          🔄 {t('pomodoro.resetAll')} {t('pomodoro.round')} 1
        </button>
      </div>
    </div>
  )
}
