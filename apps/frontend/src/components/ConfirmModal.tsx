import { createPortal } from 'react-dom'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'default'
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white/98 dark:bg-[rgba(30,30,46,0.95)] rounded-[20px] max-w-[450px] w-full mx-auto my-auto max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.1)] border border-black/5 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b-2 border-gray-200 dark:border-gray-700">
          <h3 className="m-0 text-gray-800 dark:text-gray-100 text-xl">{title}</h3>
          <button
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-2xl leading-none flex items-center justify-center cursor-pointer transition-all border-none hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col">
          <p className="m-0 text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-4 p-6 border-t-2 border-gray-200 dark:border-gray-700">
          <button
            className="px-6 py-3 rounded-lg font-medium text-base cursor-pointer transition-all bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-none hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium text-base cursor-pointer transition-all border-none ${
              variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-emerald-400 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
