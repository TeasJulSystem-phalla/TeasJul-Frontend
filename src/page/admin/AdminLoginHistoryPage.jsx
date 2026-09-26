import { useCallback, useEffect, useMemo, useState } from "react";
import {
  History,
  Search,
  RefreshCw,
  Shield,
  Monitor,
  CheckCircle2,
  XCircle,
  Globe,
  CalendarDays,
  ChevronDown,
  User,
  X,
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Alert,
  Input,
  EmptyState,
  Pagination,
  Skeleton,
} from "../../components/ui/index.js";
import { adminLoginHistoryApi } from "../../api/adminLoginHistory.api.js";
import { ownerAdminApi } from "../../api/ownerAdmin.api.js";
import { formatDate } from "../../utils/format.js";

// ─── helpers ────────────────────────────────────────────────────────────────
const fullName = (u) =>
  u
    ? [u.firstName, u.lastName].filter(Boolean).join(" ") ||
      u.username ||
      `#${u.id}`
    : "—";

const outcomeLabel = (outcome) =>
  outcome === "SUCCESS"
    ? { label: "ជោគជ័យ", variant: "success" }
    : { label: "បរាជ័យ", variant: "danger" };

const methodLabel = (method) =>
  method === "PASSWORD_2FA" ? "ពាក្យសម្ងាត់ + 2FA" : "ពាក្យសម្ងាត់";

/** Try to extract a readable browser / OS name from a User-Agent string */
const parseUA = (ua) => {
  if (!ua) return "—";
  let browser = "Browser";
  let os = "";

  if (/Chrome\//.test(ua) && !/Chromium|Edg\/|OPR\//.test(ua))
    browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  else if (/OPR\//.test(ua)) browser = "Opera";

  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";

  return os ? `${browser} / ${os}` : browser;
};

const formatDateTime = (val) => {
  if (!val) return "—";
  return new Date(val).toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// ─── User search dropdown ────────────────────────────────────────────────────
function UserSearchDropdown({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const doSearch = useCallback(async (q) => {
    setLoading(true);
    try {
      const data = await ownerAdminApi.listOwners({
        search: q || undefined,
        page: 0,
        size: 20,
      });
      setResults(data.content || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      doSearch(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  return (
    <div className="relative w-full sm:w-80">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="ស្វែងរកអ្នកប្រើ..."
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        {loading && (
          <RefreshCw className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              onMouseDown={() => {
                onSelect(u);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-gray-700"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-gray-700">
                <User className="h-4 w-4 text-slate-500 dark:text-slate-300" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-800 dark:text-white truncate">
                  {fullName(u)}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  @{u.username} · {u.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminLoginHistoryPage() {
  // selected user
  const [selectedUser, setSelectedUser] = useState(null);

  // history data
  const [data, setData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const SIZE = 10;

  // local filters (applied on fetched page data)
  const [outcomeFilter, setOutcomeFilter] = useState(""); // "" | "SUCCESS" | "FAILED"
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── fetch ──
  const fetchHistory = useCallback(async () => {
    if (!selectedUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminLoginHistoryApi.getUserLoginHistory(
        selectedUser.id,
        { page, size: SIZE }
      );
      setData({
        content: res.content || [],
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "មិនអាចទាញប្រវត្តិចូលប្រព័ន្ធបានទេ។"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedUser, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // reset page when user changes
  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setPage(0);
    setOutcomeFilter("");
    setDateFrom("");
    setDateTo("");
    setData({ content: [], totalElements: 0, totalPages: 0 });
    setError(null);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setData({ content: [], totalElements: 0, totalPages: 0 });
    setError(null);
    setPage(0);
  };

  // ── client-side filter ──
  const filtered = useMemo(() => {
    return data.content.filter((row) => {
      if (outcomeFilter && row.outcome !== outcomeFilter) return false;
      if (dateFrom) {
        const rowDate = new Date(row.occurredAt);
        if (rowDate < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const rowDate = new Date(row.occurredAt);
        // include the whole "to" day
        const toEnd = new Date(dateTo);
        toEnd.setDate(toEnd.getDate() + 1);
        if (rowDate >= toEnd) return false;
      }
      return true;
    });
  }, [data.content, outcomeFilter, dateFrom, dateTo]);

  const selectCls =
    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-white";

  const inputDateCls =
    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  // ── skeleton loading ──
  if (loading && !data.content.length) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            ប្រវត្តិការចូលប្រព័ន្ធ (Login History)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ពិនិត្យប្រវត្តិការចូលប្រព័ន្ធរបស់អ្នកប្រើ — SUPER_ADMIN Only
          </p>
        </div>
        {selectedUser && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchHistory}
            disabled={loading}
          >
            ធ្វើឱ្យស្រស់
          </Button>
        )}
      </div>

      {/* ── error ── */}
      {error && (
        <Alert
          variant="danger"
          title="កំហុស"
          description={error}
          dismissible
        />
      )}

      {/* ── user selector + filters bar ── */}
      <Card>
        <div className="flex flex-col gap-4">
          {/* user search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                ជ្រើសរើសអ្នកប្រើ:
              </span>
            </div>
            {selectedUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                  <User className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                    {fullName(selectedUser)}
                  </span>
                  <span className="text-xs text-slate-400">
                    @{selectedUser.username}
                  </span>
                </div>
                <button
                  onClick={handleClearUser}
                  className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-700 dark:hover:text-white"
                  aria-label="ជ្រើសអ្នកប្រើផ្សេង"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <UserSearchDropdown onSelect={handleSelectUser} />
            )}
          </div>

          {/* filters — only shown when a user is selected */}
          {selectedUser && (
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 dark:border-gray-700">
              {/* outcome filter */}
              <div className="flex items-center gap-2">
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={outcomeFilter}
                  onChange={(e) => setOutcomeFilter(e.target.value)}
                  className={selectCls}
                  style={{ minWidth: "150px" }}
                >
                  <option value="">លទ្ធផលទាំងអស់</option>
                  <option value="SUCCESS">ជោគជ័យ</option>
                  <option value="FAILED">បរាជ័យ</option>
                </select>
              </div>

              {/* date from */}
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={inputDateCls}
                  style={{ minWidth: "140px" }}
                  title="ចាប់ពី"
                />
              </div>

              {/* date to */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">ដល់</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={inputDateCls}
                  style={{ minWidth: "140px" }}
                  title="ដល់"
                />
              </div>

              {/* clear filters */}
              {(outcomeFilter || dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setOutcomeFilter("");
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700"
                >
                  <X className="h-3.5 w-3.5" />
                  លុបតម្រង
                </button>
              )}

              <span className="ml-auto text-xs text-slate-400">
                {filtered.length} / {data.totalElements} កំណត់ត្រា
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* ── content ── */}
      {!selectedUser ? (
        <EmptyState
          icon={History}
          title="ជ្រើសរើសអ្នកប្រើ"
          description="ស្វែងរក និងជ្រើសរើសអ្នកប្រើម្នាក់ដើម្បីមើលប្រវត្តិការចូលប្រព័ន្ធ។"
        />
      ) : loading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="គ្មានប្រវត្តិចូលប្រព័ន្ធ"
          description={
            outcomeFilter || dateFrom || dateTo
              ? "មិនមានកំណត់ត្រាត្រូវនឹងតម្រងដែលបានជ្រើសរើសទេ។"
              : "គ្មានប្រវត្តិការចូលប្រព័ន្ធសម្រាប់អ្នកប្រើនេះទេ។"
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden rounded-xl border-slate-200/80 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 dark:border-gray-800 dark:bg-gray-900/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      ពេលវេលា
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      លទ្ធផល
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      វិធីសាស្ត្រ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        IP
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5" />
                        ឧបករណ៍ / Browser
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                  {filtered.map((row) => {
                    const { label, variant } = outcomeLabel(row.outcome);
                    return (
                      <tr
                        key={row.id}
                        className="group transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800/40"
                      >
                        {/* date/time */}
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          <p className="font-medium">
                            {formatDateTime(row.occurredAt)}
                          </p>
                        </td>

                        {/* outcome */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            {row.outcome === "SUCCESS" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Badge variant={variant}>{label}</Badge>
                          </span>
                        </td>

                        {/* method */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Shield className="h-3.5 w-3.5 text-slate-400" />
                            {methodLabel(row.method)}
                          </span>
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {row.ip || "—"}
                        </td>

                        {/* device/browser */}
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          <p className="max-w-xs truncate" title={row.userAgent || ""}>
                            {parseUA(row.userAgent)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── pagination ── */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                ទំព័រ {page + 1} / {data.totalPages} ·{" "}
                {data.totalElements} កំណត់ត្រាសរុប
              </span>
              <Pagination
                currentPage={page + 1}
                totalPages={data.totalPages}
                onPageChange={(p) => setPage(p - 1)}
                disabled={loading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
