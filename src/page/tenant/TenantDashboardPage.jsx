// src/page/tenant/TenantDashboardPage.jsx
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Droplets,
  Zap,
  Building2,
  DoorOpen,
  CalendarDays,
  Receipt,
  RefreshCw,
  Hourglass,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Alert,
  Badge,
  Button,
  Card,
  CountUp,
  EmptyState,
  Input,
  Pagination,
  Select,
  Skeleton,
  Table,
} from '../../components/ui/index.js';
import {
  useTenantDashboard,
  useTenantInvoices,
  useTenantTrends,
} from '../../hooks/useTenantDashboard';
import { formatCompactCurrency, formatCurrency, formatDate, formatMonth, formatNumber } from '../../utils/format';
import { invoiceStatus } from '../../utils/invoiceStatus';

const PAYMENT_STATUS_COLORS = {
  PAID: '#059669',
  PARTIAL: '#0ea5e9',
  PENDING: '#f59e0b',
  OVERDUE: '#dc2626',
  CANCELLED: '#6b7280',
};

const DATE_RANGE_OPTIONS = [
  { value: 'this-month', label: 'ខែនេះ (This Month)' },
  { value: 'last-month', label: 'ខែមុន (Last Month)' },
  { value: 'last-3-months', label: '៣ ខែចុងក្រោយ (Last 3 Months)' },
  { value: 'last-6-months', label: '៦ ខែចុងក្រោយ (Last 6 Months)' },
  { value: 'this-year', label: 'ឆ្នាំនេះ (This Year)' },
  { value: 'custom', label: 'ផ្ទាល់ខ្លួន (Custom)' },
];

const RANGE_LABELS = {
  'this-month': 'ខែនេះ',
  'last-month': 'ខែមុន',
  'last-3-months': '៣ ខែចុងក្រោយ',
  'last-6-months': '៦ ខែចុងក្រោយ',
  'this-year': 'ឆ្នាំនេះ',
  custom: 'ផ្ទាល់ខ្លួន',
};

const toMonthString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const SummaryCard = ({ icon, label, value, sub, highlight, countUpValue, formatter, suffix }) => (
  <Card className="flex flex-col">
    <div className="flex items-start justify-between">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
        {icon}
      </span>
    </div>
    <p className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
    <p
      className={`mt-1 truncate text-lg font-bold ${
        highlight
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-slate-900 dark:text-white'
      }`}
    >
      {countUpValue === undefined || countUpValue === null ? (
        value
      ) : (
        <CountUp value={countUpValue} formatter={formatter} suffix={suffix} />
      )}
    </p>
    {sub && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
  </Card>
);

export default function TenantDashboardPage() {
  const navigate = useNavigate();

  const { dashboard, loading: dashboardLoading, error: dashboardError, fetchDashboard } =
    useTenantDashboard();

  const [dateRange, setDateRange] = useState('this-year');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const computeRange = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    const lastNMonths = (n) => ({
      from: toMonthString(new Date(y, m - (n - 1), 1)),
      to: toMonthString(now),
    });

    switch (dateRange) {
      case 'this-month': {
        const cur = toMonthString(now);
        return { from: cur, to: cur };
      }
      case 'last-month': {
        const last = toMonthString(new Date(y, m - 1, 1));
        return { from: last, to: last };
      }
      case 'last-3-months':
        return lastNMonths(3);
      case 'last-6-months':
        return lastNMonths(6);
      case 'custom':
        if (customFrom && customTo) return { from: customFrom, to: customTo };
        return lastNMonths(6);
      default:
        return { from: `${y}-01`, to: toMonthString(now) };
    }
  }, [dateRange, customFrom, customTo]);

  const range = useMemo(() => computeRange(), [computeRange]);

  const { usage, payments, loading: trendsLoading, error: trendsError, fetchTrends } =
    useTenantTrends(range.from, range.to);
  const [page, setPage] = useState(0);
  const { invoices, pageData, loading: invoicesLoading, error: invoicesError, fetchInvoices } =
    useTenantInvoices(page, 10);

  const handleRefresh = () => {
    fetchDashboard();
    fetchTrends(range.from, range.to);
    fetchInvoices(page, 10);
  };

  const clearFilters = () => {
    setDateRange('this-year');
    setCustomFrom('');
    setCustomTo('');
  };

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (dashboardError || !dashboard) {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert
          variant="danger"
          title="កំហុសក្នុងការផ្ទុកផ្ទាំងគ្រប់គ្រង"
          description={dashboardError || 'មិនអាចផ្ទុកទិន្នន័យផ្ទាំងគ្រប់គ្រងបានទេ។'}
        >
          <Button size="sm" className="mt-3" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchDashboard}>
            ព្យាយាមម្តងទៀត
          </Button>
        </Alert>
      </div>
    );
  }

  const { tenant, room, contract, financial, utilities } = dashboard;

  const waterLast = utilities?.water;
  const electricityLast = utilities?.electricity;

  const usageChartData = (usage?.water || []).map((w) => {
    const el = (usage?.electricity || []).find((e) => e.month === w.month);
    return {
      month: w.month,
      label: formatMonth(w.month),
      water: Number(w.usage || 0),
      electricity: el ? Number(el.usage || 0) : 0,
    };
  });

  const paymentChartData = (payments || []).map((p) => ({
    month: p.month,
    label: formatMonth(p.month),
    amount: Number(p.amount || 0),
    status: p.status,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            ផ្ទាំងគ្រប់គ្រង {tenant?.name ? `• ${tenant.name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            សង្ខេបការជួល វិក្កយបត្រ និងការប្រើប្រាស់ទឹកភ្លើងរបស់អ្នក
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={handleRefresh}
          disabled={dashboardLoading || trendsLoading || invoicesLoading}
        >
          ធ្វើឱ្យស្រស់
        </Button>
      </div>

      {!contract && (
        <Alert
          variant="warning"
          title="គ្មានកិច្ចសន្យាសកម្ម"
          description="ព័ត៌មានការទូទាត់ និងការប្រើប្រាស់នឹងបង្ហាញនៅពេលអ្នកត្រូវបានចាត់តាំងទៅកិច្ចសន្យាជួល។"
        />
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Select
            label="រយៈពេល (Date Range)"
            options={DATE_RANGE_OPTIONS}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
        </div>
        {dateRange === 'custom' && (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="w-full sm:w-56">
              <Input
                type="month"
                label="ពី (From)"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-56">
              <Input
                type="month"
                label="ដល់ (To)"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            សម្អាត
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          icon={<Wallet className="h-4 w-4" />}
          label="ចំនួនបានបង់ទាំងអស់"
          value={formatCompactCurrency(financial?.totalPaid)}
          countUpValue={financial?.totalPaid}
          formatter={formatCompactCurrency}
          sub={`${financial?.paidInvoices || 0} វិក្កយបត្របានបង់រួច`}
          highlight={Number(financial?.totalPaid || 0) > 0}
        />
        <SummaryCard
          icon={<Receipt className="h-4 w-4" />}
          label="ចំនួនត្រូវបង់សរុប"
          value={formatCompactCurrency(financial?.currentDue)}
          countUpValue={financial?.currentDue}
          formatter={formatCompactCurrency}
          sub={`${financial?.unpaidInvoices || 0} វិក្កយបត្រមិនទាន់បង់`}
          highlight={Number(financial?.currentDue || 0) > 0}
        />
        <SummaryCard
          icon={<Hourglass className="h-4 w-4" />}
          label="វិក្កយបត្រហួសកំណត់"
          value={`${financial?.overdueInvoices || 0}`}
          countUpValue={financial?.overdueInvoices}
          sub="ត្រូវទូទាត់ឱ្យបានឆាប់"
          highlight={Number(financial?.overdueInvoices || 0) > 0}
        />
        <SummaryCard
          icon={<Droplets className="h-4 w-4" />}
          label="ប្រើប្រាស់ទឹក (ខែចុងក្រោយ)"
          countUpValue={waterLast?.usage}
          formatter={formatNumber}
          suffix={waterLast ? ` ${waterLast.unit || 'm\u00B3'}` : ''}
          value={
            waterLast
              ? `${formatNumber(waterLast.usage)} ${waterLast.unit || 'm³'}`
              : '—'
          }
          sub={waterLast ? formatMonth(waterLast.month) : 'គ្មានទិន្នន័យ'}
        />
        <SummaryCard
          icon={<Zap className="h-4 w-4" />}
          label="ប្រើប្រាស់ភ្លើង (ខែចុងក្រោយ)"
          countUpValue={electricityLast?.usage}
          formatter={formatNumber}
          suffix={electricityLast ? ` ${electricityLast.unit || 'kWh'}` : ''}
          value={
            electricityLast
              ? `${formatNumber(electricityLast.usage)} ${electricityLast.unit || 'kWh'}`
              : '—'
          }
          sub={electricityLast ? formatMonth(electricityLast.month) : 'គ្មានទិន្នន័យ'}
        />
      </div>

      {/* House / Room / Contract */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="ផ្ទះ និងបន្ទប់" description={room ? 'ព័ត៌មានបន្ទប់ជួលបច្ចុប្បន្នរបស់អ្នក' : 'មិនមានបន្ទប់'}>
          {room ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{room.houseName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">អគារ / ផ្ទះ</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                  <DoorOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {room.roomName || `បន្ទប់ ${room.roomNumber}`}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    លេខបន្ទប់: {room.roomNumber}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={DoorOpen}
              title="គ្មានបន្ទប់"
              description="មិនមានព័ត៌មានបន្ទប់សម្រាប់ពេលនេះទេ។"
            />
          )}
        </Card>

        <Card title="កិច្ចសន្យាជួល" description={contract ? `លេខកិច្ចសន្យា: ${contract.contractNumber}` : 'មិនមានកិច្ចសន្យា'}>
          {contract ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">ថ្លៃជួលប្រចាំខែ</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(contract.monthlyRent)}
                  </p>
                </div>
                <Badge variant={contract.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {contract.status || 'N/A'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>
                    {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                  </span>
                </div>
                {contract.dueDay && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>ថ្ងៃកំណត់បង់: ថ្ងៃទី {contract.dueDay} នៃរៀងរាល់ខែ</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Hourglass}
              title="គ្មានកិច្ចសន្យាសកម្ម"
              description="នៅពេលអ្នកមានកិច្ចសន្យាជួល ព័ត៌មាននឹងបង្ហាញនៅទីនេះ។"
            />
          )}
        </Card>
      </div>

      {/* Usage & Payment Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="ការប្រើប្រាស់ទឹក និងភ្លើង"
          description={`ប្រវត្តិការប្រើប្រាស់តាមខែ (${RANGE_LABELS[dateRange] || ''})`}
        >
          {trendsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : trendsError ? (
            <EmptyState
              icon={AlertCircle}
              title="មិនអាចផ្ទុកទិន្នន័យបានទេ"
              description={trendsError}
            />
          ) : usageChartData.length === 0 ? (
            <EmptyState
              icon={Droplets}
              title="គ្មានទិន្នន័យប្រើប្រាស់"
              description="មិនទាន់មានការអានម៉ែត្រទឹក ឬភ្លើងនៅឡើយទេ។"
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageChartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--app-primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--app-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="electricityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--app-secondary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--app-secondary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="water"
                    name="ទឹក"
                    stroke="var(--app-primary)"
                    fill="url(#waterGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="electricity"
                    name="ភ្លើង"
                    stroke="var(--app-secondary)"
                    fill="url(#electricityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          title="ប្រវត្តិនៃការបង់ប្រាក់"
          description="ចំនួនទឹកប្រាក់ដែលបានទូទាត់តាមខែ"
        >
          {trendsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : trendsError ? (
            <EmptyState
              icon={AlertCircle}
              title="មិនអាចផ្ទុកទិន្នន័យបានទេ"
              description={trendsError}
            />
          ) : paymentChartData.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="គ្មានប្រវត្តិការបង់ប្រាក់"
              description="មិនទាន់មានការទូទាត់នៅឡើយទេ។"
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentChartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" name="ចំនួនទឹកប្រាក់" radius={[6, 6, 0, 0]}>
                    {paymentChartData.map((entry, index) => (
                      <Cell key={index} fill={PAYMENT_STATUS_COLORS[entry.status] || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card
        title="វិក្កយបត្រថ្មីៗ"
        description="ចុចលើវិក្កយបត្រដើម្បីមើលព័ត៌មានលម្អិត"
        footer={
          <div className="flex justify-end">
            <Pagination
              currentPage={pageData.page + 1}
              totalPages={pageData.totalPages || 1}
              onPageChange={(p) => setPage(p - 1)}
              disabled={invoicesLoading}
            />
          </div>
        }
      >
        {invoicesError && (
          <Alert variant="danger" title="មិនអាចទាញយកវិក្កយបត្របានទេ" description={invoicesError} className="mb-4" />
        )}
        <Table
          columns={[
            { header: 'លេខវិក្កយបត្រ', accessor: 'invoiceNo', cellClassName: 'font-mono font-semibold' },
            { header: 'ខែគិតថ្លៃ', render: (row) => formatMonth(row.billingMonth) },
            {
              header: 'ចំនួនទឹកប្រាក់',
              render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(row.total)}</span>,
            },
            { header: 'ស្ថានភាព', render: (row) => { const cfg = invoiceStatus(row.status); return <Badge variant={cfg.variant}>{cfg.label}</Badge>; } },
            { header: 'ថ្ងៃកំណត់', render: (row) => formatDate(row.dueDate) },
          ]}
          data={invoices}
          loading={invoicesLoading}
          emptyMessage="គ្មានវិក្កយបត្រ"
          onRowClick={(row) => navigate(`/tenant/invoices/${row.id}`)}
        />
      </Card>
    </div>
  );
}
