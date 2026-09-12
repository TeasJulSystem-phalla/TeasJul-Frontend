import { useState, useCallback, useEffect } from "react";
import { tenantApi } from "../api/tenant.api";

export function useTenantsList(initialSize = 10) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSetSearchTerm = useCallback((val) => {
    setSearchTerm(val);
    setPage(0);
  }, []);

  const handleSetStatusFilter = useCallback((val) => {
    setStatusFilter(val);
    setPage(0);
  }, []);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tenantApi.getMyTenants({
        page,
        size,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter || undefined,
      });
      setTenants(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load tenants. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedSearch, statusFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummary(await tenantApi.getMyTenantsSummary());
    } catch {
      // summary is best-effort
    }
  }, []);

  const getTenant = useCallback(async (id) => {
    return await tenantApi.getTenantById(id);
  }, []);

  const createTenant = useCallback(
    async (data) => {
      const created = await tenantApi.createTenant(data);
      fetchTenants();
      fetchSummary();
      return created;
    },
    [fetchTenants, fetchSummary]
  );

  const updateTenant = useCallback(
    async (id, data) => {
      const updated = await tenantApi.updateTenant(id, data);
      fetchTenants();
      fetchSummary();
      return updated;
    },
    [fetchTenants, fetchSummary]
  );

  const deactivateTenant = useCallback(
    async (id) => {
      await tenantApi.deactivateTenant(id);
      fetchTenants();
      fetchSummary();
    },
    [fetchTenants, fetchSummary]
  );

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    tenants,
    summary,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    searchTerm,
    statusFilter,
    setSearchTerm: handleSetSearchTerm,
    setStatusFilter: handleSetStatusFilter,
    setPage,
    setSize,
    fetchTenants,
    fetchSummary,
    getTenant,
    createTenant,
    updateTenant,
    deactivateTenant,
  };
}