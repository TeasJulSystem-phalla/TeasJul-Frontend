import { useCallback, useState } from "react";
import {
  Layers,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Power,
  PowerOff,
  Zap,
  Sparkles,
  Scale,
  Hash,
  Calendar,
  Tag,
  CircleDollarSign,
  Image as ImageIcon,
  AlignLeft,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Modal,
  Input,
  Textarea,
  Select,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Tabs,
} from "../../components/ui/index.js";
import { useAdminSystemDefaults } from "../../hooks/useAdminSystemDefaults.js";
import { useToast } from "../../components/ui/Toast.jsx";
import { formatDate } from "../../utils/format.js";

const KIND_TABS = [
  { value: "UTILITY", label: "ប្រើប្រាស់ទឹកភ្លើង" },
  { value: "AMENITY", label: "សម្ភារ:ប្រើប្រាស់" },
];

const BILLING_METHOD_OPTIONS = [
  { value: "METERED", label: "Metered (METERED)" },
  { value: "FIXED", label: "Fixed (FIXED)" },
];

const EMPTY_FORM = {
  kind: "UTILITY",
  name: "",
  code: "",
  unit: "",
  billingMethod: "METERED",
  description: "",
  icon: "",
};

const FIELD_LABELS = {
  UTILITY: "ប្រើប្រាស់ទឹកភ្លើង",
  AMENITY: "សម្ភារ:ប្រើប្រាស់",
};

export default function AdminSystemDefaultsPage() {
  const [kind, setKind] = useState("UTILITY");
  const { defaults, loading, error, fetchDefaults, createDefault, updateDefault, updateStatus } =
    useAdminSystemDefaults(kind);
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewTarget, setViewTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const changeKind = useCallback((k) => {
    setKind(k);
    setSearchTerm("");
  }, []);

  const filtered = (defaults || []).filter((d) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.code && d.code.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q))
    );
  });

  const resetForm = (k = kind) => {
    setForm({ ...EMPTY_FORM, kind: k });
    setFormErrors({});
  };

  const openCreate = () => {
    resetForm();
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditTarget(d);
    setForm({
      kind: d.kind,
      name: d.name || "",
      code: d.code || "",
      unit: d.unit || "",
      billingMethod: d.billingMethod || "METERED",
      description: d.description || "",
      icon: d.icon || "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "តម្រូវឱ្យបញ្ចូលឈ្មោះ";
    if (!form.code.trim()) errs.code = "តម្រូវឱ្យបញ្ចូលលេខកូដ";
    if (form.kind === "UTILITY") {
      if (!form.unit.trim()) errs.unit = "តម្រូវឱ្យបញ្ចូលឯកតា";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload =
      form.kind === "UTILITY"
        ? {
            kind: form.kind,
            name: form.name.trim(),
            code: form.code.trim(),
            unit: form.unit.trim(),
            billingMethod: form.billingMethod || "METERED",
            description: (form.description || "").trim() || undefined,
            icon: (form.icon || "").trim() || undefined,
          }
        : {
            kind: form.kind,
            name: form.name.trim(),
            code: form.code.trim(),
            description: (form.description || "").trim() || undefined,
            icon: (form.icon || "").trim() || undefined,
          };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateDefault(editTarget.id, payload);
        toast.success("បានកែប្រែ", `"${payload.name}" ត្រូវបានកែប្រែរួចរាល់។`);
        setEditTarget(null);
      } else {
        await createDefault(payload);
        toast.success("បានបង្កើត", `"${payload.name}" ត្រូវបានបង្កើតរួចរាល់។`);
      }
      setModalOpen(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "ប្រតិបត្តិការបរាជ័យ។";
      if (/name|c/i.test(msg)) setFormErrors((prev) => ({ ...prev, code: msg }));
      else toast.error("កំហុស", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      const next = toggleTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateStatus(toggleTarget.id, next);
      toast.success(
        next === "ACTIVE" ? "បានបើកដំណើរការ" : "បានបិទដំណើរការ",
        `"${toggleTarget.name}" ត្រូវបានប្តូរជា ${next === "ACTIVE" ? "សកម្ម" : "អសកម្ម"}។`
      );
      setToggleTarget(null);
    } catch (err) {
      toast.error("កំហុស", err.response?.data?.message || err.response?.data?.error || "បរាជ័យក្នុងការប្តូរស្ថានភាព។");
      setToggleTarget(null);
    } finally {
      setToggling(false);
    }
  };

  const columns = [
    {
      header: "ឈ្មោះ / កូដ",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {row.kind === "UTILITY" ? <Zap className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-slate-800 dark:text-white">{row.name}</p>
            <p className="font-mono text-xs text-slate-400">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: "ប្រភេទ",
      render: (row) => (
        <Badge variant={row.kind === "UTILITY" ? "info" : "default"}>{FIELD_LABELS[row.kind] || row.kind}</Badge>
      ),
    },
    {
      header: "ឯកតា",
      render: (row) =>
        row.kind === "UTILITY" ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <Scale className="h-4 w-4 text-slate-400" />
            {row.unit || "—"}
          </span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      header: "វិធីសាស្រ្តគិតការទូទាត់",
      render: (row) =>
        row.kind === "UTILITY" ? (
          <Badge variant={row.billingMethod === "FIXED" ? "info" : "default"}>
            {row.billingMethod === "METERED" ? "Metered" : row.billingMethod === "FIXED" ? "Fixed" : row.billingMethod || "—"}
          </Badge>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      header: "ការពិពណ៌នា",
      render: (row) => (
        <span className="block max-w-[220px] truncate text-sm text-slate-500 dark:text-slate-400">
          {row.description || "—"}
        </span>
      ),
    },
    {
      header: "ស្ថានភាព",
      render: (row) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "warning"}>
          {row.status === "ACTIVE" ? "សកម្ម" : "អសកម្ម"}
        </Badge>
      ),
    },
    {
      header: "បានបង្កើត",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(row.createdAt)}
        </span>
      ),
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
            {row.status === "ACTIVE" ? "បិទ" : "បើក"}
          </Button>
        </div>
      ),
    },
  ];

  if (loading && !defaults.length) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            ប្រព័ន្ធលំនាំដើម (System Defaults)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            បង្កើត កែប្រែ និងគ្រប់គ្រងឧបករណ៍ប្រើប្រាស់ និងសម្ភារ:ប្រើប្រាស់លំនាំដើម ដែលម្ចាស់អាចបើក/បិទដំណើរការបាន។
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => fetchDefaults()} disabled={loading}>
            ធ្វើឱ្យស្រស់
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => openCreate()}>
            បង្កើតលំនាំដើម
          </Button>
        </div>
      </div>

      <Tabs tabs={KIND_TABS} activeTab={kind} onChange={changeKind} className="overflow-x-auto" />

      {error && (
        <Alert variant="danger" title="កំហុស" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => fetchDefaults()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ កូដ ឬការពិពណ៌នា..."
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs text-slate-400">{filtered.length} លំនាំដើម</span>
        </div>
      </Card>

      {loading && defaults.length ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="រកមិនឃើញលំនាំដើម"
          description={
            searchTerm
              ? "មិនមានលំនាំដើមត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ។"
              : `មិនទាន់មាន${FIELD_LABELS[kind]}លំនាំដើមទេ។ បង្កើតមួយដើម្បីឱ្យម្ចាស់អាចបើកដំណើរការបាន។`
          }
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => openCreate()}>បង្កើតលំនាំដើម</Button>}
        />
      ) : (
        <Card className="overflow-hidden rounded-xl border-slate-200/80 dark:border-gray-800">
          <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} onRowClick={setViewTarget} className="w-full" />
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        title={editTarget ? "កែប្រែលំនាំដើម" : "បង្កើតលំនាំដើម"}
        description={editTarget ? `កំពុងកែប្រែ "${editTarget.name}"` : "បង្កើតឧបករណ៍ប្រើប្រាស់ ឬសម្ភារ:ប្រើប្រាស់លំនាំដើមថ្មី។"}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setModalOpen(false); setEditTarget(null); }} disabled={submitting}>
              បោះបង់
            </Button>
            <Button type="submit" form="systemDefaultForm" loading={submitting}>
              {editTarget ? "រក្សាទុកការផ្លាស់ប្តូរ" : "បង្កើតលំនាំដើម"}
            </Button>
          </div>
        }
      >
        <form id="systemDefaultForm" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              ប្រភេទ <span className="text-red-500">*</span>
            </label>
            <Select
              name="kind"
              options={[
                { value: "UTILITY", label: "ប្រើប្រាស់ទឹកភ្លើង (Utility)" },
                { value: "AMENITY", label: "សម្ភារ:ប្រើប្រាស់ (Amenity)" },
              ]}
              value={form.kind}
              onChange={(e) => {
                handleFormChange(e);
              }}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="ឈ្មោះ" required name="name" value={form.name} onChange={handleFormChange} placeholder="ឧ. អគ្គិសនី / WiFi" error={formErrors.name} />
            <Input label="កូដ" required name="code" value={form.code} onChange={handleFormChange} placeholder="ឧ. ELECTRIC / WIFI" error={formErrors.code} />
          </div>
          {form.kind === "UTILITY" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="ឯកតា" required name="unit" value={form.unit} onChange={handleFormChange} placeholder="ឧ. kWh, m³" error={formErrors.unit} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  វិធីសាស្រ្តគិតការទូទាត់ <span className="text-red-500">*</span>
                </label>
                <Select name="billingMethod" options={BILLING_METHOD_OPTIONS} value={form.billingMethod} onChange={handleFormChange} />
              </div>
            </div>
          )}
          <Input label="រូបតំណាង" name="icon" value={form.icon} onChange={handleFormChange} placeholder="ឧ. wifi, pool, parking" />
          <Textarea label="ការពិពណ៌នា" name="description" value={form.description} onChange={handleFormChange} rows={2} placeholder="ពិណ៌នាអំពីលំនាំដើមនេះ..." />
        </form>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="ព័ត៌មានលម្អិតលំនាំដើម" size="md">
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  {viewTarget.kind === "UTILITY" ? <Zap className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{viewTarget.name}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">{viewTarget.code}</p>
                </div>
              </div>
              <Badge variant={viewTarget.status === "ACTIVE" ? "success" : "warning"}>
                {viewTarget.status === "ACTIVE" ? "សកម្ម" : "អសកម្ម"}
              </Badge>
            </div>

            {viewTarget.description && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ការពិណ៌នា</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewTarget.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="លេខសម្គាល់" value={viewTarget.id} />
              <DetailItem icon={<Tag className="h-4 w-4 text-slate-400" />} label="ប្រភេទ" value={FIELD_LABELS[viewTarget.kind] || viewTarget.kind} />
              {viewTarget.kind === "UTILITY" && (
                <DetailItem icon={<Scale className="h-4 w-4 text-slate-400" />} label="ឯកតា" value={viewTarget.unit || "—"} />
              )}
              {viewTarget.kind === "UTILITY" && (
                <DetailItem icon={<CircleDollarSign className="h-4 w-4 text-slate-400" />} label="វិធីសាស្រ្តគិតការទូទាត់" value={viewTarget.billingMethod === "METERED" ? "Metered (METERED)" : viewTarget.billingMethod === "FIXED" ? "Fixed (FIXED)" : viewTarget.billingMethod || "—"} />
              )}
              {viewTarget.icon && (
                <DetailItem icon={<ImageIcon className="h-4 w-4 text-slate-400" />} label="រូបតំណាង" value={viewTarget.icon} />
              )}
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="បានបង្កើត" value={formatDate(viewTarget.createdAt)} />
              <DetailItem icon={<CheckCircle2 className="h-4 w-4 text-slate-400" />} label="ស្ថានភាព" value={viewTarget.status} />
              {viewTarget.updatedAt && (
                <DetailItem icon={<AlignLeft className="h-4 w-4 text-slate-400" />} label="បានធ្វើបច្ចុប្បន្នភាព" value={formatDate(viewTarget.updatedAt)} />
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.status === "ACTIVE" ? "បិទដំណើរការលំនាំដើម" : "បើកដំណើរការលំនាំដើម"}
        description={
          !toggleTarget
            ? ""
            : toggleTarget.status === "ACTIVE"
              ? `តើអ្នកប្រាកដថាចង់បិទដំណើរការ "${toggleTarget.name}"? ម្ចាស់ទាំងអស់មិនអាចបើកវាថ្មីបានទេ ប៉ុន្តែអ្វីដែលបានបើករួចនៅតែដំណើរការ។`
              : `តើអ្នកប្រាកដថាចង់បើកដំណើរការ "${toggleTarget.name}" ឡើងវិញ?`
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

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-gray-800">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  </div>
);