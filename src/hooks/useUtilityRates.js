import { useState, useCallback, useEffect } from "react";
import { utilityRateApi } from "../api/utilityRate.api";

export function useUtilityRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const fetchRates = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await utilityRateApi.getRates({
          page,
          size,
          ...params,
        });
        setRates(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load utility rates. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, size]
  );

  const createRate = useCallback(async (data) => {
    const created = await utilityRateApi.createRate(data);
    setRates((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateRate = useCallback(async (id, data) => {
    const updated = await utilityRateApi.updateRate(id, data);
    setRates((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const deactivateRate = useCallback(async (id) => {
    await utilityRateApi.deactivateRate(id);
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "INACTIVE" } : r))
    );
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    loading,
    error,
    page,
    size,
    totalPages,
    setPage,
    setSize,
    fetchRates,
    createRate,
    updateRate,
    deactivateRate,
  };
}
