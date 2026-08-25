import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
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
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className="inline-flex h-9 items-center justify-center rounded-md px-2 text-gray-500 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

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

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className="inline-flex h-9 items-center justify-center rounded-md px-2 text-gray-500 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
