import api from "./axios";

export const maintenanceRequestApi = {
  createRequest: (data) =>
    api.post("/v1/maintenance-requests", data).then((res) => res.data),

  getMyRequests: () =>
    api.get("/v1/maintenance-requests").then((res) => res.data),

  getRequestById: (id) =>
    api.get(`/v1/maintenance-requests/${id}`).then((res) => res.data),

  updateRequest: (id, data) =>
    api.put(`/v1/maintenance-requests/${id}`, data).then((res) => res.data),

  changeStatus: (id, status) =>
    api.patch(`/v1/maintenance-requests/${id}/status`, { status }).then((res) => res.data),

  // ---- Tenant portal (`/api/v1/maintenance-requests/my`) ----
  getMyTenantRequests: () =>
    api.get("/v1/maintenance-requests/my").then((res) => res.data),

  createMyRequest: (data) =>
    api.post("/v1/maintenance-requests/my", data).then((res) => res.data),
};
