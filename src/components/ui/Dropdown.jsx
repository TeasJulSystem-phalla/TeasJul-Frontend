import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ trigger, items = [], disabled = false, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => !disabled && setOpen(!open)}>
        {trigger || (
          <button
            type="button"
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Options
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="my-1 border-t border-gray-200 dark:border-gray-700" />;
            }
            return (
              <button
                key={i}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick && item.onClick();
                  setOpen(false);
                }}
                className={`
                  flex w-full items-center gap-2 px-3 py-2 text-left text-sm
                  ${item.danger ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
              >
                {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
