// src/pages/Properties.jsx
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
  FileSpreadsheet,
  Hand,
  ExternalLink,
  X,
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
  cityProvince: "",
  googleMapsUrl: "",
  postalCode: "",
  latitude: "",
  longitude: "",
  totalRooms: "",
  availableRooms: "",
  description: "",
  status: "ACTIVE",
};

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
      cityProvince: house.cityProvince || "",
      googleMapsUrl: house.googleMapsUrl || "",
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
    if (!form.slug.trim()) errs.slug = "តម្រូវឱ្យបញ្ចូល Slug";
    if (!form.code.trim()) errs.code = "តម្រូវឱ្យបញ្ចូលលេខកូដ";
    if (!form.address.trim()) errs.address = "តម្រូវឱ្យបញ្ចូលអាសយដ្ឋាន";
    const numLat = Number(form.latitude);
    const numLng = Number(form.longitude);
    if (
      form.latitude !== "" &&
      (Number.isNaN(numLat) || numLat < -90 || numLat > 90)
    ) {
      errs.latitude = "រយៈទទឹងត្រូវស្ថិតនៅចន្លោះ -90 និង 90";
    }
    if (
      form.longitude !== "" &&
      (Number.isNaN(numLng) || numLng < -180 || numLng > 180)
    ) {
      errs.longitude = "រយៈបណ្តោយត្រូវស្ថិតនៅចន្លោះ -180 និង 180";
    }
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
        cityProvince: form.cityProvince.trim() || null,
        googleMapsUrl: form.googleMapsUrl.trim() || null,
        postalCode: form.postalCode.trim() || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        totalRooms: form.totalRooms !== "" ? parseInt(form.totalRooms) : 0,
        availableRooms:
          form.availableRooms !== "" ? parseInt(form.availableRooms) : 0,
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

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className={`space-y-6 ${KH}`}>
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
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
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
    <div className={`space-y-6 ${KH}`}>
      {/* ======================= HEADER ======================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0f2942]">
            អចលនទ្រព្យ
          </h1>
          <p className="mt-1 text-[13px] text-gray-500">
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

      {/* ======================= FILTERS ======================= */}
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
          {(search || statusFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3.5 text-[12.5px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <X className="h-3.5 w-3.5" />
              សម្អាត
            </button>
          )}
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
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((house) => (
            <article
              key={house.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300"
            >
              {/* ---- Media header ---- */}
              <div className="relative h-40 w-full overflow-hidden bg-gray-50">
                {house.primaryImage ? (
                  <img
                    src={house.primaryImage}
                    alt={house.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-9 w-9 text-gray-300" />
                  </div>
                )}

                {/* Menu button top-right */}
                <div className="absolute right-2 top-2">
                  <button
                    onClick={() =>
                      setMenuOpen(menuOpen === house.id ? null : house.id)
                    }
                    className="rounded-md bg-white/90 p-1.5 text-gray-600 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-[#0f2942]"
                    aria-label="ម៉ឺនុយ"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {menuOpen === house.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(null)}
                      />
                      <div className="absolute right-0 z-50 mt-1.5 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        <MenuItem
                          icon={Eye}
                          label="មើលព័ត៌មានលម្អិត"
                          onClick={() => {
                            setMenuOpen(null);
                            setViewTarget(house);
                          }}
                        />
                        <MenuItem
                          icon={Hand}
                          label="បញ្ចូលដោយដៃ"
                          onClick={() => {
                            setMenuOpen(null);
                            navigate(
                              `${basePath}/properties/${house.id}/onboarding/manual`
                            );
                          }}
                        />
                        <MenuItem
                          icon={FileSpreadsheet}
                          label="នាំចូល CSV/Excel"
                          onClick={() => {
                            setMenuOpen(null);
                            navigate(
                              `${basePath}/properties/${house.id}/onboarding/import`
                            );
                          }}
                        />
                        {!readOnly && (
                          <>
                            <div className="my-1 h-px bg-gray-100" />
                            <MenuItem
                              icon={Edit3}
                              label="កែប្រែ"
                              onClick={() => openEdit(house)}
                            />
                            <MenuItem
                              icon={Trash2}
                              label="លុប"
                              danger
                              onClick={() => {
                                setDeleteTarget(house);
                                setMenuOpen(null);
                              }}
                            />
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ---- Body ---- */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14.5px] font-semibold text-[#0f2942]">
                      {house.name}
                    </h3>
                    {house.code && (
                      <p className="mt-0.5 font-mono text-[11.5px] text-gray-400">
                        {house.code}
                      </p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[house.status] || "default"}>
                    {STATUS_OPTIONS.find((o) => o.value === house.status)
                      ?.label || house.status}
                  </Badge>
                </div>

                {house.address && (
                  <div className="mt-3 flex items-start gap-1.5 text-[12.5px] text-gray-500">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">{house.address}</span>
                  </div>
                )}

                {house.description && (
                  <p className="mt-3 line-clamp-2 text-[12.5px] leading-[1.9] text-gray-500">
                    {house.description}
                  </p>
                )}

                {typeof house.totalRooms === "number" && (
                  <div className="mt-4 flex items-center gap-1.5 text-[12.5px] text-gray-600">
                    <BedDouble className="h-3.5 w-3.5 text-gray-400" />
                    <span>
                      <span className="font-semibold text-[#0f2942]">
                        {house.availableRooms}
                      </span>
                      <span className="text-gray-400">
                        {" "}
                        / {house.totalRooms}
                      </span>{" "}
                      បន្ទប់ទំនេរ
                    </span>
                  </div>
                )}
              </div>

              {/* ---- Footer ---- */}
              <div className="mt-auto flex items-center justify-between border-t border-gray-100 px-5 py-3">
                <p className="text-[11px] text-gray-400">
                  បង្កើត{" "}
                  {new Date(house.createdAt).toLocaleDateString("en-GB")}
                </p>
                <button
                  onClick={() => navigate(`${basePath}/properties/${house.id}`)}
                  className="text-[12px] font-medium text-[#0f2942] hover:underline"
                >
                  មើលលម្អិត →
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
          <div className="flex items-center justify-end gap-3">
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
          <Input
            label="ក្រុង/ខេត្ត (City/Province)"
            placeholder="ឧ. រាជធានីភ្នំពេញ"
            value={form.cityProvince}
            onChange={(e) => handleFormChange("cityProvince", e.target.value)}
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
            <Input
              label="Google Maps URL"
              placeholder="https://maps.google.com/..."
              value={form.googleMapsUrl}
              onChange={(e) =>
                handleFormChange("googleMapsUrl", e.target.value)
              }
            />
          </div>
          <Input
            label="រយៈទទឹង"
            type="number"
            step="any"
            placeholder="ឧ. 10.762622"
            value={form.latitude}
            onChange={(e) => handleFormChange("latitude", e.target.value)}
            error={formErrors.latitude}
          />
          <Input
            label="រយៈបណ្តោយ"
            type="number"
            step="any"
            placeholder="ឧ. 106.660172"
            value={form.longitude}
            onChange={(e) => handleFormChange("longitude", e.target.value)}
            error={formErrors.longitude}
          />
          <div className="sm:col-span-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="h-4 w-4" />}
              disabled={
                !getMapsUrl(form.latitude, form.longitude, form.googleMapsUrl)
              }
              onClick={() =>
                openInGoogleMaps(
                  form.latitude,
                  form.longitude,
                  form.googleMapsUrl
                )
              }
            >
              មើលដោយ Google Maps
            </Button>
          </div>
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
            onChange={(e) =>
              handleFormChange("availableRooms", e.target.value)
            }
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
              <p className="text-[13.5px] leading-[1.9] text-gray-500">
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
              <p className="text-[13.5px] leading-[1.9] text-gray-500">
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

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
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
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0f2942]">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-mono text-[12px] text-gray-400">
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
                label="បន្ទប់"
                value={`${viewTarget.availableRooms}/${viewTarget.totalRooms} ទំនេរ`}
                icon={BedDouble}
              />
              <DetailField
                label="រយៈទទឹង"
                value={viewTarget.latitude ?? "—"}
              />
              <DetailField
                label="រយៈបណ្តោយ"
                value={viewTarget.longitude ?? "—"}
              />
            </div>

            <div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="h-4 w-4" />}
                disabled={!getMapsUrl(viewTarget.latitude, viewTarget.longitude)}
                onClick={() =>
                  openInGoogleMaps(viewTarget.latitude, viewTarget.longitude)
                }
              >
                មើលដោយ Google Maps
              </Button>
            </div>

            {viewTarget.description && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  ការពិពណ៌នា
                </p>
                <p className="mt-1 text-[13.5px] leading-[1.9] text-[#0f2942]">
                  {viewTarget.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
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

const MenuItem = ({ icon: Icon, label, danger, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${
      danger
        ? "text-red-600 hover:bg-red-50"
        : "text-gray-700 hover:bg-gray-50"
    }`}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

const ChoiceCard = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-[#0f2942]/40"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-[#0f2942]">
      <Icon
        className="h-5 w-5 text-[#0f2942] transition-colors group-hover:text-white"
        strokeWidth={1.75}
      />
    </div>
    <div>
      <p className="text-[13.5px] font-semibold text-[#0f2942]">{title}</p>
      <p className="mt-1 text-[12.5px] leading-[1.9] text-gray-500">
        {description}
      </p>
    </div>
  </button>
);

const DetailField = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
      {label}
    </p>
    <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-[#0f2942]">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
      {value}
    </p>
  </div>
);

export default Properties;