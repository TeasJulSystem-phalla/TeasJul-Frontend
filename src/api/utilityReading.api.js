import api from "./axios";

export const utilityReadingApi = {
  createReading: (data) =>
    api.post("/utility-readings", data).then((res) => res.data),

  getReadings: (params) =>
    api.get("/utility-readings", { params }).then((res) => res.data),

  getReadingById: (id) =>
    api.get(`/utility-readings/${id}`).then((res) => res.data),
};
