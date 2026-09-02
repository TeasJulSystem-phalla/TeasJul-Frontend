// src/page/tenant/TenantPaymentsPage.jsx
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Wallet, BadgeCheck, Hourglass, ArrowLeft } from 'lucide-react';
import { useTenantProfile } from '../../hooks/useTenantProfile';
import {
  Alert,
  Badge,
  Button,
  Card,
  Skeleton,
} from '../../components/ui/index.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);

const InfoItem = ({ icon, label, value, highlight }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p className={`truncate text-sm font-semibold ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
        {value}
      </p>
    </div>
  </div>
);

export default function TenantPaymentsPage() {
  const navigate = useNavigate();
  const { profile, loading, error, fetchProfile } = useTenantProfile();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Alert
        variant="danger"
        title="កំហុស"
        description={error || 'មិនអាចផ្ទុកព័ត៌មានបានទេ។'}
      >
        <Button size="sm" className="mt-3" onClick={fetchProfile}>ព្យាយាមម្តងទៀត</Button>
      </Alert>
    );
  }

  const contract = profile.contract;

  if (!contract) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Hourglass className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-800 dark:text-white">
              គ្មានកិច្ចសន្យាសកម្ម
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              ព័ត៌មានការទូទាត់នឹងបង្ហាញនៅពេលអ្នកត្រូវបានចាត់តាំងទៅកិច្ចសន្យាជួល។
            </p>
            <Button className="mt-6" variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/tenant')}>
              ត្រឡប់ទៅទំព័រដើម
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const depositPaid = Number(contract.depositPaidAmount || 0);
  const depositTotal = Number(contract.securityDeposit || 0);
  const depositRatio = depositTotal > 0 ? Math.min(100, Math.round((depositPaid / depositTotal) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">ការទូទាត់</h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            ថ្លៃជួល និងប្រាក់កក់របស់អ្នកសម្រាប់ {contract.contractNo}។
          </p>
        </div>
        <Badge variant="success">ACTIVE</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="ថ្លៃជួលរៀងរាល់ខែ" description={`លេខកិច្ចសន្យា: ${contract.contractNo}`}>
          <div className="space-y-4">
            <InfoItem
              icon={<Wallet className="h-4 w-4" />}
              label="ថ្លៃជួល"
              value={formatCurrency(contract.monthlyRent)}
              highlight
            />
            <InfoItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="ថ្ងៃកំណត់បង់"
              value={`ថ្ងៃទី ${contract.dueDay} នៃរៀងរាល់ខែ`}
            />
            <InfoItem
              icon={<Wallet className="h-4 w-4" />}
              label="ថ្លៃជួលក្នុងមួយឆ្នាំ"
              value={formatCurrency(contract.monthlyRent * 12)}
            />
          </div>
        </Card>

        <Card title="ប្រាក់កក់" description="ស្ថានភាពប្រាក់កក់របស់កិច្ចសន្យា">
          <div className="space-y-4">
            <InfoItem
              icon={<BadgeCheck className="h-4 w-4" />}
              label="ប្រាក់កក់សរុប"
              value={formatCurrency(depositTotal)}
            />
            <InfoItem
              icon={<Wallet className="h-4 w-4" />}
              label="បានបង់រួច"
              value={formatCurrency(depositPaid)}
            />
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400 dark:text-slate-500">ការបង់ប្រាក់កក់</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{depositRatio}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${depositRatio}%` }}
                />
              </div>
              <div className="mt-2">
                {contract.depositFullyPaid ? (
                  <Badge variant="success">បានបង់ពេញ</Badge>
                ) : (
                  <Badge variant="warning">បង់មិនទាន់ពេញ</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Alert
        variant="info"
        title="ការទូទាត់តាមអនឡាញ"
        description="បច្ចុប្បន្នការបង់ប្រាក់តាមអនឡាញកំពុងត្រូវបានអភិវឌ្ឍន៍។ សូមទាក់ទងម្ចាស់ផ្ទះ ឬអ្នកគ្រប់គ្រងដើម្បីបង់ប្រាក់ជួល។"
      />
    </div>
  );
}