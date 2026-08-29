import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Hash,
  Calendar,
  Filter,
  Tag,
  Wrench,
} from 'lucide-react';
import { useMaintenanceCategories } from '../../hooks/useMaintenanceCategories.js';
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
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function MaintenanceCategories() {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deactivateCategory,
  } = useMaintenanceCategories();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => fetchCategories(), [fetchCategories]);

  const filtered = useMemo(() => {
    let result = categories;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.code && c.code.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    return result;
  }, [categories, searchTerm, statusFilter]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{status || '—'}</Badge>
  );

  const columns = [
    {
      header: 'ប្រភេទ',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
            <Tag className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">{row.name}</p>
            <p className="font-mono text-xs text-slate-400">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'ការពិពណ៌នា',
      render: (row) => (
        <span className="block max-w-[260px] truncate text-sm text-slate-500 dark:text-slate-400">
          {row.description || '—'}
        </span>
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'កាលបរិច្ឆេទបង្កើត',
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
          <IconButton variant="ghost" size="sm" tooltip="មើល" icon={<Eye className="h-4 w-4" />} onClick={() => setViewTarget(row)} />
          <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={() => openEdit(row)} />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip={row.status === 'INACTIVE' ? 'អសកម្មរួចហើយ' : 'បិទដំណើរការ'}
            icon={<Trash2 className="h-4 w-4" />}
            disabled={row.status === 'INACTIVE'}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            onClick={() => setDeactivateTarget(row)}
          />
        </div>
      ),
    },
  ];

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (c) => {
    setEditTarget(c);
    setForm({
      name: c.name || '',
      code: c.code || '',
      description: c.description || '',
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
    if (!form.name.trim()) errs.name = 'ឈ្មោះត្រូវបានទាមទារ';
    if (!form.code.trim()) errs.code = 'កូដត្រូវបានទាមទារ';
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
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateCategory(editTarget.id, payload);
        toast.success('ប្រភេទត្រូវបានកែប្រែ', `"${payload.name}" ត្រូវបានកែប្រែរួចរាល់។`);
        setEditTarget(null);
      } else {
        await createCategory(payload);
        toast.success('ប្រភេទត្រូវបានបង្កើត', `"${payload.name}" ត្រូវបានបង្កើតរួចរាល់។`);
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'ប្រតិបត្តិការបរាជ័យ។';
      if (/name|c/i.test(message)) {
        setFormErrors((prev) => ({ ...prev, code: message }));
      } else {
        toast.error('កំហុស', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await deactivateCategory(deactivateTarget.id);
      toast.success('ប្រភេទត្រូវបានបិទដំណើរការ', `"${deactivateTarget.name}" ត្រូវបានបិទដំណើរការរួចរាល់។`);
      setDeactivateTarget(null);
    } catch (err) {
      toast.error('ការបិទដំណើរការបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការបិទដំណើរការប្រភេទ។');
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-44" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">ប្រភេទការជួសជុល</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            រៀបចំសំណើជួសជុលតាមប្រភេទ។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>ធ្វើឱ្យស្រស់</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បង្កើតប្រភេទ</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកប្រភេទ" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      {categories.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ កូដ ឬការពិពណ៌នា..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="ស្ថានភាពទាំងអស់" />
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>សម្អាត</Button>
        </div>
      )}

      {!loading && categories.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="មិនទាន់មានប្រភេទ"
          description="បង្កើតប្រភេទការជួសជុលដំបូងរបស់អ្នក ដើម្បីចាត់ថ្នាក់សំណើ។"
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បង្កើតប្រភេទ</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="រកមិនឃើញទិន្នន័យ" description="សូមព្យាយាមកែតម្រូវការស្វែងរក ឬលក្ខខណ្ឌតម្រងរបស់អ្នក។" />
      ) : (
        <Card className="hidden lg:block">
          <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} onRowClick={setViewTarget} className="w-full" />
        </Card>
      )}

      <Modal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        title={editTarget ? 'កែប្រែប្រភេទ' : 'បង្កើតប្រភេទ'}
        description={editTarget ? `កំពុងកែប្រែ "${editTarget.name}"` : 'កំណត់ប្រភេទការជួសជុល។'}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>បោះបង់</Button>
            <Button type="submit" form="categoryForm" onClick={() => document.getElementById('categoryForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតប្រភេទ'}
            </Button>
          </div>
        }
      >
        <form id="categoryForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="ឈ្មោះ" required name="name" value={form.name} onChange={handleFormChange} placeholder="ឧ. បំពង់ទឹក" error={formErrors.name} />
            <Input label="កូដ" required name="code" value={form.code} onChange={handleFormChange} placeholder="ឧ. PLUMBING" error={formErrors.code} />
          </div>
          <Textarea label="ការពិពណ៌នា" name="description" value={form.description} onChange={handleFormChange} rows={2} placeholder="ពិពណ៌នាអំពីប្រភេទនេះ..." />
        </form>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="ព័ត៌មានលម្អិតប្រភេទ" size="md">
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                  <Tag className="h-6 w-6" />
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
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ការពិពណ៌នា</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewTarget.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="លេខសម្គាល់ប្រភេទ" value={viewTarget.id} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="កាលបរិច្ឆេទបង្កើត" value={formatDate(viewTarget.createdAt)} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="បិទដំណើរការប្រភេទ"
        description={`តើអ្នកប្រាកដថាចង់បិទដំណើរការ "${deactivateTarget?.name}" មែនទេ?`}
        confirmText="បិទដំណើរការ"
        cancelText="បោះបង់"
        danger
        loading={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-gray-800">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  </div>
);
