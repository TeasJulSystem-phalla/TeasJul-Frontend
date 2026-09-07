import api from "./axios";

export const ownerDashboardApi = {
  getDashboard: (params = {}) =>
    api.get("/owner/dashboard", { params }).then((res) => res.data),
};

export const ownerReportApi = {
  getMonthlyReport: (params = {}) =>
    api.get("/owner/reports/monthly", { params }).then((res) => res.data),
};
