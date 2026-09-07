import { create } from "zustand";
import { notificationApi } from "../api/notification.api";

const RECENT_SIZE = 20;
const PAGE_SIZE = 20;

const toMessage = (err) =>
  err.response?.data?.message ||
  err.response?.data?.error ||
  "Failed to load notifications.";

export const useNotificationStore = create((set, get) => ({
  recent: [],
  recentLoading: false,
  recentReady: false,

  notifications: [],
  page: 0,
  size: PAGE_SIZE,
  totalPages: 0,
  totalElements: 0,
  pageLoading: false,
  error: null,

  ensureRecent: async () => {
    if (get().recentReady || get().recentLoading) return;
    set({ recentLoading: true, error: null });
    try {
      const data = await notificationApi.getNotifications({ page: 0, size: RECENT_SIZE });
      set({
        recent: data.content || [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        recentReady: true,
      });
    } catch (err) {
      set({ error: toMessage(err), recentReady: true });
    } finally {
      set({ recentLoading: false });
    }
  },

  fetchPage: async (page) => {
    const target = page ?? get().page;
    set({ pageLoading: true, error: null });
    try {
      const data = await notificationApi.getNotifications({ page: target, size: get().size });
      set({
        notifications: data.content || [],
        page: target,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      });
    } catch (err) {
      set({ error: toMessage(err) });
    } finally {
      set({ pageLoading: false });
    }
  },

  changePage: async (page) => {
    const current = get().page;
    if (page === current) return;
    set({ page });
    await get().fetchPage(page);
  },

  markAsRead: async (id) => {
    const updated = await notificationApi.markRead(id);
    set((s) => ({
      recent: s.recent.map((n) => (n.id === id ? updated : n)),
      notifications: s.notifications.map((n) => (n.id === id ? updated : n)),
    }));
    return updated;
  },

  markAllAsRead: async () => {
    await notificationApi.markReadAll();
    const now = new Date().toISOString();
    set((s) => ({
      recent: s.recent.map((n) => (n.readAt ? n : { ...n, readAt: now })),
      notifications: s.notifications.map((n) => (n.readAt ? n : { ...n, readAt: now })),
    }));
  },

  refresh: async () => {
    set({ recentReady: false, error: null });
    await get().ensureRecent();
    await get().fetchPage(get().page);
  },
}));