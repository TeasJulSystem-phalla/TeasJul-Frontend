import { useCallback, useEffect, useState } from "react";
import { tenantDashboardApi } from "../api/tenantDashboard.api";

const toErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

export function useTenantDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await tenantDashboardApi.getDashboard());
    } catch (err) {
      setError(toErrorMessage(err, "ការផ្ទុកផ្ទាំងគ្រប់គ្រងបានបរាជ័យ។"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, fetchDashboard };
}

export function useTenantTrends(from, to) {
  const [usage, setUsage] = useState(null);
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrends = useCallback(async (fromValue, toValue) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (fromValue) params.from = fromValue;
      if (toValue) params.to = toValue;
      const [usageData, paymentData] = await Promise.all([
        tenantDashboardApi.getUtilityUsage(params),
        tenantDashboardApi.getPaymentHistory(params),
      ]);
      setUsage(usageData);
      setPayments(paymentData);
    } catch (err) {
      setError(toErrorMessage(err, "ការផ្ទុកទិន្នន័យប្រើប្រាស់បានបរាជ័យ។"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends(from, to);
  }, [fetchTrends, from, to]);

  return { usage, payments, loading, error, fetchTrends };
}

export function useTenantInvoices(page = 0, size = 10) {
  const [result, setResult] = useState({
    content: [],
    page,
    size,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(
    async (p = page, s = size) => {
      setLoading(true);
      setError(null);
      try {
        setResult(await tenantDashboardApi.getInvoices({ page: p, size: s }));
      } catch (err) {
        setError(toErrorMessage(err, "ការផ្ទុកបញ្ជីវិក្កយបត្របានបរាជ័យ។"));
      } finally {
        setLoading(false);
      }
    },
    [page, size]
  );

  useEffect(() => {
    fetchInvoices(page, size);
  }, [fetchInvoices, page, size]);

  return {
    invoices: result.content,
    pageData: result,
    loading,
    error,
    fetchInvoices,
  };
}

export function useTenantInvoiceDetail(invoiceId) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setInvoice(await tenantDashboardApi.getInvoiceById(invoiceId));
    } catch (err) {
      setError(toErrorMessage(err, "ការផ្ទុកវិក្កយបត្របានបរាជ័យ។"));
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return { invoice, loading, error, fetchInvoice };
}