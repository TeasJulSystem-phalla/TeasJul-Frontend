import Tooltip from './Tooltip';

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const IconButton = ({
  icon,
  tooltip,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary:
      'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100',
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost:
      'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
    danger:
      'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
  };

  const button = (
    <button
      type="button"
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-md transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        dark:focus-visible:ring-white
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.ghost}
        ${className}
      `}
      aria-label={tooltip}
      {...props}
    >
      {icon}
    </button>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
};

export default IconButton;
