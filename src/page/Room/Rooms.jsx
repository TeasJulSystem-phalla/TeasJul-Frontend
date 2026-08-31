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
  CalendarClock,
  KeySquare,
  Filter,
  LayoutGrid,
  List,
  X,
  UserCheck,
  ChevronRight,
  FilePlus,
} from 'lucide-react';
import { useRooms, useRoomAmenities } from '../../hooks/useRooms.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useRoomTypes } from '../../hooks/useRoomType.js';
import { useRoomOccupants } from '../../hooks/useRoomOccupants.js';
import { roomApi } from '../../api/room.api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Card,
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
  Skeleton,
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
  capacity: 1,
  status: 'AVAILABLE',
  description: '',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

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

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [houseFilter, setHouseFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [amenityTarget, setAmenityTarget] = useState(null);
  const viewAmenities = useRoomAmenities(viewData?.id);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const houseName = useCallback(
    (id) => houses.find((h) => h.id === id)?.name || `ផ្ទះ #${id}`,
    [houses]
  );
  const roomTypeName = useCallback(
    (id) => roomTypes.find((rt) => rt.id === id)?.name || `ប្រភេទបន្ទប់ #${id}`,
    [roomTypes]
  );

  const refresh = useCallback(() => fetchRooms(), [fetchRooms]);

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
    return result;
  }, [rooms, searchTerm, statusFilter, houseFilter]);

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
    navigate(`/contracts/new?roomId=${roomId}`);
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
          <Layers className="h-4 w-4 text-slate-400" />
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
      header: 'ថ្លៃជួល / ប្រាក់ដាក់ប្រាកដ',
      render: (row) => (
        <div className="text-sm">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(row.monthlyRent)}</p>
          <p className="text-xs text-slate-400">ប្រាក់ដាក់ប្រាកដ {formatCurrency(row.securityDeposit)}</p>
        </div>
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'សកម្មភាព',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {row.status === 'AVAILABLE' && (
            <IconButton
              variant="ghost"
              size="sm"
              tooltip="បង្កើតកិច្ចសន្យា"
              icon={<FilePlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              onClick={() => handleCreateContractForRoom(row.id)}
            />
          )}
          <IconButton variant="ghost" size="sm" tooltip="មើលព័ត៌មានលម្អិត" icon={<Eye className="h-4 w-4" />} onClick={() => handleOpenView(row)} />
          <IconButton variant="ghost" size="sm" tooltip="គ្រឿងបរិក្ខារ" icon={<KeySquare className="h-4 w-4" />} onClick={() => setAmenityTarget(row)} />
          <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={() => openEdit(row)} />
          <IconButton variant="ghost" size="sm" tooltip="លុប" icon={<Trash2 className="h-4 w-4 text-red-600 dark:text-red-400 hover:text-red-700" />} onClick={() => setDeleteTarget(row)} />
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
      capacity: room.capacity || 1,
      status: room.status || 'AVAILABLE',
      description: room.description || '',
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'number' ? value : value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.houseId) errs.houseId = 'តម្រូវឱ្យជ្រើសរើសផ្ទះ';
    if (!form.roomTypeId) errs.roomTypeId = 'តម្រូវឱ្យជ្រើសរើសប្រភេទបន្ទប់';
    if (!form.roomNumber.trim()) errs.roomNumber = 'តម្រូវឱ្យបញ្ចូលលេខបន្ទប់';
    if (Number(form.capacity) < 1) errs.capacity = 'សមត្ថភាពត្រូវតែយ៉ាងតិច ១';
    if (Number(form.monthlyRent) < 0) errs.monthlyRent = 'ថ្លៃជួលមិនអាចជាលេខអវិជ្ជមានបានទេ';
    if (Number(form.securityDeposit) < 0) errs.securityDeposit = 'ប្រាក់ដាក់ប្រាកដមិនអាចជាលេខអវិជ្ជមានបានទេ';
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
      capacity: Number(form.capacity),
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
      <div className="space-y-6">
        <div className="flex justify-between">
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

  const hasActiveFilters = Boolean(searchTerm || statusFilter || houseFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">បន្ទប់</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ទិដ្ឋភាពទូទៅនៃបន្ទប់ តម្លៃប្រចាំខែ និងការស្នាក់នៅរបស់អ្នកជួល។
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>
            ធ្វើឱ្យស្រស់
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
            onClick={() => setStatusFilter('')}
            className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
              statusFilter === ''
                ? 'border-slate-400 bg-slate-100/80 dark:border-slate-600 dark:bg-gray-800'
                : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">បន្ទប់សរុប</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
            </div>
            <BedDouble className="h-5 w-5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'AVAILABLE' ? '' : 'AVAILABLE')}
            className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
              statusFilter === 'AVAILABLE'
                ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30'
                : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">ទំនេរ</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.available}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'OCCUPIED' ? '' : 'OCCUPIED')}
            className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
              statusFilter === 'OCCUPIED'
                ? 'border-slate-500 bg-slate-100 dark:border-slate-600 dark:bg-gray-800'
                : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">មានអ្នកស្នាក់នៅ</p>
              <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{stats.occupied}</p>
            </div>
            <DoorOpen className="h-5 w-5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'MAINTENANCE' ? '' : 'MAINTENANCE')}
            className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
              statusFilter === 'MAINTENANCE'
                ? 'border-amber-500 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30'
                : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">កំពុងជួសជុល</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.maintenance}</p>
            </div>
            <Wrench className="h-5 w-5 text-amber-500" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      {rooms.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="តម្រងតាមលេខបន្ទប់ ឬឈ្មោះ..."
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
            </div>
            <div className="w-full sm:w-44">
              <Select
                options={[
                  { value: '', label: 'ផ្ទះទាំងអស់' },
                  ...houses.map((h) => ({ value: String(h.id), label: h.name })),
                ]}
                value={houseFilter}
                onChange={(e) => setHouseFilter(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="h-4 w-4" />}
                onClick={() => { setSearchTerm(''); setStatusFilter(''); setHouseFilter(''); }}
                className="text-slate-500"
              >
                សម្អាត
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-gray-800 sm:border-0 sm:pt-0">
            <span className="text-xs text-slate-400 mr-2">{filtered.length} បន្ទប់</span>
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
                <LayoutGrid className="h-3.5 w-3.5 inline mr-1" /> ក្រឡា
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-gray-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <List className="h-3.5 w-3.5 inline mr-1" /> តារាង
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
      ) : viewMode === 'table' ? (
        <Card className="overflow-hidden rounded-xl border-slate-200/80 dark:border-gray-800">
          <Table columns={columns} data={filtered} onRowClick={handleOpenView} />
        </Card>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => {
            const meta = STATUS_META[room.status] || STATUS_META.RESERVED;
            const primaryTenant = getPrimaryTenantName(room);

            return (
              <div
                key={room.id}
                onClick={() => handleOpenView(room)}
                className="group cursor-pointer rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                        <DoorOpen className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {room.name || `បន្ទប់ ${room.roomNumber}`}
                        </h3>
                        <p className="font-mono text-xs text-slate-400">អង្គភាព #{room.roomNumber}</p>
                      </div>
                    </div>
                    {getStatusBadge(room.status)}
                  </div>

                  <div className="mt-3.5 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 dark:bg-gray-800">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      <span className="max-w-[130px] truncate">{houseName(room.houseId)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 dark:bg-gray-800">
                      <Layers className="h-3 w-3 text-slate-400" />
                      {roomTypeName(room.roomTypeId)}
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
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <UserIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{primaryTenant}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">អ្នកជួល</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>មិនទាន់មានអ្នកជួល</span>
                        {room.status === 'AVAILABLE' && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">ទំនេរ</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400">ថ្លៃជួល</span>
                    <p className="font-bold text-slate-900 dark:text-white text-base">{formatCurrency(room.monthlyRent)}</p>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {room.status === 'AVAILABLE' && (
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<FilePlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                        onClick={() => handleCreateContractForRoom(room.id)}
                        className="mr-1 text-xs"
                      >
                        កិច្ចសន្យា
                      </Button>
                    )}
                    <IconButton variant="ghost" size="sm" tooltip="គ្រឿងបរិក្ខារ" icon={<KeySquare className="h-4 w-4" />} onClick={() => setAmenityTarget(room)} />
                    <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={() => openEdit(room)} />
                    <IconButton variant="ghost" size="sm" tooltip="លុប" icon={<Trash2 className="h-4 w-4 text-red-500" />} onClick={() => setDeleteTarget(room)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
          <div className="flex justify-end gap-2">
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
            houseName={houseName}
            roomTypeName={roomTypeName}
            viewAmenities={viewAmenities}
            occupants={roomTenants((viewData || viewTarget).id)}
            onManageAmenities={() => {
              setAmenityTarget(viewData || viewTarget);
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

      {/* Amenity manager */}
      <RoomAmenityManager room={amenityTarget} onClose={() => setAmenityTarget(null)} />

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

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white p-2.5 dark:border-gray-800 dark:bg-gray-900">
    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-300">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

const RoomForm = ({ form, errors, onChange, houses, roomTypes, onSubmit }) => (
  <form id="roomForm" onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        label="ប្រភេទបន្ទប់"
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Input label="ឈ្មោះ" name="name" value={form.name} onChange={onChange} placeholder="ឧ. Suite A" />
      <Input label="ជាន់" type="number" min="0" name="floorNumber" value={form.floorNumber} onChange={onChange} placeholder="ឧ. 1" />
      <Input label="សមត្ថភាព" required type="number" min="1" name="capacity" value={form.capacity} onChange={onChange} error={errors.capacity} />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input label="ថ្លៃជួលប្រចាំខែ ($)" type="number" step="0.01" min="0" name="monthlyRent" value={form.monthlyRent} onChange={onChange} error={errors.monthlyRent} />
      <Input label="ប្រាក់ដាក់ប្រាកដ ($)" type="number" step="0.01" min="0" name="securityDeposit" value={form.securityDeposit} onChange={onChange} error={errors.securityDeposit} />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
    <Textarea label="ការពិពណ៌នា" name="description" value={form.description} onChange={onChange} rows={2} placeholder="ព័ត៌មានលម្អិតនៃបន្ទប់..." />
  </form>
);

const ViewRoomDetails = ({ room, houseName, roomTypeName, viewAmenities, occupants = [], onManageAmenities, onEdit, onCreateContract }) => (
  <div className="space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-slate-200">
          <DoorOpen className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{room.name || `បន្ទប់ ${room.roomNumber}`}</h2>
          <p className="font-mono text-xs text-slate-400">អង្គភាព #{room.roomNumber} · {houseName(room.houseId)}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
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

    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      <DetailItem icon={<Building2 className="h-4 w-4" />} label="ផ្ទះ" value={houseName(room.houseId)} />
      <DetailItem icon={<Layers className="h-4 w-4" />} label="ប្រភេទ" value={roomTypeName(room.roomTypeId)} />
      <DetailItem icon={<MapPin className="h-4 w-4" />} label="ជាន់" value={room.floorNumber ?? '—'} />
      <DetailItem icon={<UsersIcon className="h-4 w-4" />} label="សមត្ថភាព" value={`${room.capacity} នាក់`} />
    </div>

    <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        អ្នកស្នាក់នៅបច្ចុប្បន្ន{occupants.length === 1 ? '' : ''}
      </p>
      {occupants.length > 0 ? (
        <div className="space-y-1.5">
          {occupants.map((t) => (
            <div key={t.tenantId} className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-gray-900 dark:text-slate-200 border border-slate-200/60 dark:border-gray-800">
              <span className="flex items-center gap-2">
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                {t.name}
              </span>
              {t.isPrimary && <Badge variant="info">ចម្បង</Badge>}
            </div>
          ))}
        </div>
      ) : room.tenant ? (
        <div className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-gray-900 dark:text-slate-200 border border-slate-200/60 dark:border-gray-800">
          <span className="flex items-center gap-2">
            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
            {`${room.tenant.firstName || ''} ${room.tenant.lastName || ''}`.trim() || `អ្នកជួល #${room.tenant.id}`}
          </span>
          <Badge variant="info">ចម្បង</Badge>
        </div>
      ) : (
        <p className="text-xs text-slate-400">មិនមានអ្នកជួលកំពុងជួលបន្ទប់នេះទេ។</p>
      )}
    </div>

    <div className="grid grid-cols-2 gap-2.5">
      <DetailItem icon={<DollarSign className="h-4 w-4" />} label="ថ្លៃជួលប្រចាំខែ" value={formatCurrency(room.monthlyRent)} />
      <DetailItem icon={<Wallet className="h-4 w-4" />} label="ប្រាក់ដាក់ប្រាកដ" value={formatCurrency(room.securityDeposit)} />
    </div>

    <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">គ្រឿងបរិក្ខារ</p>
        <Button variant="outline" size="xs" leftIcon={<KeySquare className="h-3.5 w-3.5" />} onClick={onManageAmenities}>
          គ្រប់គ្រង
        </Button>
      </div>
      {viewAmenities.amenities.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {viewAmenities.amenities.map((a) => (
            <span key={a.amenityId} className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs text-slate-700 dark:bg-gray-900 dark:text-slate-200 border border-slate-200/60 dark:border-gray-800">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {a.amenityName}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">មិនទាន់កំណត់គ្រឿងបរិក្ខារទេ។</p>
      )}
    </div>
  </div>
);

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
    } catch (err) {
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
    } catch (err) {
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
                  <button type="button" disabled={busyId === a.amenityId} onClick={() => handleRemove(a.amenityId)} className="text-slate-400 hover:text-red-500 ml-1">
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
}
