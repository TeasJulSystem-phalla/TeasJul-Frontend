import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  FileText,
  Building2,
  Users,
  DollarSign,
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices.js';
import { useHouses } from '../../hooks/useHouses.js';
import {
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Input,
  Select,
  IconButton,
  EmptyState,
  Pagination,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  DRAFT: 'default',
  PENDING: 'warning',
  PARTIAL: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'default',
};

const STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'DRAFT', label: 'សេចក្តីព្រាង' },
  { value: 'PENDING', label: 'កំពុងរង់ចាំ' },
  { value: 'PARTIAL', label: 'បានបង់មួយផ្នែក' },
  { value: 'PAID', label: 'បានបង់' },
  { value: 'OVERDUE', label: 'ហួសកំណត់' },
  { value: 'CANCELLED', label: 'បានលុបចោល' },
];

const MONTH_OPTIONS = [
  { value: '', label: 'ខែទាំងអស់' },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `ខែ ${i + 1}`,
  })),
];

const YEAR_OPTIONS = [
  { value: '', label: 'ឆ្នាំទាំងអស់' },
  ...Array.from({ length: 6 }, (_, i) => {
    const y = new Date().getFullYear() - 2 + i;
    return { value: String(y), label: String(y) };
  }),
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const getStatusBadge = (status) => (
  <Badge variant={STATUS_VARIANT[status] || 'default'}>{status || '—'}</Badge>
);

export default function Invoices() {
  const navigate = useNavigate();
  const { invoices, loading, error, page, totalPages, setPage, fetchInvoices } = useInvoices();
  const { houses } = useHouses();

  const [searchTerm, setSearchTerm] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const houseOptions = useMemo(
    () => [
      { value: '', label: 'អចលនទ្រព្យទាំងអស់' },
      ...houses.map((h) => ({ value: String(h.id), label: h.name || `អចលនទ្រព្យ #${h.id}` })),
    ],
    [houses]
  );

  const applyFilters = () => {
    fetchInvoices({
      search: searchTerm || undefined,
      houseId: houseFilter || undefined,
      status: statusFilter || undefined,
      billingMonth: monthFilter || undefined,
      billingYear: yearFilter || undefined,
    });
    if (page !== 0) setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setHouseFilter('');
    setStatusFilter('');
    setMonthFilter('');
    setYearFilter('');
    fetchInvoices({});
  };

  const columns = [
    {
      header: 'លេខវិក្កយបត្រ',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">{row.invoiceNo}</p>
            <p className="text-xs text-slate-400">
              {row.billingMonth}/{row.billingYear}
            </p>
          </div>
        </div>
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
      header: 'បន្ទប់',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.roomNumber || '—'}
        </span>
      ),
    },
    {
      header: 'អចលនទ្រព្យ',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Building2 className="h-4 w-4 text-slate-400" />
          {row.houseName || '—'}
        </span>
      ),
    },
    {
      header: 'សរុប',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-white">
          <DollarSign className="h-4 w-4 text-slate-400" />
          {formatCurrency(row.totalAmount)}
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
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="មើល"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => navigate(`/invoices/${row.id}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">វិក្កយបត្រ</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងវិក្កយបត្រប្រចាំខែ និងការទូទាត់។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => fetchInvoices({})}>ធ្វើឱ្យស្រស់</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/invoices/generate')}>បង្កើតវិក្កយបត្រ</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកវិក្កយបត្រ" description={error} dismissible />
      )}

      {!loading && invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="មិនទាន់មានវិក្កយបត្រ"
          description="បង្កើតវិក្កយបត្រប្រចាំខែដំបូងរបស់អ្នក ដើម្បីចាប់ផ្តើមទូទាត់។"
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/invoices/generate')}>បង្កើតវិក្កយបត្រ</Button>}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ ឬអ្នកជួល..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select options={houseOptions} value={houseFilter} onChange={(e) => setHouseFilter(e.target.value)} placeholder="អចលនទ្រព្យទាំងអស់" />
            </div>
            <div className="w-full sm:w-36">
              <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
            </div>
            <div className="w-full sm:w-32">
              <Select options={MONTH_OPTIONS} value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
            </div>
            <div className="w-full sm:w-32">
              <Select options={YEAR_OPTIONS} value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={applyFilters}>អនុវត្ត</Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>សម្អាត</Button>
          </div>

          <Card>
            <Table columns={columns} data={invoices} keyExtractor={(row) => row.id} className="w-full" />
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-end">
              <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
