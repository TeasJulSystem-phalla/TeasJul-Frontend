import api from "./axios";

export const houseApi = {
  getMyHouses: () =>
    api.get("/houses").then((res) => res.data),

  getHouseById: (id) =>
    api.get(`/houses/${id}`).then((res) => res.data),

  createHouse: (data) =>
    api.post("/houses", data).then((res) => res.data),

  updateHouse: (id, data) =>
    api.put(`/houses/${id}`, data).then((res) => res.data),

  deleteHouse: (id) =>
    api.delete(`/houses/${id}`).then((res) => res.data),

  getHouseUsers: (houseId) =>
    api.get(`/houses/${houseId}/access`).then((res) => res.data),

  grantAccess: (houseId, userId) =>
    api.post(`/houses/${houseId}/access`, { userId }).then((res) => res.data),

  revokeAccess: (houseId, userId) =>
    api.delete(`/houses/${houseId}/access/${userId}`).then((res) => res.data),
};
