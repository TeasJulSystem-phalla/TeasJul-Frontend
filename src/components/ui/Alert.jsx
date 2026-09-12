import { useState, isValidElement } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

const variantConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-300',
    iconColor: 'text-green-500 dark:text-green-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-300',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
  },
  danger: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    iconColor: 'text-red-500 dark:text-red-400',
  },
};

variantConfig.error = variantConfig.danger;

const Alert = ({ variant = 'info', icon, title, description, dismissible = false, onDismiss, children, className = '' }) => {
  const [visible, setVisible] = useState(true);
  const config = variantConfig[variant] || variantConfig.info;

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss && onDismiss();
  };

  const renderIcon = () => {
    if (icon) {
      if (isValidElement(icon)) {
        return icon;
      }
      const CustomIcon = icon;
      return <CustomIcon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />;
    }
    const DefaultIcon = config.icon;
    return <DefaultIcon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />;
  };

  return (
    <div
      className={`
        rounded-md border p-4 ${config.bg} ${config.border}
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {renderIcon()}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-semibold ${config.text}`}>{title}</h4>
          )}
          {description && (
            <p className={`mt-1 text-sm ${config.text} opacity-80`}>{description}</p>
          )}
          {children}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={`shrink-0 rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10 ${config.text}`}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
