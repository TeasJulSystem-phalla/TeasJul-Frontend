import api from "./axios";

export const paymentApi = {
  /**
   * Create a KHQR payment for an invoice via PayWay Sandbox
   * @param {{ invoiceId: number, paymentMethodId: number }} data
   * @returns {Promise<{
   *   id: number,
   *   invoiceId: number,
   *   paymentMethodId: number,
   *   paymentMethodName: string,
   *   paymentNo: string,
   *   transactionId: string,
   *   amount: number,
   *   currency: string,
   *   status: string,
   *   qrCode: string,
   *   paidAt: string|null,
   *   createdAt: string
   * }>}
   */
  createPayment: (data) =>
    api.post("/payments", data).then((res) => res.data),

  /**
   * Record a manual (offline/cash) payment for an invoice.
   * Creates an immediately-PAID payment record. amount is optional (defaults to the
   * full outstanding balance).
   * @param {{ invoiceId: number, paymentMethodId: number, amount?: number, paidAt?: string }} data
   * @returns {Promise<PaymentResponse>}
   */
  recordManualPayment: (data) =>
    api.post("/payments/manual", data).then((res) => res.data),

  /**
   * Create a new payment method (owner only).
   * @param {{ name: string, code: string, description?: string }} data
   * @returns {Promise<PaymentMethodResponse>}
   */
  createPaymentMethod: (data) =>
    api.post("/payment-methods", data).then((res) => res.data),

  /**
   * Update a payment method's name/description/status (owner only).
   * @param {number} id
   * @param {{ name: string, description?: string, status: 'ACTIVE'|'INACTIVE' }} data
   * @returns {Promise<PaymentMethodResponse>}
   */
  updatePaymentMethod: (id, data) =>
    api.put(`/payment-methods/${id}`, data).then((res) => res.data),

  /**
   * Get the authoritative status of a payment by ABA transaction id.
   * Non-terminal payments are reconciled against the PayWay Check Transaction
   * API server-side, so the result is accurate even if the ABA callback was
   * delayed or lost.
   * @param {string} transactionId
   * @returns {Promise<{
   *   transactionId: string,
   *   paymentId: number,
   *   invoiceId: number,
   *   invoiceNo: string,
   *   paymentStatus: string,
   *   invoiceStatus: string,
   *   amount: number,
   *   currency: string,
   *   paidAt: string|null
   * }>}
   */
  getPaymentStatus: (transactionId) =>
    api.get(`/payments/status/${encodeURIComponent(transactionId)}`).then((res) => res.data),

  /**
   * List payments across the houses the current owner/manager can access.
   * @param {{ houseId?: number|string, status?: string, fromDate?: string, toDate?: string, page?: number, size?: number }} params
   * @returns {Promise<{ content: Array<PaymentListResponse>, totalPages: number, totalElements: number, page: number, size: number }>}
   */
  listPayments: (params) =>
    api.get("/payments", { params }).then((res) => res.data),

  /**
   * List the payment methods configured for the current owner/manager.
   * @returns {Promise<Array<{ id: number, name: string, code: string, description: string|null, status: string }>>}
   */
  listPaymentMethods: () =>
    api.get("/payment-methods").then((res) => res.data),
};

export default paymentApi;
