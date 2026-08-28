import { useState, useCallback, useEffect } from "react";
import { maintenanceAssignmentApi } from "../api/maintenanceAssignment.api";

export function useMaintenanceAssignments(requestId) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!requestId) {
      setAssignments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setAssignments(await maintenanceAssignmentApi.getAssignments(requestId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const createAssignment = useCallback(
    async (data) => {
      const created = await maintenanceAssignmentApi.createAssignment(requestId, data);
      setAssignments((prev) => [created, ...prev]);
      return created;
    },
    [requestId]
  );

  const completeAssignment = useCallback(
    async (assignmentId) => {
      await maintenanceAssignmentApi.completeAssignment(requestId, assignmentId);
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, completedAt: new Date().toISOString() } : a
        )
      );
    },
    [requestId]
  );

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
    completeAssignment,
  };
}
