import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Zap,
  Hash,
  Calendar,
  Filter,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import { useUtilityTypes } from '../../hooks/useUtilityTypes.js';
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
  IconButton,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Pagination,
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

const BILLING_METHOD_OPTIONS = [
  { value: 'METERED', label: 'Metered (METERED)' },
  { value: 'FIXED', label: 'Fixed (FIXED)' },
];

const EMPTY_FORM = {
  name: '',
  code: '',
  unit: '',
  billingMethod: 'METERED',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function UtilityTypes() {
  const {
    types,
    loading,
    error,
    page,
    totalPages,
    setPage,
    fetchTypes,
    createType,
    updateType,
    deactivateType,
  } = useUtilityTypes();
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

  const refresh = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    if (page !== 0) setPage(0);
    fetchTypes({ search: '', status: '' });
  }, [fetchTypes, page, setPage]);

  const filtered = useMemo(() => {
    let result = types;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.code && t.code.toLowerCase().includes(q)) ||
          (t.unit && t.unit.toLowerCase().includes(q))
      );
    }
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    return result;
  }, [types, searchTerm, statusFilter]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{status || '—'}</Badge>
  );

  const columns = [
    {
      header: 'ឈ្មោះ',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">{row.name}</p>
            <p className="font-mono text-xs text-slate-400">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'ឯកតា',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Scale className="h-4 w-4 text-slate-400" />
          {row.unit || '—'}
        </span>
      ),
    },
    {
      header: 'វិធីសាស្រ្តប្រាក់កម្រ',
      render: (row) => (
        <Badge variant={row.billingMethod === 'FIXED' ? 'info' : 'default'}>
          {row.billingMethod === 'METERED' ? 'Metered' : row.billingMethod === 'FIXED' ? 'Fixed' : row.billingMethod || '—'}
        </Badge>
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

  const openEdit = (t) => {
    setEditTarget(t);
    setForm({ name: t.name || '', code: t.code || '', unit: t.unit || '', billingMethod: t.billingMethod || 'METERED' });
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
    if (!form.unit.trim()) errs.unit = 'ឯកតាត្រូវបានទាមទារ';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      unit: form.unit.trim(),
      billingMethod: form.billingMethod || 'METERED',
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateType(editTarget.id, payload);
        toast.success('ប្រភេទប្រើប្រាស់ត្រូវបានកែប្រែ', `"${payload.name}" ត្រូវបានកែប្រែរួចរាល់។`);
        setEditTarget(null);
      } else {
        await createType(payload);
        toast.success('ប្រភេទប្រើប្រាស់ត្រូវបានបង្កើត', `"${payload.name}" ត្រូវបានបង្កើតរួចរាល់។`);
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
      await deactivateType(deactivateTarget.id);
      toast.success('ប្រភេទប្រើប្រាស់ត្រូវបានបិទដំណើរការ', `"${deactivateTarget.name}" ត្រូវបានបិទដំណើរការរួចរាល់។`);
      setDeactivateTarget(null);
    } catch (err) {
      toast.error('ការបិទដំណើរការបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការបិទដំណើរការប្រភេទប្រើប្រាស់។');
    } finally {
      setDeactivating(false);
    }
  };

  const applyFilters = () => {
    fetchTypes({ search: searchTerm, status: statusFilter });
    if (page !== 0) setPage(0);
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">ប្រភេទប្រើប្រាស់ទឹកភ្លើង</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងប្រភេទប្រើប្រាស់ទឹកភ្លើង (អគ្គិសនី ទឹក ហ្គាស) ដែលអ្នកតាមដាន។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>ធ្វើឱ្យស្រស់</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បង្កើតប្រភេទ</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកប្រភេទប្រើប្រាស់" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      {types.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ កូដ ឬឯកតា..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }} placeholder="ស្ថានភាពទាំងអស់" />
          </div>
          <Button variant="outline" size="sm" onClick={applyFilters}>អនុវត្ត</Button>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); fetchTypes({}); }}>សម្អាត</Button>
        </div>
      )}

      {!loading && types.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="មិនទាន់មានប្រភេទប្រើប្រាស់"
          description="បង្កើតប្រភេទប្រើប្រាស់ដំបូងរបស់អ្នក ដើម្បីចាប់ផ្តើមតាមដានម៉ែត្រ និងការអានម៉ែត្រ។"
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បង្កើតប្រភេទ</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="រកមិនឃើញទិន្នន័យ" description="សូមព្យាយាមកែតម្រូវការស្វែងរក ឬលក្ខខណ្ឌតម្រងរបស់អ្នក។" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((t) => (
              <div key={t.id} onClick={() => setViewTarget(t)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                      <Zap className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{t.name}</p>
                      <p className="font-mono text-xs text-slate-400">{t.code}</p>
                    </div>
                  </div>
                  {getStatusBadge(t.status)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-gray-800">
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Scale className="h-4 w-4 text-slate-400" />
                    {t.unit || '—'}
                  </span>
                  <Badge variant={t.billingMethod === 'FIXED' ? 'info' : 'default'}>
                    {t.billingMethod === 'METERED' ? 'Metered' : t.billingMethod === 'FIXED' ? 'Fixed' : t.billingMethod || '—'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openEdit(t); }} />
                    <IconButton variant="ghost" size="sm" tooltip="បិទដំណើរការ" icon={<Trash2 className="h-4 w-4" />} disabled={t.status === 'INACTIVE'} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeactivateTarget(t); }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="hidden lg:block">
            <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} onRowClick={setViewTarget} className="w-full" />
          </Card>
        </>
      )}

      {totalPages > 1 && filtered.length > 0 && (
        <div className="flex justify-end">
          <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
        </div>
      )}

      <Modal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        title={editTarget ? 'កែប្រែប្រភេទប្រើប្រាស់' : 'បង្កើតប្រភេទប្រើប្រាស់'}
        description={editTarget ? `កំពុងកែប្រែ "${editTarget.name}"` : 'កំណត់ប្រភេទប្រើប្រាស់ទឹកភ្លើងដែលអ្នកអាចតាមដានបាន។'}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>បោះបង់</Button>
            <Button type="submit" form="utilityTypeForm" onClick={() => document.getElementById('utilityTypeForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតប្រភេទ'}
            </Button>
          </div>
        }
      >
        <form id="utilityTypeForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="ឈ្មោះ" required name="name" value={form.name} onChange={handleFormChange} placeholder="ឧ. អគ្គិសនី" error={formErrors.name} />
            <Input label="កូដ" required name="code" value={form.code} onChange={handleFormChange} placeholder="ឧ. ELECTRIC" error={formErrors.code} />
          </div>
          <Input label="ឯកតា" required name="unit" value={form.unit} onChange={handleFormChange} placeholder="ឧ. kWh, m³" error={formErrors.unit} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              វិធីសាស្រ្តប្រាក់កម្រ <span className="text-red-500">*</span>
            </label>
            <Select
              name="billingMethod"
              value={form.billingMethod}
              onChange={handleFormChange}
              options={BILLING_METHOD_OPTIONS}
            />
          </div>
        </form>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="ព័ត៌មានលម្អិតប្រភេទប្រើប្រាស់" size="md">
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  <Zap className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{viewTarget.name}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">{viewTarget.code}</p>
                </div>
              </div>
              {getStatusBadge(viewTarget.status)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="លេខសម្គាល់ប្រភេទ" value={viewTarget.id} />
              <DetailItem icon={<Scale className="h-4 w-4 text-slate-400" />} label="ឯកតា" value={viewTarget.unit || '—'} />
              <DetailItem icon={<CheckCircle2 className="h-4 w-4 text-slate-400" />} label="វិធីសាស្រ្តប្រាក់កម្រ" value={viewTarget.billingMethod === 'METERED' ? 'Metered (METERED)' : viewTarget.billingMethod === 'FIXED' ? 'Fixed (FIXED)' : viewTarget.billingMethod || '—'} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="កាលបរិច្ឆេទបង្កើត" value={formatDate(viewTarget.createdAt)} />
              <DetailItem icon={<CheckCircle2 className="h-4 w-4 text-slate-400" />} label="ស្ថានភាព" value={viewTarget.status} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="បិទដំណើរការប្រភេទប្រើប្រាស់"
        description={`តើអ្នកប្រាកដថាចង់បិទដំណើរការ "${deactivateTarget?.name}" មែនទេ? ប្រភេទដែលបានបិទដំណើរការមិនអាចប្រើសម្រាប់ម៉ែត្រថ្មីបានទៀតទេ។`}
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
