import api from "./axios";

export const utilityMeterApi = {
  createMeter: (data) =>
    api.post("/utility-meters", data).then((res) => res.data),

  getMeters: (params) =>
    api.get("/utility-meters", { params }).then((res) => res.data),

  getMeterById: (id) =>
    api.get(`/utility-meters/${id}`).then((res) => res.data),

  updateMeter: (id, data) =>
    api.put(`/utility-meters/${id}`, data).then((res) => res.data),

  deactivateMeter: (id) =>
    api.patch(`/utility-meters/${id}/deactivate`).then((res) => res.data),

  // ---- Utility Meter CSV/Excel Import ----
  previewMeterImport: (file, houseId) => {
    const formData = new FormData();
    formData.append("file", file);
    if (houseId) {
      formData.append("houseId", houseId);
    }
    return api
      .post("/utility-meters/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  confirmMeterImport: (rows, houseId) =>
    api.post("/utility-meters/import", { houseId, rows }).then((res) => res.data),
};
