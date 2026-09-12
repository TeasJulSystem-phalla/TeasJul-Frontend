import api from "./axios";

const themeApi = {
  getTheme: async () => {
    const res = await api.get("/v1/settings/theme");
    return res.data;
  },

  updateTheme: async (data) => {
    const res = await api.put("/v1/settings/theme", data);
    return res.data;
  },

  resetTheme: async () => {
    const res = await api.post("/v1/settings/theme/reset");
    return res.data;
  },
};

export default themeApi;