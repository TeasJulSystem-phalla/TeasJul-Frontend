import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Eye,
  CheckCircle2,
  DoorOpen,
  RefreshCw,
  Building2,
  Layers,
  XCircle,
  CalendarClock,
  Info,
} from "lucide-react";
import {
  Card,
  Button,
  Alert,
  Modal,
  Textarea,
  Label,
  ConfirmDialog,
  EmptyState,
  Pagination,
  Skeleton,
  Badge,
  Select,
} from "../../components/ui/index.js";
import PublicationStatusBadge from "../../components/room/PublicationStatusBadge.jsx";
import { roomPublicationApi } from "../../api/roomPublication.api.js";
import { ownerAdminApi } from "../../api/ownerAdmin.api.js";
import { adminRoomsApi } from "../../api/adminRooms.api.js";
import { formatDate, formatCurrency } from "../../utils/format.js";

const TABS = [
  { value: "PENDING_APPROVAL", label: "រង់ចាំការអនុម័ត (Pending)" },
  { value: "PUBLISHED", label: "បានផ្សាយ (Published)" },
  { value: "REJECTED", label: "បានបដិសេធ (Rejected)" },
];

const STATUS_LABELS = {
  AVAILABLE: "មានទំនេរ (Available)",
  OCCUPIED: "មានអ្នកជួល (Occupied)",
  MAINTENANCE: "ជួសជុល (Maintenance)",
  RESERVED: "បានកក់ (Reserved)",
};

const ROOM_STATUS_VARIANT = {
  AVAILABLE: "success",
  OCCUPIED: "info",
  MAINTENANCE: "warning",
  RESERVED: "neutral",
};

const ROOM_STATUS_FILTER_OPTIONS = [
  { value: "", label: "ទាំងអស់ (All)" },
  { value: "AVAILABLE", label: STATUS_LABELS.AVAILABLE },
  { value: "OCCUPIED", label: STATUS_LABELS.OCCUPIED },
  { value: "RESERVED", label: STATUS_LABELS.RESERVED },
  { value: "MAINTENANCE", label: STATUS_LABELS.MAINTENANCE },
];

const HOUSE_STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
};

const PageHeader = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        ការពិនិត្យការដាក់ស្នើផ្សាយ (Submissions Review)
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        ពិនិត្យ និងសម្រេចលើការដាក់ស្នើផ្សាយបន្ទប់របស់ម្ចាស់អចលនទ្រព្យ។
      </p>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {label}
    </p>
    <p className="mt-0.5 text-[13px] font-medium text-slate-800 dark:text-slate-100">
      {value || "—"}
    </p>
  </div>
);

const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {children}
    </p>
  </div>
);

const HOUSE_STATUS = {
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  INACTIVE: "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300",
};

const RoomDetailModal = ({
  room,
  house,
  houseLoading,
  houseError,
  onClose,
  onApprove,
  onReject,
  onUnpublish,
  busyAction,
}) => {
  const status = room?.publicationStatus;
  const roomStatusLabel = room ? STATUS_LABELS[room.status] || room.status || "—" : "";

  const footer = room && (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Button variant="secondary" size="sm" onClick={onClose}>
        បិទ
      </Button>
      {status === "PENDING_APPROVAL" && (
        <>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<XCircle className="h-4 w-4" />}
            onClick={() => onReject(room)}
            loading={busyAction === "reject"}
          >
            បដិសេធ
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => onApprove(room)}
            loading={busyAction === "approve"}
          >
            យល់ព្រមផ្សាយ
          </Button>
        </>
      )}
      {status === "PUBLISHED" && (
        <Button
          variant="danger"
          size="sm"
          leftIcon={<DoorOpen className="h-4 w-4" />}
          onClick={() => onUnpublish(room)}
          loading={busyAction === "unpublish"}
        >
          ឈប់ផ្សាយ
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      open={!!room}
      onClose={onClose}
      title={room ? room.name || `បន្ទប់ ${room.roomNumber}` : ""}
      description={
        room
          ? `${room.roomNumber ? `លេខបន្ទប់ #${room.roomNumber}` : ""}${room.houseName && room.roomNumber ? " · " : ""}${room.houseName || ""}`
          : ""
      }
      size="lg"
      footer={footer}
    >
      {room && (
        <div className="space-y-6">
          {/* Room header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0f2942] text-white">
                <DoorOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-slate-800 dark:text-white">
                  {room.name || `បន្ទប់ ${room.roomNumber}`}
                </p>
                <p className="text-xs text-slate-400">
                  {room.roomNumber ? `លេខបន្ទប់ #${room.roomNumber}` : ""}
                  {room.roomTypeName ? ` · ${room.roomTypeName}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PublicationStatusBadge status={room.publicationStatus} />
              <Badge variant="outline" tone="muted">
                បន្ទប់៖ {roomStatusLabel}
              </Badge>
            </div>
          </div>

          {/* Room details */}
          <div>
            <SectionTitle icon={DoorOpen}>ព័ត៌មានបន្ទប់ (Room Details)</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
              <InfoRow label="លេខបន្ទប់ (Room #)" value={room.roomNumber} />
              <InfoRow label="ផ្ទះ (House)" value={room.houseName} />
              <InfoRow label="ប្រភេទបន្ទប់ (Type)" value={room.roomTypeName} />
              <InfoRow label="ជាន់ (Floor)" value={room.floorNumber} />
              <InfoRow label="សមត្ថភាព (Capacity)" value={room.capacity ? `${room.capacity} នាក់` : ""} />
              <InfoRow label="ថ្លៃជួល (Rent)" value={formatCurrency(room.monthlyRent)} />
              <InfoRow label="ប្រាក់ធានា (Deposit)" value={formatCurrency(room.securityDeposit)} />
              <InfoRow
                label="ស្ថានភាពបន្ទប់ (Status)"
                value={roomStatusLabel}
              />
            </div>

            {room.description && (
              <div className="mt-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  ការពិពណ៌នា
                </p>
                <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {room.description}
                </p>
              </div>
            )}
          </div>

          {/* House information */}
          <div>
            <SectionTitle icon={Building2}>ញ្ញា (House)</SectionTitle>
            <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/50">
              {houseLoading ? (
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ) : houseError ? (
                <div className="flex items-center gap-2 text-[12.5px] text-amber-600 dark:text-amber-400">
                  <Info className="h-4 w-4 shrink-0" />
                  មិនអាចផ្ទុកព័ត៌មានញ្ញាបានទេ។ បង្ហាញតែឈ្មោះញ្ញាពីបញ្ជីផ្សាយ។
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                  <InfoRow
                    label="ឈ្មោះ (Name)"
                    value={house?.name || room.houseName}
                  />
                  <InfoRow
                    label="អាសយដ្ឋាន (Address)"
                    value={house?.address}
                  />
                  <InfoRow label="លេខកូដប្រៃសណីយ៍ (Postal)" value={house?.postalCode} />
                  <InfoRow label="ចំនួនបន្ទប់ (Rooms)" value={house?.totalRooms ?? ""} />
                  <InfoRow label="បន្ទប់ទំនេរ (Available)" value={house?.availableRooms ?? ""} />
                  <InfoRow
                    label="ស្ថានភាពញ្ញា (Status)"
                    value={
                      house?.status ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            HOUSE_STATUS[house.status] || "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300"
                          }`}
                        >
                          {HOUSE_STATUS_LABELS[house.status] || house.status}
                        </span>
                      ) : (
                        ""
                      )
                    }
                  />
                  {house?.description && (
                    <div className="col-span-full">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        ការពិពណ៌នាញ្ញា
                      </p>
                      <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {house.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Publication timeline */}
          <div>
            <SectionTitle icon={CalendarClock}>កាលប្បវត្តិនៃការផ្សាយ (Publication Timeline)</SectionTitle>
            <div className="mt-3 grid gap-x-4 gap-y-4 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 sm:grid-cols-2 dark:border-gray-800 dark:bg-gray-900/50">
              <InfoRow label="ដាក់ស្នើនៅ (Submitted)" value={formatDate(room.submittedAt)} />
              <InfoRow label="ដាក់ស្នើដោយ (Submitted by)" value={room.submittedByName} />
              {room.approvedAt && <InfoRow label="យល់ព្រមនៅ (Approved)" value={formatDate(room.approvedAt)} />}
              {room.approvedByName && <InfoRow label="យល់ព្រមដោយ (Approved by)" value={room.approvedByName} />}
              {room.publishedAt && <InfoRow label="ផ្សាយនៅ (Published)" value={formatDate(room.publishedAt)} />}
              {room.rejectedAt && <InfoRow label="បានបដិសេធនៅ (Rejected)" value={formatDate(room.rejectedAt)} />}
              {room.rejectedByName && <InfoRow label="បដិសេធដោយ (Rejected by)" value={room.rejectedByName} />}
            </div>
          </div>

          {/* Rejection reason */}
          {room.rejectionReason && (
            <div className="rounded-xl border border-red-200/70 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
              <p className="text-[11px] font-medium uppercase tracking-wider text-red-500 dark:text-red-400">
                ហេតុផលនៃការបដិសេធ (Rejection reason)
              </p>
              <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-red-700 dark:text-red-300">
                {room.rejectionReason}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

const RejectModal = ({ target, reason, setReason, error, onConfirm, onCancel, loading }) => {
  return (
    <Modal open={!!target} onClose={onCancel} title="បដិសេធការដាក់ស្នើ" size="md">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          សូមបញ្ជាក់ហេតុផលសម្រាប់ការបដិសេធបន្ទប់
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {target ? ` ${target.name || `#${target.roomNumber}`}` : ""}
          </span>
          ។ ម្ចាស់នឹងអាចកែតម្រូវ និងដាក់ស្នើឡើងវិញបាន។
        </p>
        <div>
          <Label htmlFor="reject-reason">ហេតុផល (តម្រូវ)</Label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="ឧ. ព័ត៌មានមិនគ្រប់គ្រាន់ ឬរូបភាពមិនច្បាស់..."
          />
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-slate-400">{reason.length}/1000</p>
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            បោះបង់
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            leftIcon={<XCircle className="h-4 w-4" />}
          >
            បញ្ជាក់ការបដិសេធ
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default function AdminRoomSubmissionsPage() {
  const [searchParams] = useSearchParams();
  const notificationRoomId = searchParams.get("roomId");
  const [activeTab, setActiveTab] = useState("PENDING_APPROVAL");
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomStatusFilter, setRoomStatusFilter] = useState("");
  const [roomStatusSummary, setRoomStatusSummary] = useState(null);
  const summaryRequestRef = useRef(0);
  const size = 10;

  const [ownersById, setOwnersById] = useState({});
  const [viewTarget, setViewTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [unpublishTarget, setUnpublishTarget] = useState(null);
  const [unpublishing, setUnpublishing] = useState(false);
  const [housesByOwner, setHousesByOwner] = useState({});
  const [houseLoadState, setHouseLoadState] = useState({});

  const fetchOwnersMap = useCallback(async () => {
    try {
      const ownersPage = await ownerAdminApi.listOwners({ page: 0, size: 100 });
      const map = {};
      for (const owner of ownersPage.content || []) {
        map[owner.id] = [owner.firstName, owner.lastName].filter(Boolean).join(" ") || owner.username;
      }
      setOwnersById(map);
    } catch {
      setOwnersById({});
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pageData = await roomPublicationApi.getAdminRoomsByPublication({
        status: activeTab,
        roomStatus: roomStatusFilter,
        page,
        size,
      });
      setData({
        content: (pageData.content || []).filter(Boolean),
        totalElements: pageData.totalElements || 0,
        totalPages: pageData.totalPages || 0,
      });

      const token = ++summaryRequestRef.current;
      if (activeTab === "PUBLISHED") {
        roomPublicationApi
          .getRoomStatusSummary({ status: "PUBLISHED" })
          .then((summary) => {
            if (summaryRequestRef.current === token) setRoomStatusSummary(summary);
          })
          .catch(() => {
            if (summaryRequestRef.current === token) setRoomStatusSummary(null);
          });
      } else {
        setRoomStatusSummary(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "មិនអាចផ្ទុកបញ្ជីការដាក់ស្នើបានទេ។"
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, roomStatusFilter, page]);

  useEffect(() => {
    fetchOwnersMap();
  }, [fetchOwnersMap]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!notificationRoomId || loading || viewTarget) return;
    const target = data.content.find((room) => String(room.id) === notificationRoomId);
    if (target) setViewTarget(target);
  }, [data.content, loading, notificationRoomId, viewTarget]);

  const contentWithNames = useMemo(() => {
    const byId = (id) =>
      id != null && ownersById[id] ? ownersById[id] : id != null ? `#${id}` : "—";
    return (data.content || [])
      .filter(Boolean)
      .map((room) => ({
        ...room,
        submittedByName: byId(room.submittedBy),
        approvedByName: byId(room.approvedBy),
        rejectedByName: byId(room.rejectedBy),
      }));
  }, [data.content, ownersById]);

  const loadHouseForOwner = useCallback(async (ownerId) => {
    if (!ownerId || housesByOwner[ownerId] || houseLoadState[ownerId] === "loading") return;
    setHouseLoadState((prev) => ({ ...prev, [ownerId]: "loading" }));
    try {
      const houses = await adminRoomsApi.getOwnerHouses(ownerId);
      setHousesByOwner((prev) => ({ ...prev, [ownerId]: houses || [] }));
      setHouseLoadState((prev) => ({ ...prev, [ownerId]: "ok" }));
    } catch {
      setHouseLoadState((prev) => ({ ...prev, [ownerId]: "error" }));
    }
  }, [housesByOwner, houseLoadState]);

  useEffect(() => {
    if (viewTarget?.ownerId) {
      loadHouseForOwner(viewTarget.ownerId);
    }
  }, [viewTarget?.ownerId, loadHouseForOwner]);

  const detailHouse = useMemo(() => {
    if (!viewTarget?.ownerId || !viewTarget.houseId) return null;
    const houses = housesByOwner[viewTarget.ownerId];
    return (houses || []).find((h) => h.id === viewTarget.houseId) || null;
  }, [viewTarget, housesByOwner]);

  const detailHouseState = viewTarget?.ownerId
    ? houseLoadState[viewTarget.ownerId]
    : null;

  const switchTab = (tab) => {
    setActiveTab(tab);
    setPage(0);
  };

  const switchRoomStatus = (value) => {
    setRoomStatusFilter(value);
    setPage(0);
  };

  const refresh = () => {
    fetchOwnersMap();
    fetchData();
  };

  const afterMutate = (removedFromPage) => {
    if (removedFromPage && data.content.length === 1 && page > 0) {
      setPage((p) => p - 1);
    } else {
      fetchData();
    }
    setViewTarget(null);
    setApproveTarget(null);
    setUnpublishTarget(null);
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setApproving(true);
    try {
      await roomPublicationApi.approveRoom(approveTarget.id);
      afterMutate(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "ការយល់ព្រមផ្សាយបរាជ័យ។"
      );
      setApproveTarget(null);
    } finally {
      setApproving(false);
    }
  };

  const openReject = (room) => {
    setRejectTarget(room);
    setRejectReason("");
    setRejectError("");
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setRejectError("តម្រូវឱ្យបញ្ចូលហេតុផលនៃការបដិសេធ");
      return;
    }
    setRejecting(true);
    try {
      await roomPublicationApi.rejectRoom(rejectTarget.id, rejectReason.trim());
      afterMutate(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "ការបដិសេធបរាជ័យ។"
      );
      setRejectTarget(null);
    } finally {
      setRejecting(false);
    }
  };

  const handleUnpublish = async () => {
    if (!unpublishTarget) return;
    setUnpublishing(true);
    try {
      await roomPublicationApi.unpublishRoom(unpublishTarget.id);
      afterMutate(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "ការឈប់ផ្សាយបរាជ័យ។"
      );
      setUnpublishTarget(null);
    } finally {
      setUnpublishing(false);
    }
  };

  const activeTabLabel = TABS.find((t) => t.value === activeTab)?.label || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader />
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={refresh}
          disabled={loading}
        >
          ធ្វើឱ្យស្រស់
        </Button>
      </div>

      <Card>
        <div className="flex gap-0 -mb-px flex-wrap px-4 pt-3">
          {TABS.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => switchTab(tab.value)}
                className={[
                  "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:w-60">
              <Select
                label="ស្ថានភាពបន្ទប់ (Room Status)"
                value={roomStatusFilter}
                onChange={(e) => switchRoomStatus(e.target.value)}
                options={ROOM_STATUS_FILTER_OPTIONS}
              />
            </div>
            {activeTab === "PUBLISHED" && roomStatusSummary && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  បានផ្សាយ (Published)
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-800 dark:bg-gray-800 dark:text-slate-100">
                    {roomStatusSummary.total}
                  </span>
                </span>
                {Object.entries(roomStatusSummary.counts).map(([key, count]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-gray-600" />
                    {STATUS_LABELS[key] || key}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <Alert
              variant="danger"
              title="កំហុស"
              description={error}
              dismissible
              onClose={() => setError(null)}
              className="mb-4"
            >
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={fetchData}>
                  ព្យាយាមម្តងទៀត
                </Button>
              </div>
            </Alert>
          )}

          {loading && !data.content.length ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data.content.length === 0 ? (
            <EmptyState
              icon={DoorOpen}
              title="មិនទាន់មានការដាក់ស្នើទេ"
              description={`មិនទាន់មានបន្ទប់ក្នុងម៉ឺនុយ «${activeTabLabel}» ទេ។`}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 dark:border-gray-800 dark:text-slate-500">
                      <th className="px-2 pb-2 font-semibold">បន្ទប់</th>
                      <th className="px-2 pb-2 font-semibold">ផ្ទះ / ប្រភេទ</th>
                      <th className="px-2 pb-2 font-semibold text-right">ថ្លៃជួល</th>
                      <th className="px-2 pb-2 font-semibold">
                        {activeTab === "PENDING_APPROVAL" ? "ដាក់ស្នើ" : activeTab === "REJECTED" ? "បានបដិសេធ" : "ផ្សាយ"}
                      </th>
                      <th className="px-2 pb-2 font-semibold">ស្ថានភាព</th>
                      <th className="px-2 pb-2 font-semibold">ស្ថានភាពបន្ទប់</th>
                      <th className="px-2 pb-2 text-right font-semibold">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                    {contentWithNames.map((room) => (
                      <tr key={room.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800/60">
                        <td className="px-2 py-3">
                          <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100">
                            {room.name || `បន្ទប់ ${room.roomNumber}`}
                          </p>
                          <p className="text-xs text-slate-400">#{room.roomNumber}</p>
                        </td>
                        <td className="px-2 py-3">
                          {room.houseName && (
                            <span className="flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-300">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              {room.houseName}
                            </span>
                          )}
                          {room.roomTypeName && (
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                              <Layers className="h-3.5 w-3.5" />
                              {room.roomTypeName}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(room.monthlyRent)}
                          </span>
                          <span className="block text-xs text-slate-400">
                            {room.capacity ? `${room.capacity} នាក់` : ""}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-[13px] text-slate-500 dark:text-slate-400">
                          {formatDate(
                            activeTab === "PENDING_APPROVAL"
                              ? room.submittedAt
                              : activeTab === "REJECTED"
                                ? room.rejectedAt
                                : room.publishedAt
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <PublicationStatusBadge status={room.publicationStatus} />
                        </td>
                        <td className="px-2 py-3">
                          <Badge variant={ROOM_STATUS_VARIANT[room.status] || "default"}>
                            {STATUS_LABELS[room.status] || room.status || "—"}
                          </Badge>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Eye className="h-4 w-4" />}
                              onClick={() => setViewTarget(room)}
                            >
                              មើល
                            </Button>
                            {activeTab === "PENDING_APPROVAL" && (
                              <>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  leftIcon={<XCircle className="h-4 w-4" />}
                                  onClick={() => openReject(room)}
                                >
                                  បដិសេធ
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                                  onClick={() => setApproveTarget(room)}
                                >
                                  យល់ព្រម
                                </Button>
                              </>
                            )}
                            {activeTab === "PUBLISHED" && (
                              <Button
                                variant="danger"
                                size="sm"
                                leftIcon={<DoorOpen className="h-4 w-4" />}
                                onClick={() => setUnpublishTarget(room)}
                              >
                                ឈប់ផ្សាយ
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {contentWithNames.map((room) => (
                  <div
                    key={room.id}
                    className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {room.name || `បន្ទប់ ${room.roomNumber}`}
                        </p>
                        <p className="text-xs text-slate-400">
                          #{room.roomNumber}
                          {room.houseName ? ` · ${room.houseName}` : ""}
                        </p>
                      </div>
                      <PublicationStatusBadge status={room.publicationStatus} />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {formatCurrency(room.monthlyRent)}
                      </span>
                      <Badge variant={ROOM_STATUS_VARIANT[room.status] || "default"}>
                        {STATUS_LABELS[room.status] || room.status || "—"}
                      </Badge>
                      {room.roomTypeName && (
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" />
                          {room.roomTypeName}
                        </span>
                      )}
                      <span>
                        {formatDate(
                          activeTab === "PENDING_APPROVAL"
                            ? room.submittedAt
                            : activeTab === "REJECTED"
                              ? room.rejectedAt
                              : room.publishedAt
                        )}
                      </span>
                    </div>

                    {activeTab === "REJECTED" && room.rejectionReason && (
                      <p className="mt-2 truncate rounded-lg bg-red-50/70 px-3 py-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
                        {room.rejectionReason}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => setViewTarget(room)}
                      >
                        មើល
                      </Button>
                      {activeTab === "PENDING_APPROVAL" && (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<XCircle className="h-4 w-4" />}
                            onClick={() => openReject(room)}
                          >
                            បដិសេធ
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle2 className="h-4 w-4" />}
                            onClick={() => setApproveTarget(room)}
                          >
                            យល់ព្រម
                          </Button>
                        </>
                      )}
                      {activeTab === "PUBLISHED" && (
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<DoorOpen className="h-4 w-4" />}
                          onClick={() => setUnpublishTarget(room)}
                        >
                          ឈប់ផ្សាយ
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {data.totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={page + 1}
                    totalPages={data.totalPages}
                    onPageChange={(p) => setPage(p - 1)}
                    disabled={loading}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      <RoomDetailModal
        room={viewTarget}
        house={detailHouse}
        houseLoading={detailHouseState === "loading"}
        houseError={detailHouseState === "error"}
        onClose={() => setViewTarget(null)}
        onApprove={(room) => {
          setViewTarget(null);
          setApproveTarget(room);
        }}
        onReject={(room) => {
          setViewTarget(null);
          openReject(room);
        }}
        onUnpublish={(room) => {
          setViewTarget(null);
          setUnpublishTarget(room);
        }}
        busyAction={approving ? "approve" : rejecting ? "reject" : unpublishing ? "unpublish" : ""}
      />

      <ConfirmDialog
        open={!!approveTarget}
        title="យល់ព្រមផ្សាយបន្ទប់"
        description={
          approveTarget
            ? `តើអ្នកប្រាកដថាចង់យល់ព្រម និងផ្សាយបន្ទប់ "${
                approveTarget.name || `បន្ទប់ ${approveTarget.roomNumber}`
              }" នៅលើគេហទំព័រសាធារណៈឬ?`
            : ""
        }
        confirmText="យល់ព្រមផ្សាយ"
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
        loading={approving}
      />

      <RejectModal
        target={rejectTarget}
        reason={rejectReason}
        setReason={setRejectReason}
        error={rejectError}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
        loading={rejecting}
      />

      <ConfirmDialog
        open={!!unpublishTarget}
        title="ឈប់ផ្សាយបន្ទប់"
        description={
          unpublishTarget
            ? `តើអ្នកប្រាកដថាចង់ឈប់ផ្សាយបន្ទប់ "${
                unpublishTarget.name || `បន្ទប់ ${unpublishTarget.roomNumber}`
              }" ពីគេហទំព័រសាធារណៈឬ?`
            : ""
        }
        confirmText="ឈប់ផ្សាយ"
        cancelText="បោះបង់"
        danger
        onConfirm={handleUnpublish}
        onCancel={() => setUnpublishTarget(null)}
        loading={unpublishing}
      />
    </div>
  );
}