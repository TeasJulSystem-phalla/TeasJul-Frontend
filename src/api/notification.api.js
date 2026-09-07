import api from "./axios";

export const notificationApi = {
  getNotifications: (params) =>
    api.get("/notifications", { params }).then((res) => res.data),

  getUnreadCount: () =>
    api.get("/notifications/unread-count").then((res) => res.data),

  markRead: (id) =>
    api.patch(`/notifications/${id}/read`).then((res) => res.data),
  markReadAll: () => api.patch("/notifications/read-all"),
};