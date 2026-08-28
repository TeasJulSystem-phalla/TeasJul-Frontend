import api from "./axios";

export const maintenanceCategoryApi = {
  createCategory: (data) =>
    api.post("/v1/maintenance-categories", data).then((res) => res.data),

  getMyCategories: () =>
    api.get("/v1/maintenance-categories").then((res) => res.data),

  getCategoryById: (id) =>
    api.get(`/v1/maintenance-categories/${id}`).then((res) => res.data),

  updateCategory: (id, data) =>
    api.put(`/v1/maintenance-categories/${id}`, data).then((res) => res.data),

  deactivateCategory: (id) =>
    api.patch(`/v1/maintenance-categories/${id}/deactivate`).then((res) => res.data),
};
