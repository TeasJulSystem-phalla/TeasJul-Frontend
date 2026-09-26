// src/page/Room/Properties.jsx
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  MapPin,
  BedDouble,
  MoreVertical,
  Trash2,
  Edit3,
  Eye,
  Search,
  RefreshCw,
  Filter,
  FileSpreadsheet,
  Hand,
  ExternalLink,
  X,
  LayoutGrid,
  List,
  ArrowRight,
  CheckCircle2,
  Wrench,
  DoorOpen,
} from "lucide-react";
import { useHouses } from "../../hooks/useHouses";
import { useMyRoles } from "../../hooks/useMyRoles";
import { useBasePath } from "../../hooks/useBasePath.js";
import useToast from "../../components/ui/Toast";
import Skeleton from "../../components/ui/Skeleton";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Table from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import Dropdown from "../../components/ui/Dropdown";
import CountUp from "../../components/ui/CountUp";

const STATUS_OPTIONS = [
  { value: "", label: "ស្ថានភាពទាំងអស់" },
  { value: "ACTIVE", label: "សកម្ម" },
  { value: "INACTIVE", label: "អសកម្ម" },
  { value: "MAINTENANCE", label: "កំពុងជួសជុល" },
];

const STATUS_FORM_OPTIONS = [
  { value: "ACTIVE", label: "សកម្ម" },
  { value: "INACTIVE", label: "អសកម្ម" },
  { value: "MAINTENANCE", label: "កំពុងជួសជុល" },
];

const STATUS_VARIANT = {
  ACTIVE: "success",
  INACTIVE: "danger",
  MAINTENANCE: "warning",
};

const STATUS_META = {
  ACTIVE: {
    label: "សកម្ម",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  INACTIVE: {
    label: "អសកម្ម",
    dot: "bg-slate-400",
    bg: "bg-slate-100 dark:bg-gray-800",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-200 dark:border-gray-700",
  },
  MAINTENANCE: {
    label: "កំពុងជួសជុល",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/30",
  },
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  code: "",
  address: "",
  cityProvince: "",
  googleMapsUrl: "",
  postalCode: "",
  description: "",
  status: "ACTIVE",
};

// Slug is system-managed: derived from the house name so the user never types it.
// Kept backend-compatible because CreateHouseRequest still requires a slug.
const slugify = (value) =>
  (value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");

const KH = "font-[Kantumruy_Pro,Hanuman,Inter,sans-serif]";

const Properties = () => {
  const {
    houses,
    loading,
    error,
    fetchHouses,
    createHouse,
    updateHouse,
    deleteHouse,
  } = useHouses();
  const { isOwner, isManager } = useMyRoles();
  const toast = useToast();
  const navigate = useNavigate();
  const basePath = useBasePath();

  const readOnly = isManager && !isOwner;

  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  const [formModal, setFormModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [onboardingTarget, setOnboardingTarget] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState("choice");

  const filtered = useMemo(() => {
    let result = houses;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.code && h.code.toLowerCase().includes(q)) ||
          (h.address && h.address.toLowerCase().includes(q))
      );
    }
    if (statusFilter) {
      result = result.filter((h) => h.status === statusFilter);
    }
    return result;
  }, [houses, search, statusFilter]);

  const stats = useMemo(() => {
    const active = houses.filter((h) => h.status === "ACTIVE").length;
    const maintenance = houses.filter((h) => h.status === "MAINTENANCE").length;
    const totalRooms = houses.reduce(
      (sum, h) => sum + (typeof h.totalRooms === "number" ? h.totalRooms : 0),
      0
    );
    const availableRooms = houses.reduce(
      (sum, h) => sum + (h.availableRooms ?? 0),
      0
    );
    return { total: houses.length, active, maintenance, totalRooms, availableRooms };
  }, [houses]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormModal("create");
  };

  const openEdit = useCallback((house) => {
    setForm({
      name: house.name || "",
      // Existing slug is preserved on edit so public URLs stay stable.
      slug: house.slug || "",
      code: house.code || "",
      address: house.address || "",
      cityProvince: house.cityProvince || "",
      googleMapsUrl: house.googleMapsUrl || "",
      postalCode: house.postalCode || "",
      description: house.description || "",
      status: house.status || "ACTIVE",
    });
    setFormErrors({});
    setFormModal(house);
  }, []);

  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Only auto-generate on create; edits preserve the existing slug.
      if (field === "name" && formModal === "create") {
        next.slug = slugify(value);
      }
      return next;
    });
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getMapsUrl = (lat, lng, mapsUrl) => {
    if (mapsUrl && mapsUrl.trim()) return mapsUrl.trim();
    if (lat == null || lng == null || lat === "" || lng === "") return null;
    const numLat = Number(lat);
    const numLng = Number(lng);
    if (Number.isNaN(numLat) || Number.isNaN(numLng)) return null;
    if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180)
      return null;
    return `https://www.google.com/maps?q=${numLat},${numLng}`;
  };

  const openInGoogleMaps = (lat, lng, mapsUrl) => {
    const url = getMapsUrl(lat, lng, mapsUrl);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "តម្រូវឱ្យបញ្ចូលឈ្មោះ";
    if (!form.code.trim()) errs.code = "តម្រូវឱ្យបញ្ចូលលេខកូដ";
    if (!form.address.trim()) errs.address = "តម្រូវឱ្យបញ្ចូលអាសយដ្ឋាន";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormLoading(true);
    try {
      // Slug is system-managed. On create it is derived from the name; on edit
      // the existing slug is sent unchanged to keep public URLs stable.
      const resolvedSlug =
        (formModal === "create" ? slugify(form.name) : form.slug) ||
        `house-${Date.now().toString(36)}`;

      const payload = {
        name: form.name.trim(),
        slug: resolvedSlug,
        code: form.code.trim(),
        address: form.address.trim(),
        cityProvince: form.cityProvince.trim() || null,
        googleMapsUrl: form.googleMapsUrl.trim() || null,
        postalCode: form.postalCode.trim() || null,
        description: form.description.trim() || null,
      };

      if (formModal === "create") {
        const created = await createHouse(payload);
        toast.success(
          "អចលនទ្រព្យត្រូវបានបង្កើត",
          "អចលនទ្រព្យថ្មីត្រូវបានបន្ថែមដោយជោគជ័យ។"
        );
        const newId = created?.id ?? created?.data?.id;
        const newName = created?.name ?? form.name;
        setFormModal(null);
        setOnboardingStep("choice");
        setOnboardingTarget(newId ? { id: newId, name: newName } : null);
        return;
      } else {
        await updateHouse(formModal.id, { ...payload, status: form.status });
        toast.success(
          "អចលនទ្រព្យត្រូវបានកែប្រែ",
          "ព័ត៌មានលម្អិតនៃអចលនទ្រព្យត្រូវបានរក្សាទុក។"
        );
      }
      setFormModal(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "មានអ្វីមួយខុសប្រក្រតី។ សូមព្យាយាមម្តងទៀត។";
      toast.error("កំហុស", message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteHouse(deleteTarget.id);
      toast.success(
        "អចលនទ្រព្យត្រូវបានលុប",
        `"${deleteTarget.name}" ត្រូវបានលុប។`
      );
      setDeleteTarget(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការលុបអចលនទ្រព្យបរាជ័យ។";
      toast.error("ការលុបបរាជ័យ", message);
    } finally {
      setDeleting(false);
    }
  };

  // Row actions shared by the grid menu and the table dropdown.
  const buildActions = useCallback(
    (house) => [
      {
        label: "មើលព័ត៌មានលម្អិត",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => setViewTarget(house),
      },
      {
        label: "បញ្ចូលដោយដៃ",
        icon: <Hand className="h-4 w-4" />,
        onClick: () =>
          navigate(`${basePath}/properties/${house.id}/onboarding/manual`),
      },
      {
        label: "នាំចូល CSV/Excel",
        icon: <FileSpreadsheet className="h-4 w-4" />,
        onClick: () =>
          navigate(`${basePath}/properties/${house.id}/onboarding/import`),
      },
      ...(!readOnly
        ? [
            { divider: true },
            {
              label: "កែប្រែ",
              icon: <Edit3 className="h-4 w-4" />,
              onClick: () => openEdit(house),
            },
            {
              label: "លុប",
              icon: <Trash2 className="h-4 w-4" />,
              danger: true,
              onClick: () => setDeleteTarget(house),
            },
          ]
        : []),
    ],
    [basePath, navigate, openEdit, readOnly]
  );

  const columns = useMemo(
    () => [
      {
        header: "អចលនទ្រព្យ",
        render: (h) => (
          <div className="flex items-center gap-3">
            {h.primaryImage ? (
              <img
                src={h.primaryImage}
                alt={h.name}
                className="h-9 w-9 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
                <Building2 className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-800 dark:text-white">
                {h.name}
              </p>
              {h.code && (
                <p className="font-mono text-xs text-slate-400">{h.code}</p>
              )}
            </div>
          </div>
        ),
      },
      {
        header: "អាសយដ្ឋាន",
        render: (h) => (
          <div className="min-w-0">
            <p className="max-w-[220px] truncate text-slate-600 dark:text-slate-300">
              {h.address || "—"}
            </p>
            {h.cityProvince && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <MapPin className="h-3 w-3" />
                {h.cityProvince}
              </p>
            )}
          </div>
        ),
      },
      {
        header: "បន្ទប់",
        render: (h) =>
          typeof h.totalRooms === "number" ? (
            <div className="w-28">
              <p className="text-slate-700 dark:text-slate-200">
                <span className="font-semibold text-slate-800 dark:text-white">
                  {h.availableRooms}
                </span>
                <span className="text-slate-400"> / {h.totalRooms}</span>
              </p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  style={{
                    width: `${
                      h.totalRooms > 0
                        ? Math.min(
                            100,
                            Math.round((h.availableRooms / h.totalRooms) * 100)
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <span className="text-slate-400">—</span>
          ),
      },
      {
        header: "ស្ថានភាព",
        render: (h) => <StatusPill status={h.status} />,
      },
      {
        header: "បង្កើត",
        render: (h) => (
          <span className="text-slate-500 dark:text-slate-400">
            {new Date(h.createdAt).toLocaleDateString("en-GB")}
          </span>
        ),
      },
      {
        header: "",
        className: "text-right",
        render: (h) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-800 dark:hover:text-slate-300"
                  aria-label="ម៉ឺនុយ"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
              items={buildActions(h)}
            />
          </div>
        ),
      },
    ],
    [buildActions]
  );

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className={`min-w-0 space-y-6 ${KH}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <Skeleton className="h-36 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-w-0 space-y-6 ${KH}`}>
      {/* ======================= HEADER ======================= */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            អចលនទ្រព្យ
          </h1>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងផ្ទះ និងបន្ទប់ជួលរបស់អ្នក។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchHouses}
          >
            ធ្វើឱ្យស្រស់
          </Button>
          {!readOnly && (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={openCreate}
            >
              បន្ថែមអចលនទ្រព្យ
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="កំហុស"
          description={error}
          dismissible
        />
      )}

      {/* ======================= STATS ======================= */}
      {houses.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="សរុប"
            value={stats.total}
            icon={<Building2 className="h-5 w-5" />}
            iconClass="bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300"
          />
          <StatCard
            label="សកម្ម"
            value={stats.active}
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          />
          <StatCard
            label="កំពុងជួសជុល"
            value={stats.maintenance}
            icon={<Wrench className="h-5 w-5" />}
            iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
          />
          <StatCard
            label="បន្ទប់ទំនេរ"
            value={stats.availableRooms}
            icon={<DoorOpen className="h-5 w-5" />}
            iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
          />
        </div>
      )}

      {/* ======================= FILTERS + VIEW TOGGLE ======================= */}
      {houses.length > 0 && (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ លេខកូដ ឬអាសយដ្ឋាន..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-44">
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
            {(search || statusFilter) && (
              <button
                onClick={clearFilters}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-[12.5px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-3.5 w-3.5" />
                សម្អាត
              </button>
            )}
            <div className="ml-auto flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
              <ViewToggle
                active={view === "grid"}
                label="ក្រឡាចត្រង្គ"
                icon={<LayoutGrid className="h-4 w-4" />}
                onClick={() => setView("grid")}
              />
              <ViewToggle
                active={view === "table"}
                label="បញ្ជី"
                icon={<List className="h-4 w-4" />}
                onClick={() => setView("table")}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================= CONTENT ======================= */}
      {houses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="មិនទាន់មានអចលនទ្រព្យទេ"
          description="ចាប់ផ្តើមដោយបន្ថែមអចលនទ្រព្យដំបូងរបស់អ្នក។"
          action={
            !readOnly ? (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={openCreate}
              >
                បន្ថែមអចលនទ្រព្យ
              </Button>
            ) : null
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="រកមិនឃើញលទ្ធផលត្រូវនឹងលក្ខខណ្ឌទេ"
          description="សូមព្យាយាមកែតម្រូវលក្ខខណ្ឌនៃការស្វែងរក ឬតម្រង។"
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              សម្អាតតម្រង
            </Button>
          }
        />
      ) : view === "table" ? (
        /* ----------------------- TABLE VIEW ----------------------- */
        <Card className="min-w-0 overflow-hidden rounded-xl border-slate-200/80 dark:border-gray-800">
          <div className="w-full overflow-x-auto">
            <Table
              columns={columns}
              data={filtered}
              onRowClick={(h) => navigate(`${basePath}/properties/${h.id}`)}
            />
          </div>
        </Card>
      ) : (
        /* ----------------------- GRID VIEW ----------------------- */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((house) => (
            <article
              key={house.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/10 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-black/30"
            >
              {/* ---- Media header ---- */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-gray-800">
                {house.primaryImage ? (
                  <img
                    src={house.primaryImage}
                    alt={house.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/5 to-transparent" />

                {/* Status badge */}
                <div className="absolute left-3 top-3">
                  <StatusPill status={house.status} onImage />
                </div>

                {/* Actions menu */}
                <div className="absolute right-2.5 top-2.5" onClick={(e) => e.stopPropagation()}>
                  <Dropdown
                    trigger={
                      <button
                        type="button"
                        className="rounded-md bg-slate-900/45 p-1.5 text-white/90 backdrop-blur-sm transition-colors hover:bg-slate-900/65 hover:text-white"
                        aria-label="ម៉ឺនុយ"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    }
                    items={buildActions(house)}
                  />
                </div>

                {/* City */}
                {house.cityProvince && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[12px] font-medium text-white">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{house.cityProvince}</span>
                  </div>
                )}
              </div>

              {/* ---- Body ---- */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">
                      {house.name}
                    </h3>
                    {house.code && (
                      <p className="mt-0.5 font-mono text-[11.5px] text-slate-400">
                        {house.code}
                      </p>
                    )}
                  </div>
                </div>

                {house.address && (
                  <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {house.address}
                  </p>
                )}

                {typeof house.totalRooms === "number" && (
                  <div className="mt-4">
                    <RoomsProgress house={house} />
                  </div>
                )}
              </div>

              {/* ---- Footer ---- */}
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3.5 dark:border-gray-800">
                <p className="min-w-0 truncate text-[11px] text-slate-400 dark:text-slate-500">
                  បង្កើត{" "}
                  {new Date(house.createdAt).toLocaleDateString("en-GB")}
                </p>
                <button
                  onClick={() =>
                    navigate(`${basePath}/properties/${house.id}`)
                  }
                  className="group/link inline-flex shrink-0 items-center gap-1 rounded-md text-[12.5px] font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  មើលលម្អិត
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ======================= DELETE CONFIRM ======================= */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="លុបអចលនទ្រព្យ"
        description={`តើអ្នកប្រាកដថាចង់លុប "${deleteTarget?.name}"? សកម្មភាពនេះមិនអាចបញ្ឈប់បានទេ។`}
        confirmText="លុប"
        cancelText="បោះបង់"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ======================= CREATE / EDIT MODAL ======================= */}
      <Modal
        open={!!formModal}
        onClose={() => setFormModal(null)}
        title={
          formModal === "create" ? "បន្ថែមអចលនទ្រព្យ" : "កែប្រែអចលនទ្រព្យ"
        }
        size="lg"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setFormModal(null)}
              disabled={formLoading}
            >
              បោះបង់
            </Button>
            <Button onClick={handleSubmit} loading={formLoading}>
              {formModal === "create"
                ? "បង្កើតអចលនទ្រព្យ"
                : "រក្សាទុកការផ្លាស់ប្តូរ"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* ---------- Basic Information ---------- */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              ព័ត៌មានទូទៅ
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="ឈ្មោះ"
                required
                placeholder="ឧ. Sunset Apartments"
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                error={formErrors.name}
              />
              <Input
                label="លេខកូដ"
                required
                placeholder="ឧ. SA-001"
                value={form.code}
                onChange={(e) => handleFormChange("code", e.target.value)}
                error={formErrors.code}
              />
              <Input
                label="លេខកូដប្រៃសណីយ៍"
                placeholder="ឧ. 12345"
                value={form.postalCode}
                onChange={(e) => handleFormChange("postalCode", e.target.value)}
              />
              <Input
                label="ក្រុង/ខេត្ត (City/Province)"
                placeholder="ឧ. រាជធានីភ្នំពេញ"
                value={form.cityProvince}
                onChange={(e) =>
                  handleFormChange("cityProvince", e.target.value)
                }
              />
              <div className="sm:col-span-2">
                <Input
                  label="អាសយដ្ឋាន"
                  required
                  placeholder="អាសយដ្ឋានពេញលេញ"
                  value={form.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  error={formErrors.address}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="ការពិពណ៌នា"
                  placeholder="ការពិពណ៌នាបន្ថែម (ស្រេចចិត្ត)..."
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {/* ---------- Location ---------- */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              ទីតាំង
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Google Maps URL"
                  placeholder="https://maps.google.com/..."
                  value={form.googleMapsUrl}
                  onChange={(e) =>
                    handleFormChange("googleMapsUrl", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink className="h-4 w-4" />}
                  disabled={!getMapsUrl(null, null, form.googleMapsUrl)}
                  onClick={() =>
                    openInGoogleMaps(null, null, form.googleMapsUrl)
                  }
                >
                  មើលដោយ Google Maps
                </Button>
              </div>
            </div>
          </section>

          {/* ---------- Status + read-only room summary ---------- */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              ស្ថានភាព
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="ស្ថានភាព"
                options={STATUS_FORM_OPTIONS}
                value={form.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
              />
              {formModal !== "create" &&
                formModal &&
                typeof formModal.totalRooms === "number" && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-gray-800 dark:bg-gray-800/50">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      បន្ទប់ (គណនាដោយស្វ័យប្រវត្តិ)
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-[13px] text-slate-700 dark:text-slate-200">
                      <span>
                        សរុប{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formModal.totalRooms}
                        </span>
                      </span>
                      <span>
                        ទំនេរ{" "}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formModal.availableRooms ?? 0}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </section>
        </div>
      </Modal>

      {/* ======================= ONBOARDING MODAL ======================= */}
      <Modal
        open={!!onboardingTarget}
        onClose={() => {
          setOnboardingTarget(null);
          setOnboardingStep("choice");
        }}
        title={
          onboardingStep === "choice"
            ? "រៀបចំអចលនទ្រព្យថ្មី"
            : "រៀបចំអចលនទ្រព្យដែលមានស្រាប់"
        }
        size="lg"
      >
        <div className="space-y-5">
          {onboardingStep === "choice" ? (
            <>
              <p className="text-[13.5px] leading-[1.9] text-slate-500 dark:text-slate-400">
                តើផ្ទះ "{onboardingTarget?.name}" ជាអចលនទ្រព្យថ្មី ឬមានទិន្នន័យជួលដែលមានស្រាប់?
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ChoiceCard
                  icon={Plus}
                  title="អចលនទ្រព្យថ្មី"
                  description="មិនទាន់មានទិន្នន័យជួល។ បន្ថែមបន្ទប់ អ្នកជួល និងកិច្ចសន្យាពេលក្រោយ។"
                  onClick={() => {
                    setOnboardingTarget(null);
                    setOnboardingStep("choice");
                    navigate(`${basePath}/properties/${onboardingTarget.id}`);
                  }}
                />
                <ChoiceCard
                  icon={FileSpreadsheet}
                  title="អចលនទ្រព្យដែលមានស្រាប់"
                  description="ផ្ទះនេះមានបន្ទប់ អ្នកជួល និងកិច្ចសន្យាដែលមានស្រាប់។"
                  onClick={() => setOnboardingStep("existing")}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-[13.5px] leading-[1.9] text-slate-500 dark:text-slate-400">
                តើអ្នកចង់បញ្ចូលទិន្នន័យដែលមានស្រាប់ដោយរបៀបណា?
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ChoiceCard
                  icon={Hand}
                  title="បញ្ចូលដោយដៃ"
                  description="បញ្ចូលព័ត៌មានបន្ទប់ អ្នកជួល និងកិច្ចសន្យាដោយដៃ។"
                  onClick={() => {
                    setOnboardingTarget(null);
                    setOnboardingStep("choice");
                    navigate(
                      `${basePath}/properties/${onboardingTarget.id}/onboarding/manual`
                    );
                  }}
                />
                <ChoiceCard
                  icon={FileSpreadsheet}
                  title="នាំចូល CSV/Excel"
                  description="ផ្ទុកឡើងឯកសារ CSV/Excel ដើម្បីនាំចូលទិន្នន័យ។"
                  onClick={() => {
                    setOnboardingTarget(null);
                    setOnboardingStep("choice");
                    navigate(
                      `${basePath}/properties/${onboardingTarget.id}/onboarding/import`
                    );
                  }}
                />
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-gray-800">
            <div>
              {onboardingStep === "existing" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOnboardingStep("choice")}
                >
                  ត្រឡប់ក្រោយ
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOnboardingTarget(null);
                setOnboardingStep("choice");
              }}
            >
              នៅពេលក្រោយ
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================= VIEW DETAILS MODAL ======================= */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget?.name}
        size="lg"
      >
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-mono text-[12px] text-slate-400">
                  {viewTarget.code}
                </p>
                <Badge
                  variant={STATUS_VARIANT[viewTarget.status] || "default"}
                  className="mt-1"
                >
                  {STATUS_OPTIONS.find((o) => o.value === viewTarget.status)
                    ?.label || viewTarget.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Slug" value={viewTarget.slug} />
              <DetailField
                label="អាសយដ្ឋាន"
                value={viewTarget.address}
                icon={MapPin}
              />
              <DetailField
                label="លេខកូដប្រៃសណីយ៍"
                value={viewTarget.postalCode || "—"}
              />
              <DetailField
                label="បន្ទប់សរុប"
                value={viewTarget.totalRooms ?? 0}
                icon={BedDouble}
              />
              <DetailField
                label="បន្ទប់ទំនេរ"
                value={viewTarget.availableRooms ?? 0}
                icon={BedDouble}
              />
            </div>

            <div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="h-4 w-4" />}
                disabled={
                  !getMapsUrl(
                    viewTarget.latitude,
                    viewTarget.longitude,
                    viewTarget.googleMapsUrl
                  )
                }
                onClick={() =>
                  openInGoogleMaps(
                    viewTarget.latitude,
                    viewTarget.longitude,
                    viewTarget.googleMapsUrl
                  )
                }
              >
                មើលដោយ Google Maps
              </Button>
            </div>

            {viewTarget.description && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  ការពិពណ៌នា
                </p>
                <p className="mt-1 text-[13.5px] leading-[1.9] text-slate-700 dark:text-slate-200">
                  {viewTarget.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 dark:border-gray-800 sm:grid-cols-2">
              <DetailField
                label="បានបង្កើត"
                value={new Date(viewTarget.createdAt).toLocaleString()}
              />
              <DetailField
                label="បានធ្វើបច្ចុប្បន្នភាព"
                value={new Date(viewTarget.updatedAt).toLocaleString()}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ======================= Sub-components ======================= */

const ViewToggle = ({ active, label, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={`មើល ${label}`}
    className={`
      inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors
      ${
        active
          ? "bg-slate-100 text-slate-800 dark:bg-gray-800 dark:text-white"
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      }
    `}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, iconClass }) => (
  <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-800 dark:text-white">
          <CountUp value={value} />
        </p>
      </div>
    </div>
  </div>
);

const StatusPill = ({ status, onImage = false }) => {
  const meta = STATUS_META[status] || STATUS_META.INACTIVE;
  if (onImage) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.bg} ${meta.text} ${meta.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

const RoomsProgress = ({ house }) => {
  const total = house.totalRooms ?? 0;
  const available = house.availableRooms ?? 0;
  const pct =
    total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <BedDouble className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          បន្ទប់ទំនេរ
        </span>
        <span className="font-semibold text-slate-800 dark:text-white">
          {available}
          <span className="font-normal text-slate-400 dark:text-slate-500">
            {" "}
            / {total}
          </span>
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const ChoiceCard = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-primary/40 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary/50"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-primary group-hover:text-white dark:bg-gray-800 dark:text-slate-300">
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </div>
    <div>
      <p className="text-[13.5px] font-semibold text-slate-800 dark:text-white">
        {title}
      </p>
      <p className="mt-1 text-[12.5px] leading-[1.9] text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  </button>
);

const DetailField = ({ label, value, icon: Icon }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
      {label}
    </p>
    <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-slate-800 dark:text-white">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
      <span className="truncate">{value}</span>
    </p>
  </div>
);

export default Properties;