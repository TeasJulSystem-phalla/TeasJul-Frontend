// src/page/tenant/TenantHomePage.jsx
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  DoorOpen,
  FileText,
  Phone,
  Mail,
  Wrench,
  Wallet,
  Zap,
  UserCircle,
  Hourglass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
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

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-CA') : '—';

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const QuickAction = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="group flex w-full items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
  >
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-slate-800 dark:text-white">{label}</span>
      <span className="block truncate text-xs text-slate-400 dark:text-slate-500">{description}</span>
    </span>
    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
  </button>
);

export default function TenantHomePage() {
  const navigate = useNavigate();
  const { profile, loading, error, fetchProfile } = useTenantProfile();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert
          variant="danger"
          title="កំហុស"
          description={error || 'មិនអាចផ្ទុកព័ត៌មានរបស់អ្នកបានទេ។'}
          dismissible={false}
        />
        <div className="mt-4 text-center">
          <Button onClick={fetchProfile}>ព្យាយាមម្តងទៀត</Button>
        </div>
      </div>
    );
  }

  const tenantCode = profile.tenantCode;
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'អ្នកជួល';
  const [house, room, contract] = [profile.house, profile.room, profile.contract];

  // Awaiting activation screen
  if (profile.status === 'PENDING' || !contract) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">ទំព័រដើម</h1>
          <Badge variant="warning">កំពុងរង់ចាំការដាក់ឱ្យដំណើរការ</Badge>
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Hourglass className="h-8 w-8" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
              សូមស្វាគមន៍, {fullName}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              ប្រវត្តិរបស់អ្នកកំពុងរង់ចាំការដាក់ឱ្យដំណើរការ។ ម្ចាស់ផ្ទះ ឬអ្នកគ្រប់គ្រង
              នឹងចាត់តាំងអ្នកទៅកាន់កិច្ចសន្យាជួលមួយ បន្ទាប់ពីនោះអ្នកនឹងអាចមើល
              ផ្ទះ បន្ទប់ កិច្ចសន្យា ការជួសជុល ការទូទាត់ និងប្រើប្រាស់ទឹកភ្លើង។
            </p>

            <div className="mt-6 grid w-full max-w-sm gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 text-left dark:bg-gray-800">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">លេខកូដអ្នកជួល</p>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">{tenantCode}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-left dark:bg-gray-800">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">ស្ថានភាព</p>
                <p className="mt-1 text-sm font-bold text-yellow-600 dark:text-yellow-400">PENDING</p>
              </div>
            </div>

            {profile.ownerName && (
              <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
                គិតត្រូវការជំនួយទេ? ទាក់ទងម្ចាស់ផ្ទះ
                {profile.ownerPhone ? ` លេខ ${profile.ownerPhone}` : ''}។
              </p>
            )}

            <Button className="mt-6" onClick={() => navigate('/tenant/profile')}>
              កែសម្រួលប្រវត្តិរបស់ខ្ញុំ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const depositFullyPaid = contract.depositFullyPaid;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">សួស្តី, {fullName}</h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            ដំណើរការជួលផ្ទះរបស់អ្នកស្ថិតក្នុងលក្ខណៈល្អ។ អ្នកអាចដឹងទាន់កាលកំណត់
            ដោយឡើងផ្ទះ ឬបន្ទប់ស្ថិតក្រោមកិច្ចសន្យា។
          </p>
        </div>
        <Badge variant="success">RENTING</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="ផ្ទះ និងបន្ទប់របស់ខ្ញុំ" description="ពត៌មានទីតាំងលំនៅដ្ឋាន">
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {house ? house.name : 'ផ្ទះ'}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {house ? `${house.code} · ${house.address}` : '—'}
              </p>
            </div>
            <InfoItem
              icon={<DoorOpen className="h-4 w-4" />}
              label="បន្ទប់"
              value={room ? `${room.roomNumber}${room.name ? ` · ${room.name}` : ''}` : '—'}
            />
            <InfoItem
              icon={<Building2 className="h-4 w-4" />}
              label="ជាន់"
              value={room && room.floorNumber != null ? `${room.floorNumber}` : '—'}
            />
            <InfoItem
              icon={<Wallet className="h-4 w-4" />}
              label="តម្លៃជួលប្រចាំខែ"
              value={formatCurrency(room?.monthlyRent)}
            />
          </div>
        </Card>

        <Card title="កិច្ចសន្យាជួល" description="ព័ត៌មានកិច្ចសន្យាបច្ចុប្បន្ន">
          <div className="space-y-4">
            <InfoItem
              icon={<FileText className="h-4 w-4" />}
              label="លេខកិច្ចសន្យា"
              value={contract.contractNo}
            />
            <InfoItem
              icon={<FileText className="h-4 w-4" />}
              label="រយៈពេល"
              value={`${formatDate(contract.startDate)} → ${formatDate(contract.endDate)}`}
            />
            <InfoItem
              icon={<Wallet className="h-4 w-4" />}
              label="ថ្លៃជួល / ប្រាក់កក់"
              value={`${formatCurrency(contract.monthlyRent)} / ${formatCurrency(contract.securityDeposit)}`}
            />
            <InfoItem
              icon={<Sparkles className="h-4 w-4" />}
              label="ថ្ងៃកំណត់បង់រៀងរាល់ខែ"
              value={`ថ្ងៃទី ${contract.dueDay}`}
            />
            <div className="flex items-center gap-2">
              <InfoItem
                icon={<Sparkles className="h-4 w-4" />}
                label="ប្រាក់កក់បានបង់"
                value={
                  depositFullyPaid
                    ? `បានបង់ពេញ (${formatCurrency(contract.depositPaidAmount)})`
                    : `បង់មិនទាន់ពេញ (${formatCurrency(contract.depositPaidAmount || 0)})`
                }
              />
              {depositFullyPaid ? (
                <Badge variant="success">បានបង់ពេញ</Badge>
              ) : (
                <Badge variant="warning">បង់មិនទាន់ពេញ</Badge>
              )}
            </div>
          </div>
        </Card>

        <Card title="ម្ចាស់ផ្ទះ / អ្នកគ្រប់គ្រង" description="ព័ត៌មានទំនាក់ទំនង">
          <div className="space-y-4">
            <InfoItem
              icon={<UserCircle className="h-4 w-4" />}
              label="ឈ្មោះ"
              value={profile.ownerName || '—'}
            />
            <InfoItem
              icon={<Phone className="h-4 w-4" />}
              label="ទូរស័ព្ទ"
              value={profile.ownerPhone || '—'}
            />
            <InfoItem
              icon={<Mail className="h-4 w-4" />}
              label="អ៊ីមែល"
              value={profile.ownerEmail || '—'}
            />
          </div>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-slate-800 dark:text-white">សកម្មភាពរហ័ស</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            icon={<Wrench className="h-5 w-5" />}
            label="ការជួសជុល"
            description="រាយការណ៍បញ្ហា"
            onClick={() => navigate('/tenant/maintenance')}
          />
          <QuickAction
            icon={<Wallet className="h-5 w-5" />}
            label="ការទូទាត់"
            description="ថ្លៃជួល និងប្រាក់កក់"
            onClick={() => navigate('/tenant/payments')}
          />
          <QuickAction
            icon={<Zap className="h-5 w-5" />}
            label="ទឹក និងភ្លើង"
            description="អានម៉ែត្របច្ចុប្បន្ន"
            onClick={() => navigate('/tenant/utilities')}
          />
          <QuickAction
            icon={<UserCircle className="h-5 w-5" />}
            label="ប្រវត្តិរបស់ខ្ញុំ"
            description="កែសម្រួលព័ត៌មាន"
            onClick={() => navigate('/tenant/profile')}
          />
        </div>
      </div>
    </div>
  );
}