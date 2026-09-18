import { useState, useCallback } from "react";
import { roomUtilityApi } from "../api/roomUtility.api";

export function useRoomUtilities(roomId) {
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUtilities = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await roomUtilityApi.getRoomUtilities(roomId);
      setUtilities(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load room utilities."
      );
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const assignUtility = useCallback(
    async (utilityTypeId, isIncluded = false) => {
      const created = await roomUtilityApi.assignUtility(roomId, utilityTypeId, isIncluded);
      setUtilities((prev) => {
        const idx = prev.findIndex((u) => u.utilityTypeId === utilityTypeId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = created;
          return next;
        }
        return [...prev, created];
      });
      return created;
    },
    [roomId]
  );

  const removeUtility = useCallback(
    async (utilityTypeId) => {
      await roomUtilityApi.removeUtility(roomId, utilityTypeId);
      setUtilities((prev) => prev.filter((u) => u.utilityTypeId !== utilityTypeId));
    },
    [roomId]
  );

  return {
    utilities,
    loading,
    error,
    fetchUtilities,
    assignUtility,
    removeUtility,
  };
}
