import api from "./axios";

// SUPER_ADMIN room provisioning (`/admin/owners/{ownerId}/...`). The backend
// verifies that the owner (and their houses/room-types) exist, so the admin
// can post rooms into an owner's property directly.
export const adminRoomsApi = {
  getOwnerHouses: (ownerId) =>
    api.get(`/admin/owners/${ownerId}/houses`).then((res) => res.data),

  getOwnerRoomTypes: (ownerId) =>
    api.get(`/admin/owners/${ownerId}/room-types`).then((res) => res.data),

  createRoomForOwner: (ownerId, data) =>
    api
      .post(`/admin/owners/${ownerId}/rooms`, data)
      .then((res) => res.data),

  createRoomsForOwner: (ownerId, data) =>
    api
      .post(`/admin/owners/${ownerId}/rooms/bulk`, data)
      .then((res) => res.data),

  createHouseForOwner: (ownerId, data) =>
    api
      .post(`/admin/owners/${ownerId}/houses`, data)
      .then((res) => res.data),

  createRoomTypeForOwner: (ownerId, data) =>
    api
      .post(`/admin/owners/${ownerId}/room-types`, data)
      .then((res) => res.data),
};