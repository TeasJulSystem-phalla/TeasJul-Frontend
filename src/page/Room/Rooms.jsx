import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Hash,
  Calendar,
  KeySquare,
  Filter,
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

const STATUS_VARIANT = {
  AVAILABLE: 'success',
  OCCUPIED: 'info',
  MAINTENANCE: 'warning',
  RESERVED: 'neutral',
};

const STATUS_META = {
  AVAILABLE: { label: 'Available', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  OCCUPIED: { label: 'Occupied', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  MAINTENANCE: { label: 'Maintenance', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  RESERVED: { label: 'Reserved', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'RESERVED', label: 'Reserved' },
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

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function Rooms() {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [houseFilter, setHouseFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [amenityTarget, setAmenityTarget] = useState(null); // room being managed

  const viewAmenities = useRoomAmenities(viewData?.id);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Lookup maps for display
  const houseName = useCallback(
    (id) => houses.find((h) => h.id === id)?.name || `House #${id}`,
    [houses]
  );
  const roomTypeName = useCallback(
    (id) => roomTypes.find((rt) => rt.id === id)?.name || `Room Type #${id}`,
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

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{STATUS_META[status]?.label || status || '—'}</Badge>
  );

  const roomTenants = (roomId) => {
    const list = roomOccupants[roomId] || [];
    return [...list].sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1));
  };

  const renderTenantCell = (room) => {
    const list = roomTenants(room.id);
    if (list.length === 0) {
      return (
        <span className="text-sm text-slate-400">
          {room.status === 'OCCUPIED' && occupantsLoading ? 'Loading…' : '—'}
        </span>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        {list.map((t) => (
          <span key={t.tenantId} className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
            <UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{t.name}</span>
            {t.isPrimary && <Badge variant="info">Primary</Badge>}
          </span>
        ))}
      </div>
    );
  };

  const columns = [
    {
      header: 'Room',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            <DoorOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-slate-800 dark:text-white">
              {row.name || row.roomNumber}
            </p>
            <p className="font-mono text-xs text-slate-400">Room {row.roomNumber}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'House',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="max-w-[160px] truncate">{houseName(row.houseId)}</span>
        </span>
      ),
    },
    {
      header: 'Tenant',
      render: (row) => renderTenantCell(row),
    },
    {
      header: 'Type',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Layers className="h-4 w-4 text-slate-400" />
          <span className="max-w-[140px] truncate">{roomTypeName(row.roomTypeId)}</span>
        </span>
      ),
    },
    {
      header: 'Floor',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <MapPin className="h-4 w-4 text-slate-400" />
          {row.floorNumber ?? '—'}
        </span>
      ),
    },
    {
      header: 'Capacity',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <UsersIcon className="h-4 w-4 text-slate-400" />
          {row.capacity}
        </span>
      ),
    },
    {
      header: 'Rent / Deposit',
      render: (row) => (
        <div className="text-sm">
          <p className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            {formatCurrency(row.monthlyRent)}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Wallet className="h-3 w-3" />
            dep {formatCurrency(row.securityDeposit)}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton variant="ghost" size="sm" tooltip="View" icon={<Eye className="h-4 w-4" />} onClick={() => handleOpenView(row)} />
          <IconButton variant="ghost" size="sm" tooltip="Amenities" icon={<KeySquare className="h-4 w-4" />} onClick={() => setAmenityTarget(row)} />
          <IconButton variant="ghost" size="sm" tooltip="Edit" icon={<Edit className="h-4 w-4" />} onClick={() => openEdit(row)} />
          <IconButton variant="ghost" size="sm" tooltip="Delete" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onClick={() => setDeleteTarget(row)} />
        </div>
      ),
    },
  ];

  // ---- Form ----
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
    if (!form.houseId) errs.houseId = 'House is required';
    if (!form.roomTypeId) errs.roomTypeId = 'Room type is required';
    if (!form.roomNumber.trim()) errs.roomNumber = 'Room number is required';
    if (Number(form.capacity) < 1) errs.capacity = 'Capacity must be at least 1';
    if (Number(form.monthlyRent) < 0) errs.monthlyRent = 'Rent cannot be negative';
    if (Number(form.securityDeposit) < 0) errs.securityDeposit = 'Deposit cannot be negative';
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
        toast.success('Room updated', `${payload.roomNumber} has been updated.`);
        setEditTarget(null);
      } else {
        await createRoom(payload);
        toast.success('Room created', `Room ${payload.roomNumber} has been created.`);
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Operation failed.';
      if (/room number/i.test(message)) {
        setFormErrors({ roomNumber: message });
      } else {
        toast.error('Error', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---- View ----
  const handleOpenView = (room) => {
    setViewTarget(room);
    setViewData(null);
    setViewLoading(true);
    getRoom(room.id)
      .then(setViewData)
      .catch(() => setViewData(null))
      .finally(() => setViewLoading(false));
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRoom(deleteTarget.id);
      toast.success('Room deleted', `Room ${deleteTarget.roomNumber} has been removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Delete failed', err.response?.data?.message || err.response?.data?.error || 'Failed to delete room.');
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
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="mt-3 h-3 w-16" />
              <Skeleton className="mt-1.5 h-5 w-10" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-12 ${i > 0 ? 'mt-3' : ''} w-full px-6`} />
          ))}
          <div className="h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Rooms</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your rooms, pricing, and assigned amenities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>
            Create Room
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error loading rooms" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Stats */}
      {rooms.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total" value={stats.total} icon={<BedDouble className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
          <StatCard label="Available" value={stats.available} icon={<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />} valueClass="text-green-700 dark:text-green-400" />
          <StatCard label="Occupied" value={stats.occupied} icon={<DoorOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />} valueClass="text-blue-700 dark:text-blue-400" />
          <StatCard label="Maintenance" value={stats.maintenance} icon={<Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />} valueClass="text-amber-700 dark:text-amber-400" />
          <StatCard label="Reserved" value={stats.reserved} icon={<CalendarClock className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
        </div>
      )}

      {/* Filters */}
      {rooms.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input placeholder="Search by number, name, or description..." leftIcon={<Search className="h-4 w-4" />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
          </div>
          <div className="w-full sm:w-52">
            <Select
              options={[
                { value: '', label: 'All Houses' },
                ...houses.map((h) => ({ value: String(h.id), label: h.name })),
              ]}
              value={houseFilter}
              onChange={(e) => setHouseFilter(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); setHouseFilter(''); }}>
            Clear
          </Button>
        </div>
      )}

      {/* Content */}
      {!loading && rooms.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No rooms yet"
          description="Get started by adding your first room."
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>Create Room</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="No matches found" description="Try adjusting your search or filter criteria." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((room) => {
              const meta = STATUS_META[room.status] || STATUS_META.RESERVED;
              return (
                <div key={room.id} onClick={() => handleOpenView(room)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                        <DoorOpen className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{room.name || room.roomNumber}</p>
                        <p className="font-mono text-xs text-slate-400">Room {room.roomNumber}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{houseName(room.houseId)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Layers className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{roomTypeName(room.roomTypeId)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <DollarSign className="h-4 w-4 shrink-0 text-slate-400" />
                      {formatCurrency(room.monthlyRent)}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <UsersIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      {room.capacity} people
                    </div>
                  </div>
                  {roomTenants(room.id).length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 dark:border-gray-800">
                      <UserIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      {roomTenants(room.id).map((t) => (
                        <span key={t.tenantId} className="inline-flex items-center gap-1.5">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.name}</span>
                          {t.isPrimary && <Badge variant="info">Primary</Badge>}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-gray-800">
                    <IconButton variant="ghost" size="sm" tooltip="Amenities" icon={<KeySquare className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); setAmenityTarget(room); }} />
                    <IconButton variant="ghost" size="sm" tooltip="Edit" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openEdit(room); }} />
                    <IconButton variant="ghost" size="sm" tooltip="Delete" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeleteTarget(room); }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <Card className="hidden lg:block">
            <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} onRowClick={handleOpenView} className="w-full" />
          </Card>
        </>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Room' : 'Create Room'}
        description={editTarget ? `Editing ${editTarget.name || editTarget.roomNumber}` : 'Add a new room to a property.'}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="roomForm" onClick={() => document.getElementById('roomForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'Save Changes' : 'Create Room'}
            </Button>
          </div>
        }
      >
        <RoomForm form={form} errors={formErrors} onChange={handleFormChange} houses={houses} roomTypes={roomTypes} onSubmit={handleSubmit} />
      </Modal>

      {/* View modal */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Room Details" size="lg">
        {viewLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : viewData ? (
          <ViewRoomDetails room={viewData} houseName={houseName} roomTypeName={roomTypeName} viewAmenities={viewAmenities} occupants={roomTenants(viewData?.id)} onManageAmenities={() => { setAmenityTarget(viewData); setViewTarget(null); }} onEdit={() => { openEdit(viewData); setViewTarget(null); }} />
        ) : (
          <EmptyState icon={BedDouble} title="Room not found" description="Could not load room details." />
        )}
      </Modal>

      {/* Amenity manager */}
      <RoomAmenityManager
        room={amenityTarget}
        onClose={() => setAmenityTarget(null)}
      />

      {/* Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Room"
        description={`Are you sure you want to delete room "${deleteTarget?.roomNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

const StatCard = ({ label, value, icon, valueClass = 'text-slate-800 dark:text-white' }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">{icon}</div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      </div>
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-gray-800">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

const RoomForm = ({ form, errors, onChange, houses, roomTypes, onSubmit }) => (
  <form id="roomForm" onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Select label="House" required name="houseId" placeholder="Select a house" options={houses.map((h) => ({ value: String(h.id), label: h.name }))} value={String(form.houseId)} onChange={onChange} error={errors.houseId} />
      <Select label="Room Type" required name="roomTypeId" placeholder="Select a type" options={roomTypes.map((rt) => ({ value: String(rt.id), label: rt.name }))} value={String(form.roomTypeId)} onChange={onChange} error={errors.roomTypeId} />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Input label="Room Number" required name="roomNumber" value={form.roomNumber} onChange={onChange} placeholder="e.g., 101" error={errors.roomNumber} />
      <Input label="Name" name="name" value={form.name} onChange={onChange} placeholder="e.g., Deluxe Suite" />
      <Input label="Floor" type="number" min="0" name="floorNumber" value={form.floorNumber} onChange={onChange} placeholder="e.g., 1" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Input label="Monthly Rent ($)" type="number" step="0.01" min="0" name="monthlyRent" value={form.monthlyRent} onChange={onChange} error={errors.monthlyRent} />
      <Input label="Security Deposit ($)" type="number" step="0.01" min="0" name="securityDeposit" value={form.securityDeposit} onChange={onChange} error={errors.securityDeposit} />
      <Input label="Capacity" required type="number" min="1" name="capacity" value={form.capacity} onChange={onChange} error={errors.capacity} />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Select
        label="Status"
        name="status"
        options={[
          { value: 'AVAILABLE', label: 'Available' },
          { value: 'OCCUPIED', label: 'Occupied' },
          { value: 'MAINTENANCE', label: 'Maintenance' },
          { value: 'RESERVED', label: 'Reserved' },
        ]}
        value={form.status}
        onChange={onChange}
      />
    </div>
    <Textarea label="Description" name="description" value={form.description} onChange={onChange} rows={2} placeholder="Describe the room..." />
  </form>
);

const ViewRoomDetails = ({ room, houseName, roomTypeName, viewAmenities, occupants = [], onManageAmenities, onEdit }) => (
  <div className="space-y-5">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
          <DoorOpen className="h-6 w-6" />
        </span>
        <div>
          <p className="text-lg font-semibold text-slate-800 dark:text-white">{room.name || room.roomNumber}</p>
          <p className="font-mono text-sm text-slate-500 dark:text-slate-400">Room {room.roomNumber}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={onEdit}>Edit</Button>
        <Button variant="primary" size="sm" leftIcon={<KeySquare className="h-4 w-4" />} onClick={onManageAmenities}>Amenities</Button>
      </div>
    </div>

    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Location & Type</p>
      <div className="grid grid-cols-2 gap-3">
        <DetailItem icon={<Building2 className="h-4 w-4 text-slate-400" />} label="House" value={houseName(room.houseId)} />
        <DetailItem icon={<Layers className="h-4 w-4 text-slate-400" />} label="Room Type" value={roomTypeName(room.roomTypeId)} />
        <DetailItem icon={<MapPin className="h-4 w-4 text-slate-400" />} label="Floor" value={room.floorNumber ?? '—'} />
        <DetailItem icon={<UsersIcon className="h-4 w-4 text-slate-400" />} label="Capacity" value={`${room.capacity} people`} />
      </div>
    </div>

    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Tenant{occupants.length === 1 ? '' : 's'}</p>
      {occupants.length > 0 ? (
        <div className="space-y-2">
          {occupants.map((t) => (
            <div key={t.tenantId} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.name}</span>
              </div>
              {t.isPrimary && <Badge variant="info">Primary</Badge>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No tenant is currently renting this room.</p>
      )}
    </div>

    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Pricing</p>
      <div className="grid grid-cols-2 gap-3">
        <DetailItem icon={<DollarSign className="h-4 w-4 text-slate-400" />} label="Monthly Rent" value={formatCurrency(room.monthlyRent)} />
        <DetailItem icon={<Wallet className="h-4 w-4 text-slate-400" />} label="Security Deposit" value={formatCurrency(room.securityDeposit)} />
      </div>
    </div>

    {room.description && (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</p>
        <p className="text-sm text-slate-700 dark:text-slate-300">{room.description}</p>
      </div>
    )}

    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Amenities</p>
        {viewAmenities.loading ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <RefreshCw className="h-3 w-3 animate-spin" /> Loading...
          </span>
        ) : null}
      </div>
      {viewAmenities.loading ? (
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      ) : viewAmenities.amenities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {viewAmenities.amenities.map((a) => (
            <span
              key={a.amenityId}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              {a.amenityName}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-400">No amenities assigned to this room.</p>
          <Button variant="outline" size="sm" leftIcon={<KeySquare className="h-4 w-4" />} onClick={onManageAmenities}>Manage</Button>
        </div>
      )}
    </div>

    <div className="grid grid-cols-2 gap-3">
      <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="Room ID" value={room.id} />
      <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Created" value={formatDate(room.createdAt)} />
    </div>
  </div>
);

const RoomAmenityManager = ({ room, onClose }) => {
  const { amenities, loading, error, assignAmenity, removeAmenity } = useRoomAmenities(room?.id);
  const [allAmenities, setAllAmenities] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    try {
      setAllAmenities(await roomApi.getMyAmenities());
    } catch {
      setAllAmenities([]);
    } finally {
      setLoadingAll(false);
    }
  }, []);

  // Re-collect all amenities and assigned amenities when a new room is opened
  useEffect(() => {
    if (room?.id) {
      setAllAmenities([]);
      loadAll();
    }
  }, [room?.id, loadAll]);

  const assignedIds = useMemo(() => new Set(amenities.map((a) => a.amenityId)), [amenities]);
  const availableAmenities = useMemo(() => allAmenities.filter((a) => !assignedIds.has(a.id)), [allAmenities, assignedIds]);

  const handleAssign = async (amenityId) => {
    setBusyId(amenityId);
    try {
      await assignAmenity(amenityId);
      toast.success('Amenity assigned', 'Amenity added to the room.');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to assign amenity.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (amenityId) => {
    setBusyId(amenityId);
    try {
      await removeAmenity(amenityId);
      toast.success('Amenity removed', 'Amenity removed from the room.');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to remove amenity.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Modal
      open={!!room}
      onClose={onClose}
      title="Room Amenities"
      description={room ? `Manage amenities for ${room.name || room.roomNumber}.` : undefined}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {!room ? null : (
        <div className="space-y-5">
          {error && <Alert variant="danger" title="Error" description={error} dismissible />}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Assigned Amenities</p>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : amenities.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {amenities.map((a) => (
                  <div key={a.amenityId} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{a.amenityName}</span>
                    </div>
                    <IconButton variant="ghost" size="sm" tooltip="Remove" icon={<Trash2 className="h-4 w-4" />} disabled={busyId === a.amenityId} className="text-red-600 dark:text-red-400" onClick={() => handleRemove(a.amenityId)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No amenities assigned to this room yet.</p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Available Amenities</p>
            {loadingAll ? (
              <Skeleton className="h-20 w-full rounded-lg" />
            ) : availableAmenities.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {availableAmenities.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleAssign(a.id)}
                    disabled={busyId === a.id}
                    className="flex items-center justify-between rounded-md border border-dashed border-slate-300 px-3 py-2 text-left transition-colors hover:border-slate-400 hover:bg-white disabled:opacity-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{a.name}</span>
                    </div>
                    {a.icon && <span className="text-xs text-slate-400">{a.icon}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {allAmenities.length === 0 ? 'No amenities found. Create amenities to assign them to rooms.' : 'All amenities are already assigned to this room.'}
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
