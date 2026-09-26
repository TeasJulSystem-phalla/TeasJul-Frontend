import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <nav
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label="ការបែងចែកទំព័រ"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className="inline-flex h-8 sm:h-9 items-center justify-center rounded-md px-1.5 sm:px-2 text-gray-500 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="ទំព័រមុន"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Mobile compact indicator */}
      <span className="inline-flex sm:hidden items-center px-2 text-xs font-medium text-gray-700 dark:text-gray-300">
        {currentPage} / {totalPages}
      </span>

      {/* Desktop page buttons */}
      <div className="hidden sm:inline-flex items-center gap-1">
        {getPages().map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            disabled={disabled}
            className={`
              inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-md
              px-2 text-sm font-medium transition-colors
              ${
                page === currentPage
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }
              disabled:pointer-events-none disabled:opacity-50
            `}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className="inline-flex h-8 sm:h-9 items-center justify-center rounded-md px-1.5 sm:px-2 text-gray-500 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="ទំព័របន្ទាប់"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
