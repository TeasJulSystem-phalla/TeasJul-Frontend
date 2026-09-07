import { useCallback, useEffect, useMemo } from "react";
import { useNotificationStore } from "../store/notification.store";
import { useMyRoles } from "./useMyRoles";
import { useBasePath } from "./useBasePath";

const ROLE_OWNER = "OWNER";
const ROLE_MANAGER = "MANAGER";
const ROLE_TENANT = "TENANT";

export function useNotifications() {
  const store = useNotificationStore();
  const { codes, loading: rolesLoading } = useMyRoles();
  const basePath = useBasePath();

  useEffect(() => {
    store.ensureRecent();
  }, [store]);

  const isOwner = codes.includes(ROLE_OWNER);
  const isManager = codes.includes(ROLE_MANAGER);
  const isTenant = codes.includes(ROLE_TENANT);
  const hasAdminAccess = isOwner || isManager;

  const notificationsPath = isTenant
    ? "/tenant/notifications"
    : isManager
      ? "/manager/notifications"
      : "/notifications";

  const unreadCount = useMemo(
    () => store.recent.filter((n) => !n.readAt).length,
    [store.recent]
  );

  const isEmpty =
    !rolesLoading &&
    store.recentReady &&
    store.recent.length === 0 &&
    !store.recentLoading &&
    !store.error;

  const getNotificationPath = useCallback(
    (notification) => {
      const entity = notification.data?.entity;
      const id = notification.data?.id;
      if (!entity || id == null) return null;

      if (entity === "invoice") {
        return isTenant ? `/tenant/invoices/${id}` : `${basePath}/invoices/${id}`;
      }
      if (entity === "payment") {
        return isTenant ? "/tenant/payments" : `${basePath}/finance/payments`;
      }
      if (entity === "maintenance") {
        return isTenant ? "/tenant/maintenance" : `${basePath}/maintenance`;
      }
      if (entity === "contract") {
        return isTenant ? "/tenant/dashboard" : `${basePath}/contracts/${id}`;
      }
      return null;
    },
    [isTenant, basePath]
  );

  return {
    notifications: store.recent,
    totalElements: store.totalElements,
    loading: store.recentLoading,
    error: store.error,
    unreadCount,
    isEmpty,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    refresh: store.refresh,
    getNotificationPath,
    notificationsPath,
    hasAdminAccess,
    isTenant,
    pageNotifications: store.notifications,
    page: store.page,
    totalPages: store.totalPages,
    pageLoading: store.pageLoading,
    fetchPage: store.fetchPage,
    changePage: store.changePage,
  };
}