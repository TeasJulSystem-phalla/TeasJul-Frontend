import api from "./axios";

export const utilityMeterApi = {
  createMeter: (data) =>
    api.post("/utility-meters", data).then((res) => res.data),

  getMeters: (params) =>
    api.get("/utility-meters", { params }).then((res) => res.data),

  getMeterById: (id) =>
    api.get(`/utility-meters/${id}`).then((res) => res.data),

  updateMeter: (id, data) =>
    api.put(`/utility-meters/${id}`, data).then((res) => res.data),

  deactivateMeter: (id) =>
    api.patch(`/utility-meters/${id}/deactivate`).then((res) => res.data),
};
