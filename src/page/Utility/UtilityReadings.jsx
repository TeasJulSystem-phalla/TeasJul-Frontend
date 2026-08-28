import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Gauge,
  TrendingUp,
  Calendar,
  Filter,
  Hash,
  Activity,
} from 'lucide-react';
import { useUtilityReadings } from '../../hooks/useUtilityReadings.js';
import { useUtilityMeters } from '../../hooks/useUtilityMeters.js';
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
  EmptyState,
  Skeleton,
  Pagination,
} from '../../components/ui/index.js';

const EMPTY_FORM = {
  meterId: '',
  currentReading: '',
  readingDate: '',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function UtilityReadings() {
  const {
    readings,
    loading,
    error,
    page,
    totalPages,
    setPage,
    fetchReadings,
    createReading,
  } = useUtilityReadings();
  const { meters } = useUtilityMeters();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [meterFilter, setMeterFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => {
    setSearchTerm('');
    setMeterFilter('');
    if (page !== 0) setPage(0);
    fetchReadings({});
  }, [fetchReadings, page, setPage]);

  const meterOptions = useMemo(
    () => [
      { value: '', label: 'All Meters' },
      ...meters.map((m) => ({ value: String(m.id), label: m.meterNumber || `Meter #${m.id}` })),
    ],
    [meters]
  );

  const meterMap = useMemo(() => Object.fromEntries(meters.map((m) => [String(m.id), m])), [meters]);

  const getMeterLabel = (meterId) => meterMap[String(meterId)]?.meterNumber || meterId || '—';

  const filtered = useMemo(() => {
    let result = readings;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r) => String(r.meterId).toLowerCase().includes(q));
    }
    if (meterFilter) result = result.filter((r) => String(r.meterId) === meterFilter);
    return result;
  }, [readings, searchTerm, meterFilter]);

  const columns = [
    {
      header: 'Meter',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
            <Gauge className="h-4 w-4" />
          </span>
          <span className="font-medium text-slate-800 dark:text-white">{getMeterLabel(row.meterId)}</span>
        </div>
      ),
    },
    {
      header: 'Previous',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{row.previousReading ?? '—'}</span>,
    },
    {
      header: 'Current',
      render: (row) => <span className="text-sm font-medium text-slate-800 dark:text-white">{row.currentReading}</span>,
    },
    {
      header: 'Usage',
      render: (row) => (
        <Badge variant={(Number(row.usage) || 0) > 0 ? 'info' : 'default'}>
          <TrendingUp className="mr-1 inline h-3 w-3" />
          {row.usage ?? '0'}
        </Badge>
      ),
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(row.readingDate)}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton variant="ghost" size="sm" tooltip="View" icon={<Eye className="h-4 w-4" />} onClick={() => setViewTarget(row)} />
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.meterId) errs.meterId = 'Meter is required';
    if (form.currentReading === '' || Number(form.currentReading) < 0) errs.currentReading = 'Current reading must not be negative';
    if (!form.readingDate) errs.readingDate = 'Reading date is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      meterId: Number(form.meterId),
      currentReading: Number(form.currentReading),
      readingDate: form.readingDate,
    };

    setSubmitting(true);
    try {
      await createReading(payload);
      toast.success('Reading recorded', 'The utility reading has been recorded.');
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to record reading.');
    } finally {
      setSubmitting(false);
    }
  };

  const applyFilters = () => {
    fetchReadings({ meterId: meterFilter || undefined });
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Utility Readings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Record and review meter readings across your properties.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>Refresh</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>Record Reading</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error loading readings" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>Retry</Button>
          </div>
        </Alert>
      )}

      {readings.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by meter id..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select options={meterOptions} value={meterFilter} onChange={(e) => setMeterFilter(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" onClick={applyFilters}>Apply</Button>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setMeterFilter(''); fetchReadings({}); }}>Clear</Button>
        </div>
      )}

      {!loading && readings.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No readings recorded"
          description="Record your first meter reading to start tracking usage."
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>Record Reading</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="No matches found" description="Try adjusting your search or filter criteria." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((r) => (
              <div key={r.id} onClick={() => setViewTarget(r)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
                      <Gauge className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{getMeterLabel(r.meterId)}</p>
                      <p className="text-xs text-slate-400">{formatDate(r.readingDate)}</p>
                    </div>
                  </div>
                  <Badge variant="info">{r.usage ?? '0'}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm dark:border-gray-800">
                  <div className="text-slate-500 dark:text-slate-400">
                    <span className="block text-[11px] text-slate-400">Previous</span>
                    {r.previousReading ?? '—'}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    <span className="block text-[11px] text-slate-400">Current</span>
                    {r.currentReading}
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
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Record Utility Reading"
        description="Enter the current reading for a meter. Usage is calculated automatically."
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="readingForm" onClick={() => document.getElementById('readingForm')?.requestSubmit()} loading={submitting}>
              {submitting ? 'Saving...' : 'Record Reading'}
            </Button>
          </div>
        }
      >
        <form id="readingForm" onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Meter"
            required
            name="meterId"
            options={meters.map((m) => ({ value: String(m.id), label: m.meterNumber || `Meter #${m.id}` }))}
            value={form.meterId}
            onChange={handleFormChange}
            error={formErrors.meterId}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Current Reading" required type="number" step="0.01" min="0" name="currentReading" value={form.currentReading} onChange={handleFormChange} error={formErrors.currentReading} />
            <Input label="Reading Date" required type="date" name="readingDate" value={form.readingDate} onChange={handleFormChange} error={formErrors.readingDate} />
          </div>
        </form>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Reading Details" size="md">
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
                  <Gauge className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{getMeterLabel(viewTarget.meterId)}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">#{viewTarget.id}</p>
                </div>
              </div>
              <Badge variant="info">Usage: {viewTarget.usage ?? '0'}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="Meter ID" value={viewTarget.meterId} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Reading Date" value={formatDate(viewTarget.readingDate)} />
              <DetailItem icon={<Activity className="h-4 w-4 text-slate-400" />} label="Previous" value={viewTarget.previousReading ?? '—'} />
              <DetailItem icon={<Activity className="h-4 w-4 text-slate-400" />} label="Current" value={viewTarget.currentReading} />
            </div>
          </div>
        )}
      </Modal>
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
