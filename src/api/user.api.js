import api from "./axios";

export const userApi = {
  getAllUsers: (params) =>
    api.get("/v1/users", { params }).then((res) => res.data),

  getUsersSummary: () =>
    api.get("/v1/users/summary").then((res) => res.data),

  searchAvailableForTenant: (params) =>
    api.get("/v1/users/available-for-tenant", { params }).then((res) => res.data),

  getCurrentUser: () =>
    api.get("/v1/users/me").then((res) => res.data),

  getMyAccessibleHouses: () =>
    api.get("/v1/users/me/houses").then((res) => res.data),

  getMyRoles: () =>
    api.get("/v1/users/me/roles").then((res) => res.data),

  getUserById: (id) =>
    api.get(`/v1/users/${id}`).then((res) => res.data),

  updateUser: (id, data) =>
    api.put(`/v1/users/${id}`, data).then((res) => res.data),

  deleteUser: (id) =>
    api.delete(`/v1/users/${id}`).then((res) => res.data),

  getUserRoles: (userId) =>
    api.get(`/users/${userId}/roles`).then((res) => res.data),

  assignRole: (userId, roleId) =>
    api.post(`/users/${userId}/roles/${roleId}`).then((res) => res.data),

  removeRole: (userId, roleId) =>
    api.delete(`/users/${userId}/roles/${roleId}`).then((res) => res.data),
};
