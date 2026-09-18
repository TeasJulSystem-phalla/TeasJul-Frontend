import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Power,
  PowerOff,
  UserCircle2,
  Mail,
  Phone,
} from "lucide-react";
import {
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Modal,
  Input,
  ConfirmDialog,
  EmptyState,
  Pagination,
  Skeleton,
  Avatar,
} from "../../components/ui/index.js";
import { ownerAdminApi } from "../../api/ownerAdmin.api.js";
import { formatDate } from "../../utils/format.js";

const EMPTY_CREATE_FORM = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
};

export default function AdminOwnersPage() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  const fetchOwners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pageData = await ownerAdminApi.listOwners({
        search: search || undefined,
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
          "មិនអាចផ្ទុកបញ្ជីម្ចាស់បានទេ។"
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  // ---- View ----
  const [viewTarget, setViewTarget] = useState(null);

  // ---- Create ----
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // ---- Edit ----
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ---- Status toggle ----
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);

  const resetCreateForm = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateErrors({});
  };

  const openEdit = (owner) => {
    setEditTarget(owner);
    setEditForm({
      firstName: owner.firstName || "",
      lastName: owner.lastName || "",
      phone: owner.phone || "",
    });
    setEditErrors({});
  };

  const storeField = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const validateCreate = () => {
    const errs = {};
    if (createForm.username.trim().length < 3) errs.username = "ឈ្មោះអ្នកប្រើត្រូវមានយ៉ាងតិច ៣ តួអក្សរ";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(createForm.email)) errs.email = "ត្រូវបញ្ចូលអ៊ីមែលត្រឹមត្រូវ";
    if (createForm.password.length < 8) errs.password = "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ";
    if (!createForm.firstName.trim()) errs.firstName = "តម្រូវឱ្យបញ្ចូលនាមត្រកូល";
    if (!createForm.lastName.trim()) errs.lastName = "តម្រូវឱ្យបញ្ចូលនាមខ្លួន";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreate()) return;
    setCreating(true);
    try {
      const created = await ownerAdminApi.createOwner({
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        phone: createForm.phone.trim() || undefined,
      });
      setCreateOpen(false);
      resetCreateForm();
      setPage(0);
      await fetchOwners();
      setViewTarget(created);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "ការបង្កើតម្ចាស់បរាជ័យ។";
      if (/username/i.test(message)) setCreateErrors((p) => ({ ...p, username: message }));
      else if (/email/i.test(message)) setCreateErrors((p) => ({ ...p, email: message }));
      else setCreateErrors((p) => ({ ...p, form: message }));
    } finally {
      setCreating(false);
    }
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.firstName.trim()) errs.firstName = "តម្រូវឱ្យបញ្ចូលនាមត្រកូល";
    if (!editForm.lastName.trim()) errs.lastName = "តម្រូវឱ្យបញ្ចូលនាមខ្លួន";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTarget || !validateEdit()) return;
    setSaving(true);
    try {
      const updated = await ownerAdminApi.updateOwner(editTarget.id, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim() || undefined,
      });
      setEditTarget(null);
      await fetchOwners();
      setViewTarget(updated);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "ការកែប្រែបរាជ័យ។";
      setEditErrors((p) => ({ ...p, form: message }));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      const nextStatus = toggleTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await ownerAdminApi.updateOwnerStatus(toggleTarget.id, nextStatus);
      setToggleTarget(null);
      await fetchOwners();
      setViewTarget((v) => (v && v.id === toggleTarget.id ? { ...v, status: nextStatus } : v));
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "ការផ្លាស់ប្តូរស្ថានភាពបរាជ័យ។";
      setError(message);
      setToggleTarget(null);
    } finally {
      setToggling(false);
    }
  };

  const ownerName = (o) =>
  o ? [o.firstName, o.lastName].filter(Boolean).join(" ") || o.username || `#${o.id}` : "—";

  const columns = [
    {
      header: "ម្ចាស់",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar image={row.avatar} fallback={ownerName(row)} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-white">{ownerName(row)}</p>
            <p className="text-xs text-slate-400">@{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      header: "អ៊ីមែល",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Mail className="h-4 w-4 text-slate-400" />
          <span className="max-w-[200px] truncate">{row.email || "—"}</span>
        </span>
      ),
    },
    {
      header: "ទូរស័ព្ទ",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Phone className="h-4 w-4 text-slate-400" />
          {row.phone || "—"}
        </span>
      ),
    },
    {
      header: "ស្ថានភាព",
      render: (row) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "danger"}>
          {row.status === "ACTIVE" ? "សកម្ម" : "អសកម្ម"}
        </Badge>
      ),
    },
    {
      header: "ចូលចុងក្រោយ",
      render: (row) => <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(row.lastLoginAt)}</span>,
    },
    {
      header: "សកម្មភាព",
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />} onClick={() => setViewTarget(row)}>
            មើល
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => openEdit(row)}>
            កែប្រែ
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={row.status === "ACTIVE" ? <PowerOff className="h-4 w-4 text-red-500" /> : <Power className="h-4 w-4 text-emerald-500" />}
            onClick={() => setToggleTarget(row)}
          >
            {row.status === "ACTIVE" ? "បិទគណនី" : "បើកគណនី"}
          </Button>
        </div>
      ),
    },
  ];

  const tableMemo = columns;

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
            គ្រប់គ្រងម្ចាស់អចលនទ្រព្យ (Owners)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            បង្កើត កែប្រែ និងគ្រប់គ្រងគណនីម្ចាស់អចលនទ្រព្យ។
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchOwners} disabled={loading}>
            ធ្វើឱ្យស្រស់
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { resetCreateForm(); setCreateOpen(true); }}>
            បង្កើតម្ចាស់
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុស" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={fetchOwners}>
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      {/* Filter bar */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល..."
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="w-full sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-white"
            >
              <option value="">ស្ថានភាពទាំងអស់</option>
              <option value="ACTIVE">សកម្ម</option>
              <option value="INACTIVE">អសកម្ម</option>
            </select>
          </div>
          <span className="text-xs text-slate-400">{data.totalElements} ម្ចាស់</span>
        </div>
      </Card>

      {loading && data.content.length ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : data.content.length === 0 ? (
        <EmptyState
          icon={Users}
          title="រកមិនឃើញម្ចាស់"
          description="មិនមានម្ចាស់អចលនទ្រព្យត្រូវនឹងលក្ខខណ្ឌទេ។"
          action={
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { resetCreateForm(); setCreateOpen(true); }}>
              បង្កើតម្ចាស់
            </Button>
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden rounded-xl border-slate-200/80 dark:border-gray-800">
            <Table columns={tableMemo} data={data.content} />
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

      {/* View modal */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget ? ownerName(viewTarget) : ""}
        description="ព័ត៌មានគណនីម្ចាស់អចលនទ្រព្យ"
        footer={
          viewTarget && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />} onClick={() => { openEdit(viewTarget); setViewTarget(null); }}>
                កែប្រែ
              </Button>
              <Button variant="outline" onClick={() => setViewTarget(null)}>
                បិទ
              </Button>
            </div>
          )
        }
      >
        {viewTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar image={viewTarget.avatar} fallback={ownerName(viewTarget)} size="lg" />
              <div>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">{ownerName(viewTarget)}</p>
                <p className="text-sm text-slate-400">@{viewTarget.username}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">អ៊ីមែល</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{viewTarget.email || "—"}</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ទូរស័ព្ទ</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{viewTarget.phone || "—"}</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ស្ថានភាព</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {viewTarget.status === "ACTIVE" ? "សកម្ម" : "អសកម្ម"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ចូលចុងក្រោយ</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDate(viewTarget.lastLoginAt)}</p>
              </div>
              <div className="col-span-full flex items-center gap-2 text-xs text-slate-400">
                <UserCircle2 className="h-4 w-4" />
                បានបង្កើត {formatDate(viewTarget.createdAt)} · បានធ្វើបច្ចុប្បន្នភាព {formatDate(viewTarget.updatedAt)}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="បង្កើតម្ចាស់អចលនទ្រព្យ"
        description="បង្កើតគណនីថ្មីដែលទទួលតួនាទី OWNER ដោយស្វ័យប្រវត្តិ។"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              បោះបង់
            </Button>
            <Button type="submit" form="createOwnerForm" loading={creating}>
              បង្កើតម្ចាស់
            </Button>
          </div>
        }
      >
        <form id="createOwnerForm" onSubmit={handleCreate} className="space-y-4">
          {createErrors.form && (
            <Alert variant="danger" title="កំហុស" description={createErrors.form} dismissible />
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="ឈ្មោះអ្នកប្រើ" required name="username" value={createForm.username} onChange={storeField(setCreateForm)} error={createErrors.username} placeholder="owner_username" />
            <Input label="អ៊ីមែល" required type="email" name="email" value={createForm.email} onChange={storeField(setCreateForm)} error={createErrors.email} placeholder="owner@example.com" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="នាមត្រកូល" required name="firstName" value={createForm.firstName} onChange={storeField(setCreateForm)} error={createErrors.firstName} />
            <Input label="នាមខ្លួន" required name="lastName" value={createForm.lastName} onChange={storeField(setCreateForm)} error={createErrors.lastName} />
          </div>
          <Input
            label="ពាក្យសម្ងាត់"
            required
            type="password"
            name="password"
            value={createForm.password}
            onChange={storeField(setCreateForm)}
            error={createErrors.password}
            helperText="យ៉ាងតិច ៨ តួអក្សរ។ ពាក្យសម្ងាត់នឹងមិនត្រូវបានបង្ហាញទេ។"
          />
          <Input label="ទូរស័ព្ទ" name="phone" value={createForm.phone} onChange={storeField(setCreateForm)} placeholder="ជម្រើស" />
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={editTarget ? `កែប្រែ ${ownerName(editTarget)}` : ""}
        description="កែប្រែព័ត៌មានមូលដ្ឋានរបស់ម្ចាស់។"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>
              បោះបង់
            </Button>
            <Button type="submit" form="editOwnerForm" loading={saving}>
              រក្សាទុក
            </Button>
          </div>
        }
      >
        <form id="editOwnerForm" onSubmit={handleSaveEdit} className="space-y-4">
          {editErrors.form && (
            <Alert variant="danger" title="កំហុស" description={editErrors.form} dismissible />
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="នាមត្រកូល" required name="firstName" value={editForm.firstName} onChange={storeField(setEditForm)} error={editErrors.firstName} />
            <Input label="នាមខ្លួន" required name="lastName" value={editForm.lastName} onChange={storeField(setEditForm)} error={editErrors.lastName} />
          </div>
          <Input label="ទូរស័ព្ទ" name="phone" value={editForm.phone} onChange={storeField(setEditForm)} />
          <p className="text-xs text-slate-400">
            ឈ្មោះអ្នកប្រើ អ៊ីមែល តួនាទី និងពាក្យសម្ងាត់ មិនអាចកែប្រែនៅទីនេះបានទេ។
          </p>
        </form>
      </Modal>

      {/* Status toggle confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.status === "ACTIVE" ? "បិទគណនីម្ចាស់" : "បើកគណនីម្ចាស់"}
        description={
          !toggleTarget
            ? ""
            : toggleTarget.status === "ACTIVE"
              ? `តើអ្នកប្រាកដថាចង់បិទគណនី "${ownerName(toggleTarget)}"? ព័ត៌មានទាំងអស់ត្រូវបានរក្សាទុក។`
              : `តើអ្នកប្រាកដថាចង់បើកគណនី "${ownerName(toggleTarget)}" ឡើងវិញ?`
        }
        confirmText={toggleTarget?.status === "ACTIVE" ? "បិទ" : "បើក"}
        cancelText="បោះបង់"
        danger={toggleTarget?.status === "ACTIVE"}
        loading={toggling}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}