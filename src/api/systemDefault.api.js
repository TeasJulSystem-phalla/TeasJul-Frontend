import api from "./axios";

export const systemDefaultApi = {
  // ---- SUPER_ADMIN management (/api/admin/system-defaults) ----
  adminList: (params) =>
    api.get("/admin/system-defaults", { params }).then((res) => res.data),

  adminCreate: (data) =>
    api.post("/admin/system-defaults", data).then((res) => res.data),

  adminUpdate: (id, data) =>
    api.put(`/admin/system-defaults/${id}`, data).then((res) => res.data),

  adminUpdateStatus: (id, status) =>
    api.patch(`/admin/system-defaults/${id}/status`, { status }).then((res) => res.data),

  // ---- Owner-facing (/api/system-defaults) ----
  listForOwner: (kind) =>
    api.get("/system-defaults", { params: kind ? { kind } : {} }).then((res) => res.data),

  enable: (id) =>
    api.post(`/system-defaults/${id}/enable`).then((res) => res.data),

  disable: (id) =>
    api.post(`/system-defaults/${id}/disable`).then((res) => res.data),
};