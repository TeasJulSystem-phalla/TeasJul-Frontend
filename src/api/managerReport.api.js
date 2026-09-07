import api from "./axios";

export const managerReportApi = {
  getMonthlyReport: (params = {}) =>
    api.get("/manager/reports/monthly", { params }).then((res) => res.data),
};