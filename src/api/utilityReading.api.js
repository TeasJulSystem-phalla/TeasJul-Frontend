import api from "./axios";

export const utilityReadingApi = {
  createReading: (data) =>
    api.post("/utility-readings", data).then((res) => res.data),

  getReadings: (params) =>
    api.get("/utility-readings", { params }).then((res) => res.data),

  getReadingById: (id) =>
    api.get(`/utility-readings/${id}`).then((res) => res.data),

  getMonthlySheet: (houseId, year, month) =>
    api.get("/utility-readings/monthly-sheet", { params: { houseId, year, month } }).then((res) => res.data),

  saveMonthlySheet: (data) =>
    api.post("/utility-readings/bulk", data).then((res) => res.data),
};
