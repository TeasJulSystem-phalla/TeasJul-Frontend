import { useState, useCallback } from "react";
import { invoiceApi } from "../api/invoice.api";

const toErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

export function useInvoiceSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const query = {};
      if (params?.houseId) query.houseId = params.houseId;
      if (params?.year) query.year = params.year;
      if (params?.month) query.month = params.month;
      if (params?.status) query.status = params.status;
      setSummary(await invoiceApi.getSummary(query));
    } catch (err) {
      setError(
        toErrorMessage(err, "ការផ្ទុកទិដ្ឋភាពសង្ខេបបានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។")
      );
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { summary, loading, error, fetchSummary };
}