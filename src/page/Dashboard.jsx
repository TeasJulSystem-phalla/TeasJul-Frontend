// src/page/Dashboard.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  DoorOpen,
  Users,
  Wallet,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Wrench,
  BarChart3,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Alert, Button, Card, EmptyState, Select, Input, Skeleton } from '../components/ui/index.js';
import RevenueTrendChart from '../components/charts/RevenueTrendChart';
import { useHouses } from '../hooks/useHouses.js';
import { useOwnerDashboard } from '../hooks/useOwnerDashboard.js';
import { formatCompactCurrency, formatCurrency, formatMonth } from '../utils/format';

const PAYMENT_STATUS_COLORS = {
  PAID: '#059669',
  PARTIAL: '#0ea5e9',
  PENDING: '#f59e0b',
  OVERDUE: '#dc2626',
  CANCELLED: '#6b7280',
  DRAFT: '#94a3b8',
};

const PAYMENT_STATUS_LABELS = {
  PAID: 'បានបង់',
  PARTIAL: 'បង់មួយផ្នែក',
  PENDING: 'កំពុងរង់ចាំ',
  OVERDUE: 'ហួសកំណត់',
  CANCELLED: 'បានលុប',
  DRAFT: 'ព្រាង',
};

const ROOM_STATUS_COLORS = {
  OCCUPIED: '#059669',
  AVAILABLE: '#0ea5e9',
  MAINTENANCE: '#f59e0b',
};

const ROOM_STATUS_LABELS = {
  OCCUPIED: 'កាន់កាប់',
  AVAILABLE: 'ទំនេរ',
  MAINTENANCE: 'ជួសជុល',
};

const MAINTENANCE_STATUS_COLORS = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#0ea5e9',
  RESOLVED: '#059669',
  CANCELLED: '#6b7280',
};

const MAINTENANCE_STATUS_LABELS = {
  PENDING: 'កំពុងរង់ចាំ',
  IN_PROGRESS: 'កំពុងដំណើរការ',
  RESOLVED: 'បានដោះស្រាយ',
  CANCELLED: 'បានលុប',
};

const PAYMENT_STATUS_BADGE = {
  PAID: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  PENDING: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  OVERDUE: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  PARTIAL: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  CANCELLED: 'bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400',
};

const ACTIVITY_ICONS = {
  PAYMENT: Wallet,
  MAINTENANCE: Wrench,
};

const DATE_RANGE_OPTIONS = [
  { value: 'this-month', label: 'ខែនេះ (This Month)' },
  { value: 'last-month', label: 'ខែមុន (Last Month)' },
  { value: 'last-3-months', label: '៣ ខែចុងក្រោយ (Last 3 Months)' },
  { value: 'last-6-months', label: '៦ ខែចុងក្រោយ (Last 6 Months)' },
  { value: 'this-year', label: 'ឆ្នាំនេះ (This Year)' },
  { value: 'custom', label: 'ផ្ទាល់ខ្លួន (Custom)' },
];

const toDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const KpiCard = ({ label, value, sub, icon: Icon, accent }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md hover:shadow-slate-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-black/20">
    <div className="flex items-start justify-between">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          accent || 'bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
    </div>
    <p className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">{value}</p>
    <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{label}</p>
    {sub && <p className="mt-2 text-[12px] font-medium text-slate-400 dark:text-slate-500">{sub}</p>}
  </div>
);

const chartTooltipStyle = {
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  background: '#ffffff',
  fontSize: '12px',
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'ឥឡូវនេះ';
  if (diffMin < 60) return `${diffMin}នាទីមុន`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}ម៉ោងមុន`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}ថ្ងៃមុន`;
  return date.toLocaleDateString('en-CA');
};

export default function Dashboard() {
  const { houses, loading: housesLoading } = useHouses();
  const { dashboard, loading, error, fetchDashboard } = useOwnerDashboard();

  const [houseId, setHouseId] = useState('');
  const [dateRange, setDateRange] = useState('this-month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const houseOptions = useMemo(
    () => [
      { value: '', label: 'អចលនទ្រព្យទាំងអស់ (All Houses)' },
      ...houses.map((h) => ({ value: String(h.id), label: h.name || `អចលនទ្រព្យ #${h.id}` })),
    ],
    [houses]
  );

  const computeRange = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    switch (dateRange) {
      case 'this-month':
        return { fromDate: toDateString(new Date(y, m, 1)), toDate: toDateString(now) };
      case 'last-month':
        return {
          fromDate: toDateString(new Date(y, m - 1, 1)),
          toDate: toDateString(new Date(y, m, 0)),
        };
      case 'last-3-months':
        return { fromDate: toDateString(new Date(y, m - 2, 1)), toDate: toDateString(now) };
      case 'last-6-months':
        return { fromDate: toDateString(new Date(y, m - 5, 1)), toDate: toDateString(now) };
      case 'this-year':
        return { fromDate: `${y}-01-01`, toDate: toDateString(now) };
      case 'custom':
        return customFrom && customTo ? { fromDate: customFrom, toDate: customTo } : null;
      default:
        return null;
    }
  }, [customFrom, customTo, dateRange]);

  useEffect(() => {
    const range = computeRange();
    if (dateRange === 'custom' && !range) return;
    fetchDashboard({
      houseId: houseId || undefined,
      ...range,
    });
  }, [houseId, dateRange, customFrom, customTo, computeRange, fetchDashboard]);

  const clearFilters = () => {
    setHouseId('');
    setDateRange('this-month');
    setCustomFrom('');
    setCustomTo('');
  };

  const kpis = dashboard?.kpis;
  const revenueTrend = useMemo(
    () =>
      (dashboard?.revenueTrend || []).map((p) => ({
        ...p,
        label: formatMonth(p.month),
        amount: Number(p.amount || 0),
      })),
    [dashboard]
  );

  const roomOccupancy = dashboard?.roomOccupancy || [];
  const paymentStatusData = (dashboard?.paymentStatus || []).map((s) => ({
    name: PAYMENT_STATUS_LABELS[s.status] || s.status,
    status: s.status,
    count: Number(s.count || 0),
  }));
  const maintenanceStatusData = (dashboard?.maintenanceStatus || []).map((s) => ({
    name: MAINTENANCE_STATUS_LABELS[s.status] || s.status,
    status: s.status,
    count: Number(s.count || 0),
  }));
  const revenueByHouse = (dashboard?.revenueByHouse || []).map((p) => ({
    name: p.houseName,
    revenue: Number(p.revenue || 0),
  }));
  const topHouses = dashboard?.topHouses || [];
  const recentPayments = dashboard?.recentPayments || [];
  const recentActivities = dashboard?.recentActivities || [];

  const hasRevenueData = revenueTrend.some((d) => d.amount > 0);
  const hasPaymentData = paymentStatusData.some((d) => d.count > 0);
  const hasOccupancyData = roomOccupancy.some(
    (d) => d.occupied > 0 || d.available > 0 || d.maintenance > 0
  );
  const hasMaintenanceData = maintenanceStatusData.some((d) => d.count > 0);
  const hasRevenueByHouse = revenueByHouse.length > 0;

  const chartLoading = loading && !dashboard;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            ផ្ទាំងគ្រប់គ្រង (Dashboard)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ទិដ្ឋភាពទូទៅនៃអចលនទ្រព្យ បន្ទប់ ចំណូល និងការទូទាត់
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() =>
            fetchDashboard({
              houseId: houseId || undefined,
              ...computeRange(),
            })
          }
          disabled={loading}
        >
          ធ្វើឱ្យស្រស់
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Select
            label="អចលនទ្រព្យ (House)"
            options={houseOptions}
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            placeholder="អចលនទ្រព្យទាំងអស់ (All Houses)"
            disabled={housesLoading}
          />
          <Select
            label="រយៈពេល (Date Range)"
            options={DATE_RANGE_OPTIONS}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
          <div />
        </div>
        {dateRange === 'custom' && (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="w-full sm:w-56">
              <Input
                type="date"
                label="ពី (From)"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-56">
              <Input
                type="date"
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

      {error && (
        <Alert
          variant="danger"
          title="កំហុសក្នុងការផ្ទុកផ្ទាំងគ្រប់គ្រង"
          description={error}
        >
          <Button
            size="sm"
            className="mt-3"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() =>
              fetchDashboard({
                houseId: houseId || undefined,
                ...computeRange(),
              })
            }
          >
            ព្យាយាមម្តងទៀត
          </Button>
        </Alert>
      )}

      {chartLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <Skeleton className="h-72 xl:col-span-2" />
            <Skeleton className="h-72" />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : !dashboard ? null : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
            <KpiCard
              label="អចលនទ្រព្យ (Houses)"
              value={kpis.totalHouses}
              icon={Building2}
              accent="bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300"
            />
            <KpiCard
              label="បន្ទប់សរុប (Rooms)"
              value={kpis.totalRooms}
              icon={DoorOpen}
              accent="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
            />
            <KpiCard
              label="អ្នកជួលសកម្ម (Active Tenants)"
              value={kpis.totalActiveTenants}
              icon={Users}
              accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />
            <KpiCard
              label="អត្រាកាន់កាប់ (Occupancy)"
              value={`${kpis.occupancyRate}%`}
              icon={TrendingUp}
              accent="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
            />
            <KpiCard
              label="ចំណូល (Revenue)"
              value={formatCompactCurrency(kpis.totalRevenue)}
              sub={formatCurrency(kpis.totalRevenue)}
              icon={Wallet}
              accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
            <KpiCard
              label="ហួសកំណត់ (Overdue)"
              value={formatCompactCurrency(kpis.overdueAmount)}
              sub={formatCurrency(kpis.overdueAmount)}
              icon={AlertCircle}
              accent="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            />
            <KpiCard
              label="ជួសជុលបើក (Open Maintenance)"
              value={kpis.openMaintenanceRequests}
              icon={Wrench}
              accent="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
            />
          </div>

          {/* Revenue Trend + Payment Status */}
          <div className="grid gap-6 xl:grid-cols-3">
            <Card
              className="xl:col-span-2"
              title="និន្នាការចំណូល (Revenue Trend)"
              description="ចំនួនទឹកប្រាក់ដែលបានទទួលតាមខែ"
            >
              {!hasRevenueData ? (
                <EmptyState
                  icon={Wallet}
                  title="គ្មានទិន្នន័យចំណូល"
                  description="មិនមានការទូទាត់ត្រូវបានទទួលក្នុងរយៈពេលនេះទេ។"
                />
              ) : (
                <RevenueTrendChart data={revenueTrend} />
              )}
            </Card>

            <Card
              title="ស្ថានភាពបង់ប្រាក់ (Payment Status)"
              description="វិក្កយបត្រតាមស្ថានភាព"
            >
              {!hasPaymentData ? (
                <EmptyState
                  icon={AlertCircle}
                  title="គ្មានទិន្នន័យ"
                  description="មិនមានវិក្កយបត្រក្នុងរយៈពេលនេះទេ។"
                />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {paymentStatusData.map((entry) => (
                          <Cell key={entry.status} fill={PAYMENT_STATUS_COLORS[entry.status] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Revenue by House + Room Occupancy */}
          <div className="grid gap-6 xl:grid-cols-2">
            <Card
              title="ចំណូលតាមអចលនទ្រព្យ (Revenue by House)"
              description="ចំនួនទឹកប្រាក់ដែលបានទទួលពីអចលនទ្រព្យនីមួយៗ"
            >
              {!hasRevenueByHouse ? (
                <EmptyState
                  icon={BarChart3}
                  title="គ្មានទិន្នន័យ"
                  description="មិនមានចំណូលពីអចលនទ្រព្យណាមួយទេ។"
                />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByHouse} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        formatter={(value) => [formatCurrency(value), 'ចំណូល']}
                      />
                      <Bar dataKey="revenue" name="ចំណូល" radius={[4, 4, 0, 0]}>
                        {revenueByHouse.map((_, i) => (
                          <Cell key={i} fill={['#7c3aed', '#0ea5e9', '#059669', '#f59e0b', '#ec4899'][i % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card
              title="ការកាន់កាប់បន្ទប់ (Room Occupancy)"
              description="ចំនួនបន្ទប់តាមស្ថានភាព"
            >
              {!hasOccupancyData ? (
                <EmptyState
                  icon={DoorOpen}
                  title="គ្មានទិន្នន័យ"
                  description="មិនមានបន្ទប់ក្នុងរយៈពេលនេះទេ។"
                />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roomOccupancy} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                      <Legend />
                      <Bar dataKey="occupied" name={ROOM_STATUS_LABELS.OCCUPIED} fill={ROOM_STATUS_COLORS.OCCUPIED} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="available" name={ROOM_STATUS_LABELS.AVAILABLE} fill={ROOM_STATUS_COLORS.AVAILABLE} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="maintenance" name={ROOM_STATUS_LABELS.MAINTENANCE} fill={ROOM_STATUS_COLORS.MAINTENANCE} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Maintenance Status */}
          <Card
            title="ស្ថានភាពការជួសជុល (Maintenance Status)"
            description="ការស្នើសុំជួសជុលតាមស្ថានភាព"
          >
            {!hasMaintenanceData ? (
              <EmptyState
                icon={Wrench}
                title="គ្មានទិន្នន័យ"
                description="មិនមានការស្នើសុំជួសជុលទេ។"
              />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceStatusData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                    <Bar dataKey="count" name="ចំនួន" radius={[4, 4, 0, 0]}>
                      {maintenanceStatusData.map((entry) => (
                        <Cell key={entry.status} fill={MAINTENANCE_STATUS_COLORS[entry.status] || '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Top Performing Houses */}
          {topHouses.length > 0 && (
            <Card
              title="អចលនទ្រព្យកំពុងដំណើរការល្អ (Top Performing Houses)"
              description="អចលនទ្រព្យដែលមានចំណូលខ្ពស់បំផុត"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-400 dark:border-gray-800 dark:bg-gray-800/60 dark:text-slate-500">
                      <th className="px-5 py-3 font-semibold">អចលនទ្រព្យ</th>
                      <th className="px-5 py-3 font-semibold text-right">បន្ទប់សរុប</th>
                      <th className="px-5 py-3 font-semibold text-right">អត្រាកាន់កាប់</th>
                      <th className="px-5 py-3 font-semibold text-right">ចំណូល</th>
                      <th className="px-5 py-3 font-semibold text-right">ហួសកំណត់</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                    {topHouses.map((h, i) => (
                      <tr key={i} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800/60">
                        <td className="px-5 py-3.5 text-[13px] font-medium text-slate-800 dark:text-slate-100">
                          {h.houseName}
                        </td>
                        <td className="px-5 py-3.5 text-right text-[13px] text-slate-500 dark:text-slate-400">
                          {h.totalRooms}
                        </td>
                        <td className="px-5 py-3.5 text-right text-[13px] text-slate-500 dark:text-slate-400">
                          {h.occupancyRate}%
                        </td>
                        <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(h.revenue)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-red-500 dark:text-red-400">
                          {formatCurrency(h.overdueAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Recent Payments + Recent Activities */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Recent Payments */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="px-5 py-4">
                <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                  ការទូទាត់ថ្មីៗ (Recent Payments)
                </h2>
                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  ប្រតិបត្តិការចុងក្រោយពីអ្នកជួល
                </p>
              </div>
              {recentPayments.length === 0 ? (
                <div className="px-5 pb-5">
                  <EmptyState icon={Wallet} title="គ្មានការទូទាត់" description="មិនមានការទូទាត់ថ្មីៗទេ។" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-400 dark:border-gray-800 dark:bg-gray-800/60 dark:text-slate-500">
                        <th className="px-5 py-3 font-semibold">ល.រ</th>
                        <th className="px-5 py-3 font-semibold">អចលនទ្រព្យ</th>
                        <th className="px-5 py-3 font-semibold">បន្ទប់</th>
                        <th className="px-5 py-3 font-semibold text-right">ចំនួនទឹកប្រាក់</th>
                        <th className="px-5 py-3 font-semibold">កាលបរិច្ឆេទ</th>
                        <th className="px-5 py-3 font-semibold">ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                      {recentPayments.map((p) => (
                        <tr key={p.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800/60">
                          <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400">
                            {p.paymentNo}
                          </td>
                          <td className="px-5 py-3.5 text-[13px] font-medium text-slate-800 dark:text-slate-100">
                            {p.houseName || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400">
                            {p.roomNumber || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400">
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-CA') : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${
                                PAYMENT_STATUS_BADGE[p.status] || 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              {PAYMENT_STATUS_LABELS[p.status] || p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="px-5 py-4">
                <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                  សកម្មភាពថ្មីៗ (Recent Activities)
                </h2>
                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  សកម្មភាពចុងក្រោយក្នុងប្រព័ន្ធ
                </p>
              </div>
              {recentActivities.length === 0 ? (
                <div className="px-5 pb-5">
                  <EmptyState icon={Clock} title="គ្មានសកម្មភាព" description="មិនមានសកម្មភាពថ្មីៗទេ។" />
                </div>
              ) : (
                <div className="divide-y divide-slate-50 px-5 dark:divide-gray-800">
                  {recentActivities.map((a, i) => {
                    const Icon = ACTIVITY_ICONS[a.type] || Clock;
                    return (
                      <div key={i} className="flex items-start gap-3 py-3.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100">
                            {a.description}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-[12px] text-slate-400 dark:text-slate-500">
                            {a.houseName && <span>{a.houseName}</span>}
                            <span>{formatTimeAgo(a.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {housesLoading && !houses.length && (
        <div className="flex items-center justify-center py-10 text-sm text-slate-400">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          កំពុងផ្ទុកអចលនទ្រព្យ...
        </div>
      )}
    </div>
  );
}
