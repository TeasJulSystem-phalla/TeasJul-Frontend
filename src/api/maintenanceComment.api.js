import api from "./axios";

export const maintenanceCommentApi = {
  createComment: (requestId, data) =>
    api.post(`/v1/maintenance-requests/${requestId}/comments`, data).then((res) => res.data),

  getComments: (requestId) =>
    api.get(`/v1/maintenance-requests/${requestId}/comments`).then((res) => res.data),

  deleteComment: (requestId, commentId) =>
    api.delete(`/v1/maintenance-requests/${requestId}/comments/${commentId}`).then((res) => res.data),
};
