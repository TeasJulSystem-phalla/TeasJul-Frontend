import { useState, useEffect } from "react";
import { Search, UserRound, X, Loader2, AlertCircle, Check } from "lucide-react";
import Label from "./Label";
import Pagination from "./Pagination";
import { useUserSearch } from "../../hooks/useUserSearch";

const fullName = (u) =>
  `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || u.email || `អ្នកប្រើ #${u.id}`;

/**
 * Async, debounced, searchable selector of users available for tenant linking.
 *
 * UX: no popup/dropdown — the first page of available users is shown right away
 * in an inline one-page table. Typing filters server-side; each row is
 * clickable to select the user.
 */
const AsyncUserSelect = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}) => {
  const {
    query,
    results,
    loading,
    error: searchError,
    searched,
    page,
    totalPages,
    search,
    goToPage,
  } = useUserSearch();

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    search("");
  }, [search]);

  useEffect(() => {
    if (value) {
      const existing = results.find((u) => String(u.id) === String(value));
      if (existing) setSelected(existing);
    } else {
      setSelected(null);
    }
  }, [results, value]);

  const clearSelection = () => {
    setSelected(null);
    onChange("");
    search("");
  };

  const handleSelect = (u) => {
    setSelected(u);
    onChange(String(u.id));
  };

  return (
    <div className="w-full">
      {label && (
        <Label required={required} className="mb-1.5 block">
          {label}
        </Label>
      )}

      {/* Selected user summary */}
      {!disabled && value && selected ? (
        <div className="mb-2 flex items-center justify-between rounded-md border border-gray-300 bg-slate-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-gray-700 dark:text-slate-300">
              <UserRound className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-white">
                {fullName(selected)}
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {[selected.email, selected.phone].filter(Boolean).join(" · ") || selected.username}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            disabled={disabled}
            aria-label="ដកចេញ"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Search box */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            search(e.target.value);
            if (value) onChange("");
          }}
          placeholder="ស្វែងរកតាមឈ្មោះ អ៊ីមែល ឬលេខទូរស័ព្ទ..."
          disabled={disabled}
          className={`block w-full rounded-md border bg-white px-3 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600 ${
            error ? "border-red-500 focus:ring-red-500 dark:focus:ring-red-500" : "border-gray-300 dark:border-gray-700"
          }`}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
          <Search className="h-4 w-4" />
        </div>
      </div>

      {/* Inline one-page results table (no popup) */}
      <div className="mt-2 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-400 dark:bg-gray-800 dark:text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">ឈ្មោះ</th>
                <th className="hidden px-3 py-2 font-semibold sm:table-cell">អ៊ីមែល</th>
                <th className="hidden px-3 py-2 font-semibold md:table-cell">លេខទូរស័ព្ទ</th>
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> កំពុងស្វែងរក...
                    </div>
                  </td>
                </tr>
              ) : searchError ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4">
                    <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{searchError}</span>
                    </div>
                  </td>
                </tr>
              ) : searched && results.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm text-slate-400 dark:text-slate-500">
                    រកមិនឃើញអ្នកប្រើ
                  </td>
                </tr>
              ) : (
                results.map((u) => {
                  const isSelected = String(u.id) === String(value);
                  return (
                    <tr
                      key={u.id}
                      onClick={() => handleSelect(u)}
                      className={`cursor-pointer border-t border-gray-100 transition-colors dark:border-gray-800 ${
                        isSelected
                          ? "bg-gray-900/5 dark:bg-gray-700/40"
                          : "hover:bg-slate-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-300">
                            <UserRound className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-800 dark:text-white">
                              {fullName(u)}
                            </span>
                            <span className="block truncate text-xs text-slate-400 dark:text-slate-500 sm:hidden">
                              {u.email}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-3 py-2 text-sm text-slate-500 sm:table-cell dark:text-slate-400">
                        {u.email}
                      </td>
                      <td className="hidden px-3 py-2 text-sm text-slate-500 md:table-cell dark:text-slate-400">
                        {u.phone || "—"}
                      </td>
                      <td className="w-10 px-3 py-2 text-center">
                        {isSelected && <Check className="ml-auto h-4 w-4 text-gray-900 dark:text-white" />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {searched && results.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 dark:border-gray-800">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ទំព័រ {page + 1} / {Math.max(1, totalPages)}
            </span>
            <Pagination
              currentPage={page + 1}
              totalPages={Math.max(1, totalPages)}
              onPageChange={(p) => goToPage(p - 1)}
              disabled={loading}
            />
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default AsyncUserSelect;