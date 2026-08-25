import { forwardRef, useId } from 'react';
import Label from './Label';

const Textarea = forwardRef(
  (
    {
      label,
      placeholder,
      error,
      helperText,
      disabled = false,
      required = false,
      rows = 4,
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
        <textarea
          ref={ref}
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={`
            block w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900
            focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50
            disabled:text-gray-500 dark:bg-gray-900 dark:text-white
            dark:placeholder:text-gray-500 dark:focus:ring-white
            dark:disabled:bg-gray-800 dark:disabled:text-gray-600
            ${
              error
                ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }
            ${className}
          `.trim()}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${id}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
