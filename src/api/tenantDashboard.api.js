import api from "./axios";

export const tenantDashboardApi = {
  getDashboard: () => api.get("/tenant/dashboard").then((res) => res.data),

  getUtilityUsage: (params = {}) =>
    api.get("/tenant/utilities/usage", { params }).then((res) => res.data),

  getPaymentHistory: (params = {}) =>
    api.get("/tenant/payments/history", { params }).then((res) => res.data),

  getInvoices: (params = {}) =>
    api.get("/tenant/invoices", { params }).then((res) => res.data),

  getInvoiceById: (invoiceId) =>
    api.get(`/tenant/invoices/${invoiceId}`).then((res) => res.data),
};