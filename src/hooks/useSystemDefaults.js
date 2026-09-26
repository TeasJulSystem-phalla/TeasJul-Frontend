import { useState, useCallback, useEffect } from "react";
import { systemDefaultApi } from "../api/systemDefault.api";

export function useSystemDefaults(kind, enabled = true) {
  const [defaults, setDefaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDefaults = useCallback(
    async (k = kind) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        setDefaults(await systemDefaultApi.listForOwner(k || undefined));
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
    [kind, enabled]
  );

  const enable = useCallback(async (id) => {
    const updated = await systemDefaultApi.enable(id);
    setDefaults((prev) =>
      prev.map((d) => (d.definition.id === id ? updated : d))
    );
    return updated;
  }, []);

  const disable = useCallback(async (id) => {
    const updated = await systemDefaultApi.disable(id);
    setDefaults((prev) =>
      prev.map((d) => (d.definition.id === id ? updated : d))
    );
    return updated;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    fetchDefaults();
  }, [fetchDefaults, enabled]);

  return {
    defaults,
    loading,
    error,
    fetchDefaults,
    enable,
    disable,
  };
}