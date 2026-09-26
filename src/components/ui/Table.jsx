import Spinner from './Spinner';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
  keyExtractor,
}) => {
  if (loading) {
    return (
      <div className="flex min-w-0 items-center justify-center rounded-lg border border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
        <Spinner size="md" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="min-w-0 rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full min-w-0 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 text-left dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className={`whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-4 sm:py-3 ${col.className || ''}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {data.map((row, rowIdx) => {
            const key = keyExtractor ? keyExtractor(row, rowIdx) : (row.id ?? rowIdx);
            return (
              <tr
                key={key}
                onClick={() => onRowClick && onRowClick(row)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 sm:px-4 sm:py-3 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;