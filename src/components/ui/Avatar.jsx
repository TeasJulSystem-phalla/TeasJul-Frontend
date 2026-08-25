const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const Avatar = ({ image, fallback, size = 'md', className = '' }) => {
  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  if (image) {
    return (
      <img
        src={image}
        alt={fallback || 'Avatar'}
        className={`
          rounded-full object-cover
          ${sizes[size] || sizes.md}
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        flex items-center justify-center rounded-full bg-gray-200
        font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300
        ${sizes[size] || sizes.md}
        ${className}
      `}
      aria-label={fallback}
    >
      {initials}
    </div>
  );
};

export default Avatar;
