import { useState, useMemo, useEffect } from "react";
import {
  UserCircle,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Trash2,
  Eye,
  Edit3,
  Shield,
  Filter,
  Clock,
  Users as UsersIcon,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";
import { useUsersList } from "../../hooks/useUsersList";
import { userApi } from "../../api/user.api";
import useToast from "../../components/ui/Toast";
import Skeleton from "../../components/ui/Skeleton";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";
import CountUp from "../../components/ui/CountUp";

const STATUS_OPTIONS = [
  { value: "", label: "ស្ថានភាពទាំងអស់" },
  { value: "ACTIVE", label: "សកម្ម" },
  { value: "INACTIVE", label: "អសកម្ម" },
  { value: "LOCKED", label: "ចាក់សោ" },
];

const STATUS_VARIANT = {
  ACTIVE: "success",
  INACTIVE: "danger",
  LOCKED: "warning",
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

const getAvatarColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return null;
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return "ទើបតែឥឡូវនេះ";
  if (diffMins < 60) return `${diffMins} នាទីមុន`;
  if (diffHours < 24) return `${diffHours} ម៉ោងមុន`;
  if (diffDays < 7) return `${diffDays} ថ្ងៃមុន`;
  if (diffWeeks < 4) return `${diffWeeks} សប្តាហ៍មុន`;
  return `${diffMonths} ខែមុន`;
};

const Users = () => {
  const {
    users,
    summary,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    search,
    statusFilter,
    setSearch,
    setStatusFilter,
    setPage,
    fetchUsers,
    fetchSummary,
    deleteUser,
  } = useUsersList();
  const toast = useToast();

  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // View
  const [viewTarget, setViewTarget] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewRoles, setViewRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Edit
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", avatar: "" });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const stats = useMemo(() => {
    if (summary) {
      const total = summary.total || 0;
      const active = summary.statusCounts?.ACTIVE || 0;
      const inactive = summary.statusCounts?.INACTIVE || 0;
      const locked = summary.statusCounts?.LOCKED || 0;
      return { total, active, inactive, locked };
    }
    const total = totalElements || users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const inactive = users.filter((u) => u.status === "INACTIVE").length;
    const locked = users.filter((u) => u.status === "LOCKED").length;
    return { total, active, inactive, locked };
  }, [summary, totalElements, users]);

  // Fetch fresh user data + roles when viewTarget changes
  useEffect(() => {
    if (!viewTarget) {
      setViewData(null);
      setViewRoles([]);
      return;
    }
    let cancelled = false;
    setViewLoading(true);
    setRolesLoading(true);

    Promise.all([
      userApi.getUserById(viewTarget.id),
      userApi.getUserRoles(viewTarget.id).catch(() => []),
    ])
      .then(([userData, roles]) => {
        if (!cancelled) {
          setViewData(userData);
          setViewRoles(roles);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setViewData(viewTarget);
          setViewRoles([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setViewLoading(false);
          setRolesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [viewTarget]);

  const getInitials = (firstName, lastName) => {
    const f = firstName?.[0] || "";
    const l = lastName?.[0] || "";
    return (f + l).toUpperCase() || "?";
  };

  const getFullName = (user) => {
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success("បានលុបអ្នកប្រើប្រាស់", `"${getFullName(deleteTarget)}" ត្រូវបានដកចេញ។`);
      setDeleteTarget(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការលុបអ្នកប្រើប្រាស់បានបរាជ័យ។";
      toast.error("ការលុបបានបរាជ័យ", message);
    } finally {
      setDeleting(false);
    }
  };

  // Edit
  const openEdit = (user) => {
    setEditTarget(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
    });
    setEditErrors({});
    setMenuOpen(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.firstName.trim()) errs.firstName = "តម្រូវឱ្យបញ្ចូលនាមត្រកូល";
    if (!editForm.lastName.trim()) errs.lastName = "តម្រូវឱ្យបញ្ចូលគោត្តនាម";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEdit()) return;
    setEditLoading(true);
    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim() || null,
        avatar: editForm.avatar.trim() || null,
      };
      await userApi.updateUser(editTarget.id, payload);
      toast.success("បានកែប្រែអ្នកប្រើប្រាស់", `"${payload.firstName} ${payload.lastName}" ត្រូវបានធ្វើបច្ចុប្បន្នភាព។`);
      setEditTarget(null);
      fetchUsers({ search: search.trim() || undefined, status: statusFilter || undefined });
      fetchSummary();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការកែប្រែអ្នកប្រើប្រាស់បានបរាជ័យ។";
      toast.error("ការធ្វើបច្ចុប្បន្នភាពបានបរាជ័យ", message);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-1.5 h-5 w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="mt-1.5 h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-7 rounded-md" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3.5 w-44" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            អ្នកប្រើប្រាស់
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងអ្នកប្រើប្រាស់ដែលបានចុះឈ្មោះទាំងអស់ក្នុងប្រព័ន្ធ។
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => {
            fetchSummary();
            fetchUsers({ search: search.trim() || undefined, status: statusFilter || undefined });
          }}
        >
          ផ្ទុកឡើងវិញ
        </Button>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុស" description={error} dismissible />
      )}

      {/* Stats */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
                <UsersIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">សរុប</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white"><CountUp value={stats.total} /></p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-green-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-green-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">សកម្ម</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-400"><CountUp value={stats.active} /></p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-red-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">អសកម្ម</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-400"><CountUp value={stats.inactive} /></p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-amber-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ចាក់សោ</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-400"><CountUp value={stats.locked} /></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {users.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ ឈ្មោះអ្នកប្រើប្រាស់ ឬអ៊ីមែល..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Empty / no matches / cards */}
      {!loading && users.length === 0 ? (
        search || statusFilter ? (
          <EmptyState
            icon={Filter}
            title="រកមិនឃើញលទ្ធផល"
            description="សូមព្យាយាមកែតម្រូវលក្ខណៈវិនិច្ឆ័យស្វែងរក ឬតម្រងរបស់អ្នក។"
          />
        ) : (
          <EmptyState
            icon={UserCircle}
            title="មិនទាន់មានអ្នកប្រើប្រាស់"
            description="មិនមានអ្នកប្រើប្រាស់ដែលបានចុះឈ្មោះក្នុងប្រព័ន្ធទេ។"
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => {
              const avatarColor = getAvatarColor(
                (user.firstName || "") + (user.lastName || "") + user.username
              );
              return (
                <div
                  key={user.id}
                  className="group relative rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-black/20"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={getFullName(user)}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
                          />
                        ) : (
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${avatarColor}`}
                          >
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white truncate">
                            {getFullName(user)}
                          </h3>
                          <p className="text-[12px] text-slate-400 dark:text-slate-500 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpen(menuOpen === user.id ? null : user.id)
                          }
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-800 dark:hover:text-slate-300"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuOpen === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuOpen(null)}
                            />
                            <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                              <button
                                onClick={() => {
                                  setViewTarget(user);
                                  setMenuOpen(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4" /> មើលព័ត៌មានលម្អិត
                              </button>
                              <button
                                onClick={() => openEdit(user)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-700"
                              >
                                <Edit3 className="h-4 w-4" /> កែប្រែ
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget(user);
                                  setMenuOpen(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" /> លុប
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {user.email && (
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Badge variant={STATUS_VARIANT[user.status] || "default"}>
                        {user.status}
                      </Badge>
                      {user.createdAt && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                          <Calendar className="h-3 w-3" />
                          បានចូលរួម {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {user.lastLoginAt && (
                    <div className="border-t border-slate-100 px-5 py-2.5 dark:border-gray-800">
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <Clock className="h-3 w-3" />
                        ការចូលចុងក្រោយ {formatRelativeTime(user.lastLoginAt)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-end pt-4">
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="លុបអ្នកប្រើប្រាស់"
        description={`តើអ្នកប្រាកដទេថាចង់លុប "${deleteTarget ? getFullName(deleteTarget) : ""}"? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`}
        confirmText="លុប"
        cancelText="បោះបង់"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Edit user modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="កែប្រែអ្នកប្រើប្រាស់"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editLoading}>
              បោះបង់
            </Button>
            <Button onClick={handleEditSubmit} loading={editLoading}>
              រក្សាទុកការផ្លាស់ប្តូរ
            </Button>
          </div>
        }
      >
        {editTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
              {editTarget.avatar ? (
                <img
                  src={editTarget.avatar}
                  alt={getFullName(editTarget)}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(
                    (editTarget.firstName || "") + (editTarget.lastName || "") + editTarget.username
                  )}`}
                >
                  {getInitials(editTarget.firstName, editTarget.lastName)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {getFullName(editTarget)}
                </p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500">
                  @{editTarget.username} &middot; {editTarget.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="នាមត្រកូល"
                required
                placeholder="នាមត្រកូល"
                value={editForm.firstName}
                onChange={(e) => handleEditChange("firstName", e.target.value)}
                error={editErrors.firstName}
              />
              <Input
                label="គោត្តនាម"
                required
                placeholder="គោត្តនាម"
                value={editForm.lastName}
                onChange={(e) => handleEditChange("lastName", e.target.value)}
                error={editErrors.lastName}
              />
            </div>
            <Input
              label="លេខទូរស័ព្ទ"
              placeholder="លេខទូរស័ព្ទ"
              value={editForm.phone}
              onChange={(e) => handleEditChange("phone", e.target.value)}
            />
            <Input
              label="URL រូបភាពតំណាង"
              placeholder="https://example.com/avatar.jpg"
              value={editForm.avatar}
              onChange={(e) => handleEditChange("avatar", e.target.value)}
            />
          </div>
        )}
      </Modal>

      {/* View details modal */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="ព័ត៌មានលម្អិតអ្នកប្រើប្រាស់"
        size="lg"
      >
        {viewLoading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-1.5 h-3 w-28" />
                <Skeleton className="mt-2 h-5 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : viewData ? (
          <div className="space-y-6">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              {viewData.avatar ? (
                <img
                  src={viewData.avatar}
                  alt={getFullName(viewData)}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
                />
              ) : (
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-md ${getAvatarColor(
                    (viewData.firstName || "") + (viewData.lastName || "") + viewData.username
                  )}`}
                >
                  {getInitials(viewData.firstName, viewData.lastName)}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">
                  {getFullName(viewData)}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  @{viewData.username}
                </p>
                <Badge variant={STATUS_VARIANT[viewData.status] || "default"} className="mt-1.5">
                  {viewData.status}
                </Badge>
              </div>
            </div>

            {/* Contact info */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                ព័ត៌មានទំនាក់ទំនង
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-800">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">អ៊ីមែល</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{viewData.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-800">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">លេខទូរស័ព្ទ</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{viewData.phone || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                តួនាទីដែលបានកំណត់
              </p>
              {rolesLoading ? (
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              ) : viewRoles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewRoles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                      <Shield className="h-3 w-3" />
                      {role.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">មិនមានតួនាទីដែលបានកំណត់</p>
              )}
            </div>

            {/* Activity */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                សកម្មភាព
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-800">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">បានចូលរួម</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {viewData.createdAt ? new Date(viewData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-800">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">ការចូលចុងក្រោយ</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {viewData.lastLoginAt ? formatRelativeTime(viewData.lastLoginAt) : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-800">
                    <RefreshCw className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">ការធ្វើបច្ចុប្បន្នភាពចុងក្រោយ</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {viewData.updatedAt ? formatRelativeTime(viewData.updatedAt) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={UserCircle} title="រកមិនឃើញអ្នកប្រើប្រាស់" description="មិនអាចផ្ទុកព័ត៌មានលម្អិតរបស់អ្នកប្រើប្រាស់បានទេ។" />
        )}
      </Modal>
    </div>
  );
};

export default Users;
