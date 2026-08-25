import { forwardRef } from 'react';

const Label = forwardRef(
  ({ htmlFor, required = false, className = '', children, ...props }, ref) => (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
);

Label.displayName = 'Label';

export default Label;
