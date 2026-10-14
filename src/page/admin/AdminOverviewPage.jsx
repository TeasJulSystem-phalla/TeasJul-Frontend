import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Send,
  Globe,
  XCircle,
  RefreshCw,
  DoorOpen,
  ArrowRight,
  Plus,
  Shield,
  UserCircle,
  MessageSquareQuote,
} from "lucide-react";
import {
  Card,
  Button,
  Alert,
  Skeleton,
  EmptyState,
} from "../../components/ui/index.js";
import PublicationStatusBadge from "../../components/room/PublicationStatusBadge.jsx";
import {
  ownerAdminApi,
} from "../../api/ownerAdmin.api.js";
import {
  roomPublicationApi,
} from "../../api/roomPublication.api.js";
import { formatDate } from "../../utils/format.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value) || 0
  );

const StatCard = ({ label, value, icon: Icon, tone = "slate", onClick }) => {
  const tones = {
    slate: "text-slate-600 dark:text-slate-300",
    emerald: "text-emerald-600 dark:text-emerald-400",
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
    sky: "text-sky-600 dark:text-sky-400",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200/80 bg-white p-5 text-left transition-all hover:border-slate-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
    >
      <div className="flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800 ${tones[tone] || "text-slate-500"}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">{value}</p>
      <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{label}</p>
    </button>
  );
};

const ActionTile = ({ label, description, icon: Icon, to, tone = "slate" }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="group flex flex-col items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800 ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-slate-800 dark:text-white">{label}</span>
        <span className="block text-[11.5px] text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:text-gray-600" />
    </button>
  );
};

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ownersPage, activePage, inactivePage, pendingPage, publishedPage, rejectedPage, recentPage] =
        await Promise.all([
          ownerAdminApi.listOwners({ page: 0, size: 5 }),
          ownerAdminApi.listOwners({ page: 0, size: 1, status: "ACTIVE" }),
          ownerAdminApi.listOwners({ page: 0, size: 1, status: "INACTIVE" }),
          roomPublicationApi.getAdminRoomsByPublication({ status: "PENDING_APPROVAL", page: 0, size: 1 }),
          roomPublicationApi.getAdminRoomsByPublication({ status: "PUBLISHED", page: 0, size: 1 }),
          roomPublicationApi.getAdminRoomsByPublication({ status: "REJECTED", page: 0, size: 1 }),
          roomPublicationApi.getAdminRoomsByPublication({ page: 0, size: 5 }),
        ]);
      setData({
        totalOwners: ownersPage.totalElements || ownersPage.content?.length || 0,
        activeOwners: activePage.totalElements || 0,
        inactiveOwners: inactivePage.totalElements || 0,
        pendingSubmissions: pendingPage.totalElements || 0,
        publishedRooms: publishedPage.totalElements || 0,
        rejectedSubmissions: rejectedPage.totalElements || 0,
        recentOwners: ownersPage.content || [],
        recentSubmissions: recentPage.content || [],
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "មិនអាចផ្ទុកទិដ្ឋភាពទូទៅរបស់អ្នកគ្រប់គ្រងបានទេ។"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const hasAnyRoomData = data && (data.pendingSubmissions + data.publishedRooms + data.rejectedSubmissions) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            អ្នកបង្កើតប្រព័ន្ធ (System Builder)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងម្ចាស់អចលនទ្រព្យ ដាក់បន្ទប់ថ្មី ពិនិត្យការផ្សាយ តួនាទី/សិទ្ធិ និងអ្នកប្រើប្រាស់។
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate("/admin/properties/new")}
          >
            ផ្សាយអចលនទ្រព្យថ្មី
          </Button>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchOverview} disabled={loading}>
          ធ្វើឱ្យស្រស់
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុស" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={fetchOverview}>
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : !data ? null : (
        <>
          {/* Owner KPIs */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="ម្ចាស់សរុប (Total Owners)"
              value={data.totalOwners}
              icon={Users}
              onClick={() => navigate("/admin/owners")}
            />
            <StatCard
              label="សកម្ម (Active)"
              value={data.activeOwners}
              icon={UserCheck}
              tone="emerald"
              onClick={() => navigate("/admin/owners")}
            />
            <StatCard
              label="អសកម្ម (Inactive)"
              value={data.inactiveOwners}
              icon={UserX}
              tone="red"
              onClick={() => navigate("/admin/owners")}
            />
            <StatCard
              label="រង់ចាំយល់ព្រម (Pending)"
              value={data.pendingSubmissions}
              icon={Send}
              tone="amber"
              onClick={() => navigate("/admin/submissions")}
            />
            <StatCard
              label="បានផ្សាយ (Published)"
              value={data.publishedRooms}
              icon={Globe}
              tone="sky"
              onClick={() => navigate("/admin/submissions")}
            />
            <StatCard
              label="បានបដិសេធ (Rejected)"
              value={data.rejectedSubmissions}
              icon={XCircle}
              tone="red"
              onClick={() => navigate("/admin/submissions")}
            />
          </div>

          {/* Quick actions (System Builder) */}
          <div>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              សកម្មភាពរហ័ស (Quick Actions)
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <ActionTile
                to="/admin/owners"
                icon={Users}
                label="បង្កើតម្ចាស់ថ្មី"
                description="គណនីម្ចាស់អចលនទ្រព្យ"
                tone="text-emerald-600 dark:text-emerald-400"
              />
              <ActionTile
                to="/admin/properties/new"
                icon={Plus}
                label="ផ្សាយអចលនទ្រព្យថ្មី"
                description="ផ្សាយជំនួសម្ចាស់ + រក្សាទុកព្រាង"
                tone="text-sky-600 dark:text-sky-400"
              />
              <ActionTile
                to="/admin/submissions"
                icon={Send}
                label="ពិនិត្យការផ្សាយ"
                description="អនុម័ត ឬបដិសេធ"
                tone="text-amber-600 dark:text-amber-400"
              />
              <ActionTile
                to="/admin/feedback"
                icon={MessageSquareQuote}
                label="គ្រប់គ្រងមតិ"
                description="ផ្សាយ ឬដកផ្សាយមតិ"
                tone="text-rose-600 dark:text-rose-400"
              />
              <ActionTile
                to="/roles"
                icon={Shield}
                label="តួនាទី & សិទ្ធិ"
                description="កែតម្រូវសិទ្ធិប្រព័ន្ធ"
                tone="text-violet-600 dark:text-violet-400"
              />
              <ActionTile
                to="/users"
                icon={UserCircle}
                label="អ្នកប្រើប្រាស់"
                description="គ្រប់គ្រងគណនីប្រើប្រាស់"
                tone="text-slate-600 dark:text-slate-300"
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Recent submissions */}
            <Card
              title="ការដាក់ស្នើថ្មីៗ (Recent Submissions)"
              description="បន្ទប់ដែលបានដាក់ស្នើថ្មីៗ"
              footer={
                <Link
                  to="/admin/submissions"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  ចូលមើលទាំងអស់ <ArrowRight className="h-4 w-4" />
                </Link>
              }
            >
              {!hasAnyRoomData ? (
                <EmptyState
                  icon={DoorOpen}
                  title="មិនទាន់មានការដាក់ស្នើទេ"
                  description="មិនទាន់មានបន្ទប់ណាត្រូវបានដាក់ស្នើសម្រាប់ការពិនិត្យទេ។"
                />
              ) : (
                <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 dark:border-gray-800 dark:text-slate-500">
                        <th className="px-2 py-2 font-semibold">បន្ទប់</th>
                        <th className="px-2 py-2 font-semibold text-right">ថ្លៃជួល</th>
                        <th className="px-2 py-2 font-semibold">ដាក់ស្នើ</th>
                        <th className="px-2 py-2 font-semibold">ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                      {data.recentSubmissions.map((room) => (
                        <tr key={room.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800/60">
                          <td className="px-2 py-3 text-[13px] font-medium text-slate-800 dark:text-slate-100">
                            {room.name || `បន្ទប់ ${room.roomNumber}`}
                            <span className="block text-xs font-normal text-slate-400">#{room.roomNumber}</span>
                          </td>
                          <td className="px-2 py-3 text-right text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(room.monthlyRent)}
                          </td>
                          <td className="px-2 py-3 text-[13px] text-slate-500 dark:text-slate-400">
                            {formatDate(room.submittedAt)}
                          </td>
                          <td className="px-2 py-3">
                            <PublicationStatusBadge status={room.publicationStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2.5 md:hidden">
                  {data.recentSubmissions.map((room) => (
                    <div key={room.id} className="rounded-lg border border-slate-100 p-3 dark:border-gray-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">
                            {room.name || `បន្ទប់ ${room.roomNumber}`}
                          </p>
                          <p className="text-xs text-slate-400">#{room.roomNumber} · {formatDate(room.submittedAt)}</p>
                        </div>
                        <PublicationStatusBadge status={room.publicationStatus} />
                      </div>
                      <p className="mt-1.5 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                        {formatCurrency(room.monthlyRent)}
                      </p>
                    </div>
                  ))}
                </div>
                </>
              )}
            </Card>

            {/* Recent owners */}
            <Card
              title="ម្ចាស់ថ្មីៗ (Recent Owners)"
              description="គណនីម្ចាស់អចលនទ្រព្យថ្មីៗ"
              footer={
                <Link
                  to="/admin/owners"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  ចូលមើលទាំងអស់ <ArrowRight className="h-4 w-4" />
                </Link>
              }
            >
              {data.recentOwners.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="មិនទាន់មានម្ចាស់ទេ"
                  description="មិនទាន់មានគណនីម្ចាស់អចលនទ្រព្យទេ។"
                />
              ) : (
                <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 dark:border-gray-800 dark:text-slate-500">
                        <th className="px-2 py-2 font-semibold">ឈ្មោះ</th>
                        <th className="px-2 py-2 font-semibold">អ៊ីមែល</th>
                        <th className="px-2 py-2 font-semibold">ស្ថានភាព</th>
                        <th className="px-2 py-2 font-semibold">ចូលចុងក្រោយ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                      {data.recentOwners.map((owner) => (
                        <tr key={owner.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800/60">
                          <td className="px-2 py-3 text-[13px] font-medium text-slate-800 dark:text-slate-100">
                            {[owner.firstName, owner.lastName].filter(Boolean).join(" ") || owner.username}
                          </td>
                          <td className="px-2 py-3 text-[13px] text-slate-500 dark:text-slate-400">{owner.email || "—"}</td>
                          <td className="px-2 py-3 text-[13px]">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                owner.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300"
                              }`}
                            >
                              {owner.status === "ACTIVE" ? "សកម្ម" : "អសកម្ម"}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-[13px] text-slate-400">{formatDate(owner.lastLoginAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2.5 md:hidden">
                  {data.recentOwners.map((owner) => (
                    <div key={owner.id} className="rounded-lg border border-slate-100 p-3 dark:border-gray-800">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">
                          {[owner.firstName, owner.lastName].filter(Boolean).join(" ") || owner.username}
                        </p>
                        <span
                          className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            owner.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300"
                          }`}
                        >
                          {owner.status === "ACTIVE" ? "សកម្ម" : "អសកម្ម"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{owner.email || "—"}</p>
                      <p className="mt-1 text-xs text-slate-400">ចូលចុងក្រោយ {formatDate(owner.lastLoginAt)}</p>
                    </div>
                  ))}
                </div>
                </>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}