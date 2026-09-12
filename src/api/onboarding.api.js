import api from "./axios";

export const onboardingApi = {
  previewImport: (houseId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post(`/houses/${houseId}/onboarding/preview`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  importExisting: (houseId, rows) =>
    api
      .post(`/houses/${houseId}/onboarding/import`, { rows })
      .then((res) => res.data),

  getHouseOwnerTenants: (houseId) =>
    api
      .get(`/houses/${houseId}/onboarding/tenants`)
      .then((res) => res.data),

  previewManualSetup: (houseId, rows) =>
    api
      .post(`/houses/${houseId}/onboarding/manual/preview`, { rows })
      .then((res) => res.data),

  manualSetup: (houseId, rows) =>
    api
      .post(`/houses/${houseId}/onboarding/manual`, { rows })
      .then((res) => res.data),
};
