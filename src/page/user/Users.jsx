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
import { useUsers } from "../../hooks/useUsers";
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

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "LOCKED", label: "Locked" },
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

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
};

const Users = () => {
  const { users, loading, error, fetchUsers, deleteUser } = useUsers();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const inactive = users.filter((u) => u.status === "INACTIVE").length;
    const locked = users.filter((u) => u.status === "LOCKED").length;
    return { total, active, inactive, locked };
  }, [users]);

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          (u.firstName && u.firstName.toLowerCase().includes(q)) ||
          (u.lastName && u.lastName.toLowerCase().includes(q)) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }
    if (statusFilter) {
      result = result.filter((u) => u.status === statusFilter);
    }
    return result;
  }, [users, search, statusFilter]);

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
      toast.success("User deleted", `"${getFullName(deleteTarget)}" has been removed.`);
      setDeleteTarget(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete user.";
      toast.error("Delete failed", message);
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
    if (!editForm.firstName.trim()) errs.firstName = "First name is required";
    if (!editForm.lastName.trim()) errs.lastName = "Last name is required";
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
      toast.success("User updated", `"${payload.firstName} ${payload.lastName}" has been updated.`);
      setEditTarget(null);
      fetchUsers();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update user.";
      toast.error("Update failed", message);
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
            Users
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage all registered users in the system.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={fetchUsers}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="danger" title="Error" description={error} dismissible />
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
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Total</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-green-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-green-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Active</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-400">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-red-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Inactive</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-400">{stats.inactive}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-amber-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Locked</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{stats.locked}</p>
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
              placeholder="Search by name, username, or email..."
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
        <EmptyState
          icon={UserCircle}
          title="No users yet"
          description="There are no registered users in the system."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No matches found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((user) => {
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
                              <Eye className="h-4 w-4" /> View details
                            </button>
                            <button
                              onClick={() => openEdit(user)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-700"
                            >
                              <Edit3 className="h-4 w-4" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(user);
                                setMenuOpen(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
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
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {user.lastLoginAt && (
                  <div className="border-t border-slate-100 px-5 py-2.5 dark:border-gray-800">
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <Clock className="h-3 w-3" />
                      Last login {formatRelativeTime(user.lastLoginAt)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget ? getFullName(deleteTarget) : ""}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Edit user modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit User"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} loading={editLoading}>
              Save Changes
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
                label="First Name"
                required
                placeholder="First name"
                value={editForm.firstName}
                onChange={(e) => handleEditChange("firstName", e.target.value)}
                error={editErrors.firstName}
              />
              <Input
                label="Last Name"
                required
                placeholder="Last name"
                value={editForm.lastName}
                onChange={(e) => handleEditChange("lastName", e.target.value)}
                error={editErrors.lastName}
              />
            </div>
            <Input
              label="Phone"
              placeholder="Phone number"
              value={editForm.phone}
              onChange={(e) => handleEditChange("phone", e.target.value)}
            />
            <Input
              label="Avatar URL"
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
        title="User Details"
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
                Contact Information
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-800">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Email</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{viewData.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-800">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Phone</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{viewData.phone || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Assigned Roles
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
                <p className="text-sm text-slate-400 dark:text-slate-500">No roles assigned</p>
              )}
            </div>

            {/* Activity */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Activity
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-800">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Joined</p>
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
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Last Login</p>
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
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Last Updated</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {viewData.updatedAt ? formatRelativeTime(viewData.updatedAt) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={UserCircle} title="User not found" description="Could not load user details." />
        )}
      </Modal>
    </div>
  );
};

export default Users;
