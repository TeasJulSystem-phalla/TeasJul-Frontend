import api from "./axios";

export const invoiceApi = {
  preview: (data) =>
    api.post("/invoices/preview", data).then((res) => res.data),

  generate: (data) =>
    api.post("/invoices/generate", data).then((res) => res.data),

  generateBulk: (data) =>
    api.post("/invoices/generate-bulk", data).then((res) => res.data),

  getInvoices: (params) =>
    api.get("/invoices", { params }).then((res) => res.data),

  getInvoiceById: (id) =>
    api.get(`/invoices/${id}`).then((res) => res.data),

  addItem: (id, data) =>
    api.post(`/invoices/${id}/items`, data).then((res) => res.data),

  updateStatus: (id, status) =>
    api.patch(`/invoices/${id}/status`, null, { params: { status } }).then((res) => res.data),

  markPaid: (id) =>
    api.patch(`/invoices/${id}/pay`).then((res) => res.data),

  recordPayment: (id, amount) =>
    api.patch(`/invoices/${id}/payment`, null, { params: { amount } }).then((res) => res.data),

  cancel: (id) =>
    api.patch(`/invoices/${id}/cancel`).then((res) => res.data),
};
