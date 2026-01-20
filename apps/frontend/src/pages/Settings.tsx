import type { TimerSettings } from '@shared/types'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguageStore } from '../stores/languageStore'
import { usePomodoroStore } from '../stores/pomodoroStore'
import { useThemeStore } from '../stores/themeStore'

type SettingsTab = 'general' | 'pomodoro' | 'alarm' | 'account' | 'premium' | 'about'

export default function Settings() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<SettingsTab>('pomodoro')
  const { theme, setTheme } = useThemeStore()
  const { language, setLanguage } = useLanguageStore()
  const pomodoroSettings = usePomodoroStore((state: { settings: TimerSettings }) => state.settings)
  const setPomodoroSettings = usePomodoroStore(
    (state: { setSettings: (settings: TimerSettings) => void }) => state.setSettings
  )
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    soundEnabled: true,
    disableBreak: false,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(pomodoroSettings)
  }, [pomodoroSettings])

  const saveSettings = useCallback(
    async (newSettings: TimerSettings) => {
      setPomodoroSettings(newSettings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
    [setPomodoroSettings]
  )

  const handleChange = (key: keyof TimerSettings, value: number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = useCallback(() => {
    const defaultSettings: TimerSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      soundEnabled: true,
      disableBreak: false,
    }
    setSettings(defaultSettings)
    saveSettings(defaultSettings)
  }, [saveSettings])

  const timerOptions = [
    { value: 1, label: '1 Minute' },
    { value: 2, label: '2 Minutes' },
    { value: 3, label: '3 Minutes' },
    { value: 4, label: '4 Minutes' },
    { value: 5, label: '5 Minutes' },
    { value: 10, label: '10 Minutes' },
    { value: 15, label: '15 Minutes' },
    { value: 20, label: '20 Minutes' },
    { value: 25, label: '25 Minutes' },
    { value: 30, label: '30 Minutes' },
    { value: 45, label: '45 Minutes' },
    { value: 60, label: '60 Minutes' },
  ]

  const pomodoroIntervalOptions = [
    { value: 2, label: '2 Pomodoros' },
    { value: 3, label: '3 Pomodoros' },
    { value: 4, label: '4 Pomodoros' },
    { value: 5, label: '5 Pomodoros' },
    { value: 6, label: '6 Pomodoros' },
    { value: 7, label: '7 Pomodoros' },
    { value: 8, label: '8 Pomodoros' },
  ]

  const ToggleSwitch = ({
    checked,
    onChange,
    label,
    id,
  }: {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    id?: string
  }) => (
    <div className="flex justify-between items-center py-3 md:py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 gap-3">
      <span className="text-sm md:text-base text-gray-900 dark:text-gray-100 font-medium flex-1 pr-2">
        {label}
      </span>
      <label
        htmlFor={id}
        className="relative inline-block w-[50px] h-7 cursor-pointer flex-shrink-0 touch-manipulation"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="opacity-0 w-0 h-0"
        />
        <span
          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 transition-all duration-300 rounded-full ${
            checked ? 'bg-[#34d399]' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        ></span>
        <span
          className={`absolute h-5 w-5 left-1 bottom-1 bg-white transition-all duration-300 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${
            checked ? 'translate-x-[22px]' : ''
          }`}
        />
      </label>
    </div>
  )

  const renderPomodoroSettings = () => (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[16px] md:rounded-[20px] p-4 md:p-6 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/8 transition-all duration-300">
      <h2 className="text-lg md:text-xl lg:text-2xl xl:text-[1.8rem] text-gray-900 dark:text-gray-100 mb-3 md:mb-4 lg:mb-6 xl:mb-8 font-semibold">
        {t('settings.pomodoroTimer')}
      </h2>

      <div className="mb-6 md:mb-8 lg:mb-10 last:mb-0">
        <h3 className="text-sm md:text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-3 md:mb-4 lg:mb-6 font-semibold">
          {t('settings.timerLength')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {t('settings.pomodoroLength')}
            </label>
            <select
              className="py-3 md:py-3.5 px-3 md:px-[18px] border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-250 appearance-none bg-[length:12px_12px] bg-[right_0.75rem_center] md:bg-[right_1rem_center] bg-no-repeat pr-8 md:pr-10 min-h-[44px] touch-manipulation hover:border-[#34d399] hover:bg-gray-50 dark:hover:bg-[#2d2d44] focus:outline-none focus:border-[#34d399] focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${document.documentElement.classList.contains('dark') ? '%239ca3af' : '%23666'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              }}
              value={settings.workDuration}
              onChange={(e) => handleChange('workDuration', parseInt(e.target.value))}
            >
              {timerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {t('settings.shortBreakLength')}
            </label>
            <select
              className="py-3 md:py-3.5 px-3 md:px-[18px] border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-250 appearance-none bg-[length:12px_12px] bg-[right_0.75rem_center] md:bg-[right_1rem_center] bg-no-repeat pr-8 md:pr-10 min-h-[44px] touch-manipulation hover:border-[#34d399] hover:bg-gray-50 dark:hover:bg-[#2d2d44] focus:outline-none focus:border-[#34d399] focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${document.documentElement.classList.contains('dark') ? '%239ca3af' : '%23666'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              }}
              value={settings.shortBreakDuration}
              onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value))}
            >
              {timerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {t('settings.longBreakLength')}
            </label>
            <select
              className="py-3 md:py-3.5 px-3 md:px-[18px] border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-250 appearance-none bg-[length:12px_12px] bg-[right_0.75rem_center] md:bg-[right_1rem_center] bg-no-repeat pr-8 md:pr-10 min-h-[44px] touch-manipulation hover:border-[#34d399] hover:bg-gray-50 dark:hover:bg-[#2d2d44] focus:outline-none focus:border-[#34d399] focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${document.documentElement.classList.contains('dark') ? '%239ca3af' : '%23666'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              }}
              value={settings.longBreakDuration}
              onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value))}
            >
              {timerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {t('settings.longBreakAfter')}
            </label>
            <select
              className="py-3 md:py-3.5 px-3 md:px-[18px] border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-250 appearance-none bg-[length:12px_12px] bg-[right_0.75rem_center] md:bg-[right_1rem_center] bg-no-repeat pr-8 md:pr-10 min-h-[44px] touch-manipulation hover:border-[#34d399] hover:bg-gray-50 dark:hover:bg-[#2d2d44] focus:outline-none focus:border-[#34d399] focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${document.documentElement.classList.contains('dark') ? '%239ca3af' : '%23666'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              }}
              value={settings.longBreakInterval}
              onChange={(e) => handleChange('longBreakInterval', parseInt(e.target.value))}
            >
              {pomodoroIntervalOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 md:mb-8 lg:mb-10 last:mb-0">
        <h3 className="text-sm md:text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-3 md:mb-4 lg:mb-6 font-semibold">
          {t('settings.automationAndBreak')}
        </h3>
        <div className="flex flex-col gap-4 md:gap-6">
          <ToggleSwitch
            id="auto-start-pomodoros"
            checked={settings.autoStartPomodoros}
            onChange={(checked) => handleChange('autoStartPomodoros', checked)}
            label={t('settings.autoStartNextPomodoro')}
          />
          <ToggleSwitch
            id="auto-start-breaks"
            checked={settings.autoStartBreaks}
            onChange={(checked) => handleChange('autoStartBreaks', checked)}
            label={t('settings.autoStartBreak')}
          />
          <ToggleSwitch
            id="disable-break"
            checked={settings.disableBreak}
            onChange={(checked) => handleChange('disableBreak', checked)}
            label={t('settings.disableBreak')}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-4 md:pt-6 mt-4 md:mt-6 border-t-2 border-gray-200 dark:border-gray-700 gap-3">
        <button
          className="w-full sm:w-auto py-3 md:py-3 px-6 md:px-8 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-none rounded-lg text-sm md:text-base font-semibold cursor-pointer transition-all duration-200 min-h-[44px] touch-manipulation hover:bg-gray-300 dark:hover:bg-gray-600 hover:-translate-y-0.5 active:translate-y-0"
          onClick={resetToDefaults}
        >
          {t('settings.resetToDefaults')}
        </button>
        <button
          className="w-full sm:w-auto py-3 md:py-3 px-6 md:px-8 bg-[#34d399] text-white border-none rounded-lg text-sm md:text-base font-semibold cursor-pointer transition-all duration-200 min-h-[44px] touch-manipulation hover:bg-[#10b981] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(52,211,153,0.4)] active:translate-y-0"
          onClick={() => saveSettings(settings)}
        >
          {t('settings.saveSettings')}
        </button>
      </div>

      {saved && (
        <div className="fixed bottom-2 right-2 left-2 sm:left-auto sm:right-4 md:bottom-8 md:right-8 bg-[#4caf50] text-white py-3 px-4 md:py-4 md:px-6 rounded-lg shadow-[0_4px_12px_rgba(76,175,80,0.3)] font-semibold animate-[slideIn_0.3s_ease-out] z-[1000] text-sm md:text-base">
          {t('settings.settingsSaved')}
        </div>
      )}
    </div>
  )

  const renderAlarmSettings = () => (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[16px] md:rounded-[20px] p-4 md:p-6 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/8 transition-all duration-300">
      <h2 className="text-xl md:text-2xl lg:text-[1.8rem] text-gray-900 dark:text-gray-100 mb-4 md:mb-6 lg:mb-8 font-semibold">
        {t('settings.alarmSound')}
      </h2>
      <div className="mb-6 md:mb-8 lg:mb-10 last:mb-0">
        <div className="flex flex-col gap-4 md:gap-6">
          <ToggleSwitch
            id="sound-enabled"
            checked={settings.soundEnabled}
            onChange={(checked) => handleChange('soundEnabled', checked)}
            label={t('settings.enableSoundNotifications')}
          />
        </div>
      </div>
      <div className="flex justify-end pt-4 md:pt-6 mt-4 md:mt-6 border-t-2 border-gray-200 dark:border-gray-700">
        <button
          className="w-full sm:w-auto py-3 md:py-3 px-6 md:px-8 bg-[#34d399] text-white border-none rounded-lg text-sm md:text-base font-semibold cursor-pointer transition-all duration-200 min-h-[44px] touch-manipulation hover:bg-[#10b981] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(52,211,153,0.4)] active:translate-y-0"
          onClick={() => saveSettings(settings)}
        >
          Save Settings
        </button>
      </div>
      {saved && (
        <div className="fixed bottom-2 right-2 left-2 sm:left-auto sm:right-4 md:bottom-8 md:right-8 bg-[#4caf50] text-white py-3 px-4 md:py-4 md:px-6 rounded-lg shadow-[0_4px_12px_rgba(76,175,80,0.3)] font-semibold animate-[slideIn_0.3s_ease-out] z-[1000] text-sm md:text-base">
          ✓ Settings saved
        </div>
      )}
    </div>
  )

  const renderGeneralSettings = () => (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[16px] md:rounded-[20px] p-4 md:p-6 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/8 transition-all duration-300">
      <h2 className="text-lg md:text-xl lg:text-2xl xl:text-[1.8rem] text-gray-900 dark:text-gray-100 mb-3 md:mb-4 lg:mb-6 xl:mb-8 font-semibold">
        {t('settings.general')}
      </h2>

      <div className="mb-6 md:mb-8 lg:mb-10 last:mb-0">
        <h3 className="text-sm md:text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-3 md:mb-4 lg:mb-6 font-semibold">
          Appearance
        </h3>
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex justify-between items-center py-3 md:py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 gap-3">
            <div className="flex flex-col flex-1">
              <span className="text-sm md:text-base text-gray-900 dark:text-gray-100 font-medium">
                Theme
              </span>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose between light and dark mode
              </span>
            </div>
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-h-[36px] touch-manipulation ${
                  theme === 'light'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-h-[36px] touch-manipulation ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 md:mb-8 lg:mb-10 last:mb-0">
        <h3 className="text-sm md:text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-3 md:mb-4 lg:mb-6 font-semibold">
          Language
        </h3>
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Select Language
            </label>
            <select
              className="py-3 md:py-3.5 px-3 md:px-[18px] border-2 border-gray-200 dark:border-gray-700 rounded-[10px] text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-250 appearance-none bg-[length:12px_12px] bg-[right_0.75rem_center] md:bg-[right_1rem_center] bg-no-repeat pr-8 md:pr-10 min-h-[44px] touch-manipulation hover:border-[#34d399] hover:bg-gray-50 dark:hover:bg-[#2d2d44] focus:outline-none focus:border-[#34d399] focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${document.documentElement.classList.contains('dark') ? '%239ca3af' : '%23666'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="th">ไทย (Thai)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAccountSettings = () => (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[16px] md:rounded-[20px] p-4 md:p-6 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/8 transition-all duration-300">
      <h2 className="text-xl md:text-2xl lg:text-[1.8rem] text-gray-900 dark:text-gray-100 mb-4 md:mb-6 lg:mb-8 font-semibold">
        {t('settings.account')}
      </h2>
      <div className="mb-6 md:mb-8 lg:mb-10 last:mb-0">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {t('settings.accountDescription')}
        </p>
      </div>
    </div>
  )

  const renderPremiumSettings = () => (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[16px] md:rounded-[20px] p-4 md:p-6 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/8 transition-all duration-300">
      <h2 className="text-xl md:text-2xl lg:text-[1.8rem] text-gray-900 dark:text-gray-100 mb-4 md:mb-6 lg:mb-8 font-semibold">
        {t('settings.premium')}
      </h2>
      <div className="mb-6 md:mb-8 lg:mb-10 last:mb-0">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {t('settings.premiumDescription')}
        </p>
      </div>
    </div>
  )

  const renderAboutSettings = () => (
    <div className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[16px] md:rounded-[20px] p-4 md:p-6 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/8 transition-all duration-300">
      <h2 className="text-xl md:text-2xl lg:text-[1.8rem] text-gray-900 dark:text-gray-100 mb-4 md:mb-6 lg:mb-8 font-semibold">
        {t('settings.about')}
      </h2>
      <div className="mb-6 md:mb-8 lg:mb-10 last:mb-0">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {t('settings.aboutDescription')}
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          {t('settings.version')}
        </p>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 min-h-[calc(100vh-200px)] flex-col lg:flex-row">
        <aside className="w-full lg:w-[240px] flex-shrink-0 bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[16px] md:rounded-[20px] py-3 md:py-6 lg:py-7 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/8 h-fit lg:sticky lg:top-8 transition-all duration-300">
          <nav className="flex flex-row gap-1 px-2 md:px-3 lg:px-4 overflow-x-auto lg:flex-col lg:overflow-x-visible scrollbar-hide">
            <button
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 border-none bg-transparent rounded-lg cursor-pointer transition-all duration-200 text-left text-gray-700 dark:text-gray-300 text-sm md:text-[0.95rem] hover:bg-[rgba(52,211,153,0.12)] hover:text-[#34d399] lg:hover:translate-x-0.5 min-h-[44px] touch-manipulation ${activeTab === 'general' ? 'bg-[rgba(52,211,153,0.15)] text-[#34d399] font-semibold' : ''} whitespace-nowrap flex-shrink-0`}
              onClick={() => setActiveTab('general')}
            >
              <span className="text-lg md:text-xl w-5 md:w-6 text-center lg:text-2xl flex-shrink-0">
                ⚙️
              </span>
              <span className="flex-1 lg:flex">{t('settings.general')}</span>
            </button>
            <button
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 border-none bg-transparent rounded-lg cursor-pointer transition-all duration-200 text-left text-gray-700 dark:text-gray-300 text-sm md:text-[0.95rem] hover:bg-[rgba(52,211,153,0.12)] hover:text-[#34d399] lg:hover:translate-x-0.5 min-h-[44px] touch-manipulation ${activeTab === 'pomodoro' ? 'bg-[rgba(52,211,153,0.15)] text-[#34d399] font-semibold' : ''} whitespace-nowrap flex-shrink-0`}
              onClick={() => setActiveTab('pomodoro')}
            >
              <span className="text-lg md:text-xl w-5 md:w-6 text-center lg:text-2xl flex-shrink-0">
                ⏰
              </span>
              <span className="flex-1 lg:flex">{t('settings.pomodoro')}</span>
            </button>
            <button
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 border-none bg-transparent rounded-lg cursor-pointer transition-all duration-200 text-left text-gray-700 dark:text-gray-300 text-sm md:text-[0.95rem] hover:bg-[rgba(52,211,153,0.12)] hover:text-[#34d399] lg:hover:translate-x-0.5 min-h-[44px] touch-manipulation ${activeTab === 'alarm' ? 'bg-[rgba(52,211,153,0.15)] text-[#34d399] font-semibold' : ''} whitespace-nowrap flex-shrink-0`}
              onClick={() => setActiveTab('alarm')}
            >
              <span className="text-lg md:text-xl w-5 md:w-6 text-center lg:text-2xl flex-shrink-0">
                🔔
              </span>
              <span className="flex-1 lg:flex">{t('settings.alarm')}</span>
            </button>
            <button
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 border-none bg-transparent rounded-lg cursor-pointer transition-all duration-200 text-left text-gray-700 dark:text-gray-300 text-sm md:text-[0.95rem] hover:bg-[rgba(52,211,153,0.12)] hover:text-[#34d399] lg:hover:translate-x-0.5 min-h-[44px] touch-manipulation ${activeTab === 'account' ? 'bg-[rgba(52,211,153,0.15)] text-[#34d399] font-semibold' : ''} whitespace-nowrap flex-shrink-0`}
              onClick={() => setActiveTab('account')}
            >
              <span className="text-lg md:text-xl w-5 md:w-6 text-center lg:text-2xl flex-shrink-0">
                👤
              </span>
              <span className="flex-1 lg:flex">{t('settings.account')}</span>
            </button>
            <button
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 border-none bg-transparent rounded-lg cursor-pointer transition-all duration-200 text-left text-gray-700 dark:text-gray-300 text-sm md:text-[0.95rem] hover:bg-[rgba(52,211,153,0.12)] hover:text-[#34d399] lg:hover:translate-x-0.5 min-h-[44px] touch-manipulation ${activeTab === 'premium' ? 'bg-[rgba(52,211,153,0.15)] text-[#34d399] font-semibold' : ''} whitespace-nowrap flex-shrink-0`}
              onClick={() => setActiveTab('premium')}
            >
              <span className="text-lg md:text-xl w-5 md:w-6 text-center lg:text-2xl flex-shrink-0">
                ⭐
              </span>
              <span className="flex-1 lg:flex">{t('settings.premium')}</span>
            </button>
            <button
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 border-none bg-transparent rounded-lg cursor-pointer transition-all duration-200 text-left text-gray-700 dark:text-gray-300 text-sm md:text-[0.95rem] hover:bg-[rgba(52,211,153,0.12)] hover:text-[#34d399] lg:hover:translate-x-0.5 min-h-[44px] touch-manipulation ${activeTab === 'about' ? 'bg-[rgba(52,211,153,0.15)] text-[#34d399] font-semibold' : ''} whitespace-nowrap flex-shrink-0`}
              onClick={() => setActiveTab('about')}
            >
              <span className="text-lg md:text-xl w-5 md:w-6 text-center lg:text-2xl flex-shrink-0">
                ℹ️
              </span>
              <span className="flex-1 lg:flex">{t('settings.about')}</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'pomodoro' && renderPomodoroSettings()}
          {activeTab === 'alarm' && renderAlarmSettings()}
          {activeTab === 'account' && renderAccountSettings()}
          {activeTab === 'premium' && renderPremiumSettings()}
          {activeTab === 'about' && renderAboutSettings()}
        </main>
      </div>
    </div>
  )
}
