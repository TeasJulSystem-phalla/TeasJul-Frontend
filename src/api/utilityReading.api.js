import api from "./axios";

export const utilityReadingApi = {
  createReading: (data) =>
    api.post("/utility-readings", data).then((res) => res.data),

  getReadings: (params) =>
    api.get("/utility-readings", { params }).then((res) => res.data),

  getReadingById: (id) =>
    api.get(`/utility-readings/${id}`).then((res) => res.data),

  getMonthlySheet: (params) =>
    api.get("/utility-readings/monthly-sheet", { params }).then((res) => res.data),

  getMonthlySheetFloors: (params) =>
    api.get("/utility-readings/floors", { params }).then((res) => res.data),

  saveMonthlySheet: (data) =>
    api.post("/utility-readings/bulk", data).then((res) => res.data),
};
