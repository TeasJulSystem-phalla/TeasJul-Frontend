import { useCallback, useEffect, useState } from "react";
import {
  MessageSquareQuote,
  RefreshCw,
  Globe,
  EyeOff,
} from "lucide-react";
import {
  Card,
  Button,
  Table,
  Alert,
  EmptyState,
  Pagination,
  Skeleton,
} from "../../components/ui/index.js";
import { feedbackAdminApi } from "../../api/feedback.api.js";
import { formatDate } from "../../utils/format.js";
import StarRating from "../../components/feedback/StarRating.jsx";
import FeedbackStatusBadge from "../../components/feedback/FeedbackStatusBadge.jsx";

const STATUS_OPTIONS = [
  { value: "", label: "ស្ថានភាពទាំងអស់" },
  { value: "PENDING", label: "រង់ចាំយល់ព្រម (Pending)" },
  { value: "PUBLISHED", label: "បានផ្សាយ (Published)" },
  { value: "UNPUBLISHED", label: "បានដកផ្សាយ (Unpublished)" },
];

export default function AdminFeedbackPage() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [actingId, setActingId] = useState(null);
  const size = 10;

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pageData = await feedbackAdminApi.listFeedback({
        status: statusFilter || undefined,
        page,
        size,
      });
      setData({
        content: (pageData.content || []).filter(Boolean),
        totalElements: pageData.totalElements || 0,
        totalPages: pageData.totalPages || 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "មិនអាចផ្ទុកបញ្ជីមតិបានទេ។"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const runAction = async (id, action) => {
    setActingId(id);
    try {
      if (action === "PUBLISH") {
        await feedbackAdminApi.publishFeedback(id);
      } else {
        await feedbackAdminApi.unpublishFeedback(id);
      }
      await fetchFeedback();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការកែប្រែស្ថានភាពបរាជ័យ។";
      setError(message);
    } finally {
      setActingId(null);
    }
  };

  const columns = [
    {
      header: "ម្ចាស់",
      render: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 dark:text-white">
            {row.ownerName || `#${row.ownerId}`}
          </p>
          {row.ownerName && (
            <p className="text-xs text-slate-400">ID: #{row.ownerId}</p>
          )}
        </div>
      ),
    },
    {
      header: "ចំណាត់ថ្នាក់",
      render: (row) => (
        <div className="flex items-center gap-2">
          <StarRating value={row.rating} readOnly size="h-4 w-4" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {row.rating}/5
          </span>
        </div>
      ),
    },
    {
      header: "មតិយោបល់",
      render: (row) => (
        <p
          className="max-w-[360px] text-[13px] leading-snug text-slate-600 line-clamp-2 dark:text-slate-300"
          title={row.comment}
        >
          {row.comment}
        </p>
      ),
    },
    {
      header: "ស្ថានភាព",
      render: (row) => <FeedbackStatusBadge status={row.status} />,
    },
    {
      header: "កាលបរិច្ឆេទ",
      render: (row) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "សកម្មភាព",
      render: (row) => {
        const isPublished = row.status === "PUBLISHED";
        return (
          <div className="flex items-center gap-1">
            {isPublished ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<EyeOff className="h-4 w-4 text-amber-600" />}
                onClick={() => runAction(row.id, "UNPUBLISH")}
                loading={actingId === row.id}
              >
                ដកផ្សាយ
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Globe className="h-4 w-4 text-emerald-600" />}
                onClick={() => runAction(row.id, "PUBLISH")}
                loading={actingId === row.id}
              >
                ផ្សាយ
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading && !data.content.length) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            គ្រប់គ្រងមតិម្ចាស់ (Feedback)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            វាយតម្លៃ ផ្សាយ ឬដកផ្សាយមតិរបស់ម្ចាស់អចលនទ្រព្យអំពីប្រព័ន្ធ TeasJul។
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={fetchFeedback}
          disabled={loading}
        >
          ធ្វើឱ្យស្រស់
        </Button>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុស" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={fetchFeedback}>
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              aria-label="តម្រងស្ថានភាពមតិ"
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-400">{data.totalElements} មតិ</span>
        </div>
      </Card>

      {loading && data.content.length ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : data.content.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="រកមិនឃើញមតិ"
          description={
            statusFilter
              ? "មិនមានមតិត្រូវនឹងស្ថានភាពដែលបានជ្រើសរើសទេ។"
              : "មិនទាន់មានមតិពីម្ចាស់អចលនទ្រព្យទេ។"
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden rounded-xl border-slate-200/80 dark:border-gray-800">
            <Table columns={columns} data={data.content} />
          </Card>
          {data.totalPages > 1 && (
            <div className="flex justify-end pt-2">
              <Pagination
                currentPage={page + 1}
                totalPages={data.totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}