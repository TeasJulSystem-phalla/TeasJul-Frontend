const variants = {
  default:
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  success:
    'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning:
    'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger:
    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info:
    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  neutral:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const Badge = ({ variant = 'default', children, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${variants[variant] || variants.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
