import { useState, useCallback, useEffect } from "react";
import { utilityReadingApi } from "../api/utilityReading.api";

export function useUtilityReadings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const fetchReadings = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await utilityReadingApi.getReadings({
          page,
          size,
          ...params,
        });
        setReadings(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load utility readings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, size]
  );

  const createReading = useCallback(async (data) => {
    const created = await utilityReadingApi.createReading(data);
    setReadings((prev) => [created, ...prev]);
    return created;
  }, []);

  const getMonthlySheet = useCallback(async (houseId, year, month) => {
    setLoading(true);
    setError(null);
    try {
      const data = await utilityReadingApi.getMonthlySheet(houseId, year, month);
      setReadings(data);
      return data;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load the monthly reading sheet."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMonthlySheet = useCallback((data) => utilityReadingApi.saveMonthlySheet(data), []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  return {
    readings,
    loading,
    error,
    page,
    size,
    totalPages,
    setPage,
    setSize,
    fetchReadings,
    createReading,
    getMonthlySheet,
    saveMonthlySheet,
  };
}
