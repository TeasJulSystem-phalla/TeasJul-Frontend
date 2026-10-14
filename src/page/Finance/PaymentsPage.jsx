import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Wallet,
  RefreshCw,
  Receipt,
  Building2,
  Users,
  DollarSign,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { paymentApi } from '../../api/payment.api';
import { invoiceApi } from '../../api/invoice.api';
import { useHouses } from '../../hooks/useHouses.js';
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
  EmptyState,
  Pagination,
  Skeleton,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'danger',
  EXPIRED: 'default',
  CANCELLED: 'default',
};

const STATUS_LABELS = {
  PENDING: 'កំពុងរង់ចាំ',
  PAID: 'បានបង់',
  FAILED: 'បរាជ័យ',
  EXPIRED: 'ផុតកំណត់',
  CANCELLED: 'បានលុបចោល',
};

const STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const NOT_RECORDABLE_STATUSES = ['PAID', 'CANCELLED', 'DRAFT'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export default function PaymentsPage() {
  const { houses } = useHouses();
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [houseFilter, setHouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applied, setApplied] = useState({});

  const [recordOpen, setRecordOpen] = useState(false);
  const [methods, setMethods] = useState([]);
  const [invoiceResults, setInvoiceResults] = useState([]);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [recordInvoiceId, setRecordInvoiceId] = useState('');
  const [recordMethodId, setRecordMethodId] = useState('');
  const [recordAmount, setRecordAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPayments = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await paymentApi.listPayments({
          page,
          size: 10,
          ...params,
        });
        setPayments(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to load payments. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    fetchPayments(applied);
  }, [fetchPayments, applied]);

  const applyImmediately = (partial) => {
    const houseId = partial.houseId !== undefined ? partial.houseId : houseFilter;
    const status = partial.status !== undefined ? partial.status : statusFilter;
    const from = partial.fromDate !== undefined ? partial.fromDate : fromDate;
    const to = partial.toDate !== undefined ? partial.toDate : toDate;
    setHouseFilter(houseId);
    setStatusFilter(status);
    setFromDate(from);
    setToDate(to);
    setApplied({
      houseId: houseId || undefined,
      status: status || undefined,
      fromDate: from || undefined,
      toDate: to || undefined,
    });
    if (page !== 0) setPage(0);
  };

  const applyFilters = () => {
    applyImmediately({});
  };

  const clearFilters = () => {
    setHouseFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setApplied({});
    if (page !== 0) setPage(0);
  };

  const searchInvoices = useCallback(async (term = '') => {
    setInvoicesLoading(true);
    try {
      const data = await invoiceApi.getInvoices({ search: term || undefined, size: 30 });
      setInvoiceResults(data.content || []);
    } catch {
      setInvoiceResults([]);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!recordOpen) return;
    const timer = setTimeout(() => searchInvoices(invoiceSearch), 200);
    return () => clearTimeout(timer);
  }, [invoiceSearch, recordOpen, searchInvoices]);

  const openRecordModal = async () => {
    setInvoiceSearch('');
    setSelectedInvoice(null);
    setRecordInvoiceId('');
    setRecordMethodId('');
    setRecordAmount('');
    setRecordOpen(true);
    searchInvoices('');
    try {
      const data = await paymentApi.listPaymentMethods();
      setMethods((data || []).filter((m) => m.status === 'ACTIVE'));
    } catch {
      setMethods([]);
    }
  };

  const recordableInvoices = useMemo(
    () => invoiceResults.filter((i) => !NOT_RECORDABLE_STATUSES.includes(i.status)),
    [invoiceResults]
  );

  const methodOptions = useMemo(
    () => methods.map((m) => ({ value: String(m.id), label: m.name })),
    [methods]
  );

  const handleSelectInvoice = (inv) => {
    setSelectedInvoice(inv);
    setRecordInvoiceId(String(inv.id));
    if (inv.totalAmount != null) {
      setRecordAmount(String(inv.totalAmount));
    } else {
      setRecordAmount('');
    }
  };

  const handleClearInvoice = () => {
    setSelectedInvoice(null);
    setRecordInvoiceId('');
    setRecordAmount('');
  };

  const handleRecord = async () => {
    if (!recordInvoiceId) {
      toast.info('ជ្រើសរើសវិក្កយបត្រ', 'សូមជ្រើសរើសវិក្កយបត្រ។');
      return;
    }
    if (!recordMethodId) {
      toast.info('ជ្រើសរើសវិធីសាស្ត្រ', 'សូមជ្រើសរើសវិធីសាស្ត្រទូទាត់។');
      return;
    }
    setSaving(true);
    try {
      await paymentApi.recordManualPayment({
        invoiceId: Number(recordInvoiceId),
        paymentMethodId: Number(recordMethodId),
        amount: recordAmount ? Number(recordAmount) : undefined,
      });
      setRecordOpen(false);
      toast.success('បានកត់ត្រាការទូទាត់', 'ការទូទាត់ត្រូវបានកត់ត្រាដោយជោគជ័យ។');
      fetchPayments(applied);
    } catch (err) {
      toast.error(
        'ការបរាជ័យ',
        err.response?.data?.message || err.response?.data?.error || 'មិនអាចកត់ត្រាបានទេ។'
      );
    } finally {
      setSaving(false);
    }
  };

  const houseOptions = useMemo(
    () => [
      { value: '', label: 'អចលនទ្រព្យទាំងអស់' },
      ...houses.map((h) => ({ value: String(h.id), label: h.name || `អចលនទ្រព្យ #${h.id}` })),
    ],
    [houses]
  );

  const columns = [
    {
      header: 'លេខទូទាត់',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Wallet className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">{row.paymentNo}</p>
            <p className="max-w-[180px] truncate text-xs text-slate-400" title={row.transactionId}>
              {row.transactionId || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'វិក្កយបត្រ',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Receipt className="h-4 w-4 text-slate-400" />
          {row.invoiceNo || '—'}
        </span>
      ),
    },
    {
      header: 'អ្នកជួល',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Users className="h-4 w-4 text-slate-400" />
          {row.tenantName || '—'}
        </span>
      ),
    },
    {
      header: 'បន្ទប់ / អចលនទ្រព្យ',
      render: (row) => (
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-200">{row.roomNumber || '—'}</p>
          <p className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Building2 className="h-3 w-3" />
            {row.houseName || '—'}
          </p>
        </div>
      ),
    },
    {
      header: 'វិធីសាស្ត្រ',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <CreditCard className="h-4 w-4 text-slate-400" />
          {row.paymentMethodName || '—'}
        </span>
      ),
    },
    {
      header: 'ចំនួនទឹកប្រាក់',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-white">
          <DollarSign className="h-4 w-4 text-slate-400" />
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'default'}>
          {STATUS_LABELS[row.status] || row.status || '—'}
        </Badge>
      ),
    },
    {
      header: 'កាលបរិច្ឆេទ',
      render: (row) => (
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {row.paidAt ? formatDate(row.paidAt) : formatDate(row.createdAt)}
          </p>
          {row.paidAt && (
            <p className="text-xs text-slate-400">បានបង្កើត {formatDate(row.createdAt)}</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">ការទូទាត់ (Payments)</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            បង្ហាញបញ្ជីទឹកប្រាក់ដែលបានទូទាត់រួច និងកំពុងរង់ចាំ។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => fetchPayments(applied)}>
            ធ្វើឱ្យស្រស់
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openRecordModal}>
            កត់ត្រាការទូទាត់
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកការទូទាត់" description={error} dismissible />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-56">
          <Select options={houseOptions} value={houseFilter} onChange={(e) => applyImmediately({ houseId: e.target.value })} placeholder="អចលនទ្រព្យទាំងអស់" />
        </div>
        <div className="w-full sm:w-40">
          <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => applyImmediately({ status: e.target.value })} placeholder="ស្ថានភាពទាំងអស់" />
        </div>
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 sm:w-auto">
          <Input type="date" value={fromDate} onChange={(e) => applyImmediately({ fromDate: e.target.value })} aria-label="ពីកាលបរិច្ឆេទ" />
          <span className="text-xs text-slate-400">→</span>
          <Input type="date" value={toDate} onChange={(e) => applyImmediately({ toDate: e.target.value })} aria-label="ដល់កាលបរិច្ឆេទ" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={applyFilters}>អនុវត្ត</Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={clearFilters}>សម្អាត</Button>
        </div>
      </div>

      {!loading && payments.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="មិនទាន់មានការទូទាត់"
          description="ការទូទាត់ពីអ្នកជួលនឹងបង្ហាញនៅទីនេះ។"
          action={
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openRecordModal}>
              កត់ត្រាការទូទាត់
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Card>
              <Table columns={columns} data={payments} keyExtractor={(row) => row.id} className="w-full" />
            </Card>
          </div>

          <div className="space-y-3 md:hidden">
            {payments.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <Wallet className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800 dark:text-white">{row.paymentNo}</p>
                      <p className="max-w-[160px] truncate text-xs text-slate-400">
                        {row.transactionId || '—'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[row.status] || 'default'}>
                    {STATUS_LABELS[row.status] || row.status || '—'}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{row.invoiceNo || '—'}</span>
                  </span>
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{row.tenantName || '—'}</span>
                  </span>
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{row.houseName || '—'}</span>
                  </span>
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{row.paymentMethodName || '—'}</span>
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-gray-800">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-white">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    {formatCurrency(row.amount)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {row.paidAt ? formatDate(row.paidAt) : formatDate(row.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center sm:justify-end">
              <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
            </div>
          )}
        </>
      )}

      <Modal open={recordOpen} onOpenChange={setRecordOpen} title="កត់ត្រាការទូទាត់ (Cash / ផ្ទាល់)">
        <div className="space-y-4">
          {!selectedInvoice ? (
            <div className="space-y-3">
              <Input
                label="ស្វែងរកវិក្កយបត្រ"
                placeholder="ស្វែងរកតាមឈ្មោះអ្នកជួល, លេខវិក្កយបត្រ, ឬ ID..."
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
              />

              {invoicesLoading ? (
                <div className="space-y-2 py-1">
                  <p className="text-xs text-slate-400">កំពុងស្វែងរក...</p>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : recordableInvoices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                  <Receipt className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {invoiceSearch ? 'រកមិនឃើញវិក្កយបត្រដែលត្រូវគ្នានឹងការស្វែងរកទេ' : 'មិនមានវិក្កយបត្រដែលត្រូវទូទាត់ទេ'}
                  </p>
                </div>
              ) : (
                <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                  <p className="text-xs font-medium text-slate-400">
                    លទ្ធផលស្វែងរក ({recordableInvoices.length}) — ចុចដើម្បីជ្រើសរើស:
                  </p>
                  {recordableInvoices.map((inv) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => handleSelectInvoice(inv)}
                      className="group flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50/30 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
                          <Receipt className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 dark:text-white">
                              {inv.invoiceNo}
                            </span>
                            <span className="text-xs font-mono text-slate-400">#{inv.id}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            👤 {inv.tenantName || '—'} {inv.roomNumber ? `• បន្ទប់ ${inv.roomNumber}` : ''} ({inv.houseName || `#${inv.houseId}`})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(inv.totalAmount)}
                        </p>
                        <Badge variant={STATUS_VARIANT[inv.status] || 'default'}>
                          {STATUS_LABELS[inv.status] || inv.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {selectedInvoice.invoiceNo}
                        </h4>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-mono font-medium text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                          ID: #{selectedInvoice.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        អ្នកជួល: <strong className="text-slate-700 dark:text-slate-200">{selectedInvoice.tenantName || '—'}</strong>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearInvoice}
                    className="h-8 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  >
                    <X className="mr-1 h-3.5 w-3.5" /> ផ្លាស់ប្តូរ
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-white/80 p-3 text-xs dark:bg-slate-900/80">
                  <div>
                    <span className="text-slate-400">អចលនទ្រព្យ/បន្ទប់:</span>
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {selectedInvoice.houseName || '—'} {selectedInvoice.roomNumber ? `(បន្ទប់ ${selectedInvoice.roomNumber})` : ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">កាលបរិច្ឆេទកំណត់:</span>
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {formatDate(selectedInvoice.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-600 p-3.5 text-white shadow-md shadow-emerald-600/20">
                  <div>
                    <p className="text-xs font-medium text-emerald-100">
                      សរុបទឹកប្រាក់ត្រូវទូទាត់ (Total Payment Amount)
                    </p>
                    <p className="text-2xl font-black tracking-tight text-white">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[selectedInvoice.status] || 'default'}>
                    {STATUS_LABELS[selectedInvoice.status] || selectedInvoice.status}
                  </Badge>
                </div>
              </div>

              <Select
                label="វិធីសាស្ត្រទូទាត់"
                options={methodOptions}
                value={recordMethodId}
                onChange={(e) => setRecordMethodId(e.target.value)}
                placeholder="ជ្រើសរើសវិធីសាស្ត្រទូទាត់"
              />

              <div>
                <div className="flex items-center justify-between pb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    ចំនួនទឹកប្រាក់ទូទាត់ ($)
                  </label>
                  {selectedInvoice.totalAmount != null && recordAmount !== String(selectedInvoice.totalAmount) && (
                    <button
                      type="button"
                      onClick={() => setRecordAmount(String(selectedInvoice.totalAmount))}
                      className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      បង់ពេញចំនួន ({formatCurrency(selectedInvoice.totalAmount)})
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={recordAmount}
                  onChange={(e) => setRecordAmount(e.target.value)}
                  placeholder={`បញ្ចូលចំនួនទឹកប្រាក់ (${formatCurrency(selectedInvoice.totalAmount)})`}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setRecordOpen(false)}>
              បោះបង់
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              disabled={!selectedInvoice}
              onClick={handleRecord}
            >
              កត់ត្រា
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}