import api from "./axios";

export const roomBookingApi = {
  createBooking: (data) => api.post("/v1/room-bookings", data).then((res) => res.data),
  getBookings: (roomId) => api.get("/v1/room-bookings", { params: roomId ? { roomId } : {} }).then((res) => res.data),
  cancelBooking: (id) => api.patch(`/v1/room-bookings/${id}/cancel`).then((res) => res.data),
};
