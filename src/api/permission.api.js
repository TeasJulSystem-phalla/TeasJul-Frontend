import api from "./axios";

export const permissionApi = {
  getAllPermissions: (module) =>
    api.get("/permissions", { params: module ? { module } : {} }).then((res) => res.data),

  getPermissionById: (id) =>
    api.get(`/permissions/${id}`).then((res) => res.data),

  createPermission: (data) =>
    api.post("/permissions", data).then((res) => res.data),

  updatePermission: (id, data) =>
    api.put(`/permissions/${id}`, data).then((res) => res.data),

  deletePermission: (id) =>
    api.delete(`/permissions/${id}`).then((res) => res.data),
};
