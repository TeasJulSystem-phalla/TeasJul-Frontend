import api from "./axios";

export const adminNotificationSettingsApi = {
  getNotificationSettings: async () => {
    const res = await api.get("/admin/settings/notifications");
    return res.data;
  },

  updateNotificationSettings: async (data) => {
    const res = await api.put("/admin/settings/notifications", data);
    return res.data;
  },
};

export default adminNotificationSettingsApi;
