import api from "./axios";

export const tenantInvitationApi = {
  // ---- Tenant invitations (`/api/v1/tenant-invitations`) ----
  createInvitation: (data) =>
    api.post("/v1/tenant-invitations", data).then((res) => res.data),

  getMyInvitations: () =>
    api.get("/v1/tenant-invitations").then((res) => res.data),

  validateInvitation: (token) =>
    api
      .get("/v1/tenant-invitations/validate", { params: { token } })
      .then((res) => res.data),

  consumeInvitation: (data) =>
    api.post("/v1/tenant-invitations/consume", data).then((res) => res.data),

  revokeInvitation: (id) =>
    api.delete(`/v1/tenant-invitations/${id}`).then((res) => res.data),
};