import { useState, useMemo } from "react";
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

const EMPTY_FORM = {
  name: "",
  slug: "",
  code: "",
  address: "",
  postalCode: "",
  latitude: "",
  longitude: "",
  totalRooms: "",
  availableRooms: "",
  description: "",
  status: "ACTIVE",
};

const Properties = () => {
  const { houses, loading, error, fetchHouses, createHouse, updateHouse, deleteHouse } = useHouses();
  const { isOwner, isManager } = useMyRoles();
  const toast = useToast();
  const navigate = useNavigate();
  const basePath = useBasePath();

  const readOnly = isManager && !isOwner;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  const [formModal, setFormModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

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

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormModal("create");
  };

  const openEdit = (house) => {
    setForm({
      name: house.name || "",
      slug: house.slug || "",
      code: house.code || "",
      address: house.address || "",
      postalCode: house.postalCode || "",
      latitude: house.latitude || "",
      longitude: house.longitude || "",
      totalRooms: house.totalRooms ?? "",
      availableRooms: house.availableRooms ?? "",
      description: house.description || "",
      status: house.status || "ACTIVE",
    });
    setFormErrors({});
    setFormModal(house);
    setMenuOpen(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "តម្រូវឱ្យបញ្ចូលឈ្មោះ";
    if (!form.slug.trim()) errs.slug = "តម្រូវឱ្យបញ្ចូល Slug";
    if (!form.code.trim()) errs.code = "តម្រូវឱ្យបញ្ចូលលេខកូដ";
    if (!form.address.trim()) errs.address = "តម្រូវឱ្យបញ្ចូលអាសយដ្ឋាន";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        code: form.code.trim(),
        address: form.address.trim(),
        postalCode: form.postalCode.trim() || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        totalRooms: form.totalRooms !== "" ? parseInt(form.totalRooms) : 0,
        availableRooms: form.availableRooms !== "" ? parseInt(form.availableRooms) : 0,
        description: form.description.trim() || null,
      };

      if (formModal === "create") {
        await createHouse(payload);
        toast.success("អចលនទ្រព្យត្រូវបានបង្កើត", "អចលនទ្រព្យថ្មីត្រូវបានបន្ថែមដោយជោគជ័យ។");
      } else {
        await updateHouse(formModal.id, { ...payload, status: form.status });
        toast.success("អចលនទ្រព្យត្រូវបានកែប្រែ", "ព័ត៌មានលម្អិតនៃអចលនទ្រព្យត្រូវបានរក្សាទុក។");
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
      toast.success("អចលនទ្រព្យត្រូវបានលុប", `"${deleteTarget.name}" ត្រូវបានលុប។`);
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

  if (loading) {
    return (
      <div className="space-y-6">
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
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1.5 h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-7 rounded-md" />
                </div>
                <Skeleton className="mt-3 h-3.5 w-48" />
                <div className="mt-4 flex items-center gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="mt-3 h-3.5 w-full" />
              </div>
              <div className="border-t border-slate-100 px-5 py-3 dark:border-gray-800">
                <Skeleton className="h-3 w-36" />
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
            អចលនទ្រព្យ
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងផ្ទះ និងបន្ទប់ជួលរបស់អ្នក។
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchHouses}
          >
            ធ្វើឱ្យស្រស់
          </Button>
          {!readOnly && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              បន្ថែមអចលនទ្រព្យ
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុស" description={error} dismissible />
      )}

      {/* Filters */}
      {houses.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ លេខកូដ ឬអាសយដ្ឋាន..."
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

      {/* Empty state */}
      {!loading && houses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="មិនទាន់មានអចលនទ្រព្យទេ"
          description="ចាប់ផ្តើមដោយបន្ថែមអចលនទ្រព្យដំបូងរបស់អ្នក។"
          action={
            !readOnly ? (
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
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
        />
      ) : (
        /* Cards grid */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((house) => (
            <div
              key={house.id}
              className="group relative rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md hover:shadow-slate-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-black/20"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                        {house.name}
                      </h3>
                      {house.code && (
                        <p className="text-[12px] font-mono text-slate-400 dark:text-slate-500">
                          {house.code}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === house.id ? null : house.id)
                      }
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-800 dark:hover:text-slate-300"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {menuOpen === house.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                          <button
                            onClick={() => {
                              setMenuOpen(null);
                              navigate(`${basePath}/properties/${house.id}`);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4" /> មើលព័ត៌មានលម្អិត
                          </button>
                          {!readOnly && (
                            <>
                              <button
                                onClick={() => openEdit(house)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-700"
                              >
                                <Edit3 className="h-4 w-4" /> កែប្រែ
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget(house);
                                  setMenuOpen(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" /> លុប
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {house.address && (
                  <div className="mt-3 flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{house.address}</span>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-300">
                    <BedDouble className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span>
                      {house.availableRooms}/{house.totalRooms} បន្ទប់
                    </span>
                  </div>
                  <Badge variant={STATUS_VARIANT[house.status] || "default"}>
                    {STATUS_OPTIONS.find((o) => o.value === house.status)?.label || house.status}
                  </Badge>
                </div>

                {house.description && (
                  <p className="mt-3 line-clamp-2 text-[13px] text-slate-500 dark:text-slate-400">
                    {house.description}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 px-5 py-3 dark:border-gray-800">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  បានបង្កើត {new Date(house.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
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

      {/* Create / Edit modal */}
      <Modal
        open={!!formModal}
        onClose={() => setFormModal(null)}
        title={formModal === "create" ? "បន្ថែមអចលនទ្រព្យ" : "កែប្រែអចលនទ្រព្យ"}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setFormModal(null)} disabled={formLoading}>
              បោះបង់
            </Button>
            <Button onClick={handleSubmit} loading={formLoading}>
              {formModal === "create" ? "បង្កើតអចលនទ្រព្យ" : "រក្សាទុកការផ្លាស់ប្តូរ"}
            </Button>
          </div>
        }
      >
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
            label="Slug"
            required
            placeholder="ឧ. sunset-apartments"
            value={form.slug}
            onChange={(e) => handleFormChange("slug", e.target.value)}
            error={formErrors.slug}
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
          <Input
            label="រយៈទទឹង"
            type="number"
            step="any"
            placeholder="ឧ. 10.762622"
            value={form.latitude}
            onChange={(e) => handleFormChange("latitude", e.target.value)}
          />
          <Input
            label="រយៈបណ្តោយ"
            type="number"
            step="any"
            placeholder="ឧ. 106.660172"
            value={form.longitude}
            onChange={(e) => handleFormChange("longitude", e.target.value)}
          />
          <Input
            label="ចំនួនបន្ទប់សរុប"
            type="number"
            min="0"
            placeholder="0"
            value={form.totalRooms}
            onChange={(e) => handleFormChange("totalRooms", e.target.value)}
          />
          <Input
            label="ចំនួនបន្ទប់ទំនេរ"
            type="number"
            min="0"
            placeholder="0"
            value={form.availableRooms}
            onChange={(e) => handleFormChange("availableRooms", e.target.value)}
          />
          <Select
            label="ស្ថានភាព"
            options={STATUS_FORM_OPTIONS}
            value={form.status}
            onChange={(e) => handleFormChange("status", e.target.value)}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="ការពិពណ៌នា"
              placeholder="ការពិពណ៌នាបន្ថែម (ស្រេចចិត្ត)..."
              rows={3}
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* View details modal */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget?.name}
        size="lg"
      >
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-[13px] font-mono text-slate-400 dark:text-slate-500">{viewTarget.code}</p>
                <Badge variant={STATUS_VARIANT[viewTarget.status] || "default"} className="mt-1">
                  {STATUS_OPTIONS.find((o) => o.value === viewTarget.status)?.label || viewTarget.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Slug</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{viewTarget.slug}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">អាសយដ្ឋាន</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {viewTarget.address}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">លេខកូដប្រៃសណីយ៍</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{viewTarget.postalCode || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">បន្ទប់</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
                  <BedDouble className="h-4 w-4 text-slate-400" />
                  {viewTarget.availableRooms}/{viewTarget.totalRooms} ទំនេរ
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">រយៈទទឹង</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{viewTarget.latitude ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">រយៈបណ្តោយ</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{viewTarget.longitude ?? "—"}</p>
              </div>
            </div>

            {viewTarget.description && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ការពិពណ៌នា</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{viewTarget.description}</p>
              </div>
            )}

            <div className="flex items-center gap-6 border-t border-slate-100 pt-4 dark:border-gray-800">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">បានបង្កើត</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{new Date(viewTarget.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">បានធ្វើបច្ចុប្បន្នភាព</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{new Date(viewTarget.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Properties;
