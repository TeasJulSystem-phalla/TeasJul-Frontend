import { useState, useCallback } from "react";
import { ownerReportApi } from "../api/ownerDashboard.api";

const toErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

export function useOwnerReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async ({ year, month, houseId } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = { year, month };
      if (houseId) query.houseId = houseId;
      setReport(await ownerReportApi.getMonthlyReport(query));
    } catch (err) {
      setError(toErrorMessage(err, "ការផ្ទុករបាយការណ៍បានបរាជ័យ។"));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { report, loading, error, fetchReport };
}
