import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  BedDouble,
  Building2,
  DoorOpen,
  Layers,
  DollarSign,
  Wallet,
  Users as UsersIcon,
  User as UserIcon,
  MapPin,
  CheckCircle2,
  Wrench,
  KeySquare,
  Filter,
  LayoutGrid,
  List,
  X,
  Check,
  FilePlus,
  FileSpreadsheet,
  FileText,
  Zap,
  ScanEye,
  MoreVertical,
} from 'lucide-react';
import { useRooms, useRoomAmenities } from '../../hooks/useRooms.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useRoomTypes } from '../../hooks/useRoomType.js';
import { useRoomOccupants } from '../../hooks/useRoomOccupants.js';
import { useRoomTypeImages } from '../../hooks/useRoomTypeImages.js';
import { useRoomUtilities } from '../../hooks/useRoomUtilities.js';
import { useUtilityTypes } from '../../hooks/useUtilityTypes.js';
import { roomApi } from '../../api/room.api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useBasePath } from '../../hooks/useBasePath.js';
import PublicationStatusBadge from '../../components/room/PublicationStatusBadge.jsx';
import SubmitForReviewButton from '../../components/room/SubmitForReviewButton.jsx';
import RoomPublicPreview, { RoomPreviewModal } from '../../components/room/RoomPublicPreview.jsx';
import { canSubmitRoom } from '../../utils/roomPublication.js';
import {
  Card,
  CountUp,
  Button,
  Table,
  Badge,
  Alert,
  Modal,
  Input,
  Select,
  Textarea,
  IconButton,
  ConfirmDialog,
  EmptyState,
  Pagination,
  Skeleton,
  Checkbox,
} from '../../components/ui/index.js';

const STATUS_META = {
  AVAILABLE: {
    label: 'ទំនេរ',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
  },
  OCCUPIED: {
    label: 'មានអ្នកស្នាក់នៅ',
    color: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-500',
  },
  MAINTENANCE: {
    label: 'កំពុងជួសជុល',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/40',
    dot: 'bg-amber-500',
  },
  RESERVED: {
    label: 'បានកក់',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-800/40',
    dot: 'bg-purple-500',
  },
};

const STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'AVAILABLE', label: 'ទំនេរ' },
  { value: 'OCCUPIED', label: 'មានអ្នកស្នាក់នៅ' },
  { value: 'MAINTENANCE', label: 'កំពុងជួសជុល' },
  { value: 'RESERVED', label: 'បានកក់' },
];

const EMPTY_FORM = {
  houseId: '',
  roomTypeId: '',
  roomNumber: '',
  name: '',
  floorNumber: '',
  monthlyRent: 0,
  securityDeposit: 0,
  status: 'AVAILABLE',
  description: '',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-CA') : '—');

export default function Rooms() {
  const navigate = useNavigate();
  const {
    rooms,
    loading,
    error,
    fetchRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
  } = useRooms();
  const { houses } = useHouses();
  const { roomTypes } = useRoomTypes();
  const { occupants: roomOccupants, loading: occupantsLoading } = useRoomOccupants();
  const toast = useToast();
  const basePath = useBasePath();

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
  const [publicationFilter, setPublicationFilter] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPage(0);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(0);
  };

  const handleHouseFilterChange = (val) => {
    setHouseFilter(val);
    setPage(0);
  };

  const handlePublicationFilterChange = (val) => {
    setPublicationFilter(val);
    setPage(0);
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [amenityTarget, setAmenityTarget] = useState(null);
  const [utilityTarget, setUtilityTarget] = useState(null);
  const [bulkUtilityOpen, setBulkUtilityOpen] = useState(false);
  const [bulkAmenityOpen, setBulkAmenityOpen] = useState(false);
  const viewAmenities = useRoomAmenities(viewData?.id);
  const viewUtilities = useRoomUtilities(viewData?.id);
  const [previewTarget, setPreviewTarget] = useState(null);
  const previewImages = useRoomTypeImages(previewTarget?.roomTypeId);
  const previewAmenities = useRoomAmenities(previewTarget?.id);
  const viewTypeImages = useRoomTypeImages(viewTarget?.roomTypeId);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-fetch utilities when view data is loaded
  useEffect(() => {
    if (viewData?.id) {
      viewUtilities.fetchUtilities();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewData?.id]);

  // Auto-switch away from table view on small screens
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const handle = () => {
      if (mq.matches && viewMode === 'table') setViewMode('grid');
    };
    handle();
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, [viewMode]);

  const houseName = useCallback(
    (id) => houses.find((h) => h.id === id)?.name || `ផ្ទះ #${id}`,
    [houses]
  );
  const roomTypeName = useCallback(
    (id) => roomTypes.find((rt) => rt.id === id)?.name || `ប្រភេទបន្ទប់ #${id}`,
    [roomTypes]
  );
  const roomTypeThumb = useCallback(
    (id) => roomTypes.find((rt) => rt.id === id)?.primaryImage,
    [roomTypes]
  );

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

  const stats = useMemo(() => {
    const total = rooms.length;
    const count = (s) => rooms.filter((r) => r.status === s).length;
    return {
      total,
      available: count('AVAILABLE'),
      occupied: count('OCCUPIED'),
      maintenance: count('MAINTENANCE'),
      reserved: count('RESERVED'),
    };
  }, [rooms]);

  const filtered = useMemo(() => {
    let result = rooms;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    if (houseFilter) result = result.filter((r) => String(r.houseId) === String(houseFilter));
    if (publicationFilter) result = result.filter((r) => r.publicationStatus === publicationFilter);
    return result;
  }, [rooms, searchTerm, statusFilter, houseFilter, publicationFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginatedRooms = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const getStatusBadge = (status) => {
    const meta = STATUS_META[status] || STATUS_META.RESERVED;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium ${meta.bg} ${meta.color}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
    );
  };

  const roomTenants = (roomId) => {
    const list = roomOccupants[roomId] || [];
    return [...list].sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1));
  };

  const getPrimaryTenantName = (room) => {
    const list = roomTenants(room.id);
    if (list.length > 0) return list[0].name;
    if (room.tenant) {
      return `${room.tenant.firstName || ''} ${room.tenant.lastName || ''}`.trim() || `អ្នកជួល #${room.tenant.id}`;
    }
    return null;
  };

  const renderTenantCell = (room) => {
    const list = roomTenants(room.id);
    if (list.length === 0) {
      if (room.tenant) {
        const tenantName = `${room.tenant.firstName || ''} ${room.tenant.lastName || ''}`.trim() || `អ្នកជួល #${room.tenant.id}`;
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
            <UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{tenantName}</span>
            <Badge variant="info">ចម្បង</Badge>
          </span>
        );
      }
      return (
        <span className="text-sm text-slate-400">
          {room.status === 'OCCUPIED' && occupantsLoading ? 'កំពុងផ្ទុក…' : '—'}
        </span>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        {list.map((t) => (
          <span key={t.tenantId} className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
            <UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{t.name}</span>
            {t.isPrimary && <Badge variant="info">ចម្បង</Badge>}
          </span>
        ))}
      </div>
    );
  };

  const handleCreateContractForRoom = (roomId) => {
    navigate(`${basePath}/contracts/new?roomId=${roomId}`);
  };

  const columns = [
    {
      header: 'បន្ទប់',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            <DoorOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-white">{row.name || row.roomNumber}</p>
            <p className="font-mono text-xs text-slate-400">បន្ទប់ {row.roomNumber}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'ផ្ទះ',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="max-w-[160px] truncate">{houseName(row.houseId)}</span>
        </span>
      ),
    },
    {
      header: 'អ្នកជួល',
      render: (row) => renderTenantCell(row),
    },
    {
      header: 'ប្រភេទ',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          {roomTypeThumb(row.roomTypeId) ? (
            <img
              src={roomTypeThumb(row.roomTypeId)}
              alt=""
              className="h-6 w-6 shrink-0 rounded object-cover"
            />
          ) : (
            <Layers className="h-4 w-4 text-slate-400" />
          )}
          <span className="max-w-[140px] truncate">{roomTypeName(row.roomTypeId)}</span>
        </span>
      ),
    },
    {
      header: 'ជាន់',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <MapPin className="h-4 w-4 text-slate-400" />
          {row.floorNumber ?? '—'}
        </span>
      ),
    },
    {
      header: 'សមត្ថភាព',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <UsersIcon className="h-4 w-4 text-slate-400" />
          {row.capacity}
        </span>
      ),
    },
    {
      header: 'ថ្លៃជួល / ប្រាក់កក់',
      render: (row) => (
        <div className="text-sm">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(row.monthlyRent)}</p>
          <p className="text-xs text-slate-400">ប្រាក់កក់ {formatCurrency(row.securityDeposit)}</p>
        </div>
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'ការផ្សាយ',
      render: (row) => (
        <div className="space-y-1">
          <PublicationStatusBadge status={row.publicationStatus} />
          {row.rejectionReason && (
            <p className="max-w-[200px] truncate text-xs text-red-600 dark:text-red-400" title={row.rejectionReason}>
              មូលហេតុ៖ {row.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'សកម្មភាព',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {canSubmitRoom(row) && (
            <SubmitForReviewButton room={row} onSuccess={() => fetchRooms()} iconOnly preview={previewNodeFor(row)} />
          )}
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="មើលព័ត៌មានលម្អិត"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => handleOpenView(row)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="កែប្រែ"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => openEdit(row)}
          />
          <RoomActionsMenu
            room={row}
            onListing={() => navigate(`${basePath}/rooms/${row.id}/listing`)}
            onPreview={() => setPreviewTarget(row)}
            onAmenities={() => setAmenityTarget(row)}
            onUtilities={() => setUtilityTarget(row)}
            onDelete={() => setDeleteTarget(row)}
            onCreateContract={() => handleCreateContractForRoom(row.id)}
          />
        </div>
      ),
    },
  ];

  // ---- Form Handlers ----
  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (room) => {
    setEditTarget(room);
    setForm({
      houseId: room.houseId ?? '',
      roomTypeId: room.roomTypeId ?? '',
      roomNumber: room.roomNumber || '',
      name: room.name || '',
      floorNumber: room.floorNumber ?? '',
      monthlyRent: Number(room.monthlyRent) || 0,
      securityDeposit: Number(room.securityDeposit) || 0,
      status: room.status || 'AVAILABLE',
      description: room.description || '',
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === 'number' ? value : value };
      if (name === 'roomTypeId' && value) {
        const selectedType = roomTypes.find((rt) => String(rt.id) === String(value));
        if (selectedType) {
          if (!prev.monthlyRent || Number(prev.monthlyRent) === 0) {
            next.monthlyRent = Number(selectedType.defaultRent) || 0;
          }
          if (!prev.securityDeposit || Number(prev.securityDeposit) === 0) {
            next.securityDeposit = Number(selectedType.defaultDeposit) || 0;
          }
          if (!prev.capacity || Number(prev.capacity) === 1) {
            next.capacity = selectedType.capacity || 1;
          }
        }
      }
      return next;
    });
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.houseId) errs.houseId = 'តម្រូវឱ្យជ្រើសរើសផ្ទះ';
    if (!form.roomTypeId) errs.roomTypeId = 'តម្រូវឱ្យជ្រើសរើសប្រភេទបន្ទប់';
    if (!form.roomNumber.trim()) errs.roomNumber = 'តម្រូវឱ្យបញ្ចូលលេខបន្ទប់';
    if (Number(form.monthlyRent) < 0) errs.monthlyRent = 'ថ្លៃជួលមិនអាចជាលេខអវិជ្ជមានបានទេ';
    if (Number(form.securityDeposit) < 0) errs.securityDeposit = 'ប្រាក់កក់មិនអាចជាលេខអវិជ្ជមានបានទេ';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      houseId: Number(form.houseId),
      roomTypeId: Number(form.roomTypeId),
      roomNumber: form.roomNumber.trim(),
      name: form.name.trim(),
      floorNumber: form.floorNumber === '' ? null : Number(form.floorNumber),
      monthlyRent: Number(form.monthlyRent),
      securityDeposit: Number(form.securityDeposit),
      status: form.status,
      description: form.description.trim(),
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateRoom(editTarget.id, payload);
        toast.success('បន្ទប់ត្រូវបានកែប្រែ', `${payload.roomNumber} ត្រូវបានកែប្រែ។`);
        setEditTarget(null);
      } else {
        await createRoom(payload);
        toast.success('បន្ទប់ត្រូវបានបង្កើត', `បន្ទប់ ${payload.roomNumber} ត្រូវបានបង្កើត។`);
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'ប្រតិបត្តិការបរាជ័យ។';
      if (/room number/i.test(message)) {
        setFormErrors({ roomNumber: message });
      } else {
        toast.error('កំហុស', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenView = (room) => {
    setViewTarget(room);
    setViewData(null);
    setViewLoading(true);
    getRoom(room.id)
      .then(setViewData)
      .catch(() => setViewData(null))
      .finally(() => setViewLoading(false));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRoom(deleteTarget.id);
      toast.success('បន្ទប់ត្រូវបានលុប', `បន្ទប់ ${deleteTarget.roomNumber} ត្រូវបានលុប។`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('ការលុបបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យ។');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-w-0 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasActiveFilters = Boolean(searchTerm || statusFilter || houseFilter || publicationFilter);

  return (
    <div className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">បន្ទប់</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ទិដ្ឋភាពទូទៅនៃបន្ទប់ តម្លៃប្រចាំខែ និងការស្នាក់នៅរបស់អ្នកជួល។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>
            ធ្វើឱ្យស្រស់
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="h-4 w-4" />}
            onClick={() => navigate(`${basePath}/rooms/import${houseFilter ? `?houseId=${houseFilter}` : ''}`)}
          >
            <span className="hidden sm:inline">នាំចូល CSV/Excel</span>
            <span className="sm:hidden">CSV/Excel</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Zap className="h-4 w-4" />}
            onClick={() => navigate(`${basePath}/rooms/meters-import${houseFilter ? `?houseId=${houseFilter}` : ''}`)}
          >
            <span className="hidden lg:inline">នាំចូល CSV បន្ទប់ + ម៉ែត្រ</span>
            <span className="lg:hidden">ម៉ែត្រ</span>
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Zap className="h-4 w-4" />} onClick={() => setBulkUtilityOpen(true)}>
            <span className="hidden lg:inline">កំណត់ប្រភេទប្រើប្រាស់ច្រើនបន្ទប់</span>
            <span className="lg:hidden">ប្រើប្រាស់</span>
          </Button>
          <Button variant="outline" size="sm" leftIcon={<KeySquare className="h-4 w-4" />} onClick={() => setBulkAmenityOpen(true)}>
            <span className="hidden lg:inline">កំណត់គ្រឿងបរិក្ខារច្រើនបន្ទប់</span>
            <span className="lg:hidden">បរិក្ខារ</span>
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>
            បង្កើតបន្ទប់
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកបន្ទប់" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => refresh()}>
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      {/* Subtle Stats Row */}
      {rooms.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => handleStatusFilterChange('')}
            className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-left transition-all sm:p-3.5 ${
              statusFilter === ''
                ? 'border-slate-400 bg-slate-100/80 dark:border-slate-600 dark:bg-gray-800'
                : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-xs">បន្ទប់សរុប</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl"><CountUp value={stats.total} /></p>
            </div>
            <BedDouble className="h-5 w-5 shrink-0 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange(statusFilter === 'AVAILABLE' ? '' : 'AVAILABLE')}
            className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-left transition-all sm:p-3.5 ${
              statusFilter === 'AVAILABLE'
                ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30'
                : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-xs">ទំនេរ</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-xl"><CountUp value={stats.available} /></p>
            </div>
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange(statusFilter === 'OCCUPIED' ? '' : 'OCCUPIED')}
            className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-left transition-all sm:p-3.5 ${
              statusFilter === 'OCCUPIED'
                ? 'border-slate-500 bg-slate-100 dark:border-slate-600 dark:bg-gray-800'
                : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-xs">មានអ្នកស្នាក់នៅ</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300 sm:text-xl"><CountUp value={stats.occupied} /></p>
            </div>
            <DoorOpen className="h-5 w-5 shrink-0 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange(statusFilter === 'MAINTENANCE' ? '' : 'MAINTENANCE')}
            className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-left transition-all sm:p-3.5 ${
              statusFilter === 'MAINTENANCE'
                ? 'border-amber-500 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30'
                : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-xs">កំពុងជួសជុល</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 sm:text-xl"><CountUp value={stats.maintenance} /></p>
            </div>
            <Wrench className="h-5 w-5 shrink-0 text-amber-500" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      {rooms.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="w-full flex-1 sm:min-w-[200px]">
              <Input
                placeholder="តម្រងតាមលេខបន្ទប់ ឬឈ្មោះ..."
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => handleStatusFilterChange(e.target.value)} />
            </div>
            <div className="w-full sm:w-44">
              <Select
                options={[
                  { value: '', label: 'ផ្ទះទាំងអស់' },
                  ...houses.map((h) => ({ value: String(h.id), label: h.name })),
                ]}
                value={houseFilter}
                onChange={(e) => handleHouseFilterChange(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={[
                  { value: '', label: 'ស្ថានភាពផ្សាយទាំងអស់' },
                  { value: 'DRAFT', label: 'ព្រាង' },
                  { value: 'PENDING_APPROVAL', label: 'រង់ចាំយល់ព្រម' },
                  { value: 'PUBLISHED', label: 'បានផ្សាយ' },
                  { value: 'REJECTED', label: 'បានបដិសេធ' },
                  { value: 'UNPUBLISHED', label: 'មិនបានផ្សាយ' },
                ]}
                value={publicationFilter}
                onChange={(e) => handlePublicationFilterChange(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="h-4 w-4" />}
                onClick={() => { setSearchTerm(''); setStatusFilter(''); setHouseFilter(''); setPublicationFilter(''); setPage(0); }}
                className="text-slate-500"
              >
                សម្អាត
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-gray-800 lg:border-0 lg:pt-0">
            <span className="mr-2 text-xs text-slate-400">{filtered.length} បន្ទប់</span>
            <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-gray-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <LayoutGrid className="mr-1 inline h-3.5 w-3.5" /> ក្រឡា
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`hidden rounded px-2.5 py-1 text-xs font-medium transition-all sm:inline-flex sm:items-center ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-gray-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <List className="mr-1 inline h-3.5 w-3.5" /> តារាង
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Room Listing */}
      {!loading && rooms.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="មិនទាន់មានបន្ទប់បន្ថែមទេ"
          description="បង្កើតបន្ទប់ដំបូងរបស់អ្នកដើម្បីគ្រប់គ្រងតម្លៃជួល និងការដាក់អ្នកជួល។"
          action={
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>
              បង្កើតបន្ទប់
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="មិនមានបន្ទប់ត្រូវនឹងលក្ខខណ្ឌទេ" description="សូមព្យាយាមកែតម្រូវលក្ខខណ្ឌនៃការតម្រង។" />
      ) : (
        <>
          {viewMode === 'table' ? (
            <Card className="overflow-hidden rounded-xl border-slate-200/80 dark:border-gray-800">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[900px]">
                  <Table columns={columns} data={paginatedRooms} onRowClick={handleOpenView} />
                </div>
              </div>
            </Card>
          ) : (
            /* Grid Cards View */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedRooms.map((room) => {
                const primaryTenant = getPrimaryTenantName(room);

                return (
                  <div
                    key={room.id}
                    onClick={() => handleOpenView(room)}
                    className="group flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                            <DoorOpen className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-slate-800 dark:text-white">
                              {room.name || `បន្ទប់ ${room.roomNumber}`}
                            </h3>
                            <p className="truncate font-mono text-xs text-slate-400">អង្គភាព #{room.roomNumber}</p>
                          </div>
                        </div>
                        <div className="shrink-0">{getStatusBadge(room.status)}</div>
                      </div>

                      <div className="mt-3.5 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 dark:bg-gray-800">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span className="max-w-[130px] truncate">{houseName(room.houseId)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 dark:bg-gray-800">
                          {roomTypeThumb(room.roomTypeId) ? (
                            <img
                              src={roomTypeThumb(room.roomTypeId)}
                              alt=""
                              className="h-4 w-4 rounded object-cover"
                            />
                          ) : (
                            <Layers className="h-3 w-3 text-slate-400" />
                          )}
                          <span className="max-w-[130px] truncate">{roomTypeName(room.roomTypeId)}</span>
                        </span>
                        {room.floorNumber != null && (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 dark:bg-gray-800">
                            ជាន់ {room.floorNumber}
                          </span>
                        )}
                      </div>

                      {/* Tenant info */}
                      <div className="mt-3 rounded-lg bg-slate-50/70 p-2.5 dark:bg-gray-800/50">
                        {primaryTenant ? (
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex min-w-0 items-center gap-2">
                              <UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span className="truncate font-medium text-slate-700 dark:text-slate-200">{primaryTenant}</span>
                            </div>
                            <span className="shrink-0 text-[10px] font-semibold uppercase text-slate-400">អ្នកជួល</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                            <span className="truncate">មិនទាន់មានអ្នកជួល</span>
                            {room.status === 'AVAILABLE' && (
                              <span className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400">ទំនេរ</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-gray-800">
                      <div className="min-w-0">
                        <span className="text-[11px] text-slate-400">ថ្លៃជួល</span>
                        <p className="truncate text-base font-bold text-slate-900 dark:text-white">{formatCurrency(room.monthlyRent)}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {room.status === 'AVAILABLE' && (
                          <Button
                            variant="outline"
                            size="xs"
                            leftIcon={<FilePlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                            onClick={() => handleCreateContractForRoom(room.id)}
                            className="hidden text-xs sm:inline-flex"
                          >
                            កិច្ចសន្យា
                          </Button>
                        )}
                        {canSubmitRoom(room) && (
                          <SubmitForReviewButton room={room} onSuccess={() => fetchRooms()} iconOnly preview={previewNodeFor(room)} />
                        )}
                        <IconButton
                          variant="ghost"
                          size="sm"
                          tooltip="មើលជាមុន (Preview)"
                          icon={<ScanEye className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
                          onClick={() => setPreviewTarget(room)}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          tooltip="កែប្រែ"
                          icon={<Edit className="h-4 w-4" />}
                          onClick={() => openEdit(room)}
                        />
                        <RoomActionsMenu
                          room={room}
                          onListing={() => navigate(`${basePath}/rooms/${room.id}/listing`)}
                          onPreview={() => setPreviewTarget(room)}
                          onAmenities={() => setAmenityTarget(room)}
                          onUtilities={() => setUtilityTarget(room)}
                          onDelete={() => setDeleteTarget(room)}
                          onCreateContract={() => handleCreateContractForRoom(room.id)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center pt-4 sm:justify-end">
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={createOpen || !!editTarget}
        onClose={() => {
          setCreateOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? `កែប្រែបន្ទប់ ${editTarget.roomNumber}` : 'បង្កើតបន្ទប់'}
        description={editTarget ? 'កែប្រែតម្លៃជួល ឬព័ត៌មានលម្អិតរបស់បន្ទប់។' : 'បន្ថែមបន្ទប់ទៅក្នុងផ្ទះរបស់អ្នក។'}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setEditTarget(null);
              }}
            >
              បោះបង់
            </Button>
            <Button type="submit" form="roomForm" loading={submitting}>
              {editTarget ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតបន្ទប់'}
            </Button>
          </div>
        }
      >
        <RoomForm
          form={form}
          errors={formErrors}
          onChange={handleFormChange}
          houses={houses}
          roomTypes={roomTypes}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        open={!!viewTarget}
        onClose={() => {
          setViewTarget(null);
          setViewData(null);
        }}
        title={`បន្ទប់ ${viewData?.roomNumber || viewTarget?.roomNumber || ''}`}
        description="ព័ត៌មានលម្អិតនៃបន្ទប់ និងស្ថានភាពអ្នកជួល។"
      >
        {viewLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : viewData || viewTarget ? (
          <ViewRoomDetails
            room={viewData || viewTarget}
            house={houses.find((h) => h.id === (viewData || viewTarget).houseId)}
            roomType={roomTypes.find((rt) => rt.id === (viewData || viewTarget).roomTypeId)}
            viewAmenities={viewAmenities}
            viewUtilities={viewUtilities}
            images={viewTypeImages.images}
            occupants={roomTenants((viewData || viewTarget).id)}
            onRoomSubmitted={async () => {
              await fetchRooms();
              handleOpenView(viewData || viewTarget);
            }}
            onManageAmenities={() => {
              setAmenityTarget(viewData || viewTarget);
              setViewTarget(null);
            }}
            onManageUtilities={() => {
              setUtilityTarget(viewData || viewTarget);
              setViewTarget(null);
            }}
            onEdit={() => {
              openEdit(viewData || viewTarget);
              setViewTarget(null);
            }}
            onCreateContract={() => {
              const target = viewData || viewTarget;
              setViewTarget(null);
              handleCreateContractForRoom(target.id);
            }}
          />
        ) : null}
      </Modal>

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

      {/* Bulk assignment modals */}
      <RoomBulkModal
        mode="utilities"
        open={bulkUtilityOpen}
        rooms={rooms}
        houses={houses}
        onClose={() => setBulkUtilityOpen(false)}
      />
      <RoomBulkModal
        mode="amenities"
        open={bulkAmenityOpen}
        rooms={rooms}
        houses={houses}
        onClose={() => setBulkAmenityOpen(false)}
      />

      {/* Amenity manager */}
      <RoomAmenityManager room={amenityTarget} onClose={() => setAmenityTarget(null)} />

      {/* Utility manager */}
      <RoomUtilityManager room={utilityTarget} onClose={() => setUtilityTarget(null)} />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="លុបបន្ទប់"
        description={`លុបបន្ទប់ "${deleteTarget?.roomNumber}"? សកម្មភាពនេះមិនអាចបញ្ឈប់បានទេ។`}
        confirmText="លុប"
        cancelText="បោះបង់"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RoomActionsMenu – collapses secondary actions into a
   dropdown so card/table rows don't overflow on small screens.
   ───────────────────────────────────────────────────────── */
const RoomActionsMenu = ({ room, onListing, onPreview, onAmenities, onUtilities, onDelete, onCreateContract }) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const item = (icon, label, handler, danger = false) => (
    <button
      type="button"
      onClick={() => { close(); handler(); }}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="relative">
      <IconButton
        variant="ghost"
        size="sm"
        tooltip="សកម្មភាពផ្សេងទៀត"
        icon={<MoreVertical className="h-4 w-4" />}
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {room.status === 'AVAILABLE' &&
              item(<FilePlus className="h-3.5 w-3.5 text-emerald-500" />, 'បង្កើតកិច្ចសន្យា', onCreateContract)}
            {item(<FileText className="h-3.5 w-3.5 text-indigo-500" />, 'បញ្ជីផ្សាយ', onListing)}
            {item(<ScanEye className="h-3.5 w-3.5 text-sky-500" />, 'មើលជាមុន', onPreview)}
            {item(<KeySquare className="h-3.5 w-3.5" />, 'គ្រឿងបរិក្ខារ', onAmenities)}
            {item(<Zap className="h-3.5 w-3.5" />, 'ប្រភេទប្រើប្រាស់', onUtilities)}
            <div className="my-1 border-t border-slate-100 dark:border-gray-800" />
            {item(<Trash2 className="h-3.5 w-3.5" />, 'លុប', onDelete, true)}
          </div>
        </>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white p-2.5 dark:border-gray-800 dark:bg-gray-900">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-300">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

const RoomForm = ({ form, errors, onChange, houses, roomTypes, onSubmit }) => {
  const selectedRoomType = roomTypes.find((rt) => String(rt.id) === String(form.roomTypeId));
  return (
    <form id="roomForm" onSubmit={onSubmit} className="space-y-4">
      {/* Step hint */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-xs text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
        <strong>ចំណាំ:</strong> ព័ត៌មានប្រភេទបន្ទប់ (បន្ទប់គេង, ផ្ទៃក្រឡា, គ្រឿងសង្ហារិម, ...)&nbsp;
        ត្រូវបានគ្រប់គ្រងនៅក្នុង <strong>ប្រភេទបន្ទប់ (Room Type)</strong>។
        ចូររក្សាតែព័ត៌មានរូបវន្ដបន្ទប់ (Physical Room) ទីនេះ។
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          label="ផ្ទះ"
          required
          name="houseId"
          placeholder="ជ្រើសរើសផ្ទះ"
          options={houses.map((h) => ({ value: String(h.id), label: h.name }))}
          value={String(form.houseId)}
          onChange={onChange}
          error={errors.houseId}
        />
        <Select
          label="ប្រភេទបន្ទប់ (Room Type)"
          required
          name="roomTypeId"
          placeholder="ជ្រើសរើសប្រភេទ"
          options={roomTypes.map((rt) => ({ value: String(rt.id), label: rt.name }))}
          value={String(form.roomTypeId)}
          onChange={onChange}
          error={errors.roomTypeId}
        />
        <Input
          label="លេខបន្ទប់"
          required
          name="roomNumber"
          value={form.roomNumber}
          onChange={onChange}
          placeholder="ឧ. 101"
          error={errors.roomNumber}
        />
      </div>

      {/* RoomType info chip — shows auto-filled defaults */}
      {selectedRoomType && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-600 dark:border-gray-800 dark:bg-gray-800/40 dark:text-slate-300">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedRoomType.name}</span>
          {selectedRoomType.bedrooms != null && <span>🛏 {selectedRoomType.bedrooms} Bed</span>}
          {selectedRoomType.bathrooms != null && <span>🚿 {selectedRoomType.bathrooms} Bath</span>}
          {selectedRoomType.areaSqm != null && <span>📐 {selectedRoomType.areaSqm} m²</span>}
          {selectedRoomType.capacity != null && <span>👥 {selectedRoomType.capacity} នាក់</span>}
          {selectedRoomType.furnishing && <span>🪑 {selectedRoomType.furnishing}</span>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="ឈ្មោះ (ជម្រើស)" name="name" value={form.name} onChange={onChange} placeholder="ឧ. Suite A" />
        <Input label="ជាន់ (Floor)" type="number" min="0" name="floorNumber" value={form.floorNumber} onChange={onChange} placeholder="ឧ. 1" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="ថ្លៃជួលប្រចាំខែ ($)" type="number" step="0.01" min="0" name="monthlyRent" value={form.monthlyRent} onChange={onChange} error={errors.monthlyRent} />
        <Input label="ប្រាក់កក់ ($)" type="number" step="0.01" min="0" name="securityDeposit" value={form.securityDeposit} onChange={onChange} error={errors.securityDeposit} />
        <Select
          label="ស្ថានភាព"
          name="status"
          options={[
            { value: 'AVAILABLE', label: 'ទំនេរ' },
            { value: 'OCCUPIED', label: 'មានអ្នកស្នាក់នៅ' },
            { value: 'MAINTENANCE', label: 'កំពុងជួសជុល' },
            { value: 'RESERVED', label: 'បានកក់' },
          ]}
          value={form.status}
          onChange={onChange}
        />
      </div>
      <Textarea label="ការពិពណ៌នា (ជម្រើស)" name="description" value={form.description} onChange={onChange} rows={2} placeholder="ព័ត៌មានលម្អិតនៃបន្ទប់..." />
    </form>
  );
};

const ViewRoomDetails = ({
  room, house, roomType, viewAmenities, viewUtilities,
  images = [], occupants = [],
  onManageAmenities, onManageUtilities, onEdit, onCreateContract, onRoomSubmitted,
}) => {
  const hName = house?.name || `ផ្ទះ #${room.houseId}`;
  const rtName = roomType?.name || `ប្រភេទ #${room.roomTypeId}`;
  const mapUrl =
    house?.googleMapsUrl ||
    (house?.latitude && house?.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${house.latitude},${house.longitude}`
      : null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-slate-200">
            <DoorOpen className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-800 dark:text-white">{room.name || `បន្ទប់ ${room.roomNumber}`}</h2>
            <p className="truncate font-mono text-xs text-slate-400">អង្គភាព #{room.roomNumber} · {hName}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {room.status === 'AVAILABLE' && (
            <Button variant="primary" size="sm" leftIcon={<FilePlus className="h-4 w-4" />} onClick={onCreateContract}>
              បង្កើតកិច្ចសន្យា
            </Button>
          )}
          <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={onEdit}>
            កែប្រែ
          </Button>
        </div>
      </div>

      {/* ── HOUSE section ── */}
      <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Building2 className="h-3 w-3" /> ផ្ទះ (House)
        </p>
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{hName}</p>
        {house?.address && <p className="mt-0.5 text-xs text-slate-500">{house.address}</p>}
        {house?.cityProvince && <p className="text-xs text-slate-500">{house.cityProvince}</p>}
        {mapUrl && (
          <a
            href={mapUrl} target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#0f2942]/30 bg-white px-2.5 py-1 text-xs font-medium text-[#0f2942] hover:bg-[#0f2942]/5 dark:border-white/20 dark:bg-gray-900 dark:text-blue-300"
          >
            <MapPin className="h-3 w-3" /> មើលលើ Google Maps ↗
          </a>
        )}
      </div>

      {/* ── ROOM TYPE section ── */}
      {roomType && (
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Layers className="h-3 w-3" /> ប្រភេទបន្ទប់ (Room Type)
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">{rtName}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roomType.bedrooms != null && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-gray-800">🛏 {roomType.bedrooms} Bed</span>
            )}
            {roomType.bathrooms != null && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-gray-800">🚿 {roomType.bathrooms} Bath</span>
            )}
            {roomType.areaSqm != null && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-gray-800">📐 {roomType.areaSqm} m²</span>
            )}
            {roomType.capacity != null && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-gray-800">👥 {roomType.capacity} នាក់</span>
            )}
            {roomType.furnishing && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-gray-800">🪑 {roomType.furnishing}</span>
            )}
            {roomType.propertyType && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-gray-800">{roomType.propertyType}</span>
            )}
          </div>
          {roomType.description && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{roomType.description}</p>
          )}
        </div>
      )}

      {/* ── PHYSICAL ROOM ── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <DetailItem icon={<MapPin className="h-4 w-4" />} label="ជាន់" value={room.floorNumber ?? '—'} />
        <DetailItem icon={<UsersIcon className="h-4 w-4" />} label="សមត្ថភាព" value={room.capacity ? `${room.capacity} នាក់` : '—'} />
        <DetailItem icon={<DollarSign className="h-4 w-4" />} label="ថ្លៃជួល/ខែ" value={formatCurrency(room.monthlyRent)} />
        <DetailItem icon={<Wallet className="h-4 w-4" />} label="ប្រាក់ប៉ោរ" value={formatCurrency(room.securityDeposit)} />
      </div>

      {/* Occupants */}
      <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">អ្នកស្នាក់នៅបច្ចុប្បន្ន</p>
        {occupants.length > 0 ? (
          <div className="space-y-1.5">
            {occupants.map((t) => (
              <div key={t.tenantId} className="flex items-center justify-between gap-2 rounded border border-slate-200/60 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-200">
                <span className="flex min-w-0 items-center gap-2"><UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">{t.name}</span></span>
                {t.isPrimary && <Badge variant="info">ចម្បង</Badge>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">មិនមានអ្នកជួល{room.status === 'AVAILABLE' ? ' — ទំនេរ' : ''}។</p>
        )}
      </div>

      {/* Amenities */}
      <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">គ្រឿងបរិក្ខារ (Amenities)</p>
          <Button variant="outline" size="xs" leftIcon={<KeySquare className="h-3.5 w-3.5" />} onClick={onManageAmenities}>
            គ្រប់គ្រង
          </Button>
        </div>
        {viewAmenities?.amenities?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {viewAmenities.amenities.map((a) => (
              <span key={a.amenityId} className="inline-flex items-center gap-1 rounded border border-slate-200/60 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-200">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {a.amenityName}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">មិនទាន់កំណត់គ្រឿងបរិក្ខារទេ។</p>
        )}
      </div>

      {/* Utilities */}
      <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ប្រើប្រាស់ (Utilities)</p>
          <Button variant="outline" size="xs" leftIcon={<Zap className="h-3.5 w-3.5" />} onClick={onManageUtilities}>
            គ្រប់គ្រង
          </Button>
        </div>
        {viewUtilities?.utilities?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {viewUtilities.utilities.map((u) => (
              <span key={u.utilityTypeId} className="inline-flex items-center gap-1 rounded border border-slate-200/60 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-200">
                <Zap className="h-3 w-3 text-amber-500" />
                {u.utilityTypeName}
                <span className="ml-1 text-[10px] text-slate-400">({u.billingMethod === 'FIXED' ? 'Fixed' : 'Metered'})</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">មិនទាន់កំណត់ប្រភេទប្រើប្រាស់ទេ។</p>
        )}
      </div>

      {/* Publication section */}
      <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ការផ្សាយ (Publication)</p>
          <PublicationStatusBadge status={room.publicationStatus} />
        </div>
        <div className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2 sm:gap-2">
          <span className="text-slate-400">ដាក់ស្នើ៖ <span className="font-semibold text-slate-700 dark:text-slate-200">{formatDate(room.submittedAt)}</span></span>
          <span className="text-slate-400">បានផ្សាយ៖ <span className="font-semibold text-slate-700 dark:text-slate-200">{formatDate(room.publishedAt)}</span></span>
        </div>
        {room.rejectionReason && (
          <div className="mt-2 rounded bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
            មូលហេតុបដិសេធ៖ {room.rejectionReason}
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canSubmitRoom(room) && (
            <SubmitForReviewButton
              room={room}
              label="ដាក់ស្នើសម្រាប់ការពិនិត្យ"
              onSuccess={onRoomSubmitted}
              preview={
                <RoomPublicPreview
                  room={room}
                  house={house}
                  roomType={roomType}
                  images={images}
                  amenities={viewAmenities?.amenities}
                  utilities={viewUtilities?.utilities}
                />
              }
            />
          )}
          {room.publicationStatus === 'REJECTED' && (
            <Button variant="outline" size="sm" leftIcon={<FilePlus className="h-4 w-4" />} onClick={onEdit}>
              កែប្រែ និងដាក់ស្នើឡើងវិញ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const RoomAmenityManager = ({ room, onClose }) => {
  const { amenities, loading, assignAmenity, removeAmenity } = useRoomAmenities(room?.id);
  const [allAmenities, setAllAmenities] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!room) return;
    setLoadingAll(true);
    roomApi
      .getMyAmenities()
      .then(setAllAmenities)
      .catch(() => setAllAmenities([]))
      .finally(() => setLoadingAll(false));
  }, [room]);

  if (!room) return null;

  const assignedIds = new Set(amenities.map((a) => a.amenityId));
  const availableToAssign = allAmenities.filter((a) => !assignedIds.has(a.id));

  const handleAssign = async (amenityId) => {
    setBusyId(amenityId);
    try {
      await assignAmenity(amenityId);
      toast.success('បានបន្ថែមគ្រឿងបរិក្ខារ');
    } catch {
      toast.error('ការបន្ថែមគ្រឿងបរិក្ខារបរាជ័យ');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (amenityId) => {
    setBusyId(amenityId);
    try {
      await removeAmenity(amenityId);
      toast.success('បានដកគ្រឿងបរិក្ខារចេញ');
    } catch {
      toast.error('ការដកគ្រឿងបរិក្ខារចេញបរាជ័យ');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Modal
      open={!!room}
      onClose={onClose}
      title={`គ្រឿងបរិក្ខារ - បន្ទប់ ${room.roomNumber}`}
      description="កំណត់រចនាសម្ព័ន្ធគ្រឿងបរិក្ខារសម្រាប់បន្ទប់នេះ។"
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">បានកំណត់</p>
          {loading ? (
            <Skeleton className="h-6 w-32" />
          ) : amenities.length === 0 ? (
            <p className="text-xs text-slate-400">គ្មាន</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {amenities.map((a) => (
                <span key={a.amenityId} className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-gray-800 dark:text-slate-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {a.amenityName}
                  <button type="button" disabled={busyId === a.amenityId} onClick={() => handleRemove(a.amenityId)} className="ml-1 text-slate-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-3 dark:border-gray-800">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">អាចបន្ថែមបាន</p>
          {loadingAll ? (
            <Skeleton className="h-6 w-32" />
          ) : availableToAssign.length === 0 ? (
            <p className="text-xs text-slate-400">បានកំណត់ទាំងអស់</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {availableToAssign.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => handleAssign(a.id)}
                  className="inline-flex items-center gap-1 rounded border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-slate-400 dark:border-gray-700 dark:text-slate-300"
                >
                  <Plus className="h-3 w-3" />
                  {a.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const RoomUtilityManager = ({ room, onClose }) => {
  const { utilities, loading, fetchUtilities, assignUtility, removeUtility } = useRoomUtilities(room?.id);
  const { types, fetchTypes } = useUtilityTypes();
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!room) return;
    fetchUtilities();
    setLoadingTypes(true);
    fetchTypes({ page: 0, size: 100, status: 'ACTIVE' })
      .finally(() => setLoadingTypes(false));
  }, [room, fetchUtilities, fetchTypes]);

  if (!room) return null;

  const assignedIds = new Set(utilities.map((u) => u.utilityTypeId));
  const availableToAssign = types.filter((t) => !assignedIds.has(t.id));

  const handleAssign = async (typeId) => {
    setBusyId(typeId);
    try {
      await assignUtility(typeId);
      toast.success('បានបន្ថែមប្រភេទប្រើប្រាស់');
    } catch {
      toast.error('ការបន្ថែមប្រភេទប្រើប្រាស់បរាជ័យ');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (typeId) => {
    setBusyId(typeId);
    try {
      await removeUtility(typeId);
      toast.success('បានដកប្រភេទប្រើប្រាស់ចេញ');
    } catch {
      toast.error('ការដកប្រភេទប្រើប្រាស់ចេញបរាជ័យ');
    } finally {
      setBusyId(null);
    }
  };

  const getBillingMethodLabel = (m) =>
    m === 'METERED' ? 'Metered' : m === 'FIXED' ? 'Fixed' : m || '—';

  return (
    <Modal
      open={!!room}
      onClose={onClose}
      title={`ប្រភេទប្រើប្រាស់ - បន្ទប់ ${room.roomNumber}`}
      description="កំណត់ប្រភេទប្រើប្រាស់ដែលបង្កើតវិក្រិត្យសម្រាប់បន្ទប់នេះ។"
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">បានកំណត់</p>
          {loading ? (
            <Skeleton className="h-6 w-32" />
          ) : utilities.length === 0 ? (
            <p className="text-xs text-slate-400">គ្មាន</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {utilities.map((u) => (
                <span key={u.utilityTypeId} className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-gray-800 dark:text-slate-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {u.utilityTypeName}
                  <Badge variant={u.billingMethod === 'FIXED' ? 'info' : 'default'} className="ml-1">
                    {getBillingMethodLabel(u.billingMethod)}
                  </Badge>
                  <button type="button" disabled={busyId === u.utilityTypeId} onClick={() => handleRemove(u.utilityTypeId)} className="ml-1 text-slate-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-3 dark:border-gray-800">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">អាចបន្ថែមបាន</p>
          {loadingTypes ? (
            <Skeleton className="h-6 w-32" />
          ) : availableToAssign.length === 0 ? (
            <p className="text-xs text-slate-400">បានកំណត់ទាំងអស់</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {availableToAssign.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={busyId === t.id}
                  onClick={() => handleAssign(t.id)}
                  className="inline-flex items-center gap-1 rounded border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-slate-400 dark:border-gray-700 dark:text-slate-300"
                >
                  <Plus className="h-3 w-3" />
                  {t.name}
                  <span className="ml-1 text-[10px] text-slate-400">({getBillingMethodLabel(t.billingMethod)})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const RoomBulkModal = ({ mode, open, rooms, houses, onClose }) => {
  const isUtilities = mode === 'utilities';
  const { types, loading: loadingTypes, fetchTypes } = useUtilityTypes();
  const [amenities, setAmenities] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  const [search, setSearch] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState(() => new Set());
  const [entityIds, setEntityIds] = useState(() => new Set());
  const [isIncluded, setIsIncluded] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setHouseFilter('');
    setFloorFilter('');
    setSelectedRoomIds(new Set());
    setEntityIds(new Set());
    setResult(null);
    setSubmitting(false);
    if (isUtilities) {
      setLoadingAmenities(false);
      fetchTypes({ page: 0, size: 100, status: 'ACTIVE' }).catch(() => {});
    } else {
      setLoadingAmenities(true);
      roomApi
        .getMyAmenities()
        .then(setAmenities)
        .finally(() => setLoadingAmenities(false));
    }
  }, [open, isUtilities, fetchTypes]);

  const entities = isUtilities ? types : amenities;
  const entitiesLoading = isUtilities ? loadingTypes : loadingAmenities;
  const houseName = (id) => houses.find((h) => h.id === id)?.name || `ផ្ទះ #${id}`;

  const floors = useMemo(() => {
    const set = new Set();
    rooms.forEach((r) => {
      if (r.floorNumber != null) set.add(r.floorNumber);
    });
    return [...set].sort((a, b) => a - b);
  }, [rooms]);

  const visibleRooms = useMemo(() => {
    let list = rooms;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
          (r.name && r.name.toLowerCase().includes(q))
      );
    }
    if (houseFilter) list = list.filter((r) => String(r.houseId) === String(houseFilter));
    if (floorFilter) list = list.filter((r) => String(r.floorNumber ?? '') === floorFilter);
    return list;
  }, [rooms, search, houseFilter, floorFilter]);

  const allVisibleSelected =
    visibleRooms.length > 0 && visibleRooms.every((r) => selectedRoomIds.has(r.id));

  const selectAllVisible = () =>
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      visibleRooms.forEach((r) => {
        if (allVisibleSelected) next.delete(r.id);
        else next.add(r.id);
      });
      return next;
    });

  const toggleRoom = (id) =>
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleEntity = (id) =>
    setEntityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const roomNumberById = (id) => rooms.find((r) => r.id === id)?.roomNumber || id;
  const entityNameById = (id) => entities.find((e) => e.id === id)?.name || id;

  const handleSubmit = async () => {
    if (selectedRoomIds.size === 0 || entityIds.size === 0) return;
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        roomIds: [...selectedRoomIds],
        ...(isUtilities
          ? { utilityTypeIds: [...entityIds], isIncluded }
          : { amenityIds: [...entityIds] }),
      };
      const res = isUtilities
        ? await roomApi.bulkAssignUtilities(payload)
        : await roomApi.bulkAssignAmenities(payload);
      setResult(res);
      toast.success(
        isUtilities ? 'កំណត់ប្រភេទប្រើប្រាស់ច្រើនបន្ទប់' : 'កំណត់គ្រឿងបរិក្ខារច្រើនបន្ទប់',
        `បានកំណត់ ${res.assignmentsCreated} កន្លែង · មានរួចហើយ ${res.alreadyAssigned} · បរាជ័យ ${res.failures?.length || 0}`
      );
    } catch (err) {
      toast.error(
        'ការកំណត់បរាជ័យ',
        err.response?.data?.message || err.response?.data?.error || 'ប្រតិបត្តិការបរាជ័យ។'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isUtilities ? 'កំណត់ប្រភេទប្រើប្រាស់ច្រើនបន្ទប់' : 'កំណត់គ្រឿងបរិក្ខារច្រើនបន្ទប់'}
      description={
        isUtilities
          ? 'ជ្រើសរើសប្រភេទប្រើប្រាស់ និងបន្ទប់ដែលត្រូវកំណត់ទាំងអស់ក្នុងពេលតែមួយ។'
          : 'ជ្រើសរើសគ្រឿងបរិក្ខារ និងបន្ទប់ដែលត្រូវកំណត់ទាំងអស់ក្នុងពេលតែមួយ។'
      }
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            បោះបង់
          </Button>
          <Button
            loading={submitting}
            disabled={selectedRoomIds.size === 0 || entityIds.size === 0}
            onClick={handleSubmit}
          >
            {submitting
              ? 'កំពុងកំណត់...'
              : `កំណត់ទៅ ${selectedRoomIds.size} បន្ទប់`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isUtilities ? 'ប្រភេទប្រើប្រាស់ (Utilities)' : 'គ្រឿងបរិក្ខារ (Amenities)'}
          </p>
          {entitiesLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : entities.length === 0 ? (
            <p className="text-xs text-slate-400">មិនមានទិន្នន័យទេ។</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {entities.map((e) => {
                const selected = entityIds.has(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEntity(e.id)}
                    className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition-colors ${
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400 dark:border-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                    {e.name}
                    {isUtilities && (
                      <span className={`text-[10px] ${selected ? 'text-slate-300 dark:text-gray-500' : 'text-slate-400'}`}>
                        ({e.billingMethod === 'METERED' ? 'Metered' : 'Fixed'})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-3 dark:border-gray-800">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">បន្ទប់ (Rooms)</p>
            <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400">
              {selectedRoomIds.size} បន្ទប់បានជ្រើសរើស
            </span>
            <Button variant="ghost" size="xs" onClick={selectAllVisible}>
              {allVisibleSelected ? 'មិនជ្រើសរើសទាំងអស់' : 'ជ្រើសរើសទាំងអស់'}
            </Button>
            <Button variant="ghost" size="xs" onClick={() => setSelectedRoomIds(new Set())}>
              សម្អាត
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 pb-2 sm:grid-cols-3">
            <Input
              placeholder="ស្វែងរកលេខបន្ទប់ ឬឈ្មោះ..."
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={[
                { value: '', label: 'ផ្ទះទាំងអស់' },
                ...houses.map((h) => ({ value: String(h.id), label: h.name })),
              ]}
              value={houseFilter}
              onChange={(e) => setHouseFilter(e.target.value)}
            />
            <Select
              options={[
                { value: '', label: 'ជាន់ទាំងអស់' },
                ...floors.map((f) => ({ value: String(f), label: `ជាន់ ${f}` })),
              ]}
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
            />
          </div>

          <div className="max-h-64 space-y-0.5 overflow-y-auto rounded-lg border border-slate-200/80 p-1.5 dark:border-gray-800">
            {visibleRooms.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-slate-400">គ្មានបន្ទប់ត្រូវនឹងលក្ខខណ្ឌ។</p>
            ) : (
              visibleRooms.map((r) => (
                <div
                  key={r.id}
                  onClick={() => toggleRoom(r.id)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm transition-colors ${
                    selectedRoomIds.has(r.id)
                      ? 'bg-slate-100 dark:bg-gray-800'
                      : 'hover:bg-slate-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={selectedRoomIds.has(r.id)}
                    className="h-4 w-4 shrink-0 accent-gray-900 dark:accent-white"
                  />
                  <span className="shrink-0 font-mono text-xs text-slate-400">#{r.roomNumber}</span>
                  <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">
                    {r.name || r.roomNumber}
                  </span>
                  <span className="hidden max-w-[140px] truncate text-xs text-slate-400 sm:block">
                    {houseName(r.houseId)}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">ជាន់ {r.floorNumber ?? '—'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {isUtilities && (
          <div className="border-t border-slate-100 pt-3 dark:border-gray-800">
            <Checkbox
              label="រាប់បញ្ចូលក្នុងវិក្ក័ប្រើប្រាស់ (Included in bill)"
              checked={isIncluded}
              onChange={(e) => setIsIncluded(e.target.checked)}
            />
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 text-sm dark:border-gray-800 dark:bg-gray-800/40">
            <p className="font-semibold text-slate-800 dark:text-white">
              បានដំណើរការ {result.roomsProcessed} បន្ទប់ · បង្កើត {result.assignmentsCreated} ·
              មានរួចហើយ {result.alreadyAssigned} · បរាជ័យ {result.failures?.length || 0}
            </p>
            {result.failures?.length > 0 && (
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-500 dark:text-slate-400">
                {result.failures.map((f, i) => (
                  <li key={i}>
                    បន្ទប់ #{roomNumberById(f.roomId)} · {entityNameById(f.entityId)} — {f.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};