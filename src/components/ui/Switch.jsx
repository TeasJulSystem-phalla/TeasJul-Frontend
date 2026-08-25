import { forwardRef, useId } from 'react';

const Switch = forwardRef(
  ({ checked, onChange, label, disabled = false, className = '', ...props }, ref) => {
    const id = useId();

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          ref={ref}
          id={id}
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange && onChange(!checked)}
          className={`
            peer relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center
            rounded-full border-2 border-transparent transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900
            focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
            dark:focus-visible:ring-white
            ${checked ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}
          `}
          {...props}
        >
          <span
            className={`
              pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg
              transition-transform dark:bg-gray-900
              ${checked ? 'translate-x-4' : 'translate-x-0'}
            `}
          />
        </button>
        {label && (
          <label
            htmlFor={id}
            className={`text-sm ${
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            } text-gray-700 dark:text-gray-300`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
