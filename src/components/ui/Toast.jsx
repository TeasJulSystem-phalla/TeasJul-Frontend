import { useState, createContext, useContext, useCallback, useMemo } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const variantConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: Info,
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
  },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(
    () => ({
      success: (title, message) => addToast({ type: 'success', title, message }),
      error: (title, message) => addToast({ type: 'error', title, message }),
      warning: (title, message) => addToast({ type: 'warning', title, message }),
      info: (title, message) => addToast({ type: 'info', title, message }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((t) => {
          const config = variantConfig[t.type] || variantConfig.info;
          const Icon = config.icon;
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto flex w-80 items-start gap-3 rounded-lg border p-4 shadow-lg
                transition-all duration-300
                ${config.bg} ${config.border}
              `}
              role="status"
              aria-live="polite"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.title}</p>
                )}
                {t.message && (
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{t.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

// eslint-disable-next-line react-refresh/only-export-components
export default useToast;
