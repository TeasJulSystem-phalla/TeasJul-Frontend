import { forwardRef, useId } from 'react';

const Radio = forwardRef(
  ({ label, checked, onChange, disabled = false, className = '', ...props }, ref) => {
    const id = useId();

    return (
      <div className={`flex items-start gap-2 ${className}`}>
        <div className="relative flex items-center pt-0.5">
          <input
            ref={ref}
            id={id}
            type="radio"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={id}
            className={`
              flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border
              transition-colors
              ${
                checked
                  ? 'border-gray-900 dark:border-white'
                  : 'border-gray-300 dark:border-gray-600'
              }
              ${
                disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:border-gray-400 dark:hover:border-gray-500'
              }
              peer-focus-visible:ring-2 peer-focus-visible:ring-gray-900 peer-focus-visible:ring-offset-2
              dark:peer-focus-visible:ring-white
            `}
          >
            {checked && (
              <span
                className={`h-2 w-2 rounded-full bg-gray-900 dark:bg-white`}
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

Radio.displayName = 'Radio';

export default Radio;
