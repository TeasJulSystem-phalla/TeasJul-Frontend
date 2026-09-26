import api from "./axios";

export const ROOM_STATUS_VALUES = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"];

// SUPER_ADMIN review endpoints for the room-list publication workflow.
// All authorization is enforced server-side (RoomPublicationService).
export const roomPublicationApi = {
  // Paginated listing for the admin review queue. status and roomStatus are
  // optional and independent: when omitted, every room is returned regardless
  // of that status.
  getAdminRoomsByPublication: ({ status, roomStatus, page = 0, size = 10 } = {}) =>
    api
      .get("/admin/rooms/publication", {
        params: {
          ...(status ? { status } : {}),
          ...(roomStatus ? { roomStatus } : {}),
          page,
          size,
        },
      })
      .then((res) => res.data),

  // Per-room-status counts for a review tab (e.g. PUBLISHED), computed from
  // real data by reusing the same review endpoint and reading totalElements.
  getRoomStatusSummary: async ({ status } = {}) => {
    const totalResponse = await api
      .get("/admin/rooms/publication", {
        params: { ...(status ? { status } : {}), page: 0, size: 1 },
      })
      .then((res) => res.data);
    const counts = {};
    for (const roomStatus of ROOM_STATUS_VALUES) {
      const res = await api
        .get("/admin/rooms/publication", {
          params: { ...(status ? { status } : {}), roomStatus, page: 0, size: 1 },
        })
        .then((res) => res.data);
      counts[roomStatus] = res.totalElements || 0;
    }
    return { total: totalResponse.totalElements || 0, counts };
  },

  approveRoom: (roomId) =>
    api.post(`/admin/rooms/${roomId}/approve`).then((res) => res.data),

  rejectRoom: (roomId, reason) =>
    api.post(`/admin/rooms/${roomId}/reject`, { reason }).then((res) => res.data),

  unpublishRoom: (roomId) =>
    api.post(`/admin/rooms/${roomId}/unpublish`).then((res) => res.data),
};