import api from "./axios";

export const maintenanceCostApi = {
  createCost: (requestId, data) =>
    api.post(`/v1/maintenance-requests/${requestId}/costs`, data).then((res) => res.data),

  getCosts: (requestId) =>
    api.get(`/v1/maintenance-requests/${requestId}/costs`).then((res) => res.data),

  updateCost: (requestId, costId, data) =>
    api.put(`/v1/maintenance-requests/${requestId}/costs/${costId}`, data).then((res) => res.data),

  deleteCost: (requestId, costId) =>
    api.delete(`/v1/maintenance-requests/${requestId}/costs/${costId}`).then((res) => res.data),
};
