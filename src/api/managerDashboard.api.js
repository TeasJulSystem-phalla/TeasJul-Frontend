import api from "./axios";

export const managerDashboardApi = {
  getDashboard: (params = {}) =>
    api.get("/dashboard", { params }).then((res) => res.data),
};