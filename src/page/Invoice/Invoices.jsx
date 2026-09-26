import { useState, useMemo, useEffect } from 'react';
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
  Download,
  Wallet,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useInvoiceSummary } from '../../hooks/useInvoiceSummary.js';
import { useBasePath } from '../../hooks/useBasePath.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatNumber } from '../../utils/format.js';
import MonthlyInvoiceChart from '../../components/charts/MonthlyInvoiceChart.jsx';
import BulkInvoicePreviewModal from './BulkInvoicePreviewModal.jsx';
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
  CountUp,
  Skeleton,
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

const StatCard = ({ label, value, formatter, icon: Icon, iconClass }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md hover:shadow-slate-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-black/20">
    <div className="flex items-start justify-between">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon className="h-5 w-5" />
      </span>
    </div>
    <p className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">
      <CountUp value={value} formatter={formatter} />
    </p>
    <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

const CollectionRate = ({ summary }) => {
  const rate = Math.max(0, Math.min(100, Number(summary.collectionRate) || 0));
  const collected = Number(summary.totalCollected) || 0;
  const invoiced = Number(summary.totalInvoiced) || 0;
  return (
    <div className="flex h-full flex-col">
      <p className="text-4xl font-bold text-slate-800 dark:text-white">
        <CountUp value={rate} decimals={2} suffix="%" />
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${rate}%` }}
        />
      </div>
      <p className="mt-4 text-[13px] text-slate-500 dark:text-slate-400">
        បានទូទាត់ {formatCurrency(collected)} ក្នុងចំណោម {formatCurrency(invoiced)}
      </p>
      <div className="mt-auto space-y-2 border-t border-slate-100 pt-4 dark:border-gray-800">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-500 dark:text-slate-400">ចំនួនវិក្កយបត្រ</span>
          <span className="font-semibold text-slate-800 dark:text-white">
            {formatNumber(summary.totalInvoices)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-500 dark:text-slate-400">ហួសកំណត់</span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(summary.overdue)}
          </span>
        </div>
      </div>
    </div>
  );
};

const AnalyticsSkeleton = () => (
  <>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 p-5 dark:border-gray-800">
          <Skeleton width={40} height={40} className="rounded-lg" />
          <Skeleton width={140} height={28} className="mt-4" />
          <Skeleton width={90} height={12} className="mt-3" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-lg border border-slate-200 p-6 dark:border-gray-800 lg:col-span-2">
        <Skeleton width={200} height={24} />
        <Skeleton width="100%" height={280} className="mt-5" />
      </div>
      <div className="rounded-lg border border-slate-200 p-6 dark:border-gray-800">
        <Skeleton width={160} height={24} />
        <Skeleton width="100%" height={180} className="mt-5" />
      </div>
    </div>
  </>
);

export default function Invoices() {
  const navigate = useNavigate();
  const {
    invoices,
    loading,
    error,
    page,
    totalPages,
    searchTerm,
    houseFilter,
    statusFilter,
    monthFilter,
    yearFilter,
    setSearchTerm,
    setHouseFilter,
    setStatusFilter,
    setMonthFilter,
    setYearFilter,
    clearFilters,
    setPage,
    fetchInvoices,
  } = useInvoices();
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    fetchSummary,
  } = useInvoiceSummary();
  const { houses } = useHouses();
  const toast = useToast();
  const basePath = useBasePath();

  const [previewOpen, setPreviewOpen] = useState(false);

  const summaryParams = useMemo(() => {
    const params = {};
    if (houseFilter) params.houseId = houseFilter;
    if (yearFilter) params.year = yearFilter;
    if (monthFilter) params.month = monthFilter;
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [houseFilter, yearFilter, monthFilter, statusFilter]);

  useEffect(() => {
    fetchSummary(summaryParams);
  }, [summaryParams, fetchSummary]);

  const handleRefresh = () => {
    fetchInvoices();
    fetchSummary(summaryParams);
  };

  const handleBulkDownload = () => {
    if (invoices.length === 0) {
      toast.info('គ្មានវិក្កយបត្រ', 'មិនមានវិក្កយបត្រដើម្បីទាញយកទេ។');
      return;
    }
    setPreviewOpen(true);
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
            onClick={() => navigate(`${basePath}/invoices/${row.id}`)}
          />
        </div>
      ),
    },
  ];

  const isFiltered = searchTerm || houseFilter || statusFilter || monthFilter || yearFilter;

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
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleBulkDownload}
          >
            ទាញយក PDF ទាំងអស់
          </Button>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={handleRefresh}>ធ្វើឱ្យស្រស់</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(`${basePath}/invoices/generate`)}>បង្កើតវិក្កយបត្រ</Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ ឬអ្នកជួល..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        {isFiltered && (
          <Button variant="outline" size="sm" onClick={clearFilters}>សម្អាត</Button>
        )}
      </div>

      {/* Financial overview */}
      <section className="space-y-6" aria-label="Financial overview">
        {summaryLoading ? (
          <AnalyticsSkeleton />
        ) : summaryError ? (
          <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកទិដ្ឋភាពហិរញ្ញវត្ថុ" description={summaryError}>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => fetchSummary(summaryParams)}
              >
                ព្យាយាមម្តងទៀត
              </Button>
            </div>
          </Alert>
        ) : summary && summary.totalInvoices > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="បានចេញវិក្កយបត្រ (Total Invoiced)"
                value={summary.totalInvoiced}
                formatter={formatCurrency}
                icon={FileText}
                iconClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              />
              <StatCard
                label="បានទូទាត់ (Total Collected)"
                value={summary.totalCollected}
                formatter={formatCurrency}
                icon={CheckCircle2}
                iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              />
              <StatCard
                label="នៅសល់ឥណទាន (Outstanding)"
                value={summary.outstanding}
                formatter={formatCurrency}
                icon={Wallet}
                iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
              />
              <StatCard
                label="ហួសកំណត់ (Overdue)"
                value={summary.overdue}
                formatter={formatCurrency}
                icon={Clock}
                iconClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card
                title="ទិដ្ឋភាពប្រចាំខែ (Monthly Overview)"
                description={`វិក្កយបត្រ និងការទូទាត់សម្រាប់ឆ្នាំ ${summary.monthlyYear || new Date().getFullYear()}`}
                className="lg:col-span-2"
              >
                <MonthlyInvoiceChart data={summary.monthly || []} year={summary.monthlyYear} />
              </Card>
<Card
            title="អត្រានៃការទូទាត់ (Collection Rate)"
            description="សមាមាត្របានទូទាត់បើធៀបនឹងវិក្កយបត្រដែលបានចេញ"
          >
            <CollectionRate summary={summary} />
          </Card>
        </div>
          </>
        ) : (
          <Card>
            <EmptyState
              icon={BarChart3}
              title="មិនទាន់មានទិន្នន័យហិរញ្ញវត្ថុ"
              description="បង្កើតវិក្កយបត្រ ដើម្បីមើលស្ថិតិប្រចាំខែ និងអត្រានៃការទូទាត់របស់អ្នក។"
            />
          </Card>
        )}
      </section>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកវិក្កយបត្រ" description={error} dismissible />
      )}

      {!loading && invoices.length === 0 ? (
        isFiltered ? (
          <EmptyState
            icon={FileText}
            title="រកមិនឃើញលទ្ធផល"
            description="សូមព្យាយាមកែតម្រូវលក្ខណៈវិនិច្ឆ័យស្វែងរក ឬតម្រងរបស់អ្នក។"
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="មិនទាន់មានវិក្កយបត្រ"
            description="បង្កើតវិក្កយបត្រប្រចាំខែដំបូងរបស់អ្នក ដើម្បីចាប់ផ្តើមទូទាត់។"
            action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(`${basePath}/invoices/generate`)}>បង្កើតវិក្កយបត្រ</Button>}
          />
        )
      ) : (
        <>
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

      <BulkInvoicePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoices={invoices}
        billingYear={yearFilter ? Number(yearFilter) : undefined}
        billingMonth={monthFilter ? Number(monthFilter) : undefined}
      />
    </div>
  );
}