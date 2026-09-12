import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Home,
  Users as UsersIcon,
  DollarSign,
  Wallet,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Hash,
  Filter,
} from 'lucide-react';
import { useRoomTypes } from '../../hooks/useRoomType.js';
import { useToast } from '../../components/ui/Toast.jsx';
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
  Skeleton,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  ACTIVE: 'success',
  INACTIVE: 'danger',
};

const STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'ACTIVE', label: 'សកម្ម' },
  { value: 'INACTIVE', label: 'អសកម្ម' },
];

const EMPTY_FORM = {
  name: '',
  code: '',
  description: '',
  capacity: 1,
  defaultRent: 0,
  defaultDeposit: 0,
  status: 'ACTIVE',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function RoomTypes() {
  const {
    roomTypes,
    loading,
    error,
    fetchAllRoomTypes,
    getRoomType,
    createRoomType,
    updateRoomType,
    deleteRoomType,
  } = useRoomTypes();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => {
    return fetchAllRoomTypes();
  }, [fetchAllRoomTypes]);

  const stats = useMemo(() => {
    const total = roomTypes.length;
    const active = roomTypes.filter((rt) => rt.status === 'ACTIVE').length;
    const inactive = roomTypes.filter((rt) => rt.status === 'INACTIVE').length;
    const avgCapacity =
      total > 0
        ? Math.round(roomTypes.reduce((acc, rt) => acc + (Number(rt.capacity) || 0), 0) / total)
        : 0;
    return { total, active, inactive, avgCapacity };
  }, [roomTypes]);

  const filtered = useMemo(() => {
    let result = roomTypes;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (rt) =>
          (rt.name && rt.name.toLowerCase().includes(q)) ||
          (rt.code && rt.code.toLowerCase().includes(q)) ||
          (rt.description && rt.description.toLowerCase().includes(q))
      );
    }
    if (statusFilter) {
      result = result.filter((rt) => rt.status === statusFilter);
    }
    return result;
  }, [roomTypes, searchTerm, statusFilter]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{STATUS_OPTIONS.find((o) => o.value === status)?.label || status || '—'}</Badge>
  );

  const columns = [
    {
      header: 'លេខកូដ',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-sm text-slate-700 dark:text-slate-300">
          <Hash className="h-3.5 w-3.5 text-slate-400" />
          {row.code}
        </span>
      ),
    },
    {
      header: 'ឈ្មោះ',
      render: (row) => (
        <span className="font-medium text-slate-800 dark:text-white">{row.name}</span>
      ),
    },
    {
      header: 'សមត្ថភាព',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <UsersIcon className="h-4 w-4 text-slate-400" />
          {row.capacity} នាក់
        </span>
      ),
    },
    {
      header: 'តម្លៃជួលលំនាំដើម',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <DollarSign className="h-4 w-4 text-slate-400" />
          {formatCurrency(row.defaultRent)}
        </span>
      ),
    },
    {
      header: 'ប្រាក់ដាក់ប្រាកដលំនាំដើម',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Wallet className="h-4 w-4 text-slate-400" />
          {formatCurrency(row.defaultDeposit)}
        </span>
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'បានបង្កើត',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'សកម្មភាព',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="មើលព័ត៌មានលម្អិត"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => setViewTarget(row)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="កែប្រែ"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => openEdit(row)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="លុប"
            icon={<Trash2 className="h-4 w-4" />}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  // ---- Form helpers ----
  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
    });
    setFormErrors({});
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (rt) => {
    setEditTarget(rt);
    setForm({
      name: rt.name || '',
      code: rt.code || '',
      description: rt.description || '',
      capacity: rt.capacity || 1,
      defaultRent: Number(rt.defaultRent) || 0,
      defaultDeposit: Number(rt.defaultDeposit) || 0,
      status: rt.status || 'ACTIVE',
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'តម្រូវឱ្យបញ្ចូលឈ្មោះ';
    if (!form.code.trim()) errors.code = 'តម្រូវឱ្យបញ្ចូលលេខកូដ';
    if (!form.capacity || form.capacity < 1) errors.capacity = 'សមត្ថភាពត្រូវតែយ៉ាងតិច ១';
    if (Number(form.defaultRent) < 0) errors.defaultRent = 'ថ្លៃជួលមិនអាចជាលេខអវិជ្ជមានបានទេ';
    if (Number(form.defaultDeposit) < 0) errors.defaultDeposit = 'ប្រាក់ដាក់ប្រាកដមិនអាចជាលេខអវិជ្ជមានបានទេ';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      capacity: Number(form.capacity),
      defaultRent: Number(form.defaultRent),
      defaultDeposit: Number(form.defaultDeposit),
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateRoomType(editTarget.id, payload);
        toast.success('ប្រភេទបន្ទប់ត្រូវបានកែប្រែ', `"${payload.name}" ត្រូវបានកែប្រែ។`);
        setEditTarget(null);
      } else {
        await createRoomType(payload);
        toast.success('ប្រភេទបន្ទប់ត្រូវបានបង្កើត', `"${payload.name}" ត្រូវបានបង្កើត។`);
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'ប្រតិបត្តិការបរាជ័យ។ សូមព្យាយាមម្តងទៀត។';
      if (message.toLowerCase().includes('code')) {
        setFormErrors({ code: message });
      } else {
        toast.error('កំហុស', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---- View ----
  const handleOpenView = (rt) => {
    setViewTarget(rt);
    setViewData(null);
    setViewLoading(true);
    getRoomType(rt.id)
      .then((data) => setViewData(data))
      .catch(() => setViewData(null))
      .finally(() => setViewLoading(false));
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRoomType(deleteTarget.id);
      toast.success('ប្រភេទបន្ទប់ត្រូវបានលុប', `"${deleteTarget.name}" ត្រូវបានលុប។`);
      setDeleteTarget(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'ការលុបប្រភេទបន្ទប់បរាជ័យ។';
      toast.error('ការលុបបរាជ័យ', message);
    } finally {
      setDeleting(false);
    }
  };

  // ---- Loading ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="mt-3 h-3 w-16" />
              <Skeleton className="mt-1.5 h-5 w-10" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            ប្រភេទបន្ទប់
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងការកំណត់រចនាសម្ព័ន្ធ តម្លៃ និងភាពអាចរកបាននៃប្រភេទបន្ទប់។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => refresh()}
          >
            ធ្វើឱ្យស្រស់
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleCreateOpen}
          >
            បង្កើតប្រភេទបន្ទប់
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="កំហុសក្នុងការផ្ទុកប្រភេទបន្ទប់"
          description={error}
          dismissible
        >
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => refresh()}
            >
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      {/* Stats */}
      {roomTypes.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="សរុប"
            value={stats.total}
            icon={<Home className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
            hover="hover:border-slate-300 dark:hover:border-gray-700"
          />
          <StatCard
            label="សកម្ម"
            value={stats.active}
            valueClass="text-green-700 dark:text-green-400"
            icon={<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
            hover="hover:border-green-300 dark:hover:border-green-800"
          />
          <StatCard
            label="អសកម្ម"
            value={stats.inactive}
            valueClass="text-red-700 dark:text-red-400"
            icon={<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            hover="hover:border-red-300 dark:hover:border-red-800"
          />
          <StatCard
            label="សមត្ថភាពមធ្យម"
            value={stats.avgCapacity}
            icon={<UsersIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            hover="hover:border-indigo-300 dark:hover:border-indigo-800"
          />
        </div>
      )}

      {/* Filters */}
      {roomTypes.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ លេខកូដ ឬការពិពណ៌នា..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
          >
            សម្អាត
          </Button>
        </div>
      )}

      {/* Content */}
      {!loading && roomTypes.length === 0 ? (
        <EmptyState
          icon={Home}
          title="មិនទាន់មានប្រភេទបន្ទប់ទេ"
          description="ចាប់ផ្តើមដោយបង្កើតប្រភេទបន្ទប់ដំបូងរបស់អ្នក។"
          action={
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>
              បង្កើតប្រភេទបន្ទប់
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="រកមិនឃើញលទ្ធផលត្រូវនឹងលក្ខខណ្ឌទេ"
          description="សូមព្យាយាមកែតម្រូវលក្ខខណ្ឌនៃការស្វែងរក ឬតម្រង។"
        />
      ) : (
        <>
          {/* Responsive card grid (mobile) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((rt) => (
              <div
                key={rt.id}
                onClick={() => handleOpenView(rt)}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                      {rt.code}
                    </p>
                    <h3 className="mt-0.5 truncate text-[15px] font-semibold text-slate-800 dark:text-white">
                      {rt.name}
                    </h3>
                  </div>
                  {getStatusBadge(rt.status)}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <UsersIcon className="h-4 w-4 shrink-0 text-slate-400" />
                    {rt.capacity} នាក់
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <DollarSign className="h-4 w-4 shrink-0 text-slate-400" />
                    {formatCurrency(rt.defaultRent)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Wallet className="h-4 w-4 shrink-0 text-slate-400" />
                    {formatCurrency(rt.defaultDeposit)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                    {formatDate(rt.createdAt)}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-gray-800">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    tooltip="កែប្រែ"
                    icon={<Edit className="h-4 w-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(rt);
                    }}
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    tooltip="លុប"
                    icon={<Trash2 className="h-4 w-4" />}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(rt);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Table (desktop) */}
          <Card className="hidden lg:block">
            <Table
              columns={columns}
              data={filtered}
              keyExtractor={(row) => row.id}
              onRowClick={handleOpenView}
              className="w-full"
            />
          </Card>
        </>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="បង្កើតប្រភេទបន្ទប់"
        description="កំណត់ប្រភេទបន្ទប់ថ្មីសម្រាប់អចលនទ្រព្យរបស់អ្នក။"
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
            >
              បោះបង់
            </Button>
            <Button
              type="submit"
              form="roomTypeForm"
              onClick={() => document.getElementById('roomTypeForm')?.requestSubmit()}
              loading={submitting}
            >
              {submitting ? 'កំពុងបង្កើត...' : 'បង្កើតប្រភេទបន្ទប់'}
            </Button>
          </div>
        }
      >
        <RoomTypeForm
          id="roomTypeForm"
          form={form}
          errors={formErrors}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="កែប្រែប្រភេទបន្ទប់"
        description={editTarget ? `កំពុងកែប្រែ "${editTarget.name}"` : undefined}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={submitting}>
              បោះបង់
            </Button>
            <Button
              type="submit"
              form="editRoomTypeForm"
              onClick={() => document.getElementById('editRoomTypeForm')?.requestSubmit()}
              loading={submitting}
            >
              {submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការផ្លាស់ប្តូរ'}
            </Button>
          </div>
        }
      >
        <RoomTypeForm
          id="editRoomTypeForm"
          form={form}
          errors={formErrors}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* View modal */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="ព័ត៌មានលម្អិតនៃប្រភេទបន្ទប់"
        size="md"
      >
        {viewLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : viewData ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">
                  {viewData.name}
                </p>
                <p className="mt-0.5 font-mono text-sm text-slate-500 dark:text-slate-400">
                  {viewData.code}
                </p>
              </div>
              {getStatusBadge(viewData.status)}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                តម្លៃ និងការកំណត់
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem
                  icon={<UsersIcon className="h-4 w-4 text-slate-400" />}
                  label="សមត្ថភាព"
                  value={`${viewData.capacity} នាក់`}
                />
                <DetailItem
                  icon={<DollarSign className="h-4 w-4 text-slate-400" />}
                  label="តម្លៃជួលលំនាំដើម"
                  value={formatCurrency(viewData.defaultRent)}
                />
                <DetailItem
                  icon={<Wallet className="h-4 w-4 text-slate-400" />}
                  label="ប្រាក់ដាក់ប្រាកដលំនាំដើម"
                  value={formatCurrency(viewData.defaultDeposit)}
                />
                <DetailItem
                  icon={<Hash className="h-4 w-4 text-slate-400" />}
                  label="លេខសម្គាល់ម្ចាស់"
                  value={viewData.ownerId}
                />
              </div>
            </div>

            {viewData.description && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  ការពិពណ៌នា
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {viewData.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <DetailItem
                icon={<Calendar className="h-4 w-4 text-slate-400" />}
                label="បានបង្កើត"
                value={formatDate(viewData.createdAt)}
              />
              <DetailItem
                icon={<Calendar className="h-4 w-4 text-slate-400" />}
                label="បានធ្វើបច្ចុប្បន្នភាព"
                value={formatDate(viewData.updatedAt)}
              />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Home}
            title="រកមិនឃើញប្រភេទបន្ទប់"
            description="មិនអាចផ្ទុកព័ត៌មានលម្អិតនៃប្រភេទបន្ទប់បានទេ។"
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="លុបប្រភេទបន្ទប់"
        description={`តើអ្នកប្រាកដថាចង់លុប "${deleteTarget?.name}"? សកម្មភាពនេះមិនអាចបញ្ឈប់បានទេ។`}
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

const StatCard = ({ label, value, icon, valueClass = 'text-slate-800 dark:text-white', hover }) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white p-4 transition-colors dark:border-gray-800 dark:bg-gray-900 ${hover}`}
  >
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className={`text-xl font-bold ${valueClass}`}><CountUp value={value} /></p>
      </div>
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-800">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

const RoomTypeForm = ({ id, form, errors, onChange, onSubmit }) => (
  <form id={id} onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input
        label="ឈ្មោះ"
        required
        name="name"
        value={form.name}
        onChange={onChange}
        placeholder="ឧ. Deluxe Room"
        error={errors.name}
      />
      <Input
        label="លេខកូដ"
        required
        name="code"
        value={form.code}
        onChange={onChange}
        placeholder="ឧ. DLX-001"
        error={errors.code}
      />
    </div>

    <Textarea
      label="ការពិពណ៌នា"
      name="description"
      value={form.description}
      onChange={onChange}
      placeholder="ពិពណ៌នាអំពីប្រភេទបន្ទប់..."
      rows={3}
    />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Input
        label="សមត្ថភាព"
        required
        type="number"
        min="1"
        name="capacity"
        value={form.capacity}
        onChange={onChange}
        error={errors.capacity}
      />
      <Input
        label="តម្លៃជួលលំនាំដើម ($)"
        type="number"
        step="0.01"
        min="0"
        name="defaultRent"
        value={form.defaultRent}
        onChange={onChange}
        error={errors.defaultRent}
      />
      <Input
        label="ប្រាក់ដាក់ប្រាកដលំនាំដើម ($)"
        type="number"
        step="0.01"
        min="0"
        name="defaultDeposit"
        value={form.defaultDeposit}
        onChange={onChange}
        error={errors.defaultDeposit}
      />
    </div>

    <Select
      label="ស្ថានភាព"
      name="status"
      value={form.status}
      onChange={onChange}
      options={[
        { value: 'ACTIVE', label: 'សកម្ម' },
        { value: 'INACTIVE', label: 'អសកម្ម' },
      ]}
    />
  </form>
);
