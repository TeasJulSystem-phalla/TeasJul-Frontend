import { useState, useCallback, useEffect, useRef } from "react";
import { userApi } from "../api/user.api";

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;

/**
 * Async, debounced, server-side search of users available for tenant linking.
 * Only searches once the query has MIN_QUERY_LENGTH characters and after a
 * debounce window, so it never fires a request on every keystroke.
 */
export function useUserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef(null);
  const requestSeq = useRef(0);

  const runSearch = useCallback(async (q, pageNumber) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await userApi.searchAvailableForTenant({
        q: q || undefined,
        page: pageNumber,
        size: 10,
      });
      if (seq !== requestSeq.current) return;
      setResults(data.content || []);
      setPage(data.page ?? 0);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setResults([]);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "ការស្វែងរកអ្នកប្រើបានបរាជ័យ។"
      );
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  const search = useCallback(
    (value) => {
      const q = (value ?? "").trim();
      setQuery(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!q) {
        // Empty query = show the first page of all available users immediately.
        runSearch("", 0);
        return;
      }
      debounceRef.current = setTimeout(() => runSearch(q, 0), DEBOUNCE_MS);
    },
    [runSearch]
  );

  const goToPage = useCallback(
    (pageNumber) => {
      runSearch(query.trim(), pageNumber);
    },
    [query, runSearch]
  );

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    requestSeq.current++;
    setQuery("");
    setResults([]);
    setLoading(false);
    setError(null);
    setSearched(false);
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return {
    query,
    results,
    loading,
    error,
    searched,
    page,
    totalPages,
    totalElements,
    search,
    goToPage,
    clear,
    minQueryLength: MIN_QUERY_LENGTH,
  };
}
