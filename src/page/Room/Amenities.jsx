import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Sparkles,
  Hash,
  Calendar,
  Filter,
  ShieldCheck,
  Archive,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAmenities } from '../../hooks/useAmenities.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Modal,
  Input,
  Textarea,
  Select,
  IconButton,
  ConfirmDialog,
  EmptyState,
  Skeleton,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  ARCHIVED: 'neutral',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const EMPTY_FORM = {
  name: '',
  code: '',
  description: '',
  icon: '',
  status: 'ACTIVE',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function Amenities() {
  const {
    amenities,
    loading,
    error,
    fetchAmenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
  } = useAmenities();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => fetchAmenities(), [fetchAmenities]);

  const stats = useMemo(() => {
    const total = amenities.length;
    const count = (s) => amenities.filter((a) => a.status === s).length;
    return { total, active: count('ACTIVE'), inactive: count('INACTIVE'), archived: count('ARCHIVED') };
  }, [amenities]);

  const filtered = useMemo(() => {
    let result = amenities;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          (a.name && a.name.toLowerCase().includes(q)) ||
          (a.code && a.code.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }
    if (statusFilter) result = result.filter((a) => a.status === statusFilter);
    return result;
  }, [amenities, searchTerm, statusFilter]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{status || '—'}</Badge>
  );

  const columns = [
    {
      header: 'Amenity',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-slate-800 dark:text-white">{row.name}</p>
            <p className="font-mono text-xs text-slate-400">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      render: (row) => (
        <span className="block max-w-[260px] truncate text-sm text-slate-500 dark:text-slate-400">
          {row.description || '—'}
        </span>
      ),
    },
    {
      header: 'Icon',
      render: (row) => (
        <span className="font-mono text-xs text-slate-400">{row.icon || '—'}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Created',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton variant="ghost" size="sm" tooltip="View" icon={<Eye className="h-4 w-4" />} onClick={() => setViewTarget(row)} />
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

  const openEdit = (a) => {
    setEditTarget(a);
    setForm({
      name: a.name || '',
      code: a.code || '',
      description: a.description || '',
      icon: a.icon || '',
      status: a.status || 'ACTIVE',
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.code.trim()) errs.code = 'Code is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      icon: form.icon.trim(),
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateAmenity(editTarget.id, payload);
        toast.success('Amenity updated', `"${payload.name}" has been updated.`);
        setEditTarget(null);
      } else {
        await createAmenity(payload);
        toast.success('Amenity created', `"${payload.name}" has been created.`);
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Operation failed.';
      if (/name|c/i.test(message)) {
        setFormErrors((prev) => ({ ...prev, code: message }));
      } else {
        toast.error('Error', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAmenity(deleteTarget.id);
      toast.success('Amenity deleted', `"${deleteTarget.name}" has been removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Delete failed', err.response?.data?.message || err.response?.data?.error || 'Failed to delete amenity.');
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Amenities</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage amenities and assign them to rooms.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>Refresh</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>Create Amenity</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error loading amenities" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>Retry</Button>
          </div>
        </Alert>
      )}

      {/* Stats */}
      {amenities.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={<Sparkles className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
          <StatCard label="Active" value={stats.active} icon={<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />} valueClass="text-green-700 dark:text-green-400" />
          <StatCard label="Inactive" value={stats.inactive} icon={<XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />} valueClass="text-amber-700 dark:text-amber-400" />
          <StatCard label="Archived" value={stats.archived} icon={<Archive className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
        </div>
      )}

      {/* Filters */}
      {amenities.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input placeholder="Search by name, code, or description..." leftIcon={<Search className="h-4 w-4" />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Statuses" />
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>Clear</Button>
        </div>
      )}

      {/* Content */}
      {!loading && amenities.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No amenities yet"
          description="Create your first amenity to start assigning it to rooms."
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>Create Amenity</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="No matches found" description="Try adjusting your search or filter criteria." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((a) => (
              <div key={a.id} onClick={() => setViewTarget(a)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{a.name}</p>
                      <p className="font-mono text-xs text-slate-400">{a.code}</p>
                    </div>
                  </div>
                  {getStatusBadge(a.status)}
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{a.description || 'No description'}</p>
                <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-gray-800">
                  <IconButton variant="ghost" size="sm" tooltip="Edit" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openEdit(a); }} />
                  <IconButton variant="ghost" size="sm" tooltip="Delete" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeleteTarget(a); }} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden lg:block">
            <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} onRowClick={setViewTarget} className="w-full" />
          </Card>
        </>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Amenity' : 'Create Amenity'}
        description={editTarget ? `Editing "${editTarget.name}"` : 'Define an amenity you can assign to rooms.'}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="amenityForm" onClick={() => document.getElementById('amenityForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'Save Changes' : 'Create Amenity'}
            </Button>
          </div>
        }
      >
        <form id="amenityForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Name" required name="name" value={form.name} onChange={handleFormChange} placeholder="e.g., WiFi" error={formErrors.name} />
            <Input label="Code" required name="code" value={form.code} onChange={handleFormChange} placeholder="e.g., WIFI" error={formErrors.code} />
          </div>
          <Input label="Icon" name="icon" value={form.icon} onChange={handleFormChange} placeholder="e.g., wifi, pool, parking" />
          <Textarea label="Description" name="description" value={form.description} onChange={handleFormChange} rows={2} placeholder="Describe this amenity..." />
          <Select
            label="Status"
            name="status"
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
            value={form.status}
            onChange={handleFormChange}
          />
        </form>
      </Modal>

      {/* View modal */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Amenity Details" size="md">
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{viewTarget.name}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">{viewTarget.code}</p>
                </div>
              </div>
              {getStatusBadge(viewTarget.status)}
            </div>

            {viewTarget.description && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewTarget.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="Amenity ID" value={viewTarget.id} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Created" value={formatDate(viewTarget.createdAt)} />
              <DetailItem icon={<ShieldCheck className="h-4 w-4 text-slate-400" />} label="Icon" value={viewTarget.icon || '—'} />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Amenity"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
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
