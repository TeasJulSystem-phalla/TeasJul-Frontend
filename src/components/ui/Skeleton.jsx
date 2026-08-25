const Skeleton = ({ width, height, className = '' }) => {
  return (
    <div
      className={`
        animate-pulse rounded-md bg-gray-200 dark:bg-gray-800
        ${className}
      `}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
