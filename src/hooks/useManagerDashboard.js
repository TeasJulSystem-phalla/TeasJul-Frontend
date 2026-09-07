import { useState, useCallback } from "react";
import { managerDashboardApi } from "../api/managerDashboard.api";

const toErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

export function useManagerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const query = {};
      if (params?.houseId) query.houseId = params.houseId;
      if (params?.fromDate) query.fromDate = params.fromDate;
      if (params?.toDate) query.toDate = params.toDate;
      if (params?.roomStatus) query.roomStatus = params.roomStatus;
      if (params?.paymentStatus) query.paymentStatus = params.paymentStatus;
      setDashboard(await managerDashboardApi.getDashboard(query));
    } catch (err) {
      setError(toErrorMessage(err, "ការផ្ទុកផ្ទាំងគ្រប់គ្រងបានបរាជ័យ។"));
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { dashboard, loading, error, fetchDashboard };
}