import api from "./axios";

export const maintenanceAssignmentApi = {
  createAssignment: (requestId, data) =>
    api.post(`/v1/maintenance-requests/${requestId}/assignments`, data).then((res) => res.data),

  getAssignments: (requestId) =>
    api.get(`/v1/maintenance-requests/${requestId}/assignments`).then((res) => res.data),

  completeAssignment: (requestId, assignmentId) =>
    api.patch(`/v1/maintenance-requests/${requestId}/assignments/${assignmentId}/complete`).then((res) => res.data),
};
