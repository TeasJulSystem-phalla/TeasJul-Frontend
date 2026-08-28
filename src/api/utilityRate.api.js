import api from "./axios";

export const utilityRateApi = {
  createRate: (data) =>
    api.post("/utility-rates", data).then((res) => res.data),

  getRates: (params) =>
    api.get("/utility-rates", { params }).then((res) => res.data),

  getRateById: (id) =>
    api.get(`/utility-rates/${id}`).then((res) => res.data),

  updateRate: (id, data) =>
    api.put(`/utility-rates/${id}`, data).then((res) => res.data),

  deactivateRate: (id) =>
    api.patch(`/utility-rates/${id}/deactivate`).then((res) => res.data),
};
