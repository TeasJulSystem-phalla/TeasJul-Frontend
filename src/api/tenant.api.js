import api from "./axios";

export const tenantApi = {
  // ---- Tenant CRUD (`/api/v1/tenants`) ----
  createTenant: (data) =>
    api.post("/v1/tenants", data).then((res) => res.data),

  getMyTenants: () =>
    api.get("/v1/tenants").then((res) => res.data),

  getTenantById: (id) =>
    api.get(`/v1/tenants/${id}`).then((res) => res.data),

  updateTenant: (id, data) =>
    api.put(`/v1/tenants/${id}`, data).then((res) => res.data),

  deactivateTenant: (id) =>
    api.patch(`/v1/tenants/${id}/deactivate`).then((res) => res.data),

  // ---- Emergency Contacts (`/api/v1/tenants/{tenantId}/emergency-contacts`) ----
  getEmergencyContacts: (tenantId) =>
    api.get(`/v1/tenants/${tenantId}/emergency-contacts`).then((res) => res.data),

  getEmergencyContactById: (tenantId, contactId) =>
    api.get(`/v1/tenants/${tenantId}/emergency-contacts/${contactId}`).then((res) => res.data),

  createEmergencyContact: (tenantId, data) =>
    api.post(`/v1/tenants/${tenantId}/emergency-contacts`, data).then((res) => res.data),

  updateEmergencyContact: (tenantId, contactId, data) =>
    api.put(`/v1/tenants/${tenantId}/emergency-contacts/${contactId}`, data).then((res) => res.data),

  deleteEmergencyContact: (tenantId, contactId) =>
    api.delete(`/v1/tenants/${tenantId}/emergency-contacts/${contactId}`).then((res) => res.data),

  // ---- Contract Tenant (`/api/v1/contract_tenant`) ----
  addTenantToContract: (data) =>
    api.post("/v1/contract_tenant", data).then((res) => res.data),

  getContractTenantById: (id) =>
    api.get(`/v1/contract_tenant/${id}`).then((res) => res.data),

  getTenantsByContract: (contractId) =>
    api.get(`/v1/contract_tenant/contract/${contractId}`).then((res) => res.data),

  getContractsByTenant: (tenantId) =>
    api.get(`/v1/contract_tenant/tenant/${tenantId}`).then((res) => res.data),

  updateContractTenant: (id, data) =>
    api.put(`/v1/contract_tenant/${id}`, data).then((res) => res.data),

  removeTenantFromContract: (id) =>
    api.delete(`/v1/contract_tenant/${id}`).then((res) => res.data),
};
