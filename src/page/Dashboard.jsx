// src/page/Dashboard.jsx
import {
  Building2,
  Users,
  FileText,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreHorizontal,
} from 'lucide-react';

const STATS = [
  { label: 'អចលនទ្រព្យសរុប', value: '24', change: '+2 ក្នុងខែនេះ', up: true, icon: Building2, color: 'gray' },
  { label: 'អ្នកជួលសកម្ម', value: '138', change: '+8 ក្នុងខែនេះ', up: true, icon: Users, color: 'emerald' },
  { label: 'កិច្ចសន្យាសកម្ម', value: '86', change: '-4 ផុតកំណត់ឆាប់ៗ', up: false, icon: FileText, color: 'amber' },
  { label: 'ចំណូលប្រចាំខែ', value: '$48,200', change: '+12.4% ធៀបនឹងខែមុន', up: true, icon: Wallet, color: 'violet' },
];

const COLOR_MAP = {
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
};

const RECENT_PAYMENTS = [
  { tenant: 'John Doe', unit: 'Apartment 4B', amount: '$1,250', date: 'Aug 15, 2026', status: 'បានបង់' },
  { tenant: 'Sarah Mitchell', unit: 'Building 2 · Unit 12', amount: '$980', date: 'Aug 15, 2026', status: 'បានបង់' },
  { tenant: 'Robert Chen', unit: 'Studio 7A', amount: '$1,100', date: 'Aug 14, 2026', status: 'កំពុងរង់ចាំ' },
  { tenant: 'Emily Watson', unit: 'Loft 9C', amount: '$1,450', date: 'Aug 13, 2026', status: 'បានបង់' },
  { tenant: 'Michael Brown', unit: 'Building 1 · Unit 3', amount: '$875', date: 'Aug 12, 2026', status: 'ហួសកំណត់' },
];

const STATUS_STYLE = {
  'បានបង់': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  'កំពុងរង់ចាំ': 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  'ហួសកំណត់': 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

const cardClass =
  'rounded-xl border border-slate-200 bg-white transition-shadow dark:border-gray-800 dark:bg-gray-900';

const occupancyBars = [68, 74, 72, 80, 78, 86, 84, 90, 88, 92, 94, 96];

const PageHeader = () => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">ផ្ទាំងគ្រប់គ្រង</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        ស្វាគមន៍មកកាន់វិញ Alex។ នេះជាអ្វីដែលកំពុងកើតឡើងនាថ្ងៃនេះ។
      </p>
    </div>
    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-gray-800/20 transition-colors hover:bg-gray-900 dark:bg-white dark:text-gray-900 dark:shadow-none dark:hover:bg-slate-200">
      <Plus className="h-4 w-4" />
      បន្ថែមអចលនទ្រព្យ
    </button>
  </div>
);

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  return (
    <div className={`${cardClass} p-5 hover:shadow-md hover:shadow-slate-900/5 dark:hover:shadow-black/20`}>
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${COLOR_MAP[stat.color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <MoreHorizontal className="h-4 w-4 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">{stat.value}</p>
      <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{stat.label}</p>
      <p
        className={`mt-2 inline-flex items-center gap-1 text-[12px] font-medium ${
          stat.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
        }`}
      >
        {stat.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {stat.change}
      </p>
    </div>
  );
};

const OccupancyCard = () => (
  <div className={`${cardClass} p-5`}>
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">អត្រាកាន់កាប់</h2>
        <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
          ការកាន់កាប់ប្រចាំខែនៅទូទាំងអចលនទ្រព្យទាំងអស់
        </p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        <TrendingUp className="h-3.5 w-3.5" />
        94%
      </span>
    </div>
    <div className="mt-5 flex h-40 items-end gap-2">
      {occupancyBars.map((value, i) => (
        <div key={i} className="group relative flex-1">
          <div
            className="w-full rounded-t-md bg-gray-200 transition-colors hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
            style={{ height: `${value}%` }}
          />
        </div>
      ))}
    </div>
    <div className="mt-3 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
      <span>មករា</span>
      <span>មេសា</span>
      <span>កក្កដា</span>
      <span>តុលា</span>
      <span>ធ្នូ</span>
    </div>
  </div>
);

const RecentPaymentsCard = () => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">ការទូទាត់ថ្មីៗ</h2>
        <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">ប្រតិបត្តិការចុងក្រោយពីអ្នកជួល</p>
      </div>
      <button className="text-[13px] font-medium text-gray-800 transition-colors hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
        មើលទាំងអស់
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-400 dark:border-gray-800 dark:bg-gray-800/60 dark:text-slate-500">
            <th className="px-5 py-3 font-semibold">អ្នកជួល</th>
            <th className="px-5 py-3 font-semibold">ឯកតា</th>
            <th className="px-5 py-3 font-semibold">ចំនួនទឹកប្រាក់</th>
            <th className="px-5 py-3 font-semibold">កាលបរិច្ឆេទ</th>
            <th className="px-5 py-3 font-semibold">ស្ថានភាព</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
          {RECENT_PAYMENTS.map((p) => (
            <tr key={p.tenant} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800/60">
              <td className="px-5 py-3.5 text-[13px] font-medium text-slate-800 dark:text-slate-100">{p.tenant}</td>
              <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400">{p.unit}</td>
              <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800 dark:text-slate-100">{p.amount}</td>
              <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400">{p.date}</td>
              <td className="px-5 py-3.5">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${STATUS_STYLE[p.status]}`}>
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <OccupancyCard />
        </div>
        <div className="xl:col-span-3">
          <RecentPaymentsCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
