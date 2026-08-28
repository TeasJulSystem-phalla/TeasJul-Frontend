import { useState, useCallback, useEffect } from "react";
import { utilityMeterApi } from "../api/utilityMeter.api";

export function useUtilityMeters() {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const fetchMeters = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await utilityMeterApi.getMeters({
          page,
          size,
          ...params,
        });
        setMeters(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load utility meters. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, size]
  );

  const createMeter = useCallback(async (data) => {
    const created = await utilityMeterApi.createMeter(data);
    setMeters((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateMeter = useCallback(async (id, data) => {
    const updated = await utilityMeterApi.updateMeter(id, data);
    setMeters((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  }, []);

  const deactivateMeter = useCallback(async (id) => {
    await utilityMeterApi.deactivateMeter(id);
    setMeters((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "INACTIVE" } : m))
    );
  }, []);

  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);

  return {
    meters,
    loading,
    error,
    page,
    size,
    totalPages,
    setPage,
    setSize,
    fetchMeters,
    createMeter,
    updateMeter,
    deactivateMeter,
  };
}
