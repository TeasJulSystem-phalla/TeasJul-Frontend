import { useState, useCallback, useEffect } from "react";
import { invoiceApi } from "../api/invoice.api";

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const fetchInvoices = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await invoiceApi.getInvoices({
          page,
          size,
          ...params,
        });
        setInvoices(data.content || []);
        setTotalPages(data.totalPages || 0);
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
    [page, size]
  );

  const preview = useCallback(async (data) => {
    return await invoiceApi.preview(data);
  }, []);

  const generate = useCallback(async (data) => {
    const created = await invoiceApi.generate(data);
    setInvoices((prev) => [created, ...prev]);
    return created;
  }, []);

  const markPaid = useCallback(async (id) => {
    const updated = await invoiceApi.markPaid(id);
    setInvoices((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    const updated = await invoiceApi.updateStatus(id, status);
    setInvoices((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const cancel = useCallback(async (id) => {
    await invoiceApi.cancel(id);
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "CANCELLED" } : i))
    );
  }, []);

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
    setPage,
    setSize,
    fetchInvoices,
    preview,
    generate,
    markPaid,
    updateStatus,
    cancel,
  };
}
