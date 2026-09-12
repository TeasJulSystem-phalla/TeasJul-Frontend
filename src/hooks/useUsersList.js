import { useState, useCallback, useEffect } from "react";
import { userApi } from "../api/user.api";

export function useUsersList(initialSize = 10) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSetSearch = useCallback((val) => {
    setSearch(val);
    setPage(0);
  }, []);

  const handleSetStatusFilter = useCallback((val) => {
    setStatusFilter(val);
    setPage(0);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getAllUsers({
        page,
        size,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter || undefined,
      });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedSearch, statusFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummary(await userApi.getUsersSummary());
    } catch {
      // summary is best-effort
    }
  }, []);

  const deleteUser = useCallback(
    async (id) => {
      await userApi.deleteUser(id);
      fetchUsers();
      fetchSummary();
    },
    [fetchUsers, fetchSummary]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    users,
    summary,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    search,
    statusFilter,
    setSearch: handleSetSearch,
    setStatusFilter: handleSetStatusFilter,
    setPage,
    setSize,
    fetchUsers,
    fetchSummary,
    deleteUser,
  };
}