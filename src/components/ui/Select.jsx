import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import Label from './Label';

const Select = forwardRef(
  (
    {
      label,
      options = [],
      placeholder = 'Select an option',
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const id = useId();

    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={id} required={required} className="mb-1.5 block">
            {label}
          </Label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`
              block w-full appearance-none rounded-md border bg-white px-3 py-2 pr-10
              text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900
              focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50
              disabled:text-gray-500 dark:bg-gray-900 dark:text-white
              dark:focus:ring-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600
              ${
                error
                  ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              }
              ${className}
            `.trim()}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
