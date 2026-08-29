import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Building2,
  Calendar,
  Filter,
  Plug,
} from 'lucide-react';
import { useUtilityRates } from '../../hooks/useUtilityRates.js';
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
};

const STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'ACTIVE', label: 'សកម្ម' },
  { value: 'INACTIVE', label: 'អសកម្ម' },
];

const EMPTY_FORM = {
  houseId: '',
  utilityTypeId: '',
  rate: '',
  effectiveFrom: '',
  effectiveTo: '',
  status: 'ACTIVE',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function UtilityRates() {
  const {
    rates,
    loading,
    error,
    page,
    totalPages,
    setPage,
    fetchRates,
    createRate,
    updateRate,
    deactivateRate,
  } = useUtilityRates();
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
    fetchRates({});
  }, [fetchRates, page, setPage]);

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
    let result = rates;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          getTypeName(r.utilityTypeId).toLowerCase().includes(q) ||
          getHouseName(r.houseId).toLowerCase().includes(q)
      );
    }
    if (houseFilter) result = result.filter((r) => String(r.houseId) === houseFilter);
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates, searchTerm, houseFilter, statusFilter, typeMap, houseMap]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{status || '—'}</Badge>
  );

  const columns = [
    {
      header: 'ប្រភេទប្រើប្រាស់',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
            <Plug className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">{getTypeName(row.utilityTypeId)}</p>
            <p className="text-xs text-slate-400">តម្លៃ # {row.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'តម្លៃ',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-white">
          <DollarSign className="h-4 w-4 text-slate-400" />
          {formatCurrency(row.rate)}
        </span>
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
      header: 'មានប្រសិទ្ធភាព',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(row.effectiveFrom)} → {formatDate(row.effectiveTo)}
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

  const openEdit = (r) => {
    setEditTarget(r);
    setForm({
      houseId: r.houseId != null ? String(r.houseId) : '',
      utilityTypeId: r.utilityTypeId != null ? String(r.utilityTypeId) : '',
      rate: r.rate != null ? String(r.rate) : '',
      effectiveFrom: r.effectiveFrom || '',
      effectiveTo: r.effectiveTo || '',
      status: r.status || 'ACTIVE',
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
    if (form.rate === '' || Number(form.rate) < 0) errs.rate = 'តម្លៃមិនត្រូវជាអវិជ្ជមានទេ';
    if (!form.effectiveFrom) errs.effectiveFrom = 'កាលបរិច្ឆេទមានប្រសិទ្ធភាពចាប់ពីត្រូវបានទាមទារ';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      houseId: Number(form.houseId),
      utilityTypeId: Number(form.utilityTypeId),
      rate: Number(form.rate),
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || null,
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateRate(editTarget.id, payload);
        toast.success('តម្លៃប្រើប្រាស់ត្រូវបានកែប្រែ', 'តម្លៃត្រូវបានកែប្រែរួចរាល់។');
        setEditTarget(null);
      } else {
        await createRate(payload);
        toast.success('តម្លៃប្រើប្រាស់ត្រូវបានបង្កើត', 'តម្លៃត្រូវបានបង្កើតរួចរាល់។');
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'ប្រតិបត្តិការបរាជ័យ។');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await deactivateRate(deactivateTarget.id);
      toast.success('តម្លៃប្រើប្រាស់ត្រូវបានបិទដំណើរការ', 'តម្លៃត្រូវបានបិទដំណើរការរួចរាល់។');
      setDeactivateTarget(null);
    } catch (err) {
      toast.error('ការបិទដំណើរការបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការបិទដំណើរការតម្លៃ។');
    } finally {
      setDeactivating(false);
    }
  };

  const applyFilters = () => {
    fetchRates({ houseId: houseFilter || undefined, status: statusFilter || undefined });
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">តម្លៃប្រើប្រាស់ទឹកភ្លើង</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            កំណត់តម្លៃគិតថ្លៃសម្រាប់ការប្រើប្រាស់នីមួយៗក្នុងកំឡុងពេលជាក់លាក់។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>ធ្វើឱ្យស្រស់</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បន្ថែមតម្លៃ</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកតម្លៃប្រើប្រាស់" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      {rates.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមប្រភេទ ឬអចលនទ្រព្យ..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select options={houseOptions} value={houseFilter} onChange={(e) => setHouseFilter(e.target.value)} />
          </div>
          <div className="w-full sm:w-40">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" onClick={applyFilters}>អនុវត្ត</Button>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setHouseFilter(''); setStatusFilter(''); fetchRates({}); }}>សម្អាត</Button>
        </div>
      )}

      {!loading && rates.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="មិនទាន់មានតម្លៃប្រើប្រាស់"
          description="បង្កើតតម្លៃ ដើម្បីកំណត់ថាការប្រើប្រាស់នីមួយៗត្រូវចំណាយប៉ុន្មាន។"
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បន្ថែមតម្លៃ</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="រកមិនឃើញទិន្នន័យ" description="សូមព្យាយាមកែតម្រូវការស្វែងរក ឬលក្ខខណ្ឌតម្រងរបស់អ្នក។" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((r) => (
              <div key={r.id} onClick={() => setViewTarget(r)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
                      <Plug className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{getTypeName(r.utilityTypeId)}</p>
                      <p className="text-xs text-slate-400">{getHouseName(r.houseId)}</p>
                    </div>
                  </div>
                  {getStatusBadge(r.status)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-gray-800">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-white">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    {formatCurrency(r.rate)}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openEdit(r); }} />
                    <IconButton variant="ghost" size="sm" tooltip="បិទដំណើរការ" icon={<Trash2 className="h-4 w-4" />} disabled={r.status === 'INACTIVE'} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeactivateTarget(r); }} />
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
        title={editTarget ? 'កែប្រែតម្លៃប្រើប្រាស់' : 'បង្កើតតម្លៃប្រើប្រាស់'}
        description={editTarget ? 'កែតម្រូវព័ត៌មាននៃតម្លៃនេះ។' : 'កំណត់តម្លៃនៃការប្រើប្រាស់មួយឯកតាសម្រាប់កំឡុងពេលជាក់លាក់។'}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>បោះបង់</Button>
            <Button type="submit" form="rateForm" onClick={() => document.getElementById('rateForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បន្ថែមតម្លៃ'}
            </Button>
          </div>
        }
      >
        <form id="rateForm" onSubmit={handleSubmit} className="space-y-4">
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
          <Input label="តម្លៃ ($)" required type="number" step="0.01" min="0" name="rate" value={form.rate} onChange={handleFormChange} error={formErrors.rate} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="មានប្រសិទ្ធភាពចាប់ពី" required type="date" name="effectiveFrom" value={form.effectiveFrom} onChange={handleFormChange} error={formErrors.effectiveFrom} />
            <Input label="មានប្រសិទ្ធភាពរហូតដល់" type="date" name="effectiveTo" value={form.effectiveTo} onChange={handleFormChange} />
          </div>
          <Select
            label="ស្ថានភាព"
            name="status"
            options={[
              { value: 'ACTIVE', label: 'សកម្ម' },
              { value: 'INACTIVE', label: 'អសកម្ម' },
            ]}
            value={form.status}
            onChange={handleFormChange}
          />
        </form>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="ព័ត៌មានលម្អិតតម្លៃប្រើប្រាស់" size="md">
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
                  <DollarSign className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{formatCurrency(viewTarget.rate)}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">តម្លៃ # {viewTarget.id}</p>
                </div>
              </div>
              {getStatusBadge(viewTarget.status)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Plug className="h-4 w-4 text-slate-400" />} label="ប្រភេទប្រើប្រាស់" value={getTypeName(viewTarget.utilityTypeId)} />
              <DetailItem icon={<Building2 className="h-4 w-4 text-slate-400" />} label="អចលនទ្រព្យ" value={getHouseName(viewTarget.houseId)} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="មានប្រសិទ្ធភាពចាប់ពី" value={formatDate(viewTarget.effectiveFrom)} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="មានប្រសិទ្ធភាពរហូតដល់" value={formatDate(viewTarget.effectiveTo)} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="បិទដំណើរការតម្លៃប្រើប្រាស់"
        description="តើអ្នកប្រាកដថាចង់បិទដំណើរការតម្លៃនេះមែនទេ?"
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
