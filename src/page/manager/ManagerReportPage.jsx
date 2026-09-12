// src/page/manager/ManagerReportPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  AlertCircle,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarRange,
  ClipboardCheck,
  ClipboardX,
  DoorOpen,
  FileBarChart,
  FileDown,
  HandCoins,
  Percent,
  RefreshCw,
  RotateCcw,
  ScrollText,
  TrendingUp,
  Wallet,
  Wrench,
  Zap,
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
import { Alert, Button, Card, CountUp, EmptyState, Select, Skeleton } from '../../components/ui/index.js';
import RevenueTrendChart from '../../components/charts/RevenueTrendChart';
import { useHouses } from '../../hooks/useHouses.js';
import { useManagerReport } from '../../hooks/useManagerReport.js';
import { formatCurrency, formatMonth } from '../../utils/format';
import { registerPdfFonts } from '../../utils/pdfFonts';
import ManagerReportPdfDocument from './ManagerReportPdfDocument.jsx';

const MONTH_NAMES = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
];

const yearOptions = () => {
  const current = new Date().getFullYear();
  return Array.from({ length: current - 2019 }, (_, i) => current - i).map((y) => ({
    value: String(y),
    label: `${y} (ឆ្នាំ ${y})`,
  }));
};

const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({
  value: String(i + 1),
  label: `${name} (${new Date(0, i).toLocaleDateString('en-US', { month: 'long' })})`,
}));

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

const chartTooltipStyle = {
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  background: '#ffffff',
  fontSize: '12px',
};

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3">
    <h2 className="text-base font-semibold text-slate-800 dark:text-white">{children}</h2>
    <div className="h-px flex-1 bg-slate-200 dark:bg-gray-800" />
  </div>
);

const KpiCard = ({ label, value, sub, icon: Icon, accent, formatter, suffix }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md hover:shadow-slate-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-black/20">
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
        accent || 'bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400'
      }`}
    >
      <Icon className="h-5 w-5" />
    </span>
    <p className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">
      <CountUp value={value} formatter={formatter} suffix={suffix} />
    </p>
    <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{label}</p>
    {sub && <p className="mt-2 text-[12px] font-medium text-slate-400 dark:text-slate-500">{sub}</p>}
  </div>
);

const StatPanel = ({ icon: Icon, title, rows }) => (
  <Card title={title}>
    <div className="divide-y divide-slate-100 dark:divide-gray-800">
      {rows.map(([label, value, accent, options]) => (
        <div key={label} className="flex items-center justify-between gap-3 py-2.5">
          <span className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </span>
          <span
            className={`text-[13px] font-semibold ${
              accent || 'text-slate-800 dark:text-white'
            }`}
          >
            {typeof value === 'number' ? <CountUp value={value} {...options} /> : value}
          </span>
        </div>
      ))}
    </div>
  </Card>
);

export default function ManagerReportPage() {
  const { houses, loading: housesLoading } = useHouses();
  const { report, loading, error, fetchReport } = useManagerReport();

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [houseId, setHouseId] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const houseOptions = useMemo(
    () => [
      { value: '', label: 'អចលនទ្រព្យទាំងអស់ (All Houses)' },
      ...houses.map((h) => ({ value: String(h.id), label: h.name || `អចលនទ្រព្យ #${h.id}` })),
    ],
    [houses]
  );

  const years = useMemo(() => yearOptions(), []);

  const generate = useCallback(
    () => fetchReport({ year: Number(year), month: Number(month), houseId: houseId || undefined }),
    [fetchReport, year, month, houseId]
  );

  useEffect(() => {
    if (!housesLoading) generate();
  }, [generate, housesLoading]);

  const clearFilters = () => {
    setYear(String(new Date().getFullYear()));
    setMonth(String(new Date().getMonth() + 1));
    setHouseId('');
  };

  const handleDownloadPdf = async () => {
    if (!report || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      registerPdfFonts();
      const instance = pdf(<ManagerReportPdfDocument report={report} />);
      const blob = await instance.toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `របាយការណ៍_${year}-${String(month).padStart(2, '0')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report PDF download failed:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const revenueTrend = useMemo(
    () =>
      (report?.revenueTrend || []).map((p) => ({
        ...p,
        label: formatMonth(p.month),
        amount: Number(p.amount || 0),
      })),
    [report]
  );

  const paymentStatusData = (report?.paymentStatus || []).map((s) => ({
    name: PAYMENT_STATUS_LABELS[s.status] || s.status,
    status: s.status,
    count: Number(s.count || 0),
  }));

  const roomOccupancyData = (report?.roomOccupancy || []).map((s) => ({
    name: s.status,
    status: s.status,
    count: Number(s.count || 0),
  }));

  const maintenanceStatusData = (report?.maintenanceStatus || []).map((s) => ({
    name: MAINTENANCE_STATUS_LABELS[s.status] || s.status,
    status: s.status,
    count: Number(s.count || 0),
  }));

  const fin = report?.financial || {};
  const rooms = report?.rooms || {};
  const contracts = report?.contracts || {};
  const payments = report?.payments || {};
  const utilities = report?.utilities || {};
  const maintenance = report?.maintenance || {};

  const hasRevenueData = revenueTrend.some((d) => d.amount > 0);
  const hasPaymentData = paymentStatusData.some((d) => d.count > 0);
  const hasRoomData = roomOccupancyData.some((d) => d.count > 0);
  const hasMaintenanceData = maintenanceStatusData.some((d) => d.count > 0);
  const hasReport = Boolean(report);
  const chartLoading = loading && !report;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            របាយការណ៍ប្រចាំខែ (Monthly Reports)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            សង្ខេបហិរញ្ញវត្ថុ បន្ទប់ កិច្ចសន្យា ការទូទាត់ និងការជួសជុល
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={generate}
            disabled={loading}
          >
            ធ្វើឱ្យស្រស់
          </Button>
          <Button
            size="sm"
            leftIcon={<FileDown className="h-4 w-4" />}
            onClick={handleDownloadPdf}
            disabled={!hasReport || downloadingPdf}
          >
            {downloadingPdf ? 'កំពុងបង្កើត PDF...' : 'ទាញយក PDF'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label="ឆ្នាំ"
            options={years}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <Select
            label="ខែ"
            options={MONTH_OPTIONS}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <Select
            label="អចលនទ្រព្យ"
            options={houseOptions}
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            placeholder="អចលនទ្រព្យទាំងអស់ (All Houses)"
            disabled={housesLoading}
          />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            សម្អាត
          </Button>
          <Button
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={generate}
            disabled={loading}
          >
            បង្កើតរបាយការណ៍
          </Button>
        </div>
      </Card>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុករបាយការណ៍" description={error}>
          <Button size="sm" className="mt-3" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={generate}>
            ព្យាយាមម្តងទៀត
          </Button>
        </Alert>
      )}

      {chartLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : !hasReport ? (
        <EmptyState
          icon={FileBarChart}
          title="គ្មានរបាយការណ៍"
          description="ជ្រើសរើសរយៈពេល រួចចុចប៊ូតុងបង្កើតរបាយការណ៍ ដើម្បីមើលទិន្នន័យ។"
        />
      ) : (
        <>
          {/* Financial summary */}
          <SectionTitle>សេចក្តីសង្ខេបហិរញ្ញវត្ថុ (Financial Summary)</SectionTitle>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard
              label="ថ្លៃឈ្នួលសរុប (Rent Billed)"
              value={fin.totalRent}
              formatter={formatCurrency}
              icon={FileBarChart}
              accent="bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300"
            />
            <KpiCard
              label="ទទួលបាន (Collected)"
              value={fin.totalPaid}
              formatter={formatCurrency}
              icon={HandCoins}
              accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />
            <KpiCard
              label="នៅសល់ត្រូវបង់ (Outstanding)"
              value={fin.totalOutstanding}
              formatter={formatCurrency}
              icon={AlertCircle}
              accent="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            />
            <KpiCard
              label="ប្រាក់កក់ (Deposits)"
              value={fin.totalDeposits}
              formatter={formatCurrency}
              icon={Wallet}
              accent="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
            />
            <KpiCard
              label="ចំណាយ (Expenses)"
              value={fin.totalExpenses}
              formatter={formatCurrency}
              icon={Wrench}
              accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
            <KpiCard
              label="ចំណូលសុទ្ធ (Net Revenue)"
              value={fin.netRevenue}
              formatter={formatCurrency}
              icon={TrendingUp}
              accent="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
            />
          </div>

          {/* Room status */}
          <SectionTitle>ស្ថានភាពបន្ទប់ (Room Status)</SectionTitle>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="បន្ទប់សរុប (Total)" value={rooms.totalRooms} icon={DoorOpen} />
            <KpiCard
              label="កាន់កាប់ (Occupied)"
              value={rooms.occupiedRooms}
              icon={Building2}
              accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />
            <KpiCard
              label="ទំនេរ (Available)"
              value={rooms.availableRooms}
              icon={BedDouble}
              accent="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
            />
            <KpiCard
              label="បម្រុងទុក (Reserved)"
              value={rooms.reservedRooms}
              icon={CalendarRange}
              accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            />
            <KpiCard
              label="ជួសជុល (Maintenance)"
              value={rooms.maintenanceRooms}
              icon={Wrench}
              accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
            <KpiCard
              label="អត្រាកាន់កាប់ (Occupancy Rate)"
              value={rooms.occupancyRate}
              suffix="%"
              icon={Percent}
              accent="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
            />
          </div>

          {/* Contracts */}
          <SectionTitle>កិច្ចសន្យា (Contracts)</SectionTitle>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <KpiCard label="ថ្មីក្នុងខែ (New)" value={contracts.newContracts} icon={ScrollText} />
            <KpiCard
              label="សកម្ម (Active)"
              value={contracts.activeContracts}
              icon={BadgeCheck}
              accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />
            <KpiCard
              label="បានផុតកំណត់ (Expired)"
              value={contracts.expiredContracts}
              icon={ClipboardX}
              accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
            <KpiCard
              label="បានបញ្ចប់ (Terminated)"
              value={contracts.terminatedContracts}
              icon={ClipboardCheck}
              accent="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            />
            <KpiCard
              label="បានបន្ត (Renewed)"
              value={contracts.renewedContracts}
              icon={RotateCcw}
              accent="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
            />
          </div>

          {/* Payments / Utilities / Maintenance */}
          <SectionTitle>ការទូទាត់ ទឹកភ្លើង និងការជួសជុល (Payments, Utilities & Maintenance)</SectionTitle>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <StatPanel
              icon={HandCoins}
              title="ការទូទាត់ (Payments)"
              rows={[
                ['បានបង់ (Paid)', payments.paidPayments],
                ['កំពុងរង់ចាំ (Pending)', payments.pendingPayments],
                ['ហួសកំណត់ (Overdue)', payments.overduePayments, 'text-red-600 dark:text-red-400'],
                ['ទឹកប្រាក់ទទួលបាន', payments.totalPaymentAmount, 'text-emerald-600 dark:text-emerald-400', { decimals: 2, formatter: formatCurrency }],
              ]}
            />
            <StatPanel
              icon={Zap}
              title="ទឹកភ្លើង (Utilities)"
              rows={[
                ['ទឹកស្អាត (m³)', utilities.totalWaterUsage],
                ['អគ្គិសនី (kWh)', utilities.totalElectricityUsage],
                ['តម្លៃប្រើប្រាស់សរុប', utilities.totalUtilityCharges, undefined, { decimals: 2, formatter: formatCurrency }],
                [
                  'វិក្កយបត្រ បានបង់ / នៅសល់',
                  <>
                    <CountUp value={utilities.paidUtilityBills} /> / <CountUp value={utilities.outstandingUtilityBills} />
                  </>,
                  'text-emerald-600 dark:text-emerald-400',
                ],
              ]}
            />
            <StatPanel
              icon={Wrench}
              title="ការជួសជុល (Maintenance)"
              rows={[
                ['ស្នើសុំសរុប (Total)', maintenance.totalRequests],
                ['កំពុងរង់ចាំ', maintenance.openRequests],
                ['កំពុងដំណើរការ', maintenance.inProgressRequests],
                ['បានដោះស្រាយ', maintenance.completedRequests],
                ['បានលុប', maintenance.cancelledRequests],
                ['ចំណាយសរុប', maintenance.totalCost, 'text-red-600 dark:text-red-400', { decimals: 2, formatter: formatCurrency }],
              ]}
            />
          </div>

          {/* Charts */}
          <SectionTitle>ក្រាហ្វ (Charts)</SectionTitle>
          <div className="grid gap-6 xl:grid-cols-3">
            <Card
              className="xl:col-span-2"
              title="និន្នាការចំណូល ១២ ខែ (Revenue Trend)"
              description="ចំនួនទឹកប្រាក់ដែលបានទទួលតាមខែ"
            >
              {!hasRevenueData ? (
                <EmptyState
                  icon={TrendingUp}
                  title="គ្មានទិន្នន័យចំណូល"
                  description="មិនមានការទូទាត់ត្រូវបានទទួលក្នុងរយៈពេល ១២ ខែនេះទេ។"
                />
              ) : (
                <RevenueTrendChart data={revenueTrend} />
              )}
            </Card>

            <Card
              title="ស្ថានភាពវិក្កយបត្រ (Invoice Status)"
              description="វិក្កយបត្រនៃខែនេះតាមស្ថានភាព"
            >
              {!hasPaymentData ? (
                <EmptyState icon={AlertCircle} title="គ្មានទិន្នន័យ" description="មិនមានវិក្កយបត្រទេ។" />
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

          <div className="grid gap-6 xl:grid-cols-2">
            <Card
              title="ការកាន់កាប់បន្ទប់ (Room Occupancy)"
              description="ចំនួនបន្ទប់តាមស្ថានភាព"
            >
              {!hasRoomData ? (
                <EmptyState icon={DoorOpen} title="គ្មានទិន្នន័យ" description="មិនមានបន្ទប់ទេ។" />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roomOccupancyData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                      <Bar dataKey="count" name="ចំនួន" radius={[4, 4, 0, 0]}>
                        {roomOccupancyData.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={
                              entry.status === 'OCCUPIED'
                                ? '#059669'
                                : entry.status === 'AVAILABLE'
                                  ? '#0ea5e9'
                                  : entry.status === 'MAINTENANCE'
                                    ? '#f59e0b'
                                    : '#8b5cf6'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card
              title="ស្ថានភាពការជួសជុល (Maintenance Status)"
              description="ការស្នើសុំជួសជុលនៃខែនេះតាមស្ថានភាព"
            >
              {!hasMaintenanceData ? (
                <EmptyState icon={Wrench} title="គ្មានទិន្នន័យ" description="មិនមានការស្នើសុំជួសជុលទេ។" />
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
                          <Cell
                            key={entry.status}
                            fill={MAINTENANCE_STATUS_COLORS[entry.status] || '#94a3b8'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
