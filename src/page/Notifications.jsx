import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { timeAgo, formatDateTime } from "../utils/timeAgo";
import {
  Button,
  Badge,
  Card,
  Alert,
  EmptyState,
  Pagination,
  Skeleton,
} from "../components/ui/index.js";

const TYPE_META = {
  INVOICE_CREATED: { label: "វិក្កយបត្របានបង្កើត", variant: "info" },
  PAYMENT_CREATED: { label: "ការទូទាត់បានបង្កើត", variant: "warning" },
  PAYMENT_SUCCESS: { label: "ការទូទាត់ជោគជ័យ", variant: "success" },
  PAYMENT_FAILED: { label: "ការទូទាត់បរាជ័យ", variant: "danger" },
  MAINTENANCE_REQUEST: { label: "សំណើជួសជុល", variant: "warning" },
  MAINTENANCE_STATUS: { label: "ស្ថានភាពជួសជុល", variant: "info" },
  CONTRACT_EXPIRING: { label: "កិច្ចសន្យាផុតកំណត់", variant: "danger" },
  ROOM_ASSIGNED: { label: "ការចាត់តាំងបន្ទប់", variant: "neutral" },
  PROPERTY_SUBMITTED: { label: "ការដាក់ស្នើអចលនទ្រព្យ", variant: "warning" },
};

const typeMeta = (type) => TYPE_META[type] || { label: type || "—", variant: "default" };

export default function Notifications() {
  const navigate = useNavigate();
  const {
    pageNotifications,
    totalElements,
    totalPages,
    page,
    pageLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh,
    fetchPage,
    changePage,
    getNotificationPath,
  } = useNotifications();

  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]);

  const visible = useMemo(
    () => (unreadOnly ? pageNotifications.filter((n) => !n.readAt) : pageNotifications),
    [unreadOnly, pageNotifications]
  );

  const handleOpen = async (n) => {
    if (!n.readAt) {
      try {
        await markAsRead(n.id);
      } catch {
        // Best-effort mark-as-read; navigation still proceeds.
      }
    }
    const path = getNotificationPath(n);
    if (path) navigate(path);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            ការជូនដំណឹងទាំងអស់
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            បញ្ជីការជូនដំណឹង{" "}
            {totalElements != null && <span className="font-medium">({totalElements})</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="h-4 w-4" />}
              onClick={markAllAsRead}
            >
              អានទាំងអស់
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              refresh();
            }}
          >
            ធ្វើឱ្យស្រស់
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="កំហុសក្នុងការផ្ទុកការជូនដំណឹង"
          description={error}
        />
      )}

      <div className="flex items-center justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-gray-800 accent-gray-800"
          />
          បង្ហាញតែមិនទាន់អាន ({unreadCount})
        </label>
      </div>

      {pageLoading && visible.length === 0 ? (
        <Card>
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-2 w-2 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title={unreadOnly ? "មិនមានការជូនដំណឹងដែលមិនទាន់អានទេ" : "មិនមានការជូនដំណឹងទេ"}
            description={
              unreadOnly
                ? "ការជូនដំណឹងថ្មីៗនឹងបង្ហាញនៅទីនេះ។"
                : "ការជូនដំណឹងថ្មីៗនឹងបង្ហាញនៅទីនេះ។"
            }
          />
        </Card>
      ) : (
        <>
          <Card className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-gray-800">
              {visible.map((n) => {
                const meta = typeMeta(n.type);
                const path = getNotificationPath(n);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => handleOpen(n)}
                      className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-gray-800"
                    >
                      <span
                        className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                          !n.readAt ? "bg-gray-600 dark:bg-gray-400" : "bg-slate-300 dark:bg-gray-600"
                        }`}
                        aria-label={n.readAt ? "បានអាន" : "មិនទាន់អាន"}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="text-[14px] font-semibold text-slate-800 dark:text-white">
                              {n.title}
                            </span>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </span>
                          <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
                            {timeAgo(n.createdAt)}
                          </span>
                        </span>
                        <span className="mt-1 block text-[13px] text-slate-500 dark:text-slate-400">
                          {n.message}
                        </span>
                        <span className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                          <span>{formatDateTime(n.createdAt)}</span>
                          {path && (
                            <span className="font-medium text-slate-500 underline-offset-2 group-hover:underline dark:text-slate-400">
                              មើលព័ត៌មានលម្អិត →
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-end">
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => changePage(p - 1)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}