import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, DoorOpen, RefreshCw, ScanEye, Send, CheckCircle2,
  Plus, Trash2, Home, Layers, Building2, MapPin, Sparkles, Zap, Compass,
  ExternalLink, Image as ImageIcon, DollarSign, BedDouble, Bath, Maximize,
  Calendar, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  Card, Button, Input, Select, Textarea, Checkbox, Alert, Skeleton, EmptyState,
} from "../ui/index.js";
import ImageGallery from "../ImageGallery.jsx";
import RoomDetailView from "./RoomDetailView.jsx";
import { useToast } from "../ui/Toast.jsx";
import { ownerAdminApi } from "../../api/ownerAdmin.api";
import { adminRoomsApi } from "../../api/adminRooms.api";
import { roomApi } from "../../api/room.api";
import { houseApi } from "../../api/house.api";
import { roomTypeApi } from "../../api/roomType.api";
import { roomUtilityApi } from "../../api/roomUtility.api";
import { utilityTypeApi } from "../../api/utilityType.api";
import { utilityRateApi } from "../../api/utilityRate.api";
import { roomPublicationApi } from "../../api/roomPublication.api";
import { useHouseImages } from "../../hooks/useHouseImages";
import { useRoomTypeImages } from "../../hooks/useRoomTypeImages";
import { canSubmitRoom } from "../../utils/roomPublication";
import { buildOwnerListingPreview } from "../../utils/roomPublicPreview";

const CREATE_HOUSE = "__new__";
const CREATE_ROOM_TYPE = "__new__";
const CREATE_OWNER = "__new__";

const EMPTY_LISTING = {
  monthlyRent: "", securityDeposit: "", advancePayment: "", capacity: 1,
  bedrooms: "", bathrooms: "", areaSqm: "", landSizeSqm: "", numberOfFloors: "",
  furnishing: "", propertyType: "", listingScope: "", availableFrom: "",
  status: "AVAILABLE", description: "",
};
const EMPTY_ROOM_ROW = { roomNumber: "", name: "", floorNumber: "" };
const EMPTY_HOUSE_FORM = {
  name: "", slug: "", code: "", address: "", postalCode: "", cityProvince: "",
  latitude: "", longitude: "", googleMapsUrl: "", propertyType: "",
  furnishing: "", areaSqm: "", description: "",
};
const EMPTY_ROOM_TYPE_FORM = {
  name: "", code: "", description: "", capacity: 1,
  defaultRent: "", defaultDeposit: "",
};
const EMPTY_OWNER_FORM = {
  username: "", email: "", password: "", firstName: "", lastName: "", phone: "",
};

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "ទំនេរ (Available)" },
  { value: "OCCUPIED", label: "មានអ្នកស្នាក់នៅ (Occupied)" },
  { value: "MAINTENANCE", label: "កំពុងជួសជុល (Maintenance)" },
  { value: "RESERVED", label: "បានកក់ (Reserved)" },
];
const PROPERTY_TYPE_OPTIONS = [
  { value: "", label: "មិនកំណត់" },
  { value: "APARTMENT", label: "អាផាតមិន (Apartment)" },
  { value: "CONDO", label: "ខុនដូ (Condo)" },
  { value: "HOUSE", label: "ផ្ទះ (House)" },
  { value: "VILLA", label: "វីឡា (Villa)" },
  { value: "ROOM", label: "បន្ទប់ (Room)" },
  { value: "SINGLE_ROOM", label: "បន្ទប់ទោល (Single Room)" },
];
const ADMIN_PROPERTY_TYPE_OPTIONS = [
  { value: "HOUSE", label: "ផ្ទះ (House)" },
  { value: "VILLA", label: "វីឡា (Villa)" },
  { value: "APARTMENT", label: "អាផាតមិន (Apartment)" },
  { value: "CONDO", label: "ខុនដូ (Condo)" },
  { value: "ROOM", label: "បន្ទប់ (Room)" },
];
const LISTING_SCOPE_OPTIONS = [
  { value: "", label: "មិនកំណត់" },
  { value: "ENTIRE_PLACE", label: "ផ្ទះទាំងមូល" },
  { value: "PRIVATE_ROOM", label: "បន្ទប់ឯកជន" },
  { value: "SHARED_ROOM", label: "បន្ទប់រួមគ្នា" },
];
const FURNISHING_OPTIONS = [
  { value: "", label: "មិនកំណត់" },
  { value: "FULLY_FURNISHED", label: "មានសង្ហារិមពេញលេញ" },
  { value: "SEMI_FURNISHED", label: "មានសង្ហារិមខ្លះ" },
  { value: "UNFURNISHED", label: "គ្មានសង្ហារិម" },
];
const NEARBY_CATEGORY_OPTIONS = [
  { value: "SCHOOL", label: "សាលារៀន (School)" },
  { value: "UNIVERSITY", label: "សាកលវិទ្យាល័យ (University)" },
  { value: "HOSPITAL", label: "មន្ទីរពេទ្យ (Hospital)" },
  { value: "MALL", label: "ផ្សារទំនើប (Mall)" },
  { value: "MARKET", label: "ផ្សារ (Market)" },
  { value: "RESTAURANT", label: "ភោជនីយដ្ឋាន (Restaurant)" },
  { value: "BANK", label: "ធនាគារ (Bank)" },
  { value: "TOURIST_SPOT", label: "កន្លែងទេសចរណ៍ (Tourist Spot)" },
  { value: "BUS_STOP", label: "ចំណតឡាន (Bus Stop)" },
  { value: "OTHER", label: "ផ្សេងៗ (Other)" },
];

const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const mapMapsUrl = (house) =>
  house?.googleMapsUrl ||
  (house?.latitude != null && house?.longitude != null
    ? `https://www.google.com/maps/search/?api=1&query=${house.latitude},${house.longitude}`
    : null);

/* ============================================================
   PHASE WRAPPER
   ============================================================ */
const Phase = ({ index, total, title, subtitle, status, children }) => (
  <section className="space-y-3">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-colors ${
          status === "done"
            ? "bg-emerald-500 text-white"
            : status === "active"
            ? "bg-[#0f2942] text-white ring-4 ring-[#0f2942]/10 dark:bg-sky-500 dark:ring-sky-500/20"
            : "bg-slate-200 text-slate-500 dark:bg-gray-800 dark:text-slate-400"
        }`}
      >
        {status === "done" ? <CheckCircle2 className="h-4 w-4" /> : index}
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
          ជំហាន {index} / {total}
        </p>
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
    <div className="space-y-3 pl-0 sm:pl-12">{children}</div>
  </section>
);

/* ============================================================
   COLLAPSIBLE
   ============================================================ */
const Collapsible = ({ title, hint, icon: Icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/50"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />}
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">{title}</p>
            {hint && (
              <p className="mt-0.5 truncate text-[11.5px] text-slate-500 dark:text-slate-400">
                {hint}
              </p>
            )}
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-4 dark:border-gray-800">
          {children}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   INLINE NOTICE
   ============================================================ */
const InlineNotice = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[11.5px] leading-relaxed text-slate-500 dark:border-gray-800 dark:bg-gray-800/30 dark:text-slate-400">
    {Icon && <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
    <span>{children}</span>
  </div>
);

/* ============================================================
   SUMMARY STRIP
   ============================================================ */
const SummaryStrip = ({ owner, house, roomType, roomsCount, listing }) => {
  const items = [
    { label: "ម្ចាស់", value: owner?.username || owner?.email || "—", icon: Users },
    { label: "ញ្ញា", value: house?.name || "—", icon: Building2 },
    { label: "ប្រភេទ", value: roomType?.name || listing.propertyType || "—", icon: Layers },
    { label: "បន្ទប់", value: roomsCount > 0 ? `${roomsCount}` : "—", icon: DoorOpen },
    {
      label: "ថ្លៃជួល",
      value: listing.monthlyRent ? `$${listing.monthlyRent}` : "—",
      icon: DollarSign,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 dark:border-gray-800 dark:bg-gray-900"
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="truncate text-[12px] font-medium text-slate-800 dark:text-slate-200">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function RoomListingEditor({
  mode = "admin",
  roomId = null,
  onBack,
  basePath = "",
  submissionsPath = "/admin/submissions",
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const isAdmin = mode === "admin";

  const [listing, setListing] = useState(EMPTY_LISTING);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Inline preview mode (no navigation, no sidebar)
  const [previewMode, setPreviewMode] = useState(false);

  // Admin state
  const [owners, setOwners] = useState([]);
  const [ownersError, setOwnersError] = useState(null);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [ownerId, setOwnerId] = useState("");
  const [ownerCreateOpen, setOwnerCreateOpen] = useState(false);
  const [ownerForm, setOwnerForm] = useState(EMPTY_OWNER_FORM);
  const [ownerFormErrors, setOwnerFormErrors] = useState({});
  const [savingOwner, setSavingOwner] = useState(false);
  const [houses, setHouses] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [houseId, setHouseId] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [rooms, setRooms] = useState([{ ...EMPTY_ROOM_ROW }]);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [submittedRooms, setSubmittedRooms] = useState(null);
  const [publishedRooms, setPublishedRooms] = useState(null);
  const [adminSelectedRoomId, setAdminSelectedRoomId] = useState("");

  const [houseCreateOpen, setHouseCreateOpen] = useState(false);
  const [houseForm, setHouseForm] = useState(EMPTY_HOUSE_FORM);
  const [houseFormErrors, setHouseFormErrors] = useState({});
  const [savingHouse, setSavingHouse] = useState(false);

  const [roomTypeCreateOpen, setRoomTypeCreateOpen] = useState(false);
  const [roomTypeForm, setRoomTypeForm] = useState(EMPTY_ROOM_TYPE_FORM);
  const [roomTypeFormErrors, setRoomTypeFormErrors] = useState({});
  const [savingRoomType, setSavingRoomType] = useState(false);

  // Owner state
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerLoadError, setOwnerLoadError] = useState(null);
  const [room, setRoom] = useState(null);
  const [house, setHouse] = useState(null);
  const [roomType, setRoomType] = useState(null);
  const [roomMeta, setRoomMeta] = useState({ name: "", floorNumber: "" });

  const [assignedAmenities, setAssignedAmenities] = useState([]);
  const [masterAmenities, setMasterAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [amenityBusy, setAmenityBusy] = useState(null);

  const [assignedUtilities, setAssignedUtilities] = useState([]);
  const [masterUtilities, setMasterUtilities] = useState([]);
  const [utilityRates, setUtilityRates] = useState([]);
  const [utilityRateForms, setUtilityRateForms] = useState({});
  const [utilitiesLoading, setUtilitiesLoading] = useState(false);
  const [utilityBusy, setUtilityBusy] = useState(null);

  const [nearby, setNearby] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [newNearby, setNewNearby] = useState({
    name: "", category: "SCHOOL", distanceKm: "", travelMinutes: "",
  });
  const [savingNearby, setSavingNearby] = useState(false);
  const [nearbyErrors, setNearbyErrors] = useState({});

  const [saving, setSaving] = useState(false);
  const selectedHouse = isAdmin
    ? houses.find((h) => String(h.id) === String(houseId) || h.id === houseId) || null
    : house;
  const selectedRoomType = isAdmin
    ? roomTypes.find((rt) => String(rt.id) === String(roomTypeId) || rt.id === roomTypeId) || null
    : roomType;
  const selectedOwner = owners.find((o) => String(o.id) === String(ownerId)) || null;

  const adminPropertyType = isAdmin ? listing.propertyType : null;
  const isRoomLike = adminPropertyType === "ROOM";
  const isUnitLike = adminPropertyType === "APARTMENT" || adminPropertyType === "CONDO";
  const isStructureLike = adminPropertyType === "HOUSE" || adminPropertyType === "VILLA";

  const selectedHouseForImages = isAdmin ? selectedHouse : house;
  const selectedRoomTypeForImages = isAdmin ? selectedRoomType : roomType;
  const houseImages = useHouseImages(selectedHouseForImages?.id);
  const roomTypeImages = useRoomTypeImages(selectedRoomTypeForImages?.id);

  const loadOwners = useCallback(async () => {
    setLoadingOwners(true);
    setOwnersError(null);
    try {
      const page = await ownerAdminApi.listOwners({ page: 0, size: 100 });
      setOwners(page.content || []);
    } catch (err) {
      setOwnersError(
        err.response?.data?.message || err.response?.data?.error ||
          "មិនអាចផ្ទុកម្ចាស់អចលនទ្រព្យបានទេ។"
      );
    } finally {
      setLoadingOwners(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) loadOwners(); }, [isAdmin, loadOwners]);

  const loadOwnerProperty = useCallback(async (ownerIdToLoad) => {
    if (!ownerIdToLoad) return;
    try {
      const [houseList, roomTypeList] = await Promise.all([
        adminRoomsApi.getOwnerHouses(ownerIdToLoad),
        adminRoomsApi.getOwnerRoomTypes(ownerIdToLoad),
      ]);
      setHouses(houseList || []);
      setRoomTypes(roomTypeList || []);
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data?.error ||
        "មិនអាចផ្ទុកញ្ញា ឬប្រភេទបន្ទប់របស់ម្ចាស់បានទេ។";
      toast.error("កំហុស", message);
      setHouses([]); setRoomTypes([]);
    }
  }, [toast]);

  const handleOwnerChange = (value) => {
    if (value === CREATE_OWNER) {
      setOwnerForm(EMPTY_OWNER_FORM); setOwnerFormErrors({});
      setOwnerCreateOpen(true); setOwnerId("");
      setHouses([]); setRoomTypes([]); setHouseId(""); setRoomTypeId("");
      setErrors((prev) => ({ ...prev, ownerId: "", houseId: "", roomTypeId: "" }));
      return;
    }
    setOwnerCreateOpen(false);
    setOwnerId(value);
    setHouseId(""); setRoomTypeId("");
    setHouseCreateOpen(false); setRoomTypeCreateOpen(false);
    setRooms([{ ...EMPTY_ROOM_ROW }]);
    setErrors((prev) => ({ ...prev, ownerId: "", houseId: "", roomTypeId: "" }));
    if (value) loadOwnerProperty(value);
  };

  const handleOwnerFormChange = (name, value) => {
    setOwnerForm((prev) => ({ ...prev, [name]: value }));
    if (ownerFormErrors[name] || ownerFormErrors.form)
      setOwnerFormErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const validateOwnerForm = () => {
    const errs = {};
    if (ownerForm.username.trim().length < 3) errs.username = "ឈ្មោះអ្នកប្រើត្រូវមានយ៉ាងតិច ៣ តួអក្សរ";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ownerForm.email)) errs.email = "ត្រូវបញ្ចូលអ៊ីមែលត្រឹមត្រូវ";
    if (ownerForm.password.length < 8) errs.password = "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ";
    if (!ownerForm.firstName.trim()) errs.firstName = "តម្រូវឱ្យបញ្ចូលនាមខ្លួន";
    if (!ownerForm.lastName.trim()) errs.lastName = "តម្រូវឱ្យបញ្ចូលនាមត្រកូល";
    setOwnerFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateOwner = async () => {
    if (!validateOwnerForm()) return;
    setSavingOwner(true);
    try {
      const created = await ownerAdminApi.createOwner({
        username: ownerForm.username.trim(), email: ownerForm.email.trim(),
        password: ownerForm.password, firstName: ownerForm.firstName.trim(),
        lastName: ownerForm.lastName.trim(), phone: ownerForm.phone.trim() || undefined,
      });
      setOwners((prev) => [created, ...prev]);
      setOwnerId(created.id); setOwnerCreateOpen(false);
      setHouses([]); setRoomTypes([]); setHouseId(""); setRoomTypeId("");
      await loadOwnerProperty(created.id);
      toast.success("ម្ចាស់ត្រូវបានបង្កើត", `បានបង្កើតគណនី "${created.username || created.email}"។`);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error ||
        "ការបង្កើតម្ចាស់បរាជ័យ សូមព្យាយាមម្តងទៀត។";
      if (/username/i.test(message)) setOwnerFormErrors((prev) => ({ ...prev, username: message }));
      else if (/email/i.test(message)) setOwnerFormErrors((prev) => ({ ...prev, email: message }));
      else setOwnerFormErrors((prev) => ({ ...prev, form: message }));
    } finally { setSavingOwner(false); }
  };

  const handleHouseChange = (value) => {
    if (value === CREATE_HOUSE) {
      setHouseForm(EMPTY_HOUSE_FORM); setHouseFormErrors({});
      setHouseCreateOpen(true); setHouseId("");
      setErrors((prev) => ({ ...prev, houseId: "" }));
    } else {
      setHouseCreateOpen(false); setHouseId(value);
      setErrors((prev) => ({ ...prev, houseId: "" }));
    }
  };

  const handleHouseFormChange = (name, value) => {
    setHouseForm((prev) => ({ ...prev, [name]: value }));
    if (houseFormErrors[name])
      setHouseFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateHouseForm = () => {
    const errs = {};
    if (!houseForm.name.trim()) errs.name = "តម្រូវឱ្យបញ្ចូលឈ្មោះញ្ញា";
    if (!houseForm.slug.trim()) errs.slug = "តម្រូវឱ្យបញ្ចូល Slug";
    if (!houseForm.code.trim()) errs.code = "តម្រូវឱ្យបញ្ចូលលេខកូដ";
    if (!houseForm.address.trim()) errs.address = "តម្រូវឱ្យបញ្ចូលអាសយដ្ឋាន";
    const lat = houseForm.latitude ? toNum(houseForm.latitude) : null;
    const lng = houseForm.longitude ? toNum(houseForm.longitude) : null;
    if (houseForm.latitude && (lat === null || lat < -90 || lat > 90))
      errs.latitude = "រយៈទទឹង (Latitude) −90..90";
    if (houseForm.longitude && (lng === null || lng < -180 || lng > 180))
      errs.longitude = "រយៈបណ្តោយ (Longitude) −180..180";
    setHouseFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateHouse = async () => {
    if (!validateHouseForm()) return;
    setSavingHouse(true);
    try {
      const created = await adminRoomsApi.createHouseForOwner(ownerId, {
        name: houseForm.name.trim(), slug: houseForm.slug.trim(), code: houseForm.code.trim(),
        address: houseForm.address.trim(),
        postalCode: houseForm.postalCode.trim() || null,
        cityProvince: houseForm.cityProvince.trim() || null,
        latitude: houseForm.latitude ? toNum(houseForm.latitude) : null,
        longitude: houseForm.longitude ? toNum(houseForm.longitude) : null,
        googleMapsUrl: houseForm.googleMapsUrl.trim() || null,
        propertyType: houseForm.propertyType || null,
        furnishing: houseForm.furnishing || null,
        areaSqm: houseForm.areaSqm ? toNum(houseForm.areaSqm) : null,
        description: houseForm.description.trim() || null,
      });
      setHouses((prev) => [created, ...prev]);
      setHouseId(created.id); setHouseCreateOpen(false);
      toast.success("ញ្ញាត្រូវបានបង្កើត",
        `"${created.name || created.slug}" ត្រូវបានបង្កើតសម្រាប់ម្ចាស់នេះ។`);
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data?.error ||
        "ការបង្កើតញ្ញាបរាជ័យ សូមព្យាយាមម្តងទៀត។";
      if (/code/i.test(message) && !/address|name|slug/i.test(message))
        setHouseFormErrors((prev) => ({ ...prev, code: message }));
      else setHouseFormErrors({ name: message });
    } finally { setSavingHouse(false); }
  };

  const handleRoomTypeChange = (value) => {
    if (value === CREATE_ROOM_TYPE) {
      setRoomTypeForm(EMPTY_ROOM_TYPE_FORM); setRoomTypeFormErrors({});
      setRoomTypeCreateOpen(true); setRoomTypeId("");
      setErrors((prev) => ({ ...prev, roomTypeId: "" }));
    } else {
      setRoomTypeCreateOpen(false); setRoomTypeId(value);
      setListing((prev) => {
        const next = { ...prev };
        const selected = roomTypes.find((rt) => String(rt.id) === String(value));
        if (selected) {
          if (!next.monthlyRent) next.monthlyRent = selected.defaultRent || "";
          if (!next.securityDeposit) next.securityDeposit = selected.defaultDeposit || "";
          if (!next.capacity || next.capacity === 1) next.capacity = selected.capacity || 1;
        }
        return next;
      });
      setErrors((prev) => ({ ...prev, roomTypeId: "" }));
    }
  };

  const handleRoomTypeFormChange = (name, value) => {
    setRoomTypeForm((prev) => ({ ...prev, [name]: value }));
    if (roomTypeFormErrors[name])
      setRoomTypeFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateRoomTypeForm = () => {
    const errs = {};
    if (!roomTypeForm.name.trim()) errs.name = "តម្រូវឱ្យបញ្ចូលឈ្មោះ";
    if (!roomTypeForm.code.trim()) errs.code = "តម្រូវឱ្យបញ្ចូលលេខកូដ";
    const capacity = toNum(roomTypeForm.capacity);
    if (!capacity || capacity < 1) errs.capacity = "សមត្ថភាពត្រូវធំជាង 0";
    setRoomTypeFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateRoomType = async () => {
    if (!validateRoomTypeForm()) return;
    setSavingRoomType(true);
    try {
      const created = await adminRoomsApi.createRoomTypeForOwner(ownerId, {
        name: roomTypeForm.name.trim(), code: roomTypeForm.code.trim(),
        description: roomTypeForm.description.trim() || null,
        capacity: toNum(roomTypeForm.capacity),
        defaultRent: toNum(roomTypeForm.defaultRent) ?? 0,
        defaultDeposit: toNum(roomTypeForm.defaultDeposit) ?? 0,
      });
      setRoomTypes((prev) => [created, ...prev]);
      setRoomTypeId(created.id);
      setListing((prev) => {
        const next = { ...prev };
        if (!prev.monthlyRent) next.monthlyRent = created.defaultRent || "";
        if (!prev.securityDeposit) next.securityDeposit = created.defaultDeposit || "";
        if (!prev.capacity || prev.capacity === 1) next.capacity = created.capacity || 1;
        return next;
      });
      setRoomTypeCreateOpen(false);
      toast.success("ប្រភេទបន្ទប់ត្រូវបានបង្កើត",
        `"${created.name}" ត្រូវបានបង្កើតសម្រាប់ម្ចាស់នេះ។`);
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data?.error ||
        "ការបង្កើតប្រភេទបន្ទប់បរាជ័យ សូមព្យាយាមម្តងទៀត។";
      if (/code/i.test(message) && !/name/i.test(message))
        setRoomTypeFormErrors((prev) => ({ ...prev, code: message }));
      else setRoomTypeFormErrors({ name: message });
    } finally { setSavingRoomType(false); }
  };

  const updateRoomRow = (index, field, value) => {
    setRooms((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    setErrors((prev) => ({ ...prev, [`room-${index}`]: "" }));
  };
  const addRoomRow = () => setRooms((prev) => [...prev, { ...EMPTY_ROOM_ROW }]);
  const removeRoomRow = (index) =>
    setRooms((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const loadAmenityUtilityNorth = async (roomIdToLoad, houseData) => {
    const roomAssured = roomIdToLoad || roomId;
    const houseAssured = houseData || house;
    setAmenitiesLoading(true); setUtilitiesLoading(true); setNearbyLoading(true);
    try {
      const [assignedAms, masterAms, assignedUts, masterUts, nearbyList, ratesPage] = await Promise.all([
        roomApi.getRoomAmenities(roomAssured),
        roomApi.getMyAmenities(),
        roomUtilityApi.getRoomUtilities(roomAssured),
        utilityTypeApi.getTypes({ page: 0, size: 500 }).then((r) => r.content || []),
        houseAssured?.id ? houseApi.getNearbyLocations(houseAssured.id) : Promise.resolve([]),
        houseAssured?.id
          ? utilityRateApi.getRates({ houseId: houseAssured.id, page: 0, size: 500 })
          : Promise.resolve({ content: [] }),
      ]);
      setAssignedAmenities(assignedAms || []);
      setMasterAmenities((masterAms || []).filter((amenity) =>
        !isAdmin || Number(amenity.ownerId) === Number(selectedOwner?.id)));
      setAssignedUtilities(assignedUts || []);
      setMasterUtilities((masterUts || []).filter((utility) =>
        !isAdmin || Number(utility.ownerId) === Number(selectedOwner?.id)));
      setUtilityRates(ratesPage?.content || []);
      setNearby(nearbyList || []);
    } catch (err) {
      toast.error("កំហុស",
        err.response?.data?.message || err.response?.data?.error ||
          "មិនអាចផ្ទុកគ្រឿងបរិក្ខារ/សេវាបានទេ។");
    } finally {
      setAmenitiesLoading(false); setUtilitiesLoading(false); setNearbyLoading(false);
    }
  };

  const selectedAdminRoom = submittedRooms?.find(
    (candidate) => String(candidate.id) === String(adminSelectedRoomId)
  ) || submittedRooms?.[0] || null;

  useEffect(() => {
    if (!isAdmin || !selectedAdminRoom) return;
    loadAmenityUtilityNorth(selectedAdminRoom.id, selectedHouse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedAdminRoom?.id, selectedHouse?.id]);

  useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;
    const load = async () => {
      setOwnerLoading(true); setOwnerLoadError(null);
      try {
        const roomData = await roomApi.getRoomById(roomId);
        const [houseData, roomTypeData] = await Promise.all([
          roomData.houseId ? houseApi.getHouseById(roomData.houseId) : Promise.resolve(null),
          roomData.roomTypeId ? roomTypeApi.getRoomTypeById(roomData.roomTypeId) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setRoom(roomData); setHouse(houseData); setRoomType(roomTypeData);
        setRoomMeta({
          name: roomData.name || "",
          floorNumber: roomData.floorNumber != null ? String(roomData.floorNumber) : "",
        });
        setListing({
          monthlyRent: roomData.monthlyRent != null ? String(roomData.monthlyRent) : "",
          securityDeposit: roomData.securityDeposit != null ? String(roomData.securityDeposit) : "",
          advancePayment: roomData.advancePayment != null ? String(roomData.advancePayment) : "",
          capacity: roomData.capacity != null ? String(roomData.capacity) : "1",
          bedrooms: roomData.bedrooms != null ? String(roomData.bedrooms) : "",
          bathrooms: roomData.bathrooms != null ? String(roomData.bathrooms) : "",
          areaSqm: roomData.areaSqm != null ? String(roomData.areaSqm) : "",
          landSizeSqm: roomData.landSizeSqm != null ? String(roomData.landSizeSqm) : "",
          numberOfFloors: roomData.numberOfFloors != null ? String(roomData.numberOfFloors) : "",
          furnishing: roomData.furnishing || "",
          propertyType: roomData.propertyType || "",
          listingScope: roomData.listingScope || "",
          availableFrom: roomData.availableFrom || "",
          status: roomData.status || "AVAILABLE",
          description: roomData.description || "",
        });
        await loadAmenityUtilityNorth(roomData.id, houseData);
      } catch (err) {
        if (!cancelled) {
          setOwnerLoadError(
            err.response?.data?.message || err.response?.data?.error ||
              "មិនអាចផ្ទុកព័ត៌មានបន្ទប់បានទេ។"
          );
        }
      } finally { if (!cancelled) setOwnerLoading(false); }
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, roomId]);

  const toggleAmenity = async (amenity) => {
    const targetRoom = isAdmin ? selectedAdminRoom : room;
    if (!targetRoom) return;
    const isAssigned = assignedAmenities.some(
      (a) => Number(a.amenityId) === Number(amenity.id)
    );
    setAmenityBusy(amenity.id);
    try {
      if (isAssigned) await roomApi.removeAmenity(targetRoom.id, amenity.id);
      else await roomApi.assignAmenity(targetRoom.id, amenity.id);
      setAssignedAmenities((await roomApi.getRoomAmenities(targetRoom.id)) || []);
      toast.success("គ្រឿងបរិក្ខារ", isAssigned ? "បានដកចេញ" : "បានបន្ថែម");
    } catch (err) {
      toast.error("កំហុស",
        err.response?.data?.message || err.response?.data?.error ||
          "មិនអាចកែសម្រួលគ្រឿងបរិក្ខារបានទេ។");
    } finally { setAmenityBusy(null); }
  };

  const refreshUtilities = async () => {
    const targetRoom = isAdmin ? selectedAdminRoom : room;
    if (!targetRoom) return;
    setAssignedUtilities((await roomUtilityApi.getRoomUtilities(targetRoom.id)) || []);
  };

  const handleAssignUtility = async (type, included) => {
    const targetRoom = isAdmin ? selectedAdminRoom : room;
    if (!targetRoom) return;
    setUtilityBusy(type.id);
    try {
      await roomUtilityApi.assignUtility(targetRoom.id, type.id, Boolean(included));
      await refreshUtilities();
      toast.success("សេវា", `"${type.name}" បានរាប់បញ្ចូល: ${included ? "បាទ" : "ទេ"}`);
    } catch (err) {
      toast.error("កំហុស",
        err.response?.data?.message || err.response?.data?.error ||
          "មិនអាចកែសម្រួលសេវាបានទេ។");
    } finally { setUtilityBusy(null); }
  };

  const handleRemoveUtility = async (typeId) => {
    const targetRoom = isAdmin ? selectedAdminRoom : room;
    if (!targetRoom) return;
    setUtilityBusy(typeId);
    try {
      await roomUtilityApi.removeUtility(targetRoom.id, typeId);
      await refreshUtilities();
      toast.success("សេវា", "បានដកសេវាចេញពីបន្ទប់។");
    } catch (err) {
      toast.error("កំហុស",
        err.response?.data?.message || err.response?.data?.error ||
          "មិនអាចដកសេវាបានទេ។");
    } finally { setUtilityBusy(null); }
  };

  const utilityRateForm = (utilityTypeId) => utilityRateForms[utilityTypeId] || {
    rate: "", effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: "",
  };

  const updateUtilityRateForm = (utilityTypeId, field, value) => {
    setUtilityRateForms((prev) => ({
      ...prev, [utilityTypeId]: { ...utilityRateForm(utilityTypeId), [field]: value },
    }));
  };

  const saveUtilityRate = async (utilityType) => {
    const form = utilityRateForm(utilityType.id);
    const rate = toNum(form.rate);
    if (rate === null || rate < 0 || !form.effectiveFrom) {
      toast.error("ទិន្នន័យមិនត្រឹមត្រូវ", "សូមបញ្ចូលអត្រា និងកាលបរិច្ឆេទចាប់ផ្តើម។");
      return;
    }
    const existing = utilityRates.find(
      (candidate) => Number(candidate.utilityTypeId) === Number(utilityType.id)
    );
    setUtilityBusy(`rate-${utilityType.id}`);
    try {
      const payload = {
        houseId: selectedHouse.id, utilityTypeId: utilityType.id, rate,
        effectiveFrom: form.effectiveFrom, effectiveTo: form.effectiveTo || null,
        status: "ACTIVE",
      };
      const saved = existing
        ? await utilityRateApi.updateRate(existing.id, payload)
        : await utilityRateApi.createRate(payload);
      setUtilityRates((prev) => existing
        ? prev.map((candidate) => candidate.id === saved.id ? saved : candidate)
        : [saved, ...prev]);
      toast.success("អត្រាសេវា", "បានរក្សាទុកអត្រាសេវាដោយជោគជ័យ។");
    } catch (err) {
      toast.error("កំហុស", err.response?.data?.message || err.response?.data?.error ||
        "មិនអាចរក្សាទុកអត្រាសេវាបានទេ។");
    } finally { setUtilityBusy(null); }
  };

  const handleAddNearby = async () => {
    const targetHouse = isAdmin ? selectedHouse : house;
    if (!targetHouse) return;
    const errs = {};
    if (!newNearby.name.trim()) errs.name = "តម្រូវឱ្យបញ្ចូលឈ្មោះ";
    const dkm = toNum(newNearby.distanceKm);
    if (!dkm || dkm < 0) errs.distanceKm = "ចម្ងាយត្រូវជាលេខមិនអវិជ្ជមាន";
    const mins = toNum(newNearby.travelMinutes);
    if (!mins || mins < 0) errs.travelMinutes = "ពេលវេលាត្រូវជាលេខមិនអវិជ្ជមាន";
    setNearbyErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSavingNearby(true);
    try {
      const created = await houseApi.createNearbyLocation(targetHouse.id, {
        name: newNearby.name.trim(), category: newNearby.category,
        distanceKm: dkm, travelMinutes: mins,
      });
      setNearby((prev) => [...prev, created]);
      setNewNearby({ name: "", category: "SCHOOL", distanceKm: "", travelMinutes: "" });
      toast.success("ទីតាំងនៅជិត", `បានបន្ថែម "${created.name}"។`);
    } catch (err) {
      toast.error("កំហុស",
        err.response?.data?.message || err.response?.data?.error ||
          "មិនអាចបន្ថែមទីតាំងនៅជិតបានទេ។");
    } finally { setSavingNearby(false); }
  };

  const handleDeleteNearby = async (id) => {
    const targetHouse = isAdmin ? selectedHouse : house;
    if (!targetHouse) return;
    try {
      await houseApi.deleteNearbyLocation(targetHouse.id, id);
      setNearby((prev) => prev.filter((n) => Number(n.id) !== Number(id)));
      toast.success("ទីតាំងនៅជិត", "បានលុប។");
    } catch (err) {
      toast.error("កំហុស",
        err.response?.data?.message || err.response?.data?.error ||
          "មិនអាចលុបទីតាំងនៅជិតបានទេ។");
    }
  };

  const setListingField = (name, value) => {
    setListing((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setAdminPropertyType = (value) => {
    setListing((prev) => ({
      ...prev,
      propertyType: value,
      capacity: value === "ROOM" ? prev.capacity || 1 : 1,
    }));
    setRoomTypeId("");
    setErrors((prev) => ({ ...prev, propertyType: "", roomTypeId: "" }));
  };

  const previewRoom = useMemo(() => {
    if (isAdmin) {
      const first = rooms[0] || EMPTY_ROOM_ROW;
      const rent = toNum(listing.monthlyRent);
      const deposit = toNum(listing.securityDeposit);
      const capacity = toNum(listing.capacity);
      const images = [selectedRoomType?.primaryImage, selectedHouse?.primaryImage].filter(Boolean);
      return {
        id: null,
        name: first.name || null, roomNumber: first.roomNumber || null,
        floorNumber: first.floorNumber ? toNum(first.floorNumber) : null,
        capacity: capacity || null, monthlyRent: rent ?? 0, securityDeposit: deposit ?? 0,
        status: listing.status, description: listing.description,
        houseId: selectedHouse?.id, houseName: selectedHouse?.name,
        houseAddress: selectedHouse?.address, housePostalCode: selectedHouse?.postalCode,
        housePrimaryImage: selectedHouse?.primaryImage,
        roomTypeId: selectedRoomType?.id, roomTypeName: selectedRoomType?.name,
        roomTypePrimaryImage: selectedRoomType?.primaryImage,
        images, amenities: [], utilities: [], nearbyLocations: [],
        propertyType: listing.propertyType || null,
        listingScope: listing.listingScope || null,
        furnishing: listing.furnishing || null,
        availableFrom: listing.availableFrom || null,
        advancePayment: listing.advancePayment !== "" ? toNum(listing.advancePayment) : null,
        bedrooms: listing.bedrooms !== "" ? toNum(listing.bedrooms) : null,
        bathrooms: listing.bathrooms !== "" ? toNum(listing.bathrooms) : null,
        areaSqm: listing.areaSqm !== "" ? toNum(listing.areaSqm) : null,
        landSizeSqm: listing.landSizeSqm !== "" ? toNum(listing.landSizeSqm) : null,
        numberOfFloors: listing.numberOfFloors !== "" ? toNum(listing.numberOfFloors) : null,
        cityProvince: selectedHouse?.cityProvince,
        latitude: selectedHouse?.latitude, longitude: selectedHouse?.longitude,
        googleMapsUrl: selectedHouse?.googleMapsUrl,
      };
    }
    return buildOwnerListingPreview({
      room, house, roomType,
      houseImages: houseImages.images, roomTypeImages: roomTypeImages.images,
      amenities: assignedAmenities, utilities: assignedUtilities, nearby,
      overrides: { meta: roomMeta, listing },
    });
  }, [
    isAdmin, rooms, listing, selectedRoomType, selectedHouse, room, roomMeta,
    house, roomType, houseImages.images, roomTypeImages.images,
    assignedAmenities, assignedUtilities, nearby,
  ]);

  const validateAdmin = useCallback(() => {
    const next = {};
    const pt = listing.propertyType;
    if (!pt) next.propertyType = "សូមជ្រើសរើសប្រភេទអចលនទ្រព្យ";
    if (!ownerId) next.ownerId = "សូមជ្រើសរើសម្ចាស់អចលនទ្រព្យ";
    if (!houseId) next.houseId = "សូមជ្រើសរើស ឬបង្កើតញ្ញា (ផ្ទះ)";
    if (pt === "ROOM" && !roomTypeId) next.roomTypeId = "សូមជ្រើសរើស ឬបង្កើតប្រភេទបន្ទប់";
    if (pt === "ROOM") {
      const capacity = toNum(listing.capacity);
      if (!capacity || capacity < 1) next.capacity = "សមត្ថភាពត្រូវធំជាង 0";
    }
    const monthlyRent = toNum(listing.monthlyRent);
    if (monthlyRent === null || monthlyRent < 0) next.monthlyRent = "ថ្លៃជួលត្រូវជាលេខមិនអវិជ្ជមាន";
    const securityDeposit = toNum(listing.securityDeposit);
    if (securityDeposit === null || securityDeposit < 0)
      next.securityDeposit = "ប្រាក់ដាក់ប្រាកដត្រូវជាលេខមិនអវិជ្ជមាន";
    const needRoomNumbers = pt !== "HOUSE" && pt !== "VILLA" && pt !== "OTHER";
    if (needRoomNumbers) {
      const seen = new Set();
      rooms.forEach((row, index) => {
        if (!row.roomNumber || !row.roomNumber.trim()) {
          next[`room-${index}`] = isUnitLike ? "សូមបញ្ចូលលេខឯកតា" : "សូមបញ្ចូលលេខបន្ទប់"; return;
        }
        const key = row.roomNumber.trim().toLowerCase();
        if (seen.has(key)) next[`room-${index}`] = "លេខបន្ទប់កំពុងស្ទួនក្នុងបញ្ជី";
        seen.add(key);
      });
    }
    if (isUnitLike && rooms[0] && (rooms[0].floorNumber === "" || rooms[0].floorNumber == null)) {
      next["floor-0"] = "សូមបញ្ចូលជាន់";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [ownerId, houseId, roomTypeId, listing, rooms, isUnitLike]);

  const buildAdminRoomPayload = (row) => ({
    houseId,
    roomTypeId: isStructureLike ? null : roomTypeId,
    roomNumber: isStructureLike ? null : (row.roomNumber ? row.roomNumber.trim() : null),
    name: row.name ? row.name.trim() || null : null,
    floorNumber: isStructureLike ? null : (row.floorNumber ? toNum(row.floorNumber) : null),
    monthlyRent: toNum(listing.monthlyRent),
    securityDeposit: toNum(listing.securityDeposit),
    advancePayment: listing.advancePayment !== "" ? toNum(listing.advancePayment) : null,
    capacity: isRoomLike ? toNum(listing.capacity) : null,
    propertyType: listing.propertyType || null,
    listingScope: listing.listingScope || null,
    furnishing: listing.furnishing || null,
    availableFrom: listing.availableFrom || null,
    bedrooms: listing.bedrooms !== "" ? toNum(listing.bedrooms) : null,
    bathrooms: listing.bathrooms !== "" ? toNum(listing.bathrooms) : null,
    areaSqm: listing.areaSqm !== "" ? toNum(listing.areaSqm) : null,
    landSizeSqm: listing.landSizeSqm !== "" ? toNum(listing.landSizeSqm) : null,
    numberOfFloors: listing.numberOfFloors !== "" ? toNum(listing.numberOfFloors) : null,
    status: listing.status,
    description: listing.description.trim() || null,
  });

  const handleAdminSubmit = async () => {
    if (submittedRooms) {
      setSubmitting(true);
      try {
        const updatedRooms = await Promise.all(submittedRooms.map((createdRoom, index) =>
          roomApi.updateRoom(createdRoom.id, buildAdminRoomPayload(rooms[index] || {
            roomNumber: createdRoom.roomNumber || "", name: createdRoom.name || "",
            floorNumber: createdRoom.floorNumber == null ? "" : String(createdRoom.floorNumber),
          }))
        ));
        setSubmittedRooms(updatedRooms);
        if (!publishImmediately) {
          toast.success("បានរក្សាទុកព្រាង", "ព័ត៌មានបន្ទប់ត្រូវបានរក្សាទុករួចរាល់។");
          return;
        }
        const published = await Promise.all(
          updatedRooms.map((createdRoom) => roomPublicationApi.approveRoom(createdRoom.id))
        );
        setPublishedRooms(published);
        toast.success("បានបោះពុម្ពផ្សាយ", `${published.length} បន្ទប់ត្រូវបានបោះពុម្ពផ្សាយជាសាធារណៈ។`);
      } catch (err) {
        toast.error("បរាជ័យក្នុងការផ្សាយ",
          err.response?.data?.message || err.response?.data?.error ||
          "មិនអាចបោះពុម្ពផ្សាយបន្ទប់បានទេ។");
      } finally { setSubmitting(false); }
      return;
    }
    if (!validateAdmin()) {
      toast.error("ទិន្នន័យមិនពេញលេញ", "សូមពិនិត្យមើលវាលដែលមានកំហុស។");
      return;
    }
    setSubmitting(true);
    try {
      let created;
      if (rooms.length === 1) {
        const single = await adminRoomsApi.createRoomForOwner(ownerId, {
          ...buildAdminRoomPayload(rooms[0]), publishImmediately: false,
        });
        created = [single];
      } else {
        created = await adminRoomsApi.createRoomsForOwner(ownerId, {
          rooms: rooms.map(buildAdminRoomPayload),
          publishImmediately: false,
        });
      }
      setSubmittedRooms(created);
      setAdminSelectedRoomId(String(created[0]?.id || ""));
      await loadAmenityUtilityNorth(created[0]?.id, selectedHouse);
      toast.success(
        "បានបង្កើតព្រាង",
        `${created.length} បន្ទប់ត្រូវបានបង្កើតសម្រាប់ម្ចាស់ "${
          selectedOwner?.username || ownerId
        }"។`
      );
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data?.error ||
        "ការបង្កើតបន្ទប់បរាជ័យ សូមព្យាយាមម្តងទៀត។";
      toast.error("បរាជ័យក្នុងការបង្កើត", message);
    } finally { setSubmitting(false); }
  };

  const buildOwnerPayload = () => ({
    houseId: room.houseId, roomTypeId: room.roomTypeId, roomNumber: room.roomNumber,
    name: roomMeta.name.trim() || null,
    floorNumber: roomMeta.floorNumber !== "" ? toNum(roomMeta.floorNumber) : null,
    monthlyRent: toNum(listing.monthlyRent),
    securityDeposit: toNum(listing.securityDeposit),
    advancePayment: listing.advancePayment !== "" ? toNum(listing.advancePayment) : null,
    capacity: toNum(listing.capacity),
    propertyType: listing.propertyType || null,
    listingScope: listing.listingScope || null,
    furnishing: listing.furnishing || null,
    availableFrom: listing.availableFrom || null,
    bedrooms: listing.bedrooms !== "" ? toNum(listing.bedrooms) : null,
    bathrooms: listing.bathrooms !== "" ? toNum(listing.bathrooms) : null,
    areaSqm: listing.areaSqm !== "" ? toNum(listing.areaSqm) : null,
    landSizeSqm: listing.landSizeSqm !== "" ? toNum(listing.landSizeSqm) : null,
    numberOfFloors: listing.numberOfFloors !== "" ? toNum(listing.numberOfFloors) : null,
    status: listing.status,
    description: listing.description.trim() || null,
  });

  const validateOwner = () => {
    const next = {};
    const capacity = toNum(listing.capacity);
    if (!capacity || capacity < 1) next.capacity = "សមត្ថភាពត្រូវធំជាង 0";
    const monthlyRent = toNum(listing.monthlyRent);
    if (monthlyRent === null || monthlyRent < 0) next.monthlyRent = "ថ្លៃជួលត្រូវជាលេខមិនអវិជ្ជមាន";
    const securityDeposit = toNum(listing.securityDeposit);
    if (securityDeposit === null || securityDeposit < 0)
      next.securityDeposit = "ប្រាក់ដាក់ប្រាកដត្រូវជាលេខមិនអវិជ្ជមាន";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveOwnerListing = async () => {
    if (!room) return;
    if (!validateOwner()) {
      toast.error("ទិន្នន័យមិនត្រឹមត្រូវ", "សូមពិនិត្យមើលវាលដែលមានកំហុស។");
      return null;
    }
    setSaving(true);
    try {
      const updated = await roomApi.updateRoom(room.id, buildOwnerPayload());
      setRoom(updated);
      toast.success("បានរក្សាទុក", "ព័ត៌មានបន្ទប់ត្រូវបានរក្សាទុក។");
      return updated;
    } catch (err) {
      toast.error("បរាជ័យ",
        err.response?.data?.message || err.response?.data?.error ||
          "មិនអាចរក្សាទុកបានទេ។");
      return null;
    } finally { setSaving(false); }
  };

  const isEligible = room ? canSubmitRoom(room) : false;
  const eligibleHint = !isEligible && room
    ? room.publicationStatus === "PENDING_APPROVAL"
      ? "បន្ទប់នេះកំពុងស្ថិតក្នុងការរង់ចាំការអនុម័តពីអ្នកគ្រប់គ្រងប្រព័ន្ធ។"
      : room.publicationStatus === "PUBLISHED"
      ? "បន្ទប់នេះត្រូវបានផ្សាយជាសាធារណៈរួចហើយ។"
      : room.status !== "AVAILABLE"
      ? "ដើម្បីដាក់ស្នើ ស្ថានភាពបន្ទប់ត្រូវមានស្ថានភាព «ទំនេរ (Available)»។"
      : "បន្ទប់នេះមិនអាចដាក់ស្នើក្នុងពេលនេះទេ។"
    : null;

  // ---- Inline preview toggle ----
  const handlePreview = async () => {
    if (!isAdmin) {
      const saved = await saveOwnerListing();
      if (!saved) return;
    }
    setPreviewMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleExitPreview = () => setPreviewMode(false);

  const handleCreateAnother = () => {
    setListing(EMPTY_LISTING); setRooms([{ ...EMPTY_ROOM_ROW }]);
    setHouses([]); setRoomTypes([]);
    setHouseForm(EMPTY_HOUSE_FORM); setRoomTypeForm(EMPTY_ROOM_TYPE_FORM);
    setHouseCreateOpen(false); setRoomTypeCreateOpen(false);
    setOwnerCreateOpen(false); setOwnerForm(EMPTY_OWNER_FORM); setOwnerFormErrors({});
    setOwnerId(""); setHouseId(""); setRoomTypeId("");
    setSubmittedRooms(null); setPublishedRooms(null); setAdminSelectedRoomId("");
    setPublishImmediately(false); setPreviewMode(false);
  };

  /* ============ Progress calculation ============ */
  const adminTypeConfirmed = isAdmin ? !!listing.propertyType : true;
  const stepIdentityDone = !!(adminTypeConfirmed && selectedOwner && selectedHouse);
  const stepRoomTypeDone = isAdmin ? (isRoomLike ? !!selectedRoomType : true) : !!selectedRoomType;
  const stepDetailsDone = !!(
    listing.monthlyRent && listing.securityDeposit &&
    (!isAdmin || isStructureLike || !!rooms[0]?.roomNumber)
  );
  const currentPhase = !stepIdentityDone ? 1 : !stepRoomTypeDone ? 2 : !stepDetailsDone ? 3 : 4;

  const phase1Status = stepIdentityDone ? "done" : currentPhase === 1 ? "active" : "pending";
  const phase2Status =
    stepRoomTypeDone && stepDetailsDone ? "done" : currentPhase === 2 ? "active" : "pending";
  const phase3Status = currentPhase === 4 ? "done" : currentPhase === 3 ? "active" : "pending";

  const header = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
          ត្រឡប់
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {isAdmin ? "ដាក់បន្ទប់ថ្មី" : "បញ្ចប់ និងពិនិត្យបញ្ជីផ្សាយ"}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
            <ScanEye className="h-3.5 w-3.5" />
            {previewMode
              ? "កំពុងមើលជាមុនបែបសាធារណៈ — ចុច «ត្រឡប់ទៅកែសម្រួល» ដើម្បីកែប្រែ"
              : isAdmin
              ? "បំពេញព័ត៌មានខាងក្រោម រួចចុច «មើលជាមុន» ដើម្បីពិនិត្យ"
              : "កែសម្រួលព័ត៌មាន រួចចុច «មើលជាមុន» ដើម្បីពិនិត្យមុនដាក់ស្នើ"}
          </p>
        </div>
      </div>
      {isAdmin && (
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={loadOwners} disabled={loadingOwners || submitting}>
          ធ្វើឱ្យស្រស់
        </Button>
      )}
    </div>
  );

  // ---- Admin success view ----
  if (isAdmin && publishedRooms) {
    return (
      <div className="space-y-6">
        {header}
        <Card
          title="បានបោះពុម្ពផ្សាយបន្ទប់ដោយជោគជ័យ"
          description={`${publishedRooms.length} បន្ទប់ត្រូវបានបោះពុម្ពផ្សាយជាសាធារណៈហើយ។`}
          footer={
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" leftIcon={<Send className="h-4 w-4" />}
                onClick={() => navigate(submissionsPath)}>
                ចូលមើលការផ្សាយ
              </Button>
              <Button variant="outline" onClick={handleCreateAnother}>បង្កើតមួយទៀត</Button>
              <Button variant="outline" onClick={onBack}>ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង</Button>
            </div>
          }
        >
          <div className="mb-3 flex flex-wrap gap-1.5">
            {publishedRooms.map((r) => (
              <span key={r.id}
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-medium text-slate-700 dark:border-gray-800 dark:bg-gray-800/40 dark:text-slate-200">
                <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
                {r.roomNumber || r.name || `បន្ទប់ #${r.id}`}
              </span>
            ))}
          </div>
          <div className="mx-auto max-w-[900px] bg-[#f8f8f6]">
            <RoomDetailView room={publishedRooms[0]} showBreadcrumb={false} />
          </div>
        </Card>
      </div>
    );
  }

  if (ownerLoading) {
    return (
      <div className="space-y-6">
        {header}
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (ownerLoadError) {
    return (
      <div className="space-y-6">
        {header}
        <Alert variant="danger" title="កំហុស" description={ownerLoadError}>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={onBack}>ត្រឡប់</Button>
          </div>
        </Alert>
      </div>
    );
  }

  const houseMapsUrl = mapMapsUrl(selectedHouse);
  const physicalRoomsCount = isAdmin ? rooms.length : 1;

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="space-y-6">
      {header}

      {ownersError && (
        <Alert variant="danger" title="កំហុស" description={ownersError}>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={loadOwners}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      {isAdmin && submittedRooms && (
        <Card className="space-y-3" title="បំពេញព័ត៌មានមុនផ្សាយ"
          description="ព័ត៌មានរូបភាព គ្រឿងបរិក្ខារ សេវាកម្ម និងទីតាំងនៅជិត ត្រូវបានរក្សាទុកលើទិន្នន័យរបស់ម្ចាស់នេះ។">
          <Select
            label="បន្ទប់ដែលត្រូវកែសម្រួល"
            options={submittedRooms.map((candidate) => ({
              value: candidate.id,
              label: `${candidate.roomNumber || candidate.name || `បន្ទប់ #${candidate.id}`}`,
            }))}
            value={selectedAdminRoom?.id || ""}
            onChange={(e) => setAdminSelectedRoomId(e.target.value)}
          />
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            បន្ទប់ទាំងអស់ត្រូវបានបង្កើតជាព្រាងរួចហើយ។ ជ្រើសរើសបន្ទប់នីមួយៗ ដើម្បីភ្ជាប់គ្រឿងបរិក្ខារ និងសេវាកម្ម មុនចុចផ្សាយ។
          </p>
        </Card>
      )}

      {previewMode ? (
        /* ============ FULL-WIDTH PREVIEW MODE (only shown when Preview is clicked) ============ */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <ScanEye className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <div>
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
                  ការមើលជាមុនបែបសាធារណៈ (Public Preview)
                </p>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                  នេះជារបៀបដែលអតិថិជននឹងឃើញការផ្សាយរបស់អ្នក។
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleExitPreview}>
              ត្រឡប់ទៅកែសម្រួល
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#f8f8f6] shadow-sm dark:border-gray-800">
            <RoomDetailView room={previewRoom} showBreadcrumb={false} />
          </div>
        </div>
      ) : (
        /* ============ EDIT MODE — full-width form (no sidebar preview) ============ */
        <div className=" space-y-8">

          {/* PHASE 1 — WHO & WHERE */}
          <Phase
            index={1}
            total={3}
            title="ម្ចាស់ និងញ្ញា (Who & Where)"
            subtitle={isAdmin ? "ជ្រើសរើសម្ចាស់ និងញ្ញាសម្រាប់បន្ទប់នេះ" : "ព័ត៌មានញ្ញារបស់បន្ទប់"}
            status={phase1Status}
          >
            {isAdmin ? (
              <Card className="space-y-3.5">
                <Select
                  label="ប្រភេទអចលនទ្រព្យ"
                  name="propertyType"
                  options={ADMIN_PROPERTY_TYPE_OPTIONS}
                  value={listing.propertyType}
                  onChange={(e) => setAdminPropertyType(e.target.value)}
                  error={errors.propertyType}
                  placeholder="ជ្រើសរើសប្រភេទអចលនទ្រព្យ..."
                />
                {isRoomLike && (
                  <InlineNotice icon={Layers}>
                    បំពេញញ្ញា (ផ្ទះ) ប្រភេទបន្ទប់ និងលេខបន្ទប់ខាងក្រោម។
                  </InlineNotice>
                )}
                {isStructureLike && (
                  <InlineNotice icon={Home}>
                    បំពេញព័ត៌មានញ្ញា (ផ្ទះ) និងបន្ទប់រូបវន្តខាងក្រោម។ ចំនួនបន្ទប់គេង/ទឹក ជាន់ និងផ្ទៃដី នឹងត្រូវបំពេញនៅជំហានទី ៣។
                  </InlineNotice>
                )}
                {isUnitLike && (
                  <InlineNotice icon={Building2}>
                    បំពេញអាគារ និងលេខឯកតា (Unit Number) ខាងក្រោម។ មិនតម្រូវឱ្យជ្រើសរើសប្រភេទបន្ទប់ទេ។
                  </InlineNotice>
                )}
                <Select
                  label="ម្ចាស់អចលនទ្រព្យ"
                  name="ownerId"
                  options={owners.map((o) => ({
                    value: o.id,
                    label: `${[o.firstName, o.lastName].filter(Boolean).join(" ") || o.username}${
                      o.email ? ` — ${o.email}` : ""
                    }`,
                  })).concat([{ value: CREATE_OWNER, label: "➕ បង្កើតម្ចាស់ថ្មី" }])}
                  value={ownerId}
                  onChange={(e) => handleOwnerChange(e.target.value)}
                  error={errors.ownerId}
                  placeholder="ជ្រើសរើសម្ចាស់..."
                  disabled={loadingOwners || !listing.propertyType}
                />
                {ownerCreateOpen && (
                  <div className="space-y-2.5 rounded-lg border border-dashed border-sky-300 bg-sky-50/40 p-3 dark:border-sky-800 dark:bg-sky-950/20">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-sky-700 dark:text-sky-300">
                        <Users className="h-3.5 w-3.5" /> ម្ចាស់ថ្មី
                      </p>
                      <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => setOwnerCreateOpen(false)}>
                        បោះបង់
                      </Button>
                    </div>
                    {ownerFormErrors.form && (
                      <Alert variant="danger" title="កំហុស" description={ownerFormErrors.form} />
                    )}
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Input label="ឈ្មោះអ្នកប្រើ" required name="username" value={ownerForm.username}
                        onChange={(e) => handleOwnerFormChange("username", e.target.value)}
                        error={ownerFormErrors.username} />
                      <Input label="អ៊ីមែល" required type="email" name="email" value={ownerForm.email}
                        onChange={(e) => handleOwnerFormChange("email", e.target.value)}
                        error={ownerFormErrors.email} />
                      <Input label="ពាក្យសម្ងាត់" required type="password" name="password" value={ownerForm.password}
                        onChange={(e) => handleOwnerFormChange("password", e.target.value)}
                        error={ownerFormErrors.password} />
                      <Input label="ទូរស័ព្ទ" name="phone" value={ownerForm.phone}
                        onChange={(e) => handleOwnerFormChange("phone", e.target.value)} />
                      <Input label="នាមខ្លួន" required name="firstName" value={ownerForm.firstName}
                        onChange={(e) => handleOwnerFormChange("firstName", e.target.value)}
                        error={ownerFormErrors.firstName} />
                      <Input label="នាមត្រកូល" required name="lastName" value={ownerForm.lastName}
                        onChange={(e) => handleOwnerFormChange("lastName", e.target.value)}
                        error={ownerFormErrors.lastName} />
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button variant="primary" size="sm" leftIcon={<Users className="h-4 w-4" />}
                        loading={savingOwner} onClick={handleCreateOwner}>
                        បង្កើតម្ចាស់
                      </Button>
                    </div>
                  </div>
                )}
                {owners.length === 0 && !loadingOwners && (
                  <EmptyState icon={Users} title="មិនទាន់មានម្ចាស់ទេ"
                    description="បង្កើតគណនីម្ចាស់អចលនទ្រព្យមុននឹងដាក់បន្ទប់។" />
                )}

                <Select
                  label={isUnitLike ? "អាគារ (Building)" : "ញ្ញា (ផ្ទះ)"}
                  name="houseId"
                  options={[
                    ...houses.map((h) => ({
                      value: h.id,
                      label: `${h.name || (isUnitLike ? `អាគារ #${h.id}` : `ញ្ញា #${h.id}`)}${
                        h.address ? ` — ${h.address}` : ""
                      }`,
                    })),
                    { value: CREATE_HOUSE, label: isUnitLike ? "➕ បង្កើតអាគារថ្មី" : "➕ បង្កើតញ្ញាថ្មី" },
                  ]}
                  value={houseCreateOpen ? "" : houseId}
                  onChange={(e) => handleHouseChange(e.target.value)}
                  error={errors.houseId}
                  disabled={!ownerId}
                  placeholder={isUnitLike ? "ជ្រើសរើស ឬបង្កើតអាគារ..." : "ជ្រើសរើស ឬបង្កើតញ្ញា..."}
                />

                {houseCreateOpen && (
                  <div className="space-y-2.5 rounded-lg border border-dashed border-sky-300 bg-sky-50/40 p-3 dark:border-sky-800 dark:bg-sky-950/20">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-sky-700 dark:text-sky-300">
                        <Building2 className="h-3.5 w-3.5" />
                        ញ្ញាថ្មីសម្រាប់ {selectedOwner?.username || "ម្ចាស់"} នេះ
                      </p>
                      <Button variant="ghost" size="sm"
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => setHouseCreateOpen(false)}>
                        បោះបង់
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Input label="ឈ្មោះ" required name="name" value={houseForm.name}
                        onChange={(e) => handleHouseFormChange("name", e.target.value)}
                        error={houseFormErrors.name} placeholder="ឧ. Villa Mondul" />
                      <Input label="Slug" required name="slug" value={houseForm.slug}
                        onChange={(e) => handleHouseFormChange("slug", e.target.value)}
                        error={houseFormErrors.slug} placeholder="ឧ. villa-mondul" />
                      <Input label="លេខកូដ" required name="code" value={houseForm.code}
                        onChange={(e) => handleHouseFormChange("code", e.target.value)}
                        error={houseFormErrors.code} placeholder="ឧ. H001" />
                      <Input label="អាសយដ្ឋាន" required name="address" value={houseForm.address}
                        onChange={(e) => handleHouseFormChange("address", e.target.value)}
                        error={houseFormErrors.address} placeholder="ឧ. #123, ផ្លូវ 456" />
                      <Input label="ទីក្រុង/ខេត្ត" name="cityProvince" value={houseForm.cityProvince}
                        onChange={(e) => handleHouseFormChange("cityProvince", e.target.value)}
                        placeholder="ឧ. ភ្នំពេញ" />
                      <Input label="Postal Code" name="postalCode" value={houseForm.postalCode}
                        onChange={(e) => handleHouseFormChange("postalCode", e.target.value)}
                        placeholder="ឧ. 12000" />
                      <Input label="Google Maps URL" name="googleMapsUrl" value={houseForm.googleMapsUrl}
                        onChange={(e) => handleHouseFormChange("googleMapsUrl", e.target.value)}
                        placeholder="https://maps.google.com/..." />
                      <div className="grid grid-cols-2 gap-2.5">
                        <Input label="Latitude" name="latitude" value={houseForm.latitude}
                          onChange={(e) => handleHouseFormChange("latitude", e.target.value)}
                          error={houseFormErrors.latitude} placeholder="11.5564" />
                        <Input label="Longitude" name="longitude" value={houseForm.longitude}
                          onChange={(e) => handleHouseFormChange("longitude", e.target.value)}
                          error={houseFormErrors.longitude} placeholder="104.9282" />
                      </div>
                      <Select label="ប្រភេទអចលនទ្រព្យ" name="propertyType"
                        options={PROPERTY_TYPE_OPTIONS} value={houseForm.propertyType}
                        onChange={(e) => handleHouseFormChange("propertyType", e.target.value)} />
                      <Select label="គ្រឿងសង្ហារិម" name="furnishing"
                        options={FURNISHING_OPTIONS} value={houseForm.furnishing}
                        onChange={(e) => handleHouseFormChange("furnishing", e.target.value)} />
                      <Input label="ផ្ទៃក្រឡា (m²)" type="number" step="0.1" min="0"
                        name="areaSqm" value={houseForm.areaSqm}
                        onChange={(e) => handleHouseFormChange("areaSqm", e.target.value)} />
                    </div>
                    <Textarea label="ការពិពណ៌នា" name="description" value={houseForm.description}
                      onChange={(e) => handleHouseFormChange("description", e.target.value)}
                      rows={2} placeholder="ព័ត៌មានលម្អិតរបស់ញ្ញា..." />
                    <div className="flex justify-end pt-1">
                      <Button variant="primary" size="sm"
                        leftIcon={<Home className="h-4 w-4" />}
                        loading={savingHouse} onClick={handleCreateHouse}>
                        បង្កើតញ្ញា
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : house ? (
              <Card className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-slate-900 dark:text-white">{house.name}</p>
                    <p className="mt-1 flex items-start gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{[house.address, house.cityProvince].filter(Boolean).join(" · ")}</span>
                    </p>
                    {houseMapsUrl && (
                      <a href={houseMapsUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-sky-600 hover:underline dark:text-sky-400">
                        <ExternalLink className="h-3.5 w-3.5" /> មើលលើ Google Maps
                      </a>
                    )}
                  </div>
                  <Button variant="outline" size="sm"
                    onClick={() => navigate(`${basePath}/properties/${house.id}`)}>
                    គ្រប់គ្រង
                  </Button>
                </div>
              </Card>
            ) : (
              <EmptyState icon={Home} title="គ្មានញ្ញា" description="—" />
            )}
          </Phase>

          {/* PHASE 2 — PROPERTY / ROOM IDENTITY */}
          {isAdmin && isStructureLike ? (
            <Phase
              index={2}
              total={3}
              title="ព័ត៌មានអចលនទ្រព្យ (Property Details)"
              subtitle="អចលនទ្រព្យផ្សាយទាំងមូល — មិនមានលេខបន្ទប់"
              status={phase2Status}
            >
              <Card className="space-y-3.5">
                <InlineNotice icon={Home}>
                  អចលនទ្រព្យប្រភេទនេះត្រូវបានផ្សាយទាំងមូលជាមួយញ្ញា (ផ្ទះ)។ វាមិនតម្រូវឱ្យបញ្ចូលប្រភេទបន្ទប់ លេខបន្ទប់ ឈ្មោះបន្ទប់ ជាន់បន្ទប់ ឬសមត្ថភាពបន្ទប់ទេ។
                </InlineNotice>
                <InlineNotice icon={Maximize}>
                  សូមបំពេញលក្ខណៈអចលនទ្រព្យ (ចំនួនបន្ទប់គេង/ទឹក ជាន់ ផ្ទៃដី ផ្ទៃក្រឡា គ្រឿងសង្ហារិម និងតម្លៃ) នៅជំហានទី ៣ ខាងក្រោម។
                </InlineNotice>
              </Card>
            </Phase>
          ) : (
            <Phase
              index={2}
              total={3}
              title="ប្រភេទបន្ទប់ និងលេខបន្ទប់ (Room Identity)"
              subtitle="កំណត់ប្រភេទ និងបន្ទប់រូបវន្ត"
              status={phase2Status}
            >
            {isAdmin && isRoomLike ? (
              <Card className="space-y-3.5">
                <Select
                  label="ប្រភេទបន្ទប់"
                  name="roomTypeId"
                  options={[
                    ...roomTypes.map((rt) => ({ value: rt.id, label: rt.name || `ប្រភេទ #${rt.id}` })),
                    { value: CREATE_ROOM_TYPE, label: "➕ បង្កើតប្រភេទបន្ទប់ថ្មី" },
                  ]}
                  value={roomTypeCreateOpen ? "" : roomTypeId}
                  onChange={(e) => handleRoomTypeChange(e.target.value)}
                  error={errors.roomTypeId}
                  disabled={!ownerId}
                  placeholder="ជ្រើសរើស ឬបង្កើតប្រភេទបន្ទប់..."
                />
                {roomTypeCreateOpen && (
                  <div className="space-y-2.5 rounded-lg border border-dashed border-sky-300 bg-sky-50/40 p-3 dark:border-sky-800 dark:bg-sky-950/20">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-sky-700 dark:text-sky-300">
                        <Layers className="h-3.5 w-3.5" />
                        ប្រភេទបន្ទប់ថ្មី
                      </p>
                      <Button variant="ghost" size="sm"
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => setRoomTypeCreateOpen(false)}>
                        បោះបង់
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Input label="ឈ្មោះ" required name="name" value={roomTypeForm.name}
                        onChange={(e) => handleRoomTypeFormChange("name", e.target.value)}
                        error={roomTypeFormErrors.name} placeholder="ឧ. Deluxe Room" />
                      <Input label="លេខកូដ" required name="code" value={roomTypeForm.code}
                        onChange={(e) => handleRoomTypeFormChange("code", e.target.value)}
                        error={roomTypeFormErrors.code} placeholder="ឧ. DLX-001" />
                      <Input label="សមត្ថភាព" required type="number" min="1" name="capacity"
                        value={roomTypeForm.capacity}
                        onChange={(e) => handleRoomTypeFormChange("capacity", e.target.value)}
                        error={roomTypeFormErrors.capacity} />
                      <Input label="ថ្លៃជួលលំនាំដើម ($)" type="number" step="0.01" min="0"
                        name="defaultRent" value={roomTypeForm.defaultRent}
                        onChange={(e) => handleRoomTypeFormChange("defaultRent", e.target.value)} />
                      <Input label="ប្រាក់ដាក់ប្រាកដលំនាំដើម ($)" type="number" step="0.01" min="0"
                        name="defaultDeposit" value={roomTypeForm.defaultDeposit}
                        onChange={(e) => handleRoomTypeFormChange("defaultDeposit", e.target.value)} />
                    </div>
                    <Textarea label="ការពិពណ៌នា" name="description" value={roomTypeForm.description}
                      onChange={(e) => handleRoomTypeFormChange("description", e.target.value)}
                      rows={2} placeholder="ពិពណ៌នាអំពីប្រភេទបន្ទប់..." />
                    <div className="flex justify-end pt-1">
                      <Button variant="primary" size="sm"
                        leftIcon={<Layers className="h-4 w-4" />}
                        loading={savingRoomType} onClick={handleCreateRoomType}>
                        បង្កើតប្រភេទបន្ទប់
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : isAdmin && isUnitLike ? (
              <Card className="space-y-3.5">
                <InlineNotice icon={Building2}>
                  អាផាតមិន/ខុនដូ មិនតម្រូវឱ្យជ្រើសរើសប្រភេទបន្ទប់ទេ។ បំពេញលេខឯកតា (Unit Number) និងជាន់ខាងក្រោម។
                </InlineNotice>
              </Card>
            ) : roomType ? (
              <Card>
                <div className="flex items-center gap-3.5">
                  {roomType.primaryImage ? (
                    <img src={roomType.primaryImage} alt={roomType.name}
                      className="h-14 w-16 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-gray-700">
                      <Layers className="h-5 w-5 text-slate-400" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">{roomType.name}</p>
                    <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                      សមត្ថភាព: {roomType.capacity} នាក់ · ថ្លៃលំនាំដើម: ${roomType.defaultRent}
                    </p>
                  </div>
                  <Button variant="outline" size="sm"
                    onClick={() => navigate(`${basePath}/roomtype`)}>
                    គ្រប់គ្រង
                  </Button>
                </div>
              </Card>
            ) : (
              <EmptyState icon={Layers} title="គ្មានប្រភេទបន្ទប់" description="—" />
            )}

            <Card>
              {isAdmin ? (
                isUnitLike ? (
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      ឯកតា (Unit)
                    </p>
                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <Input label="លេខឯកតា (Unit Number)" required name="roomNumber"
                          value={rooms[0]?.roomNumber || ""}
                          onChange={(e) => updateRoomRow(0, "roomNumber", e.target.value)}
                          placeholder="ឧ. 12A" error={errors["room-0"]} />
                        <Input label="ឈ្មោះ" name="name" value={rooms[0]?.name || ""}
                          onChange={(e) => updateRoomRow(0, "name", e.target.value)}
                          placeholder="ឧ. Skyline Unit" />
                        <Input label="ជាន់" required type="number" min="0" name="floorNumber"
                          value={rooms[0]?.floorNumber || ""}
                          onChange={(e) => updateRoomRow(0, "floorNumber", e.target.value)}
                          placeholder="ឧ. 5" error={errors["floor-0"]} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        បន្ទប់រូបវន្ត ({rooms.length})
                      </p>
                      <Button variant="outline" size="sm"
                        leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={addRoomRow}>
                        បន្ថែម
                      </Button>
                    </div>
                    {rooms.map((row, index) => (
                      <div key={index}
                        className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                        <div className="mb-2.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <DoorOpen className="h-3.5 w-3.5" /> បន្ទប់ #{index + 1}
                          </span>
                          {rooms.length > 1 && (
                            <Button variant="ghost" size="sm"
                              leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                              onClick={() => removeRoomRow(index)}>
                              លុប
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          <Input label="លេខបន្ទប់" required name="roomNumber" value={row.roomNumber}
                            onChange={(e) => updateRoomRow(index, "roomNumber", e.target.value)}
                            placeholder="ឧ. 101" error={errors[`room-${index}`]} />
                          <Input label="ឈ្មោះ" name="name" value={row.name}
                            onChange={(e) => updateRoomRow(index, "name", e.target.value)}
                            placeholder="ឧ. Suite A" />
                          <Input label="ជាន់" type="number" min="0" name="floorNumber"
                            value={row.floorNumber}
                            onChange={(e) => updateRoomRow(index, "floorNumber", e.target.value)}
                            placeholder="ឧ. 1" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <Input label="លេខបន្ទប់" value={room?.roomNumber || ""} disabled />
                  <Input label="ឈ្មោះ" name="name" value={roomMeta.name}
                    onChange={(e) => setRoomMeta((p) => ({ ...p, name: e.target.value }))}
                    placeholder="ឧ. Suite A" />
                  <Input label="ជាន់" type="number" min="0" name="floorNumber"
                    value={roomMeta.floorNumber}
                    onChange={(e) => setRoomMeta((p) => ({ ...p, floorNumber: e.target.value }))}
                    placeholder="ឧ. 1" />
                </div>
              )}
            </Card>
            </Phase>
          )}

          {/* PHASE 3 — DETAILS & PUBLISH */}
          <Phase
            index={3}
            total={3}
            title="ព័ត៌មានលម្អិត និងផ្សាយ (Details & Publish)"
            subtitle="តម្លៃ ទំហំ រូបភាព និងស្ថានភាពផ្សាយ"
            status={phase3Status}
          >
            {isAdmin && (
              <SummaryStrip
                owner={selectedOwner}
                house={selectedHouse}
                roomType={selectedRoomType}
                roomsCount={rooms.length}
                listing={listing}
              />
            )}

            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                  តម្លៃជួល (Rent / Deposit / Advance)
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Input label="ថ្លៃជួលប្រចាំខែ ($)" required type="number" step="0.01" min="0"
                  name="monthlyRent" value={listing.monthlyRent}
                  onChange={(e) => setListingField("monthlyRent", e.target.value)}
                  error={errors.monthlyRent} placeholder="ឧ. 250"
                  leftIcon={<DollarSign className="h-4 w-4 text-slate-400" />} />
                <Input label="ប្រាក់ដាក់ប្រាកដ ($)" type="number" step="0.01" min="0"
                  name="securityDeposit" value={listing.securityDeposit}
                  onChange={(e) => setListingField("securityDeposit", e.target.value)}
                  error={errors.securityDeposit} placeholder="ឧ. 500"
                  leftIcon={<DollarSign className="h-4 w-4 text-slate-400" />} />
                <Input label="ប្រាក់មុន (ខែ)" type="number" step="0.01" min="0"
                  name="advancePayment" value={listing.advancePayment}
                  onChange={(e) => setListingField("advancePayment", e.target.value)}
                  placeholder="ឧ. 1" />
              </div>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <Maximize className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                  {isAdmin && isStructureLike
                    ? "ទំហំ និងលក្ខណៈអចលនទ្រព្យ (Property Specs)"
                    : "ទំហំ និងចំនួនបន្ទប់ (Specs)"}
                </h3>
              </div>
              {isAdmin && isRoomLike ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input label="សមត្ថភាព (នាក់)" type="number" min="1" name="capacity"
                    value={listing.capacity}
                    onChange={(e) => setListingField("capacity", e.target.value)}
                    error={errors.capacity} />
                </div>
              ) : isAdmin ? (
                <div className={isStructureLike
                  ? "grid grid-cols-1 gap-3 sm:grid-cols-5"
                  : "grid grid-cols-1 gap-3 sm:grid-cols-3"}>
                  <Input label="បន្ទប់គេង" type="number" min="0" name="bedrooms"
                    value={listing.bedrooms}
                    onChange={(e) => setListingField("bedrooms", e.target.value)}
                    placeholder="ឧ. 1" leftIcon={<BedDouble className="h-4 w-4 text-slate-400" />} />
                  <Input label="បន្ទប់ទឹក" type="number" min="0" name="bathrooms"
                    value={listing.bathrooms}
                    onChange={(e) => setListingField("bathrooms", e.target.value)}
                    placeholder="ឧ. 1" leftIcon={<Bath className="h-4 w-4 text-slate-400" />} />
                  <Input label="ផ្ទៃក្រឡា (m²)" type="number" step="0.1" min="0" name="areaSqm"
                    value={listing.areaSqm}
                    onChange={(e) => setListingField("areaSqm", e.target.value)}
                    placeholder="ឧ. 30" leftIcon={<Maximize className="h-4 w-4 text-slate-400" />} />
                  {isStructureLike && (
                    <Input label="ចំនួនជាន់" type="number" min="1" name="numberOfFloors"
                      value={listing.numberOfFloors}
                      onChange={(e) => setListingField("numberOfFloors", e.target.value)}
                      placeholder="ឧ. 2" leftIcon={<Building2 className="h-4 w-4 text-slate-400" />} />
                  )}
                  {isStructureLike && (
                    <Input label="ផ្ទៃដី (m²)" type="number" step="0.1" min="0" name="landSizeSqm"
                      value={listing.landSizeSqm}
                      onChange={(e) => setListingField("landSizeSqm", e.target.value)}
                      placeholder="ឧ. 150" leftIcon={<MapPin className="h-4 w-4 text-slate-400" />} />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <Input label="សមត្ថភាព (នាក់)" type="number" min="1" name="capacity"
                    value={listing.capacity}
                    onChange={(e) => setListingField("capacity", e.target.value)}
                    error={errors.capacity} />
                  <Input label="បន្ទប់គេង" type="number" min="0" name="bedrooms"
                    value={listing.bedrooms}
                    onChange={(e) => setListingField("bedrooms", e.target.value)}
                    placeholder="ឧ. 1" leftIcon={<BedDouble className="h-4 w-4 text-slate-400" />} />
                  <Input label="បន្ទប់ទឹក" type="number" min="0" name="bathrooms"
                    value={listing.bathrooms}
                    onChange={(e) => setListingField("bathrooms", e.target.value)}
                    placeholder="ឧ. 1" leftIcon={<Bath className="h-4 w-4 text-slate-400" />} />
                  <Input label="ផ្ទៃក្រឡា (m²)" type="number" step="0.1" min="0" name="areaSqm"
                    value={listing.areaSqm}
                    onChange={(e) => setListingField("areaSqm", e.target.value)}
                    placeholder="ឧ. 30" leftIcon={<Maximize className="h-4 w-4 text-slate-400" />} />
                </div>
              )}
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                  ស្ថានភាព និងកាលបរិច្ឆេទ (Status & Availability)
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Select label="ស្ថានភាព" name="status" options={STATUS_OPTIONS}
                  value={listing.status}
                  onChange={(e) => setListingField("status", e.target.value)} />
                <Input label="ចូលរស់នៅបានចាប់ពី" type="date" name="availableFrom"
                  value={listing.availableFrom}
                  onChange={(e) => setListingField("availableFrom", e.target.value)}
                  leftIcon={<Calendar className="h-4 w-4 text-slate-400" />} />
                <Select label="គ្រឿងសង្ហារិម" name="furnishing" options={FURNISHING_OPTIONS}
                  value={listing.furnishing}
                  onChange={(e) => setListingField("furnishing", e.target.value)} />
                {!isAdmin && (
                  <Select label="ប្រភេទអចលនទ្រព្យ" name="propertyType"
                    options={PROPERTY_TYPE_OPTIONS} value={listing.propertyType}
                    onChange={(e) => setListingField("propertyType", e.target.value)} />
                )}
                <Select label="កម្រិតផ្សាយ" name="listingScope"
                  options={LISTING_SCOPE_OPTIONS} value={listing.listingScope}
                  onChange={(e) => setListingField("listingScope", e.target.value)} />
              </div>
              {!isAdmin && eligibleHint && (
                <Alert variant="info" title="ការដាក់ស្នើ" description={eligibleHint} className="mt-1" />
              )}
            </Card>

            <Card className="space-y-3">
              <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                ការពិពណ៌នា (Description)
              </h3>
              <Textarea label="ការពិពណ៌នាបន្ទប់" name="description" value={listing.description}
                onChange={(e) => setListingField("description", e.target.value)}
                rows={4} placeholder="ពិពណ៌នាអំពីបន្ទប់ បរិស្ថាន សេវាជុំវិញ..." />
            </Card>

            <Collapsible
              key={`photos-${selectedHouse?.id || "none"}-${selectedRoomType?.id || "none"}`}
              title="រូបភាព (Photos)"
              hint="រូបភាពញ្ញា និងប្រភេទបន្ទប់"
              icon={ImageIcon}
              defaultOpen={isAdmin ? Boolean(selectedHouse) : true}
            >
              {isAdmin && !selectedHouse ? (
                <div className="space-y-3">
                  <div className={(!isAdmin || isRoomLike) ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        ញ្ញា (House)
                      </p>
                      {selectedHouse?.primaryImage ? (
                        <img src={selectedHouse.primaryImage} alt="house"
                          className="h-24 w-full rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-slate-200">
                          <span className="text-[11px] text-slate-400">គ្មានរូបភាព</span>
                        </div>
                      )}
                    </div>
                    {(!isAdmin || isRoomLike) && (
                      <div>
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          ប្រភេទបន្ទប់
                        </p>
                        {selectedRoomType?.primaryImage ? (
                          <img src={selectedRoomType.primaryImage} alt="room type"
                            className="h-24 w-full rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-slate-200">
                            <span className="text-[11px] text-slate-400">គ្មានរូបភាព</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <InlineNotice icon={ImageIcon}>
                    {isAdmin
                      ? "ជ្រើសរើស ឬបង្កើត House មុនពេលផ្ទុករូបភាព។"
                      : "ជ្រើសរើស ឬបង្កើត House និង Room Type មុនពេលផ្ទុករូបភាព។"}
                  </InlineNotice>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedHouse && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        រូបភាពញ្ញា (House Photos)
                      </p>
                      <ImageGallery
                        images={houseImages.images} loading={houseImages.loading}
                        error={houseImages.error} uploading={houseImages.uploading}
                        uploadError={houseImages.uploadError} canManage
                        onUpload={houseImages.upload} onRemove={houseImages.removeImage}
                        onSetPrimary={houseImages.setAsPrimary} onMove={houseImages.moveImage}
                        onRetry={houseImages.fetchImages}
                      />
                    </div>
                  )}
                  {selectedRoomType && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        រូបភាពប្រភេទបន្ទប់ (Room Type Photos)
                      </p>
                      <ImageGallery
                        images={roomTypeImages.images} loading={roomTypeImages.loading}
                        error={roomTypeImages.error} uploading={roomTypeImages.uploading}
                        uploadError={roomTypeImages.uploadError} canManage
                        onUpload={roomTypeImages.upload} onRemove={roomTypeImages.removeImage}
                        onSetPrimary={roomTypeImages.setAsPrimary} onMove={roomTypeImages.moveImage}
                        onRetry={roomTypeImages.fetchImages}
                      />
                    </div>
                  )}
                  {isAdmin && (
                    <InlineNotice icon={ImageIcon}>
                      ប្រព័ន្ធបច្ចុប្បន្នគាំទ្ររូបភាពកម្រិត House និង Room Type ប៉ុណ្ណោះ។
                    </InlineNotice>
                  )}
                </div>
              )}
            </Collapsible>

            <Collapsible
              key={`amenities-${selectedAdminRoom?.id || "none"}`}
              title="សម្ភារៈ និងសេវាកម្ម (Amenities)"
              hint={`${assignedAmenities.length} បានភ្ជាប់`}
              icon={Sparkles}
              defaultOpen={isAdmin ? Boolean(submittedRooms) : true}
            >
              {isAdmin && !selectedAdminRoom ? (
                <InlineNotice icon={Sparkles}>
                  បំពេញព័ត៌មានបន្ទប់ រួចចុច «រក្សាទុកព្រាង» សិន។ បន្ទាប់មកអាចភ្ជាប់គ្រឿងបរិក្ខារនៅទីនេះ។
                </InlineNotice>
              ) : amenitiesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {masterAmenities.length === 0 && (
                    <p className="text-[12px] text-slate-400">
                      មិនទាន់មានគ្រឿងបរិក្ខារ។ បន្ថែមតាមទំព័រ «គ្រឿងបរិក្ខារ»។
                    </p>
                  )}
                  {masterAmenities.map((a) => {
                    const assigned = assignedAmenities.some(
                      (x) => Number(x.amenityId) === Number(a.id)
                    );
                    return (
                      <button key={a.id} type="button" disabled={amenityBusy === a.id}
                        onClick={() => toggleAmenity(a)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60 ${
                          assigned
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-300"
                        }`}>
                        <CheckCircle2 className={`h-3.5 w-3.5 ${
                          assigned ? "text-emerald-500" : "text-slate-300"
                        }`} />
                        {a.name || `#${a.id}`}
                      </button>
                    );
                  })}
                </div>
              )}
            </Collapsible>

            <Collapsible
              key={`utilities-${selectedAdminRoom?.id || "none"}`}
              title="ថ្លៃសេវា (Utilities)"
              hint={`${assignedUtilities.length} បានភ្ជាប់`}
              icon={Zap}
              defaultOpen={isAdmin ? Boolean(submittedRooms) : true}
            >
              {isAdmin && !selectedAdminRoom ? (
                <InlineNotice icon={Zap}>
                  បន្ទាប់ពីរក្សាទុកបន្ទប់ជាព្រាង អ្នកអាចភ្ជាប់សេវាកម្ម និងកំណត់ Included នៅទីនេះ។
                </InlineNotice>
              ) : utilitiesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {masterUtilities.length === 0 && (
                    <p className="text-[12px] text-slate-400">
                      មិនទាន់មានសេវា។ បន្ថែមតាមទំព័រ «សេវា»។
                    </p>
                  )}
                  {masterUtilities.map((u) => {
                    const entry = assignedUtilities.find(
                      (x) => Number(x.utilityTypeId) === Number(u.id)
                    );
                    const rate = utilityRates.find(
                      (candidate) => Number(candidate.utilityTypeId) === Number(u.id)
                    );
                    const rateForm = utilityRateForm(u.id);
                    return (
                      <div key={u.id}
                        className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                          <Zap className={`h-4 w-4 ${
                            entry ? "text-amber-500" : "text-slate-400"
                          }`} />
                          <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200">
                            {u.name}
                          </p>
                          {u.unit && <p className="text-[11px] text-slate-400">({u.unit})</p>}
                          </div>
                          <div className="flex items-center gap-3">
                          {entry && (
                            <Checkbox label="រាប់បញ្ចូលក្នុងឈ្នួល"
                              checked={Boolean(entry.isIncluded)}
                              disabled={utilityBusy === u.id}
                              onChange={(e) => handleAssignUtility(u, e.target.checked)} />
                          )}
                          {entry ? (
                            <Button variant="outline" size="sm"
                              loading={utilityBusy === u.id}
                              onClick={() => handleRemoveUtility(u.id)}>
                              ដក
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm"
                              loading={utilityBusy === u.id}
                              onClick={() => handleAssignUtility(u, false)}>
                              បន្ថែម
                            </Button>
                          )}
                          </div>
                        </div>
                        {isAdmin && selectedHouse && (
                          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-200 pt-3 sm:grid-cols-4 dark:border-gray-700">
                            <Input label="អត្រា" type="number" step="0.01" min="0"
                              value={rateForm.rate || rate?.rate || ""}
                              onChange={(e) => updateUtilityRateForm(u.id, "rate", e.target.value)}
                              placeholder="ឧ. 25" />
                            <Input label="មានប្រសិទ្ធភាពពី" type="date"
                              value={rateForm.effectiveFrom || rate?.effectiveFrom || ""}
                              onChange={(e) => updateUtilityRateForm(u.id, "effectiveFrom", e.target.value)} />
                            <Input label="ដល់ (ជាជម្រើស)" type="date"
                              value={rateForm.effectiveTo || rate?.effectiveTo || ""}
                              onChange={(e) => updateUtilityRateForm(u.id, "effectiveTo", e.target.value)} />
                            <div className="flex items-end">
                              <Button variant="outline" size="sm" className="w-full"
                                loading={utilityBusy === `rate-${u.id}`}
                                onClick={() => saveUtilityRate(u)}>
                                {rate ? "កែអត្រា" : "បន្ថែមអត្រា"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Collapsible>

            <Collapsible
              key={`nearby-${selectedHouse?.id || "none"}`}
              title="ទីតាំងនៅជិតៗ (Nearby Locations)"
              hint={`${nearby.length} កន្លែង`}
              icon={Compass}
              defaultOpen={isAdmin ? Boolean(selectedHouse) : true}
            >
              {isAdmin && !selectedHouse ? (
                <InlineNotice icon={Compass}>
                  ជ្រើសរើស ឬបង្កើត House មុនពេលបន្ថែមទីតាំងនៅជិត។
                </InlineNotice>
              ) : nearbyLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {nearby.length === 0 && (
                      <p className="text-[12px] text-slate-400">មិនទាន់មានទីតាំងនៅជិតទេ។</p>
                    )}
                    {nearby.map((n) => (
                      <div key={n.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-4 w-4 shrink-0 text-[#0f2942] dark:text-sky-400" />
                          <div>
                            <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200">
                              {n.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {NEARBY_CATEGORY_OPTIONS.find((o) => o.value === n.category)?.label
                                || n.category} · {n.distanceKm} km
                              {n.travelMinutes != null ? ` · ~${n.travelMinutes} នាទី` : ""}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm"
                          leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                          onClick={() => handleDeleteNearby(n.id)}>
                          លុប
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-dashed border-slate-300 p-3 dark:border-gray-700">
                    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      បន្ថែមទីតាំងថ្មី
                    </p>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
                      <Input label="ឈ្មោះ" name="name" value={newNearby.name}
                        onChange={(e) => setNewNearby((p) => ({ ...p, name: e.target.value }))}
                        error={nearbyErrors.name} placeholder="ឧ. ផ្សារ អូរឫស្សី" />
                      <Select label="ប្រភេទ" name="category"
                        options={NEARBY_CATEGORY_OPTIONS} value={newNearby.category}
                        onChange={(e) => setNewNearby((p) => ({ ...p, category: e.target.value }))} />
                      <Input label="ចម្ងាយ (km)" type="number" step="0.1" min="0"
                        name="distanceKm" value={newNearby.distanceKm}
                        onChange={(e) => setNewNearby((p) => ({ ...p, distanceKm: e.target.value }))}
                        error={nearbyErrors.distanceKm} placeholder="ឧ. 0.5" />
                      <Input label="ពេល (នាទី)" type="number" min="0"
                        name="travelMinutes" value={newNearby.travelMinutes}
                        onChange={(e) => setNewNearby((p) => ({ ...p, travelMinutes: e.target.value }))}
                        error={nearbyErrors.travelMinutes} placeholder="ឧ. 5" />
                    </div>
                    <div className="mt-2.5 flex justify-end">
                      <Button variant="primary" size="sm"
                        leftIcon={<Plus className="h-4 w-4" />}
                        loading={savingNearby} onClick={handleAddNearby}>
                        បន្ថែម
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Collapsible>
          </Phase>

          {/* ACTIONS BAR */}
          <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={onBack} disabled={submitting}>បោះបង់</Button>
              {isAdmin ? (
                <Button variant="outline"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={handleAdminSubmit} loading={submitting}>
                  រក្សាទុកព្រាង
                </Button>
              ) : (
                <Button variant="outline"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  loading={saving} onClick={saveOwnerListing}>
                  រក្សាទុកលម្អិត
                </Button>
              )}
            </div>
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <Checkbox label="ផ្សាយភ្លាមៗ"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)} />
                <Button variant="primary" leftIcon={<Send className="h-4 w-4" />}
                  onClick={handleAdminSubmit} loading={submitting}>
                  {publishImmediately
                    ? `បង្កើត និងផ្សាយ (${physicalRoomsCount})`
                    : `បង្កើតព្រាង (${physicalRoomsCount})`}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" leftIcon={<ScanEye className="h-4 w-4" />}
                  onClick={handlePreview} disabled={!room}>
                  មើលជាមុន
                </Button>
              </div>
            )}
          </div>

          {isAdmin && submittedRooms === null && (
            <p className="px-1 text-[11.5px] leading-relaxed text-slate-400">
              រូបភាព/គ្រឿងបរិក្ខារ/សេវា/ទីតាំងនៅជិត គឺគ្រប់គ្រងនៅកម្រិតញ្ញា និងបន្ទប់ដោយម្ចាស់។
            </p>
          )}
        </div>
      )}
    </div>
  );
}