import api from "./axios";

export const adminLoginRateLimitSettingsApi = {
  getLoginRateLimitSettings: async () => {
    const res = await api.get("/admin/settings/security/login-rate-limit");
    return res.data;
  },

  updateLoginRateLimitSettings: async (data) => {
    const res = await api.put("/admin/settings/security/login-rate-limit", data);
    return res.data;
  },
};

export default adminLoginRateLimitSettingsApi;
