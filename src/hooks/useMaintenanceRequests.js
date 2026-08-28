import { useState, useCallback, useEffect } from "react";
import { maintenanceRequestApi } from "../api/maintenanceRequest.api";

export function useMaintenanceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await maintenanceRequestApi.getMyRequests());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load maintenance requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (data) => {
    const created = await maintenanceRequestApi.createRequest(data);
    setRequests((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateRequest = useCallback(async (id, data) => {
    const updated = await maintenanceRequestApi.updateRequest(id, data);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const changeStatus = useCallback(async (id, status) => {
    await maintenanceRequestApi.changeStatus(id, status);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    updateRequest,
    changeStatus,
  };
}
