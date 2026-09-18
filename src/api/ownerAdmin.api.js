import api from "./axios";

// SUPER_ADMIN management of OWNER accounts (`/admin/owners`). The backend
// never returns or accepts passwords/roles on these endpoints.
export const ownerAdminApi = {
  listOwners: ({ search, status, page = 0, size = 10 } = {}) =>
    api
      .get("/admin/owners", {
        params: {
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          page,
          size,
        },
      })
      .then((res) => res.data),

  getOwner: (id) => api.get(`/admin/owners/${id}`).then((res) => res.data),

  createOwner: (data) => api.post("/admin/owners", data).then((res) => res.data),

  updateOwner: (id, data) =>
    api.put(`/admin/owners/${id}`, data).then((res) => res.data),

  updateOwnerStatus: (id, status) =>
    api.patch(`/admin/owners/${id}/status`, { status }).then((res) => res.data),
};