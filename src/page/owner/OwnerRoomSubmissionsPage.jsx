import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Send,
  DoorOpen,
  Building2,
  Layers,
  PenLine,
  RefreshCw,
  Search,
  FilePenLine,
  Filter,
  ScanEye,
} from "lucide-react";
import {
  Card,
  Button,
  Table,
  Alert,
  EmptyState,
  Pagination,
  Skeleton,
  Input,
  IconButton,
} from "../../components/ui/index.js";
import PublicationStatusBadge from "../../components/room/PublicationStatusBadge.jsx";
import SubmitForReviewButton from "../../components/room/SubmitForReviewButton.jsx";
import RoomPublicPreview, { RoomPreviewModal } from "../../components/room/RoomPublicPreview.jsx";
import { useRooms, useRoomAmenities } from "../../hooks/useRooms.js";
import { useHouses } from "../../hooks/useHouses.js";
import { useRoomTypes } from "../../hooks/useRoomType.js";
import { useRoomTypeImages } from "../../hooks/useRoomTypeImages.js";
import { useBasePath } from "../../hooks/useBasePath.js";
import {
  PUBLICATION_STATUS,
  canSubmitRoom,
} from "../../utils/roomPublication.js";
import { formatDate } from "../../utils/format.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value) || 0
  );

const TABS = [
  { value: "ALL", label: "ទាំងអស់" },
  { value: PUBLICATION_STATUS.DRAFT, label: "ព្រាង" },
  { value: PUBLICATION_STATUS.PENDING_APPROVAL, label: "រង់ចាំយល់ព្រម" },
  { value: PUBLICATION_STATUS.PUBLISHED, label: "បានផ្សាយ" },
  { value: PUBLICATION_STATUS.REJECTED, label: "បានបដិសេធ" },
];

const SUMMARY_TABS = [
  { value: PUBLICATION_STATUS.DRAFT, key: "draft", label: "ព្រាង", icon: FilePenLine },
  { value: PUBLICATION_STATUS.PENDING_APPROVAL, key: "pending", label: "រង់ចាំយល់ព្រម", icon: Send },
  { value: PUBLICATION_STATUS.PUBLISHED, key: "published", label: "បានផ្សាយ", icon: Filter },
  { value: PUBLICATION_STATUS.REJECTED, key: "rejected", label: "បានបដិសេធ", icon: PenLine },
];

export default function OwnerRoomSubmissionsPage() {
  const navigate = useNavigate();
  const basePath = useBasePath();
  const {
    rooms,
    loading,
    error,
    fetchRooms,
  } = useRooms();
  const { houses } = useHouses();
  const { roomTypes } = useRoomTypes();

  const [previewTarget, setPreviewTarget] = useState(null);
  const previewImages = useRoomTypeImages(previewTarget?.roomTypeId);
  const previewAmenities = useRoomAmenities(previewTarget?.id);

  const [tab, setTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const houseName = useCallback(
    (id) => houses.find((h) => h.id === id)?.name || `ផ្ទះ #${id}`,
    [houses]
  );
  const roomTypeName = useCallback(
    (id) => roomTypes.find((rt) => rt.id === id)?.name || `ប្រភេទបន្ទប់ #${id}`,
    [roomTypes]
  );

  const counts = useMemo(() => {
    const base = {
      total: rooms.length,
      draft: 0,
      pending: 0,
      published: 0,
      rejected: 0,
      unpublished: 0,
    };
    for (const room of rooms) {
      switch (room.publicationStatus) {
        case PUBLICATION_STATUS.DRAFT:
          base.draft += 1;
          break;
        case PUBLICATION_STATUS.PENDING_APPROVAL:
          base.pending += 1;
          break;
        case PUBLICATION_STATUS.PUBLISHED:
          base.published += 1;
          break;
        case PUBLICATION_STATUS.REJECTED:
          base.rejected += 1;
          break;
        case PUBLICATION_STATUS.UNPUBLISHED:
          base.unpublished += 1;
          break;
        default:
          break;
      }
    }
    return base;
  }, [rooms]);

  const filtered = useMemo(() => {
    let result = rooms;
    if (tab !== "ALL") {
      result = result.filter((r) => r.publicationStatus === tab);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
          (r.name && r.name.toLowerCase().includes(q))
      );
    }
    const sorted = [...result].sort(
      (a, b) =>
        new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt)
    );
    return sorted;
  }, [rooms, tab, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const refresh = useCallback(() => fetchRooms(), [fetchRooms]);

  const previewNodeFor = useCallback(
    (room) => {
      const rt = roomTypes.find((r) => r.id === room.roomTypeId);
      const h = houses.find((x) => x.id === room.houseId);
      return (
        <RoomPublicPreview
          room={room}
          house={h}
          roomType={rt}
          images={[rt?.primaryImage, h?.primaryImage].filter(Boolean)}
        />
      );
    },
    [houses, roomTypes]
  );

  const columns = [
    {
      header: "បន្ទប់",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            <DoorOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-white">
              {row.name || `បន្ទប់ ${row.roomNumber}`}
            </p>
            <p className="font-mono text-xs text-slate-400">បន្ទប់ {row.roomNumber}</p>
          </div>
        </div>
      ),
    },
    {
      header: "ផ្ទះ",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="max-w-[160px] truncate">{houseName(row.houseId)}</span>
        </span>
      ),
    },
    {
      header: "ប្រភេទ",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Layers className="h-4 w-4 text-slate-400" />
          <span className="max-w-[140px] truncate">{roomTypeName(row.roomTypeId)}</span>
        </span>
      ),
    },
    {
      header: "ថ្លៃជួល",
      render: (row) => (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {formatCurrency(row.monthlyRent)}
        </span>
      ),
    },
    {
      header: "ស្ថានភាពបន្ទប់",
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.status === "AVAILABLE"
            ? "ទំនេរ"
            : row.status === "OCCUPIED"
            ? "មានអ្នកស្នាក់នៅ"
            : row.status === "MAINTENANCE"
            ? "កំពុងជួសជុល"
            : row.status === "RESERVED"
            ? "បានកក់"
            : row.status || "—"}
        </span>
      ),
    },
    {
      header: "ស្ថានភាពផ្សាយ",
      render: (row) => (
        <div className="space-y-1">
          <PublicationStatusBadge status={row.publicationStatus} />
          {row.rejectionReason && (
            <p className="max-w-[220px] truncate text-xs text-red-600 dark:text-red-400" title={row.rejectionReason}>
              មូលហេតុ៖ {row.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "ដាក់ស្នើ",
      render: (row) => (
        <span className="text-xs text-slate-400">
          {formatDate(row.submittedAt)}
        </span>
      ),
    },
    {
      header: "សកម្មភាព",
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {canSubmitRoom(row) && (
            <SubmitForReviewButton room={row} onSuccess={refresh} label="ដាក់ស្នើ" preview={previewNodeFor(row)} />
          )}
          <IconButton variant="ghost" size="sm" tooltip="មើលជាមុន (Preview)" icon={<ScanEye className="h-4 w-4 text-sky-600 dark:text-sky-400" />} onClick={() => setPreviewTarget(row)} />
          {row.publicationStatus === "REJECTED" && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<PenLine className="h-4 w-4" />}
              onClick={() => navigate(`${basePath}/rooms`)}
            >
              កែប្រែ
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading && !rooms.length) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            ការផ្សាយបន្ទប់ (Room Submissions)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងការដាក់ស្នើបន្ទប់សម្រាប់ការពិនិត្យ និងផ្សាយជាសាធារណៈ។
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>
            ធ្វើឱ្យស្រស់
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<DoorOpen className="h-4 w-4" />}
            onClick={() => navigate(`${basePath}/rooms`)}
          >
            គ្រប់គ្រងបន្ទប់
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកការផ្សាយ" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => refresh()}>
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      {/* Summary cards */}
      {rooms.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SUMMARY_TABS.map(({ value, key, label, icon: Icon }) => {
            const active = tab === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5 dark:border-primary dark:bg-primary/10"
                    : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900"
                }`}
              >
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{counts[key]}</p>
                </div>
                <Icon className="h-5 w-5 text-slate-400" />
              </button>
            );
          })}
        </div>
      )}

      {/* Filter + tabs */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-64">
            <Input
              placeholder="តម្រងតាមលេខបន្ទប់ ឬឈ្មោះ..."
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{filtered.length} បន្ទប់</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTab(t.value);
                  setPage(0);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t.value
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-gray-700 dark:text-slate-400 dark:hover:border-gray-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List */}
      {!loading && rooms.length === 0 ? (
        <EmptyState
          icon={Send}
          title="មិនទាន់មានបន្ទប់សម្រាប់ការផ្សាយទេ"
          description="បង្កើត ឬកែប្រែបន្ទប់ រួចប្រើប៊ូតុង «ដាក់ស្នើសម្រាប់ការពិនិត្យ» ដើម្បីផ្សាយ។"
          action={
            <Button variant="primary" leftIcon={<DoorOpen className="h-4 w-4" />} onClick={() => navigate(`${basePath}/rooms`)}>
              គ្រប់គ្រងបន្ទប់
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="មិនមានបន្ទប់ត្រូវនឹងលក្ខខណ្ឌទេ" description="សូមព្យាយាមកែប្រែតម្រង ឬស្វែងរកផ្សេងទៀត។" />
      ) : (
        <>
          <div className="hidden md:block">
            <Card className="overflow-hidden rounded-xl border-slate-200/80 dark:border-gray-800">
              <Table columns={columns} data={paginated} />
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginated.map((room) => (
              <div
                key={room.id}
                className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                      <DoorOpen className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        {room.name || `បន្ទប់ ${room.roomNumber}`}
                      </h3>
                      <p className="font-mono text-xs text-slate-400">បន្ទប់ {room.roomNumber}</p>
                    </div>
                  </div>
                  <PublicationStatusBadge status={room.publicationStatus} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {houseName(room.houseId)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-3 w-3" /> {roomTypeName(room.roomTypeId)}
                  </span>
                  <span>ថ្លៃជួល {formatCurrency(room.monthlyRent)}</span>
                  <span>ស្ថានភាព {room.status}</span>
                </div>

                {room.rejectionReason && (
                  <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
                    មូលហេតុបដិសេធ៖ {room.rejectionReason}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">ដាក់ស្នើ {formatDate(room.submittedAt)}</span>
                  <div className="flex items-center gap-2">
                    {room.publicationStatus === "REJECTED" && (
                      <Link
                        to={`${basePath}/rooms`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                      >
                        <PenLine className="h-3.5 w-3.5" /> កែប្រែ
                      </Link>
                    )}
                    {canSubmitRoom(room) && (
                      <SubmitForReviewButton room={room} onSuccess={refresh} label="ដាក់ស្នើ" preview={previewNodeFor(room)} />
                    )}
                    <IconButton variant="ghost" size="sm" tooltip="មើលជាមុន (Preview)" icon={<ScanEye className="h-4 w-4 text-sky-600 dark:text-sky-400" />} onClick={() => setPreviewTarget(room)} />
                  </div>
                </div>
              </div>
            ))}
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

      {/* Public preview modal */}
      <RoomPreviewModal
        open={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        title={previewTarget ? `ការផ្សាយជាមុន - ${previewTarget.name || `បន្ទប់ ${previewTarget.roomNumber}`}` : 'ការផ្សាយជាមុន (Preview)'}
        description="របៀបដែលបន្ទប់នឹងបង្ហាញលើគេហទំព័រសាធារណៈ។"
        room={previewTarget}
        house={houses.find((h) => h.id === previewTarget?.houseId)}
        roomType={roomTypes.find((rt) => rt.id === previewTarget?.roomTypeId)}
        images={previewImages.images}
        amenities={previewAmenities.amenities}
      />
    </div>
  );
}