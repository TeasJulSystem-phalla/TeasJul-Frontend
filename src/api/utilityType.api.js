import api from "./axios";

export const utilityTypeApi = {
  createType: (data) =>
    api.post("/utility-types", data).then((res) => res.data),

  getTypes: (params) =>
    api.get("/utility-types", { params }).then((res) => res.data),

  getTypeById: (id) =>
    api.get(`/utility-types/${id}`).then((res) => res.data),

  updateType: (id, data) =>
    api.put(`/utility-types/${id}`, data).then((res) => res.data),

  deactivateType: (id) =>
    api.patch(`/utility-types/${id}/deactivate`).then((res) => res.data),
};
