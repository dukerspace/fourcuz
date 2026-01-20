import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] backdrop-blur-[12px] py-4 md:py-5 px-4 md:px-6 lg:px-8 border-t border-black/5 dark:border-white/8 shadow-[0_-2px_12px_rgba(0,0,0,0.06),0_-1px_4px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base text-center md:text-left">
          © {currentYear} {t('footer.copyright')}
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base flex items-center gap-1.5">
          <span>{t('footer.madeWith')}</span>
          <span className="text-red-500">❤️</span>
          <span>{t('footer.by')}</span>
          <span className="text-[#34d399] font-semibold">Fourcuz</span>
        </div>
      </div>
    </footer>
  )
}
