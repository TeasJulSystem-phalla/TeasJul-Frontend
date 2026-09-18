import api from "./axios";
export const roomTypeApi = {
  // Create a new room type
  createRoomType: (data) =>
    api.post("/room-types", data).then((res) => res.data),

  // Get all room types
  getAllRoomTypes: () =>
    api.get("/room-types").then((res) => res.data),

  // Get room type by ID
  getRoomTypeById: (id) =>
    api.get(`/room-types/${id}`).then((res) => res.data),

  // Get room types by owner
  getRoomTypesByOwner: (ownerId) =>
    api.get(`/room-types/owner/${ownerId}`).then((res) => res.data),

  // Update room type
  updateRoomType: (id, data) =>
    api.put(`/room-types/${id}`, data).then((res) => res.data),

  // Delete room type
  deleteRoomType: (id) =>
    api.delete(`/room-types/${id}`).then((res) => res.data),

  // Get room type images
  getRoomTypeImages: (roomTypeId) =>
    api.get(`/room-types/${roomTypeId}/images`).then((res) => res.data),

  uploadRoomTypeImages: (roomTypeId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api
      .post(`/room-types/${roomTypeId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  deleteRoomTypeImage: (roomTypeId, imageId) =>
    api.delete(`/room-types/${roomTypeId}/images/${imageId}`).then((res) => res.data),

  setRoomTypeImagePrimary: (roomTypeId, imageId) =>
    api.patch(`/room-types/${roomTypeId}/images/${imageId}/primary`).then((res) => res.data),

  updateRoomTypeImageOrder: (roomTypeId, imageId, sortOrder) =>
    api.patch(`/room-types/${roomTypeId}/images/${imageId}/order`, { sortOrder }).then((res) => res.data),
};