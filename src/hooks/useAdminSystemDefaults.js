import { useState, useCallback, useEffect } from "react";
import { systemDefaultApi } from "../api/systemDefault.api";

export function useAdminSystemDefaults(kind) {
  const [defaults, setDefaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDefaults = useCallback(
    async (k = kind) => {
      setLoading(true);
      setError(null);
      try {
        setDefaults(
          await systemDefaultApi.adminList({
            kind: k || undefined,
          })
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load system defaults. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [kind]
  );

  const createDefault = useCallback(async (data) => {
    const created = await systemDefaultApi.adminCreate(data);
    setDefaults((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateDefault = useCallback(async (id, data) => {
    const updated = await systemDefaultApi.adminUpdate(id, data);
    setDefaults((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const updateStatus = useCallback(
    async (id, status) => {
      await systemDefaultApi.adminUpdateStatus(id, status);
      setDefaults((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    },
    []
  );

  useEffect(() => {
    fetchDefaults();
  }, [fetchDefaults]);

  return {
    defaults,
    loading,
    error,
    fetchDefaults,
    createDefault,
    updateDefault,
    updateStatus,
  };
}