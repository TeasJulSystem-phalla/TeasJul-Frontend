import api from "./axios";

// SUPER_ADMIN review endpoints for the room-list publication workflow.
// All authorization is enforced server-side (RoomPublicationService).
export const roomPublicationApi = {
  // Paginated listing for the admin review queue. status is optional: when
  // omitted every room is returned regardless of publication status.
  getAdminRoomsByPublication: ({ status, page = 0, size = 10 } = {}) =>
    api
      .get("/admin/rooms/publication", {
        params: {
          ...(status ? { status } : {}),
          page,
          size,
        },
      })
      .then((res) => res.data),

  approveRoom: (roomId) =>
    api.post(`/admin/rooms/${roomId}/approve`).then((res) => res.data),

  rejectRoom: (roomId, reason) =>
    api.post(`/admin/rooms/${roomId}/reject`, { reason }).then((res) => res.data),

  unpublishRoom: (roomId) =>
    api.post(`/admin/rooms/${roomId}/unpublish`).then((res) => res.data),
};