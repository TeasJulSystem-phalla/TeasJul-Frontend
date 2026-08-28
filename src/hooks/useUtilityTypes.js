import { useState, useCallback, useEffect } from "react";
import { utilityTypeApi } from "../api/utilityType.api";

export function useUtilityTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const fetchTypes = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await utilityTypeApi.getTypes({
          page,
          size,
          ...params,
        });
        setTypes(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load utility types. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, size]
  );

  const createType = useCallback(async (data) => {
    const created = await utilityTypeApi.createType(data);
    setTypes((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateType = useCallback(async (id, data) => {
    const updated = await utilityTypeApi.updateType(id, data);
    setTypes((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deactivateType = useCallback(async (id) => {
    await utilityTypeApi.deactivateType(id);
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "INACTIVE" } : t))
    );
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return {
    types,
    loading,
    error,
    page,
    size,
    totalPages,
    setPage,
    setSize,
    fetchTypes,
    createType,
    updateType,
    deactivateType,
  };
}
