const Card = ({ header, footer, title, description, children, className = '' }) => {
  return (
    <div
      className={`
        rounded-lg border border-gray-200 bg-white
        dark:border-gray-800 dark:bg-gray-900
        ${className}
      `}
    >
      {(header || title) && (
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          {header || (
            <div>
              {title && (
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
