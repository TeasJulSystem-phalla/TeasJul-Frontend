import api from "./axios";

export const contractApi = {
  // ---- Rental Contracts (`/api/v1/rental-contracts`) ----
  createContract: (data) =>
    api.post("/v1/rental-contracts", data).then((res) => res.data),

  getContractById: (id) =>
    api.get(`/v1/rental-contracts/${id}`).then((res) => res.data),

  getContractsByOwner: (ownerId, params) =>
    api.get(`/v1/rental-contracts/owner/${ownerId}`, { params }).then((res) => res.data),

  getContractsByRoom: (roomId) =>
    api.get(`/v1/rental-contracts/room/${roomId}`).then((res) => res.data),

  getContractsByStatus: (status, params) =>
    api.get(`/v1/rental-contracts/status/${status}`, { params }).then((res) => res.data),

  getContractsSummary: () =>
    api.get("/v1/rental-contracts/summary").then((res) => res.data),

  updateContract: (id, data) =>
    api.put(`/v1/rental-contracts/${id}`, data).then((res) => res.data),

  updateContractStatus: (id, status) =>
    api.patch(`/v1/rental-contracts/${id}/status`, null, { params: { status } }).then((res) => res.data),

  deleteContract: (id) =>
    api.delete(`/v1/rental-contracts/${id}`).then((res) => res.data),

  // ---- Contract Deposits (`/api/v1/contract_deposit`) ----
  createDeposit: (data) =>
    api.post("/v1/contract_deposit", data).then((res) => res.data),

  markDepositPaid: (id, paidAmount) =>
    api.patch(`/v1/contract_deposit/${id}/pay`, { paidAmount }).then((res) => res.data),

  getDepositById: (id) =>
    api.get(`/v1/contract_deposit/${id}`).then((res) => res.data),

  getDepositsByContract: (contractId) =>
    api.get(`/v1/contract_deposit/contract/${contractId}`).then((res) => res.data),

  // ---- Contract Renewals (`/api/v1/contract_renewals`) ----
  createRenewal: (data) =>
    api.post("/v1/contract_renewals", data).then((res) => res.data),

  getRenewalById: (id) =>
    api.get(`/v1/contract_renewals/${id}`).then((res) => res.data),

  getRenewalsByContract: (contractId) =>
    api.get(`/v1/contract_renewals/contract/${contractId}`).then((res) => res.data),
};
