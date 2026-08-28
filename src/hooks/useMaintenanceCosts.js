import { useState, useCallback, useEffect } from "react";
import { maintenanceCostApi } from "../api/maintenanceCost.api";

export function useMaintenanceCosts(requestId) {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCosts = useCallback(async () => {
    if (!requestId) {
      setCosts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCosts(await maintenanceCostApi.getCosts(requestId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load costs."
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const createCost = useCallback(
    async (data) => {
      const created = await maintenanceCostApi.createCost(requestId, data);
      setCosts((prev) => [created, ...prev]);
      return created;
    },
    [requestId]
  );

  const updateCost = useCallback(
    async (costId, data) => {
      const updated = await maintenanceCostApi.updateCost(requestId, costId, data);
      setCosts((prev) => prev.map((c) => (c.id === costId ? updated : c)));
      return updated;
    },
    [requestId]
  );

  const deleteCost = useCallback(
    async (costId) => {
      await maintenanceCostApi.deleteCost(requestId, costId);
      setCosts((prev) => prev.filter((c) => c.id !== costId));
    },
    [requestId]
  );

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  return {
    costs,
    loading,
    error,
    fetchCosts,
    createCost,
    updateCost,
    deleteCost,
  };
}
