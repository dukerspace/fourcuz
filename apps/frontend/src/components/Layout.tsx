import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import CompactTimer from './CompactTimer'
import Footer from './Footer'
import LofiMusic from './LofiMusic'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] backdrop-blur-[12px] py-2.5 md:py-3 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] border-b border-black/5 transition-all duration-300">
        <div className="nav-brand">
          <Link to="/">
            <h1 className="text-lg md:text-xl text-[#34d399] font-semibold">🍅 Fourcuz</h1>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 justify-center md:justify-end items-center">
          <Link
            to="/"
            className={`no-underline text-gray-600 dark:text-gray-400 font-medium py-2 md:py-2.5 px-3 md:px-5 rounded-[10px] transition-all duration-250 relative hover:text-[#34d399] hover:bg-[rgba(52,211,153,0.12)] dark:hover:bg-[rgba(52,211,153,0.2)] hover:-translate-y-0.5 text-sm md:text-base ${location.pathname === '/' ? 'text-[#34d399] bg-[rgba(52,211,153,0.16)] dark:bg-[rgba(52,211,153,0.24)] font-semibold' : ''}`}
          >
            {t('common.dashboard')}
          </Link>
          <Link
            to="/tasks"
            className={`no-underline text-gray-600 dark:text-gray-400 font-medium py-2 md:py-2.5 px-3 md:px-5 rounded-[10px] transition-all duration-250 relative hover:text-[#34d399] hover:bg-[rgba(52,211,153,0.12)] dark:hover:bg-[rgba(52,211,153,0.2)] hover:-translate-y-0.5 text-sm md:text-base ${location.pathname === '/tasks' ? 'text-[#34d399] bg-[rgba(52,211,153,0.16)] dark:bg-[rgba(52,211,153,0.24)] font-semibold' : ''}`}
          >
            {t('common.tasks')}
          </Link>
          <Link
            to="/statistics"
            className={`no-underline text-gray-600 dark:text-gray-400 font-medium py-2 md:py-2.5 px-3 md:px-5 rounded-[10px] transition-all duration-250 relative hover:text-[#34d399] hover:bg-[rgba(52,211,153,0.12)] dark:hover:bg-[rgba(52,211,153,0.2)] hover:-translate-y-0.5 text-sm md:text-base ${location.pathname === '/statistics' ? 'text-[#34d399] bg-[rgba(52,211,153,0.16)] dark:bg-[rgba(52,211,153,0.24)] font-semibold' : ''}`}
          >
            {t('common.statistics')}
          </Link>
          <Link
            to="/settings"
            className={`no-underline text-gray-600 dark:text-gray-400 font-medium py-2 md:py-2.5 px-3 md:px-5 rounded-[10px] transition-all duration-250 relative hover:text-[#34d399] hover:bg-[rgba(52,211,153,0.12)] dark:hover:bg-[rgba(52,211,153,0.2)] hover:-translate-y-0.5 text-sm md:text-base ${location.pathname === '/settings' ? 'text-[#34d399] bg-[rgba(52,211,153,0.16)] dark:bg-[rgba(52,211,153,0.24)] font-semibold' : ''}`}
          >
            {t('common.settings')}
          </Link>
          <CompactTimer />
          <LofiMusic />
          <button
            className="p-2 bg-transparent border-none text-xl cursor-pointer rounded-lg transition-all duration-200 hover:bg-[rgba(52,211,153,0.1)]"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
      <main className="flex-1 py-6 md:py-8 lg:py-10 px-4 md:px-6 lg:px-10 max-w-[1200px] w-full mx-auto transition-all duration-300 dark:text-gray-200">
        {children}
      </main>
      <Footer />
    </div>
  )
}
