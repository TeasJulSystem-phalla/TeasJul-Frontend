import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Gauge,
  Building2,
  Hash,
  Calendar,
  Filter,
  Plug,
} from 'lucide-react';
import { useUtilityMeters } from '../../hooks/useUtilityMeters.js';
import { useHouses } from '../../hooks/useHouses.js';
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
  REPLACED: 'neutral',
};

const STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'ACTIVE', label: 'សកម្ម' },
  { value: 'INACTIVE', label: 'អសកម្ម' },
  { value: 'REPLACED', label: 'បានជំនួស' },
];

const EMPTY_FORM = {
  houseId: '',
  roomId: '',
  utilityTypeId: '',
  meterNumber: '',
  installedAt: '',
  status: 'ACTIVE',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function UtilityMeters() {
  const {
    meters,
    loading,
    error,
    page,
    totalPages,
    setPage,
    fetchMeters,
    createMeter,
    updateMeter,
    deactivateMeter,
  } = useUtilityMeters();
  const { houses } = useHouses();
  const { types } = useUtilityTypes();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
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
    setHouseFilter('');
    setStatusFilter('');
    if (page !== 0) setPage(0);
    fetchMeters({});
  }, [fetchMeters, page, setPage]);

  const houseOptions = useMemo(
    () => [
      { value: '', label: 'អចលនទ្រព្យទាំងអស់' },
      ...houses.map((h) => ({ value: String(h.id), label: h.name || `អចលនទ្រព្យ #${h.id}` })),
    ],
    [houses]
  );

  const typeMap = useMemo(() => Object.fromEntries(types.map((t) => [String(t.id), t])), [types]);

  const houseMap = useMemo(() => Object.fromEntries(houses.map((h) => [String(h.id), h])), [houses]);

  const getHouseName = (houseId) => houseMap[String(houseId)]?.name || houseId || '—';
  const getTypeName = (typeId) => typeMap[String(typeId)]?.name || typeId || '—';

  const filtered = useMemo(() => {
    let result = meters;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          (m.meterNumber && m.meterNumber.toLowerCase().includes(q)) ||
          getTypeName(m.utilityTypeId).toLowerCase().includes(q)
      );
    }
    if (houseFilter) result = result.filter((m) => String(m.houseId) === houseFilter);
    if (statusFilter) result = result.filter((m) => m.status === statusFilter);
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meters, searchTerm, houseFilter, statusFilter, typeMap]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{status || '—'}</Badge>
  );

  const columns = [
    {
      header: 'ម៉ែត្រ',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
            <Gauge className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">{row.meterNumber}</p>
            <p className="font-mono text-xs text-slate-400">#{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'ប្រភេទ',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{getTypeName(row.utilityTypeId)}</span>
      ),
    },
    {
      header: 'អចលនទ្រព្យ',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Building2 className="h-4 w-4 text-slate-400" />
          {getHouseName(row.houseId)}
        </span>
      ),
    },
    {
      header: 'បានដំឡើង',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(row.installedAt)}
        </span>
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

  const openEdit = (m) => {
    setEditTarget(m);
    setForm({
      houseId: m.houseId != null ? String(m.houseId) : '',
      roomId: m.roomId != null ? String(m.roomId) : '',
      utilityTypeId: m.utilityTypeId != null ? String(m.utilityTypeId) : '',
      meterNumber: m.meterNumber || '',
      installedAt: m.installedAt || '',
      status: m.status || 'ACTIVE',
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
    if (!form.houseId) errs.houseId = 'អចលនទ្រព្យត្រូវបានទាមទារ';
    if (!form.utilityTypeId) errs.utilityTypeId = 'ប្រភេទប្រើប្រាស់ត្រូវបានទាមទារ';
    if (!form.meterNumber.trim()) errs.meterNumber = 'លេខម៉ែត្រត្រូវបានទាមទារ';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      houseId: Number(form.houseId),
      roomId: form.roomId ? Number(form.roomId) : null,
      utilityTypeId: Number(form.utilityTypeId),
      meterNumber: form.meterNumber.trim(),
      installedAt: form.installedAt || null,
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateMeter(editTarget.id, payload);
        toast.success('ម៉ែត្រប្រើប្រាស់ត្រូវបានកែប្រែ', `"${payload.meterNumber}" ត្រូវបានកែប្រែរួចរាល់។`);
        setEditTarget(null);
      } else {
        await createMeter(payload);
        toast.success('ម៉ែត្រប្រើប្រាស់ត្រូវបានបង្កើត', `"${payload.meterNumber}" ត្រូវបានបង្កើតរួចរាល់។`);
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'ប្រតិបត្តិការបរាជ័យ។';
      if (/meter|c/i.test(message)) {
        setFormErrors((prev) => ({ ...prev, meterNumber: message }));
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
      await deactivateMeter(deactivateTarget.id);
      toast.success('ម៉ែត្រប្រើប្រាស់ត្រូវបានបិទដំណើរការ', `"${deactivateTarget.meterNumber}" ត្រូវបានបិទដំណើរការរួចរាល់។`);
      setDeactivateTarget(null);
    } catch (err) {
      toast.error('ការបិទដំណើរការបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការបិទដំណើរការម៉ែត្រ។');
    } finally {
      setDeactivating(false);
    }
  };

  const applyFilters = () => {
    fetchMeters({ search: searchTerm, houseId: houseFilter || undefined, status: statusFilter || undefined });
    if (page !== 0) setPage(0);
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
          <Skeleton className="h-10 w-40" />
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">ម៉ែត្រប្រើប្រាស់ទឹកភ្លើង</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            តាមដានម៉ែត្រដែលបានដំឡើងនៅទូទាំងអចលនទ្រព្យរបស់អ្នក។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>ធ្វើឱ្យស្រស់</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បន្ថែមម៉ែត្រ</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកម៉ែត្រប្រើប្រាស់" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      {meters.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមលេខម៉ែត្រ ឬប្រភេទ..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-auto sm:grid-cols-3">
            <Select options={houseOptions} value={houseFilter} onChange={(e) => setHouseFilter(e.target.value)} />
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={applyFilters}>អនុវត្ត</Button>
              <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setHouseFilter(''); setStatusFilter(''); fetchMeters({}); }}>សម្អាត</Button>
            </div>
          </div>
        </div>
      )}

      {!loading && meters.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="មិនទាន់មានម៉ែត្រប្រើប្រាស់"
          description="បន្ថែមម៉ែត្រ ដើម្បីចាប់ផ្តើមកត់ត្រាការអានម៉ែត្រប្រើប្រាស់។"
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បន្ថែមម៉ែត្រ</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="រកមិនឃើញទិន្នន័យ" description="សូមព្យាយាមកែតម្រូវការស្វែងរក ឬលក្ខខណ្ឌតម្រងរបស់អ្នក។" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((m) => (
              <div key={m.id} onClick={() => setViewTarget(m)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
                      <Gauge className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{m.meterNumber}</p>
                      <p className="text-xs text-slate-400">{getTypeName(m.utilityTypeId)}</p>
                    </div>
                  </div>
                  {getStatusBadge(m.status)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-gray-800">
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {getHouseName(m.houseId)}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openEdit(m); }} />
                    <IconButton variant="ghost" size="sm" tooltip="បិទដំណើរការ" icon={<Trash2 className="h-4 w-4" />} disabled={m.status === 'INACTIVE'} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeactivateTarget(m); }} />
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
        title={editTarget ? 'កែប្រែម៉ែត្រប្រើប្រាស់' : 'បន្ថែមម៉ែត្រប្រើប្រាស់'}
        description={editTarget ? `កំពុងកែប្រែ "${editTarget.meterNumber}"` : 'ចុះឈ្មោះម៉ែត្រនៅលើអចលនទ្រព្យណាមួយរបស់អ្នក។'}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>បោះបង់</Button>
            <Button type="submit" form="utilityMeterForm" onClick={() => document.getElementById('utilityMeterForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បន្ថែមម៉ែត្រ'}
            </Button>
          </div>
        }
      >
        <form id="utilityMeterForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="អចលនទ្រព្យ" required name="houseId" options={houseOptions.filter((o) => o.value !== '')} value={form.houseId} onChange={handleFormChange} error={formErrors.houseId} />
            <Select
              label="ប្រភេទប្រើប្រាស់"
              required
              name="utilityTypeId"
              options={types.map((t) => ({ value: String(t.id), label: t.name }))}
              value={form.utilityTypeId}
              onChange={handleFormChange}
              error={formErrors.utilityTypeId}
            />
          </div>
          <Input label="លេខម៉ែត្រ" required name="meterNumber" value={form.meterNumber} onChange={handleFormChange} placeholder="ឧ. EL-001" error={formErrors.meterNumber} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="កាលបរិច្ឆេទដំឡើង" type="date" name="installedAt" value={form.installedAt} onChange={handleFormChange} />
            <Select
              label="ស្ថានភាព"
              name="status"
              options={[
                { value: 'ACTIVE', label: 'សកម្ម' },
                { value: 'INACTIVE', label: 'អសកម្ម' },
                { value: 'REPLACED', label: 'បានជំនួស' },
              ]}
              value={form.status}
              onChange={handleFormChange}
            />
          </div>
        </form>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="ព័ត៌មានលម្អិតម៉ែត្រប្រើប្រាស់" size="md">
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
                  <Gauge className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{viewTarget.meterNumber}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">#{viewTarget.id}</p>
                </div>
              </div>
              {getStatusBadge(viewTarget.status)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Plug className="h-4 w-4 text-slate-400" />} label="ប្រភេទប្រើប្រាស់" value={getTypeName(viewTarget.utilityTypeId)} />
              <DetailItem icon={<Building2 className="h-4 w-4 text-slate-400" />} label="អចលនទ្រព្យ" value={getHouseName(viewTarget.houseId)} />
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="លេខសម្គាល់បន្ទប់" value={viewTarget.roomId || '—'} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="បានដំឡើង" value={formatDate(viewTarget.installedAt)} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="បិទដំណើរការម៉ែត្រប្រើប្រាស់"
        description={`តើអ្នកប្រាកដថាចង់បិទដំណើរការ "${deactivateTarget?.meterNumber}" មែនទេ?`}
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
