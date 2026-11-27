import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Building2,
  DoorOpen,
  LandPlot,
  Save,
  Globe,
  ImagePlus,
  Trash2,
  Plus,
  MapPin,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Badge,
  Alert,
  Skeleton,
} from "../../components/ui/index.js";
import { adminPropertyApi } from "../../api/adminProperty.api.js";
import { adminRoomsApi } from "../../api/adminRooms.api.js";
import { houseApi } from "../../api/house.api.js";
import {
  PROPERTY_TYPE_OPTIONS,
  ROOM_STATUS_OPTIONS,
  FURNISHING_OPTIONS,
  NEARBY_CATEGORY_OPTIONS,
} from "./adminPropertyConstants.js";
import PublicationStatusBadge from "../../components/room/PublicationStatusBadge.jsx";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== "" ? n : null;
};

const EMPTY_HOUSE = {
  name: "",
  address: "",
  cityProvince: "",
  postalCode: "",
  description: "",
  houseNumber: "",
  streetNumber: "",
  sangkat: "",
  khan: "",
};

const EMPTY_ROOM_TYPE = {
  name: "",
  description: "",
  capacity: 1,
  defaultRent: "",
  defaultDeposit: "",
};

const EMPTY_OWNER_RECORD = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

const EMPTY_LISTING = {
  roomNumber: "",
  name: "",
  floorNumber: "",
  capacity: "",
  monthlyRent: "",
  securityDeposit: "",
  advancePayment: "",
  availableFrom: "",
  status: "AVAILABLE",
  furnishing: "",
  description: "",
  bedrooms: "",
  bathrooms: "",
  areaSqm: "",
  landSizeSqm: "",
  numberOfFloors: "",
};

const PROPERTY_TYPE_ICONS = {
  HOUSE: Home,
  VILLA: LandPlot,
  APARTMENT: Building2,
  CONDO: Building2,
  ROOM: DoorOpen,
};

const fieldSet = (setter) => (e) => {
  const { name, value } = e.target;
  setter((prev) => ({ ...prev, [name]: value }));
};

const ownerLabel = (o) =>
  o ? [o.firstName, o.lastName].filter(Boolean).join(" ").trim() || o.username || o.name || `#${o.id}` : "";

const isEmpty = (value) => value === null || value === undefined || String(value).trim() === "";

export default function AdminPropertyPostingPage() {
  const navigate = useNavigate();
  const { id: roomId } = useParams();
  const isEditing = !!roomId;

  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(null);

  const [propertyType, setPropertyType] = useState("");
  const [ownerKind, setOwnerKind] = useState(""); // "account" | "record" | "create"
  const [ownerUserId, setOwnerUserId] = useState("");
  const [propertyOwnerId, setPropertyOwnerId] = useState("");
  const [ownerRecord, setOwnerRecord] = useState(EMPTY_OWNER_RECORD);
  const [ownerRecordSaving, setOwnerRecordSaving] = useState(false);

  const [ownerHouses, setOwnerHouses] = useState([]);
  const [ownerRoomTypes, setOwnerRoomTypes] = useState([]);
  const [houseMode, setHouseMode] = useState("new"); // "new" | "reuse"
  const [houseId, setHouseId] = useState("");
  const [house, setHouse] = useState(EMPTY_HOUSE);

  const [roomTypeMode, setRoomTypeMode] = useState("create"); // "create" | "reuse"
  const [roomTypeId, setRoomTypeId] = useState("");
  const [roomType, setRoomType] = useState(EMPTY_ROOM_TYPE);

  const [listing, setListing] = useState(EMPTY_LISTING);
  const [amenityIds, setAmenityIds] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);

  const [existingImages, setExistingImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [imageBusy, setImageBusy] = useState(false);

  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const currentRoom = useMemo(
    () => (isEditing ? parseInt(roomId, 10) : null),
    [isEditing, roomId]
  );

  const isRoomLike = propertyType === "ROOM";
  const isUnitLike = propertyType === "APARTMENT" || propertyType === "CONDO";
  const isStructureLike = propertyType === "HOUSE" || propertyType === "VILLA";

  const fetchCatalog = useCallback(async () => {
    setCatalogError(null);
    try {
      const data = await adminPropertyApi.getCatalog();
      setCatalog(data);
    } catch (err) {
      setCatalogError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "មិនអាចផ្ទុកទិន្នន័យជំនួយបានទេ។"
      );
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const loadOwnerAssets = useCallback(
    async (userId) => {
      if (!userId) return;
      try {
        const [houses, roomTypes] = await Promise.all([
          adminRoomsApi.getOwnerHouses(userId),
          adminRoomsApi.getOwnerRoomTypes(userId),
        ]);
        setOwnerHouses(houses || []);
        setOwnerRoomTypes(roomTypes || []);
      } catch {
        setOwnerHouses([]);
        setOwnerRoomTypes([]);
      }
    },
    []
  );

  const hydrateFromResponse = useCallback(
    async (resp) => {
      setPropertyType(resp.propertyType || "");
      if (resp.accountOwner && resp.ownerUserId) {
        setOwnerKind("account");
        setOwnerUserId(String(resp.ownerUserId));
        await loadOwnerAssets(resp.ownerUserId);
      } else if (resp.propertyOwnerId) {
        setOwnerKind("record");
        setPropertyOwnerId(String(resp.propertyOwnerId));
      }
      const houseIdStr = resp.houseId ? String(resp.houseId) : "";
      setHouseId(houseIdStr);
      if (houseIdStr) {
        setHouseMode("reuse");
        try {
          const images = await houseApi.getHouseImages(resp.houseId);
          setExistingImages(images || []);
        } catch {
          setExistingImages([]);
        }
      }
      setHouse({
        name: resp.propertyName || "",
        address: resp.address || "",
        cityProvince: resp.cityProvince || "",
        postalCode: resp.postalCode || "",
        description: resp.description || "",
        houseNumber: resp.houseNumber || "",
        streetNumber: resp.streetNumber || "",
        sangkat: resp.sangkat || "",
        khan: resp.khan || "",
      });
      if (resp.propertyType === "ROOM" && resp.roomTypeId) {
        setRoomTypeMode("reuse");
        setRoomTypeId(String(resp.roomTypeId));
      } else {
        setRoomTypeMode("create");
      }
      setListing({
        roomNumber: resp.roomNumber || "",
        name: resp.roomName || "",
        floorNumber: resp.floorNumber === null || resp.floorNumber === undefined ? "" : String(resp.floorNumber),
        capacity: resp.capacity === null || resp.capacity === undefined ? "" : String(resp.capacity),
        monthlyRent: resp.monthlyRent === null || resp.monthlyRent === undefined ? "" : String(resp.monthlyRent),
        securityDeposit:
          resp.securityDeposit === null || resp.securityDeposit === undefined ? "" : String(resp.securityDeposit),
        advancePayment:
          resp.advancePayment === null || resp.advancePayment === undefined ? "" : String(resp.advancePayment),
        availableFrom: resp.availableFrom || "",
        status: resp.status || "AVAILABLE",
        furnishing: resp.furnishing || "",
        description: resp.description || "",
        bedrooms: resp.bedrooms === null || resp.bedrooms === undefined ? "" : String(resp.bedrooms),
        bathrooms: resp.bathrooms === null || resp.bathrooms === undefined ? "" : String(resp.bathrooms),
        areaSqm: resp.areaSqm === null || resp.areaSqm === undefined ? "" : String(resp.areaSqm),
        landSizeSqm: resp.landSizeSqm === null || resp.landSizeSqm === undefined ? "" : String(resp.landSizeSqm),
        numberOfFloors:
          resp.numberOfFloors === null || resp.numberOfFloors === undefined ? "" : String(resp.numberOfFloors),
      });
      setAmenityIds(resp.amenityIds || []);
      setUtilities(
        (resp.utilities || []).map((u) => ({
          utilityTypeId: String(u.utilityTypeId),
          isIncluded: !!u.isIncluded,
          rate: u.rate === null || u.rate === undefined ? "" : String(u.rate),
        }))
      );
      setNearbyLocations(
        (resp.nearbyLocations || []).map((n) => ({
          name: n.name,
          category: n.category || "",
          distanceKm: n.distanceKm === null || n.distanceKm === undefined ? "" : String(n.distanceKm),
          travelMinutes:
            n.travelMinutes === null || n.travelMinutes === undefined ? "" : String(n.travelMinutes),
        }))
      );
    },
    [loadOwnerAssets]
  );

  useEffect(() => {
    if (!isEditing || !currentRoom) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const resp = await adminPropertyApi.getProperty(currentRoom);
        if (!cancelled) await hydrateFromResponse(resp);
      } catch (err) {
        if (!cancelled)
          setLoadError(err.response?.data?.message || err.response?.data?.error || "មិនអាចផ្ទុកព្រាងបានទេ។");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditing, currentRoom, hydrateFromResponse]);

  const handleOwnerKind = (e) => {
    setOwnerKind(e.target.value);
    setOwnerUserId("");
    setPropertyOwnerId("");
    setOwnerHouses([]);
    setOwnerRoomTypes([]);
    setHouseMode("new");
    setHouseId("");
    setRoomTypeMode("create");
    setRoomTypeId("");
  };

  const handleOwnerAccountChange = (e) => {
    const value = e.target.value;
    setOwnerUserId(value);
    setOwnerHouses([]);
    setOwnerRoomTypes([]);
    setHouseMode("new");
    setHouseId("");
    setRoomTypeMode("create");
    setRoomTypeId("");
    if (value) loadOwnerAssets(parseInt(value, 10));
  };

  const handleHouseModeChange = (e) => {
    setHouseMode(e.target.value);
    setHouseId("");
    setErrors((prev) => ({ ...prev, house: undefined }));
  };

  const handleRoomTypeModeChange = (e) => {
    setRoomTypeMode(e.target.value);
    setRoomTypeId("");
  };

  const handleCreateOwnerRecord = async () => {
    if (!ownerRecord.name.trim()) {
      setErrors((prev) => ({ ...prev, ownerRecord: "តម្រូវឱ្យបញ្ចូលឈ្មោះម្ចាស់" }));
      return;
    }
    setOwnerRecordSaving(true);
    try {
      const created = await adminPropertyApi.createPropertyOwner({
        name: ownerRecord.name.trim(),
        email: ownerRecord.email.trim() || undefined,
        phone: ownerRecord.phone.trim() || undefined,
        address: ownerRecord.address.trim() || undefined,
        notes: ownerRecord.notes.trim() || undefined,
      });
      setCatalog((prev) =>
        prev ? { ...prev, propertyOwners: [created, ...(prev.propertyOwners || [])] } : prev
      );
      setPropertyOwnerId(String(created.id));
      setOwnerKind("record");
      setOwnerRecord(EMPTY_OWNER_RECORD);
      setErrors((prev) => ({ ...prev, ownerRecord: undefined }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        ownerRecord:
          err.response?.data?.message || err.response?.data?.error || "ការបង្កើតកំណត់ត្រាម្ចាស់បរាជ័យ។",
      }));
    } finally {
      setOwnerRecordSaving(false);
    }
  };

  const toggleAmenity = (value) => {
    setAmenityIds((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleUtilityChange = (utilityTypeId, field, value) => {
    setUtilities((prev) => {
      const index = prev.findIndex((u) => u.utilityTypeId === utilityTypeId);
      if (index === -1) {
        const next = { utilityTypeId, isIncluded: false, rate: "" };
        if (field === "isIncluded") next.isIncluded = !!value;
        if (field === "rate") next.rate = value;
        return [...prev, next];
      }
      return prev.map((u, i) =>
        i === index ? { ...u, [field]: field === "isIncluded" ? !!value : value } : u
      );
    });
  };

  const addNearby = () =>
    setNearbyLocations((prev) => [...prev, { name: "", category: "", distanceKm: "", travelMinutes: "" }]);

  const updateNearby = (index, field, value) =>
    setNearbyLocations((prev) => prev.map((n, i) => (i === index ? { ...n, [field]: value } : n)));

  const removeNearby = (index) =>
    setNearbyLocations((prev) => prev.filter((_, i) => i !== index));

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removePendingFile = (index) =>
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));

  const removeExistingImage = async (imageId) => {
    if (!houseId) return;
    setImageBusy(true);
    try {
      await houseApi.deleteHouseImage(parseInt(houseId, 10), imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        photos: err.response?.data?.message || err.response?.data?.error || "ការលុបរូបភាពបរាជ័យ។",
      }));
    } finally {
      setImageBusy(false);
    }
  };

  const buildPayload = (publish) => {
    const payload = {
      propertyType,
      roomNumber: isRoomLike || isUnitLike ? listing.roomNumber.trim() || null : null,
      name: listing.name.trim() || null,
      floorNumber: isRoomLike || isUnitLike ? (isEmpty(listing.floorNumber) ? null : toNum(listing.floorNumber)) : null,
      capacity: isRoomLike ? toNum(listing.capacity) : null,
      monthlyRent: toNum(listing.monthlyRent),
      securityDeposit: toNum(listing.securityDeposit),
      advancePayment: isEmpty(listing.advancePayment) ? null : toNum(listing.advancePayment),
      availableFrom: listing.availableFrom || null,
      status: listing.status || "AVAILABLE",
      furnishing: listing.furnishing || null,
      description: listing.description.trim() || null,
      bedrooms: isEmpty(listing.bedrooms) ? null : toNum(listing.bedrooms),
      bathrooms: isEmpty(listing.bathrooms) ? null : toNum(listing.bathrooms),
      areaSqm: isEmpty(listing.areaSqm) ? null : toNum(listing.areaSqm),
      landSizeSqm: isEmpty(listing.landSizeSqm) ? null : toNum(listing.landSizeSqm),
      numberOfFloors: isEmpty(listing.numberOfFloors) ? null : toNum(listing.numberOfFloors),
      amenities: undefined,
      amenityIds: amenityIds.length ? amenityIds : null,
      utilities: utilities.filter((u) => u.utilityTypeId).map((u) => ({
        utilityTypeId: parseInt(u.utilityTypeId, 10),
        isIncluded: !!u.isIncluded,
        rate: isEmpty(u.rate) ? null : toNum(u.rate),
      })),
      nearbyLocations: nearbyLocations
        .filter((n) => n.name.trim() && n.category)
        .map((n) => ({
          name: n.name.trim(),
          category: n.category,
          distanceKm: toNum(n.distanceKm),
          travelMinutes: toNum(n.travelMinutes),
        })),
      publish: !!publish,
    };

    if (ownerKind === "account" && ownerUserId) {
      payload.ownerUserId = parseInt(ownerUserId, 10);
    } else if (ownerKind === "record" && propertyOwnerId) {
      payload.ownerRecordId = parseInt(propertyOwnerId, 10);
    } else {
      payload.ownerRecord = {
        name: ownerRecord.name.trim(),
        email: ownerRecord.email.trim() || undefined,
        phone: ownerRecord.phone.trim() || undefined,
        address: ownerRecord.address.trim() || undefined,
        notes: ownerRecord.notes.trim() || undefined,
      };
    }

    if (isEditing) {
      payload.house = {
        name: house.name.trim() || "Property",
        address: house.address.trim() || "—",
        cityProvince: house.cityProvince.trim() || undefined,
        postalCode: house.postalCode.trim() || undefined,
        description: house.description.trim() || undefined,
        houseNumber: house.houseNumber?.trim() || undefined,
        streetNumber: house.streetNumber?.trim() || undefined,
        sangkat: house.sangkat?.trim() || undefined,
        khan: house.khan?.trim() || undefined,
        propertyType: propertyType || undefined,
      };
    } else if (houseMode === "reuse" && houseId) {
      payload.houseId = parseInt(houseId, 10);
    } else {
      payload.house = {
        name: house.name.trim(),
        address: house.address.trim(),
        cityProvince: house.cityProvince.trim() || undefined,
        postalCode: house.postalCode.trim() || undefined,
        description: house.description.trim() || undefined,
        houseNumber: house.houseNumber?.trim() || undefined,
        streetNumber: house.streetNumber?.trim() || undefined,
        sangkat: house.sangkat?.trim() || undefined,
        khan: house.khan?.trim() || undefined,
        propertyType: propertyType || undefined,
        furnishing: listing.furnishing || undefined,
      };
    }

    if (isRoomLike) {
      if (roomTypeMode === "reuse" && roomTypeId) {
        payload.roomTypeId = parseInt(roomTypeId, 10);
      } else {
        payload.roomType = {
          name: roomType.name.trim(),
          description: roomType.description.trim() || undefined,
          capacity: roomType.capacity ? toNum(roomType.capacity) : 1,
          defaultRent: isEmpty(roomType.defaultRent) ? 0 : toNum(roomType.defaultRent),
          defaultDeposit: isEmpty(roomType.defaultDeposit) ? 0 : toNum(roomType.defaultDeposit),
        };
      }
    }

    return payload;
  };

  const validate = () => {
    const errs = {};
    if (!propertyType) errs.propertyType = "តម្រូវឱ្យជ្រើសរើសប្រភេទអចលនទ្រព្យ";
    const hasOwner =
      (ownerKind === "account" && ownerUserId) ||
      (ownerKind === "record" && propertyOwnerId) ||
      (ownerKind === "create" && ownerRecord.name.trim());
    if (!hasOwner) errs.owner = "តម្រូវឱ្យជ្រើសរើស ឬបង្កើតម្ចាស់";
    if (ownerKind === "create" && !ownerRecord.name.trim())
      errs.ownerRecord = "តម្រូវឱ្យបញ្ចូលឈ្មោះម្ចាស់";

    const houseProvided =
      (houseMode === "reuse" && houseId) || (house.name.trim() && house.address.trim());
    if (!houseProvided && !isEditing) errs.house = "តម្រូវឱ្យបញ្ចូលឈ្មោះផ្ទះ/អាគារ និងអាសយដ្ឋាន";
    if (isRoomLike && roomTypeMode === "create" && !roomType.name.trim())
      errs.roomType = "តម្រូវឱ្យបញ្ចូលឈ្មោះប្រភេទបន្ទប់";
    if (isRoomLike && isEmpty(listing.capacity)) errs.capacity = "តម្រូវឱ្យបញ្ចូលសមត្ថភាព";
    if ((isRoomLike || isUnitLike) && !listing.roomNumber.trim()) errs.roomNumber = "តម្រូវឱ្យបញ្ចូលលេខបន្ទប់/លេខឯកតា";
    if (isUnitLike && isEmpty(listing.floorNumber)) errs.floorNumber = "តម្រូវឱ្យបញ្ចូលជាន់";
    if (isEmpty(listing.monthlyRent) || toNum(listing.monthlyRent) === null)
      errs.monthlyRent = "តម្រូវឱ្យបញ្ចូលថ្លៃជួលប្រចាំខែ";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (publish) => {
    if (!validate()) {
      return;
    }
    setSaving(true);
    setErrors((prev) => ({ ...prev, form: undefined }));
    try {
      const payload = buildPayload(publish);
      let result;
      if (isEditing) {
        result = await adminPropertyApi.updateProperty(currentRoom, payload);
      } else {
        result = await adminPropertyApi.createProperty(payload);
      }
      const resultHouseId = result?.houseId;
      if (resultHouseId && pendingFiles.length) {
        try {
          await houseApi.uploadHouseImages(resultHouseId, pendingFiles);
        } catch (err) {
          setErrors((prev) => ({
            ...prev,
            photos: err.response?.data?.message || err.response?.data?.error || "រូបភាពមួយចំនួនមិនអាចផ្ទុកឡើងបានទេ។",
          }));
        }
      }
      setPendingFiles([]);
      if (publish) {
        navigate("/admin/properties");
      } else {
        navigate("/admin/properties/drafts");
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.response?.data?.message || err.response?.data?.error || "ការរក្សាទុកបរាជ័យ។",
      }));
    } finally {
      setSaving(false);
    }
  };

  const ownerSelectOptions = useMemo(() => {
    const options = [];
    const accounts = catalog?.ownerAccounts || [];
    if (accounts.length) {
      options.push({ value: "__header_accounts", label: "— គណនី OWNER — ", disabled: true });
      accounts.forEach((o) => options.push({ value: String(o.id), label: `${ownerLabel(o)} (${o.email || ""})` }));
    }
    const records = catalog?.propertyOwners || [];
    if (records.length) {
      options.push({ value: "__header_records", label: "— កំណត់ត្រាក្រៅប្រព័ន្ធ —", disabled: true });
      records.forEach((o) => options.push({ value: String(o.id), label: `${o.name}${o.email ? ` (${o.email})` : ""}` }));
    }
    return options;
  }, [catalog]);

  const renderOwnerSelect = () => {
    if (ownerKind === "account") {
      return (
        <Select
          label="គណនី OWNER (មានគណនី TeasJul)"
          placeholder="ជ្រើសរើសគណនីម្ចាស់"
          value={ownerUserId}
          onChange={handleOwnerAccountChange}
          options={[ ...ownerSelectOptions.filter((o) => o.value !== "__header_records"), 
          ].filter((o) => o.value === "__header_accounts" || ownerSelectOptions.some((x) => x.value === "__header_accounts" && o.value === x.value) || !o.disabled)}
        />
      );
    }
    if (ownerKind === "record") {
      return (
        <Select
          label="កំណត់ត្រាម្ចាស់ (មិនមានគណនី TeasJul)"
          placeholder="ជ្រើសរើសកំណត់ត្រាម្ចាស់"
          value={propertyOwnerId}
          onChange={(e) => setPropertyOwnerId(e.target.value)}
          options={ownerSelectOptions.filter((o) => o.value !== "__header_accounts")}
        />
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate("/admin/properties")}>
            ត្រឡប់
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {isEditing ? "បន្តកែសម្រួលអចលនទ្រព្យ" : "ផ្សាយអចលនទ្រព្យថ្មី"}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
              <Globe className="h-3.5 w-3.5" />
              ការផ្សាយជំនួសម្ចាស់អចលនទ្រព្យ — ពិតជាយន្តការផ្សេងពីផ្ទាំងគ្រប់គ្រងរបស់ OWNER។
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Badge variant={catalog ? "info" : "default"}>
              <PublicationStatusBadge status={catalog ? undefined : undefined} />
            </Badge>
          )}
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchCatalog} disabled={saving}>
            ធ្វើឱ្យស្រស់
          </Button>
        </div>
      </div>

      {catalogError && (
        <Alert variant="danger" title="កំហុស" description={catalogError} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={fetchCatalog}>
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      {loadError && (
        <Alert variant="danger" title="កំហុស" description={loadError} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/properties/drafts")}>
              ត្រឡប់ទៅព្រាង
            </Button>
          </div>
        </Alert>
      )}

      {errors.form && (
        <Alert variant="danger" title="មិនអាចរក្សាទុកបានទេ" description={errors.form} dismissible />
      )}

      {!catalog ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <>
          {/* 1. PROPERTY TYPE */}
          <Card
            title="1. ប្រភេទអចលនទ្រព្យ"
            description="ប្រភេទកំណត់ព័ត៌មានដែលត្រូវបំពេញខាងក្រោម។"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {PROPERTY_TYPE_OPTIONS.map((opt) => {
                const Icon = PROPERTY_TYPE_ICONS[opt.value];
                const active = propertyType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setPropertyType(opt.value);
                      setErrors((prev) => ({ ...prev, propertyType: undefined }));
                    }}
                    className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
                      active
                        ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/40"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-sky-600 dark:text-sky-400" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${active ? "text-sky-700 dark:text-sky-300" : "text-slate-700 dark:text-slate-200"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.propertyType && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.propertyType}</p>}
            {propertyType && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {isRoomLike && "បន្ទប់ (ROOM)៖ ផ្ទះ + ប្រភេទបន្ទប់ + លេខបន្ទប់ + សមត្ថភាព។"}
                {isUnitLike && "អាផាតមិន/ខុនដូ៖ អាគារ + លេខឯកតា + ជាន់ (មិនត្រូវការប្រភេទបន្ទប់)។"}
                {isStructureLike && "ផ្ទះ/វីឡា៖ អចលនទ្រព្យទាំងមូល (មិនត្រូវការលេខបន្ទប់ ឬប្រភេទបន្ទប់)។"}
              </p>
            )}
          </Card>

          {/* 2. OWNER */}
          <Card title="2. ម្ចាស់អចលនទ្រព្យ" description="ជ្រើសរើសម្ចាស់ដែលមានគណនី ឬបង្កើតកំណត់ត្រាម្ចាស់ដោយគ្មានគណនី TeasJul។">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => { handleOwnerKind({ target: { value: "account" } }); }}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    ownerKind === "account"
                      ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/40"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">គណនី OWNER</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ម្ចាស់ប្រើប្រាស់ TeasJul ជាមួយគណនីសម្រាប់ចូល។</p>
                </button>
                <button
                  type="button"
                  onClick={() => { handleOwnerKind({ target: { value: "record" } }); }}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    ownerKind === "record"
                      ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/40"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">កំណត់ត្រាអតិថិជន (គ្មានគណនី)</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ម្ចាស់មិនប្រើ TeasJul — គ្រាន់តែរក្សាទុកព័ត៌មានកម្មសិទ្ធិ។</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setOwnerKind("create"); }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-400 dark:border-gray-700 dark:text-slate-300"
                >
                  <UserPlus className="h-4 w-4" />
                  បង្កើតម្ចាស់ថ្មី (គ្មានគណនី)
                </button>
              </div>

              {ownerKind && ownerKind !== "create" && (
                <div className="max-w-lg">{renderOwnerSelect()}</div>
              )}

              {ownerKind === "create" && (
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40 sm:grid-cols-2">
                  <Input label="ឈ្មោះម្ចាស់" required name="name" value={ownerRecord.name} onChange={fieldSet(setOwnerRecord)} placeholder="ឈ្មោះអ្នកជាម្ចាស់"
                    error={errors.ownerRecord}
                    helperText="មិនមានការបង្កើតគណនី ឬពាក្យសម្ងាត់ស្វ័យប្រវត្តិទេ។" />
                  <Input label="អ៊ីមែល" type="email" name="email" value={ownerRecord.email} onChange={fieldSet(setOwnerRecord)} placeholder="ជម្រើស" />
                  <Input label="ទូរស័ព្ទ" name="phone" value={ownerRecord.phone} onChange={fieldSet(setOwnerRecord)} placeholder="ជម្រើស" />
                  <Input label="អាសយដ្ឋាន" name="address" value={ownerRecord.address} onChange={fieldSet(setOwnerRecord)} placeholder="ជម្រើស" />
                  <Input label="កំណត់ចំណាំ" name="notes" value={ownerRecord.notes} onChange={fieldSet(setOwnerRecord)} placeholder="ជម្រើស" />
                  <div className="flex items-end">
                    <Button variant="primary" size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={handleCreateOwnerRecord} loading={ownerRecordSaving}>
                      រក្សាទុកម្ចាស់
                    </Button>
                  </div>
                </div>
              )}
              {errors.owner && <p className="text-sm text-red-600 dark:text-red-400">{errors.owner}</p>}
            </div>
          </Card>

          {/* 3. PROPERTY / BUILDING */}
          <Card title="3. ព័ត៌មានអចលនទ្រព្យ / អាគារ" description="ឈ្មោះ ទីតាំង និងការពិពណ៌នារបស់អចលនទ្រព្យ។">
            <div className="space-y-4">
              {ownerKind === "account" && ownerUserId && ownerHouses.length > 0 && (
                <div className="max-w-lg">
                  <Select
                    label="របៀបផ្ទះ/អាគារ"
                    value={houseMode}
                    onChange={handleHouseModeChange}
                    options={[
                      { value: "new", label: "បង្កើតផ្ទះ/អាគារថ្មី" },
                      { value: "reuse", label: "ប្រើប្រាស់ផ្ទះ/អាគារដែលមានស្រាប់" },
                    ]}
                  />
                  {houseMode === "reuse" && (
                    <div className="mt-3">
                      <Select
                        label="ជ្រើសរើសផ្ទះ/អាគារ"
                        value={houseId}
                        onChange={(e) => setHouseId(e.target.value)}
                        options={ownerHouses.map((h) => ({ value: String(h.id), label: `${h.name} — ${h.address || ""}` }))}
                      />
                    </div>
                  )}
                </div>
              )}

              {!(houseMode === "reuse" && houseId) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="ឈ្មោះផ្ទះ/អាគារ" required name="name" value={house.name} onChange={fieldSet(setHouse)} placeholder="ឧ. វីឡា សំណាង" />
                  <Input label="លេខកូដប្រៃសណីយ៍" name="postalCode" value={house.postalCode} onChange={fieldSet(setHouse)} placeholder="ជម្រើស" />
                  <Input label="ផ្ទះលេខ" name="houseNumber" value={house.houseNumber} onChange={fieldSet(setHouse)} placeholder="ឧ. 12B" />
                  <Input label="ផ្លូវលេខ" name="streetNumber" value={house.streetNumber} onChange={fieldSet(setHouse)} placeholder="ឧ. 2004" />
                  <Input label="សង្កាត់/ឃុំ" name="sangkat" value={house.sangkat} onChange={fieldSet(setHouse)} placeholder="ឧ. ទឹកថ្លា" />
                  <Input label="ខណ្ឌ/ស្រុក" name="khan" value={house.khan} onChange={fieldSet(setHouse)} placeholder="ឧ. សែនសុខ" />
                  <Input label="ទីក្រុង/ខេត្ត" name="cityProvince" value={house.cityProvince} onChange={fieldSet(setHouse)} placeholder="ភ្នំពេញ" />
                  <Input label="អាសយដ្ឋាន (ពេញលេញ)" required name="address" value={house.address} onChange={fieldSet(setHouse)} placeholder="ផ្លូវ..., សង្កាត់..." />
                  <div className="sm:col-span-2">
                    <Textarea label="ការពិពណ៌នា" name="description" rows={3} value={house.description} onChange={fieldSet(setHouse)} placeholder="ពិពណ៌នាអំពីអចលនទ្រព្យ..." />
                  </div>
                </div>
              )}

              {isStructureLike && (
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-gray-800 sm:grid-cols-5">
                  <Input label="ចំនួនបន្ទប់គេង" name="bedrooms" type="number" value={listing.bedrooms} onChange={fieldSet(setListing)} placeholder="" />
                  <Input label="ចំនួនបន្ទប់ទឹក" name="bathrooms" type="number" value={listing.bathrooms} onChange={fieldSet(setListing)} />
                  <Input label="ចំនួនជាន់" name="numberOfFloors" type="number" value={listing.numberOfFloors} onChange={fieldSet(setListing)} />
                  <Input label="ផ្ទៃដី (m²)" name="landSizeSqm" type="number" value={listing.landSizeSqm} onChange={fieldSet(setListing)} />
                  <Input label="ផ្ទៃក្រឡា (m²)" name="areaSqm" type="number" value={listing.areaSqm} onChange={fieldSet(setListing)} />
                </div>
              )}

              {isUnitLike && (
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-gray-800 sm:grid-cols-5">
                  <Input label="លេខឯកតា" required name="roomNumber" value={listing.roomNumber} onChange={fieldSet(setListing)} error={errors.roomNumber} placeholder="ឧ. #302" />
                  <Input label="ជាន់" required name="floorNumber" type="number" value={listing.floorNumber} onChange={fieldSet(setListing)} error={errors.floorNumber} />
                  <Input label="ចំនួនបន្ទប់គេង" name="bedrooms" type="number" value={listing.bedrooms} onChange={fieldSet(setListing)} />
                  <Input label="ចំនួនបន្ទប់ទឹក" name="bathrooms" type="number" value={listing.bathrooms} onChange={fieldSet(setListing)} />
                  <Input label="ផ្ទៃក្រឡា (m²)" name="areaSqm" type="number" value={listing.areaSqm} onChange={fieldSet(setListing)} />
                </div>
              )}

              {errors.house && <p className="text-sm text-red-600 dark:text-red-400">{errors.house}</p>}
            </div>
          </Card>

          {/* 4. ROOM DETAILS */}
          {isRoomLike && (
            <Card title="4. ព័ត៌មានបន្ទប់" description="ផ្ទះ ប្រភេទបន្ទប់ លេខបន្ទប់ ជាន់ និងសមត្ថភាព។">
              <div className="space-y-4">
                {ownerKind === "account" && ownerUserId && ownerHouseIdAvailable() && (
                  <div className="max-w-lg">
                    <Select
                      label="របៀបផ្ទះ"
                      value={houseMode}
                      onChange={handleHouseModeChange}
                      options={[
                        { value: "new", label: "បង្កើតផ្ទះថ្មី" },
                        { value: "reuse", label: "ប្រើប្រាស់ផ្ទះដែលមានស្រាប់" },
                      ]}
                    />
                    {houseMode === "reuse" && (
                      <div className="mt-3">
                        <Select
                          label="ជ្រើសរើសផ្ទះ"
                          value={houseId}
                          onChange={(e) => setHouseId(e.target.value)}
                          options={ownerHouses.map((h) => ({ value: String(h.id), label: `${h.name} — ${h.address || ""}` }))}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="ឈ្មោះបន្ទប់ (ប្រសិនបើមាន)" name="name" value={listing.name} onChange={fieldSet(setListing)} placeholder="ជម្រើស" />
                  <Input label="លេខបន្ទប់" required name="roomNumber" value={listing.roomNumber} onChange={fieldSet(setListing)} error={errors.roomNumber} placeholder="ឧ. 101" />
                  <Input label="ជាន់" name="floorNumber" type="number" value={listing.floorNumber} onChange={fieldSet(setListing)} placeholder="ជម្រើស" />
                  <Input label="សមត្ថភាព" required name="capacity" type="number" value={listing.capacity} onChange={fieldSet(setListing)} error={errors.capacity} placeholder="ឧ. 2" />
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40 sm:grid-cols-2">
                  <div className="max-w-lg">
                    <Select
                      label="ប្រភេទបន្ទប់ — របៀប"
                      value={roomTypeMode}
                      onChange={handleRoomTypeModeChange}
                      options={[
                        { value: "create", label: "បង្កើតប្រភេទបន្ទប់ថ្មី" },
                        { value: "reuse", label: "ប្រើប្រភេទបន្ទប់ដែលមានស្រាប់" },
                      ]}
                    />
                  </div>
                </div>

                {roomTypeMode === "reuse" ? (
                  <div className="max-w-lg">
                    <Select
                      label="ជ្រើសរើសប្រភេទបន្ទប់"
                      placeholder="ជ្រើសរើស"
                      value={roomTypeId}
                      onChange={(e) => setRoomTypeId(e.target.value)}
                      options={ownerRoomTypes.map((rt) => ({
                        value: String(rt.id),
                        label: rt.name || `#${rt.id}`,
                      }))}
                    />
                    {errors.roomType && <p className="text-sm text-red-600 dark:text-red-400">{errors.roomType}</p>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="ឈ្មោះប្រភេទបន្ទប់" required name="name" value={roomType.name} onChange={fieldSet(setRoomType)} error={errors.roomType} placeholder="ឧ. បន្ទប់ស្តង់ដារ" />
                    <Input label="សមត្ថភាពលំនាំដើម" name="capacity" type="number" value={roomType.capacity} onChange={fieldSet(setRoomType)} />
                    <Input label="ថ្លៃជួលលំនាំដើម" name="defaultRent" type="number" value={roomType.defaultRent} onChange={fieldSet(setRoomType)} />
                    <Input label="ប្រាក់កក់លំនាំដើម" name="defaultDeposit" type="number" value={roomType.defaultDeposit} onChange={fieldSet(setRoomType)} />
                    <div className="sm:col-span-2">
                      <Textarea label="ការពិពណ៌នាប្រភេទបន្ទប់" name="description" rows={2} value={roomType.description} onChange={fieldSet(setRoomType)} />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 5. PRICING & AVAILABILITY */}
          <Card title={isRoomLike ? "5. តម្លៃ និងស្ថានភាព" : "4. តម្លៃ និងស្ថានភាព"} description="ថ្លៃជួល ប្រាក់កក់ ប្រាក់មុន ស្ថានភាព និងប្រភេទសង្ហារិម។">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Input label="ថ្លៃជួលប្រចាំខែ" required name="monthlyRent" type="number" value={listing.monthlyRent} onChange={fieldSet(setListing)} error={errors.monthlyRent} placeholder="0.00" />
              <Input label="ប្រាក់កក់សន្តិសុខ" name="securityDeposit" type="number" value={listing.securityDeposit} onChange={fieldSet(setListing)} placeholder="0.00" />
              <Input label="ប្រាក់មុន" name="advancePayment" type="number" value={listing.advancePayment} onChange={fieldSet(setListing)} placeholder="ជម្រើស" />
              <Input label="ទំនេរចាប់ពី" name="availableFrom" type="date" value={listing.availableFrom} onChange={fieldSet(setListing)} />
              <Select label="ស្ថានភាព" value={listing.status} onChange={fieldSet(setListing)} options={ROOM_STATUS_OPTIONS} />
              <Select label="ប្រភេទសង្ហារិម" value={listing.furnishing} onChange={fieldSet(setListing)} options={FURNISHING_OPTIONS} />
            </div>
            <div className="mt-4">
              <Textarea label="ការពិពណ៌នា" name="description" rows={3} value={listing.description} onChange={fieldSet(setListing)} placeholder="ពិពណ៌នាបន្ថែម..." />
            </div>
          </Card>

          {/* 6. AMENITIES & UTILITIES */}
          <Card title={isRoomLike ? "6. គ្រឿងបរិក្ខារ និងសេវាកម្ម" : "5. គ្រឿងបរិក្ខារ និងសេវាកម្ម"} description="ជ្រើសរើសគ្រឿងបរិក្ខារ និងសេវាកម្ម (ទឹក ភ្លើង និងថ្លៃឈ្នួល) ផ្ទាល់ក្នុងការផ្សាយ។">
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">គ្រឿងបរិក្ខារ</p>
                {(catalog.amenities || []).length === 0 ? (
                  <p className="text-sm text-slate-400">មិនមានគ្រឿងបរិក្ខារសកម្មទេ។</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {(catalog.amenities || []).map((a) => (
                      <Checkbox
                        key={a.id}
                        label={a.name}
                        checked={amenityIds.includes(a.id)}
                        onChange={() => toggleAmenity(a.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">សេវាកម្ម (Utilities)</p>
                {(catalog.utilityTypes || []).length === 0 ? (
                  <p className="text-sm text-slate-400">មិនមានប្រភេទសេវាកម្មសកម្មទេ។</p>
                ) : (
                  <div className="space-y-2">
                    {(catalog.utilityTypes || []).map((u) => {
                      const selected = utilities.find((x) => x.utilityTypeId === String(u.id));
                      return (
                        <div key={u.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40 sm:flex-row sm:items-center">
                          <div className="flex-1">
                            <Checkbox
                              label={u.name}
                              checked={!!selected}
                              onChange={(e) => handleUtilityChange(String(u.id), "isIncluded", e.target.checked)}
                            />
                          </div>
                          {selected && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                label="រួមបញ្ចូលក្នុងថ្លៃជួល"
                                checked={!!selected.isIncluded}
                                onChange={(e) => handleUtilityChange(String(u.id), "isIncluded", e.target.checked)}
                              />
                              <Input
                                className="sm:w-32"
                                type="number"
                                placeholder={`ថ្លៃ (${u.unit || "USD"})`}
                                value={selected.rate || ""}
                                onChange={(e) => handleUtilityChange(String(u.id), "rate", e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* 7. NEARBY LOCATIONS */}
          <Card title={isRoomLike ? "7. ទីតាំងនៅជិត" : "6. ទីតាំងនៅជិត"} description="សាលា មន្ទីរពេទ្យ ផ្សារ និងទីតាំងសំខាន់ៗនៅក្បែរអចលនទ្រព្យ។">
            <div className="space-y-3">
              {nearbyLocations.length === 0 && (
                <p className="text-sm text-slate-400">មិនទាន់មានទីតាំងនៅជិតទេ។</p>
              )}
              {nearbyLocations.map((n, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40 sm:flex-row sm:items-center">
                  <MapPin className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
                  <Input className="sm:flex-1" placeholder="ឈ្មោះ (ឧ. សាកលវិទ្យាល័យភូមិន្ទ)" value={n.name} onChange={(e) => updateNearby(i, "name", e.target.value)} />
                  <Select
                    className="sm:w-44"
                    placeholder="ប្រភេទ"
                    value={n.category}
                    onChange={(e) => updateNearby(i, "category", e.target.value)}
                    options={NEARBY_CATEGORY_OPTIONS}
                  />
                  <Input className="sm:w-24" type="number" placeholder="គីឡូម៉ែត្រ" value={n.distanceKm} onChange={(e) => updateNearby(i, "distanceKm", e.target.value)} />
                  <Input className="sm:w-24" type="number" placeholder="នាទី" value={n.travelMinutes} onChange={(e) => updateNearby(i, "travelMinutes", e.target.value)} />
                  <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-4 w-4 text-red-500" />} onClick={() => removeNearby(i)}>
                    លុប
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={addNearby}>
                បន្ថែមទីតាំងនៅជិត
              </Button>
            </div>
          </Card>

          {/* 8. PHOTOS */}
          <Card title={isRoomLike ? "8. រូបភាព" : "7. រូបភាព"} description="បន្ថែមរូបថតអចលនទ្រព្យផ្ទាល់ក្នុងការផ្សាយ (JPG/PNG/WEBP, អតិបរមា 5MB ក្នុងមួយសន្លឹក)។">
            <div className="space-y-3">
              {errors.photos && <Alert variant="danger" title="រូបភាព" description={errors.photos} dismissible />}

              {(existingImages.length > 0 || pendingFiles.length > 0) && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {existingImages.map((img) => (
                    <div key={img.id} className="group relative">
                      <img
                        src={img.secureUrl}
                        alt=""
                        className="h-24 w-full rounded-lg border border-slate-200 object-cover dark:border-gray-800"
                      />
                      <button
                        type="button"
                        disabled={imageBusy}
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-90 transition-opacity hover:opacity-100"
                        aria-label="លុបរូបភាព"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {pendingFiles.map((file, i) => (
                    <div key={`pending-${i}`} className="group relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="h-24 w-full rounded-lg border border-slate-200 object-cover dark:border-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => removePendingFile(i)}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-90 transition-opacity hover:opacity-100"
                        aria-label="ដករូបភាព"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <input
                  id="admin-property-photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={onPickFiles}
                />
                <label htmlFor="admin-property-photos">
                  <span className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 dark:hover:border-gray-600">
                    <ImagePlus className="h-4 w-4" />
                    ជ្រើសរើសរូបភាព
                  </span>
                </label>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  រូបភាពត្រូវបានផ្ទុកឡើងទៅកាន់អចលនទ្រព្យ នៅពេលអ្នកចុច «រក្សាទុកព្រាង» ឬ «ផ្សាយ»។
                </p>
              </div>
            </div>
          </Card>

          {/* ACTIONS */}
          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ព្រាងនឹងបង្ហាញក្នុង «បញ្ជីព្រាង» សម្រាប់បន្តកែសម្រួល — មិនចូលទៅកាន់ផ្ទាំង OWNER ទេ។
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/admin/properties")} disabled={saving}>
                បោះបង់
              </Button>
              <Button
                variant="outline"
                leftIcon={<Save className="h-4 w-4" />}
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុកព្រាង"}
              </Button>
              <Button
                variant="primary"
                leftIcon={<Globe className="h-4 w-4" />}
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                {saving ? "កំពុងផ្សាយ..." : "ផ្សាយ"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper: used by the ROOM section to decide whether to show house reuse options.
function ownerHouseIdAvailable() {
  return true;
}