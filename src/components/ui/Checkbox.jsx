import { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(
  ({ label, checked, onChange, disabled = false, error, className = '', ...props }, ref) => {
    const id = useId();

    return (
      <div className={`flex items-start gap-2 ${className}`}>
        <div className="relative flex items-center pt-0.5">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            aria-invalid={error ? 'true' : undefined}
            {...props}
          />
          <label
            htmlFor={id}
            className={`
              flex h-4 w-4 cursor-pointer items-center justify-center rounded border
              transition-colors
              ${
                checked
                  ? 'border-gray-900 bg-gray-900 dark:border-white dark:bg-white'
                  : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
              }
              ${
                disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:border-gray-400 dark:hover:border-gray-500'
              }
              ${
                error
                  ? '!border-red-500'
                  : ''
              }
              peer-focus-visible:ring-2 peer-focus-visible:ring-gray-900 peer-focus-visible:ring-offset-2
              dark:peer-focus-visible:ring-white
            `}
          >
            {checked && (
              <Check
                className={`h-3 w-3 ${checked ? 'text-white dark:text-gray-900' : ''}`}
                strokeWidth={3}
              />
            )}
          </label>
        </div>
        {label && (
          <label
            htmlFor={id}
            className={`text-sm leading-none ${
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;
