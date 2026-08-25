const Separator = ({ orientation = 'horizontal', className = '' }) => {
  return (
    <div
      role="separator"
      className={`
        shrink-0 bg-gray-200 dark:bg-gray-800
        ${
          orientation === 'horizontal'
            ? 'h-px w-full'
            : 'h-full w-px'
        }
        ${className}
      `}
    />
  );
};

export default Separator;
