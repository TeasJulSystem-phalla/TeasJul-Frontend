import api from "./axios";

export const roomApi = {
  // ---- Room CRUD ----
  createRoom: (data) =>
    api.post("/rooms", data).then((res) => res.data),

  getAllRooms: () =>
    api.get("/rooms").then((res) => res.data),

  getRoomById: (id) =>
    api.get(`/rooms/${id}`).then((res) => res.data),

  getRoomsByHouse: (houseId) =>
    api.get(`/rooms/house/${houseId}`).then((res) => res.data),

  updateRoom: (id, data) =>
    api.put(`/rooms/${id}`, data).then((res) => res.data),

  deleteRoom: (id) =>
    api.delete(`/rooms/${id}`).then((res) => res.data),

  // ---- Room Publication (submit for public review) ----
  submitRoomForApproval: (roomId) =>
    api.post(`/rooms/${roomId}/submit`).then((res) => res.data),

  getRoomsByPublication: ({ status, page = 0, size = 10 } = {}) =>
    api
      .get("/rooms/publication", {
        params: {
          status,
          page,
          size,
        },
      })
      .then((res) => res.data),

  // ---- Room CSV/Excel Import ----
  previewRoomImport: (file, houseId) => {
    const formData = new FormData();
    formData.append("file", file);
    if (houseId) {
      formData.append("houseId", houseId);
    }
    return api
      .post("/rooms/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  confirmRoomImport: (rows, houseId) =>
    api.post("/rooms/import", { houseId, rows }).then((res) => res.data),

  // ---- Room Amenities (`/rooms/{roomId}/amenities`) ----
  getRoomAmenities: (roomId) =>
    api.get(`/rooms/${roomId}/amenities`).then((res) => res.data),

  assignAmenity: (roomId, amenityId) =>
    api.post(`/rooms/${roomId}/amenities/${amenityId}`).then((res) => res.data),

  removeAmenity: (roomId, amenityId) =>
    api.delete(`/rooms/${roomId}/amenities/${amenityId}`).then((res) => res.data),

  // ---- Amenity CRUD (`/amenities`) ----
  getMyAmenities: (status) =>
    api.get("/amenities", { params: status ? { status } : {} }).then((res) => res.data),

  getAllAmenities: (status) =>
    api.get("/amenities", { params: status ? { status } : {} }).then((res) => res.data),

  getAmenityById: (id) =>
    api.get(`/amenities/${id}`).then((res) => res.data),

  createAmenity: (data) =>
    api.post("/amenities", data).then((res) => res.data),

  updateAmenity: (id, data) =>
    api.put(`/amenities/${id}`, data).then((res) => res.data),

  deleteAmenity: (id) =>
    api.delete(`/amenities/${id}`).then((res) => res.data),
};
