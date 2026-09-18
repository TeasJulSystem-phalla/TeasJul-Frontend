import { useState, useCallback, useEffect } from "react";
import { adminPropertyApi } from "../api/adminProperty.api";

// Admin property post list with server-side pagination, search, property-type
// and publication-status filters. Used by the admin properties list and the
// drafts page (which pins status=DRAFT).
export function useAdminProperties({ initialStatus = "" } = {}) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const onSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(0);
  }, []);

  const onTypeFilterChange = useCallback((value) => {
    setTypeFilter(value);
    setPage(0);
  }, []);

  const onStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    setPage(0);
  }, []);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminPropertyApi.listProperties({
        search: debouncedSearch.trim() || undefined,
        propertyType: typeFilter || undefined,
        status: statusFilter || undefined,
        page,
        size,
      });
      setContent((data.content || []).filter(Boolean));
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "មិនអាចផ្ទុកបញ្ជីអចលនទ្រព្យបានទេ។"
      );
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedSearch, typeFilter, statusFilter]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    content,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    search,
    typeFilter,
    statusFilter,
    setPage,
    setSize,
    setSearch: onSearchChange,
    setTypeFilter: onTypeFilterChange,
    setStatusFilter: onStatusFilterChange,
    fetchProperties,
  };
}