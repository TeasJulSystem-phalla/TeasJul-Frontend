import { useState, useCallback, useEffect } from "react";
import { invoiceApi } from "../api/invoice.api";

export function useInvoices(initialSize = 10) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [houseFilter, setHouseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

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

  const handleSetHouseFilter = useCallback((val) => {
    setHouseFilter(val);
    setPage(0);
  }, []);

  const handleSetStatusFilter = useCallback((val) => {
    setStatusFilter(val);
    setPage(0);
  }, []);

  const handleSetMonthFilter = useCallback((val) => {
    setMonthFilter(val);
    setPage(0);
  }, []);

  const handleSetYearFilter = useCallback((val) => {
    setYearFilter(val);
    setPage(0);
  }, []);

  const fetchInvoices = useCallback(
    async (overrideParams) => {
      setLoading(true);
      setError(null);
      try {
        const query = {
          page,
          size,
          search: debouncedSearch.trim() || undefined,
          houseId: houseFilter || undefined,
          status: statusFilter || undefined,
          billingMonth: monthFilter || undefined,
          billingYear: yearFilter || undefined,
          ...overrideParams,
        };
        const data = await invoiceApi.getInvoices(query);
        setInvoices(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load invoices. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, size, debouncedSearch, houseFilter, statusFilter, monthFilter, yearFilter]
  );

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setHouseFilter("");
    setStatusFilter("");
    setMonthFilter("");
    setYearFilter("");
    setPage(0);
  }, []);

  const preview = useCallback(async (data) => {
    return await invoiceApi.preview(data);
  }, []);

  const generate = useCallback(
    async (data) => {
      const created = await invoiceApi.generate(data);
      fetchInvoices();
      return created;
    },
    [fetchInvoices]
  );

  const generateBulk = useCallback(async (data) => {
    const result = await invoiceApi.generateBulk(data);
    return result;
  }, []);

  const markPaid = useCallback(
    async (id) => {
      const updated = await invoiceApi.markPaid(id);
      fetchInvoices();
      return updated;
    },
    [fetchInvoices]
  );

  const updateStatus = useCallback(
    async (id, status) => {
      const updated = await invoiceApi.updateStatus(id, status);
      fetchInvoices();
      return updated;
    },
    [fetchInvoices]
  );

  const cancel = useCallback(
    async (id) => {
      await invoiceApi.cancel(id);
      fetchInvoices();
    },
    [fetchInvoices]
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    searchTerm,
    houseFilter,
    statusFilter,
    monthFilter,
    yearFilter,
    setSearchTerm: handleSetSearchTerm,
    setHouseFilter: handleSetHouseFilter,
    setStatusFilter: handleSetStatusFilter,
    setMonthFilter: handleSetMonthFilter,
    setYearFilter: handleSetYearFilter,
    clearFilters,
    setPage,
    setSize,
    fetchInvoices,
    preview,
    generate,
    generateBulk,
    markPaid,
    updateStatus,
    cancel,
  };
}

