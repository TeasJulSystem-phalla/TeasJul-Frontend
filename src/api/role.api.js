import api from "./axios";

export const roleApi = {
  getAllRoles: () =>
    api.get("/roles").then((res) => res.data),

  getRoleById: (id) =>
    api.get(`/roles/${id}`).then((res) => res.data),

  createRole: (data) =>
    api.post("/roles", data).then((res) => res.data),

  updateRole: (id, data) =>
    api.put(`/roles/${id}`, data).then((res) => res.data),

  deleteRole: (id) =>
    api.delete(`/roles/${id}`).then((res) => res.data),

  getRolePermissions: (roleId) =>
    api.get(`/roles/${roleId}/permissions`).then((res) => res.data),

  assignPermission: (roleId, permissionId) =>
    api.post(`/roles/${roleId}/permissions/${permissionId}`).then((res) => res.data),

  removePermission: (roleId, permissionId) =>
    api.delete(`/roles/${roleId}/permissions/${permissionId}`).then((res) => res.data),

  replacePermissions: (roleId, permissionIds) =>
    api.put(`/roles/${roleId}/permissions`, { permissionIds }).then((res) => res.data),
};
