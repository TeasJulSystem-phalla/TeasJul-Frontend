import api from "./axios";

const settingsApi = {
  getSettings: async () => {
    const res = await api.get("/v1/settings");
    return res.data;
  },

  updateSettings: async (data) => {
    const res = await api.put("/v1/settings", data);
    return res.data;
  },
};

export default settingsApi;
