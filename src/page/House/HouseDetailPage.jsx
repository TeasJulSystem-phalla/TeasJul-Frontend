import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  BedDouble,
  Users,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Wrench,
  CheckCircle2,
  DoorOpen,
  Calendar,
} from 'lucide-react';
import {
  useRoomTypes,
} from '../../hooks/useRoomType';
import { useHouseDetail } from '../../hooks/useHouseDetail';
import { useBasePath } from '../../hooks/useBasePath.js';
import {
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Input,
  Select,
  EmptyState,
  Skeleton,
  Pagination,
  Tabs,
} from '../../components/ui/index.js';
import { CONTRACT_STATUS_LABEL, formatShortDate } from '../ContractDetail/format.js';

const HOUSE_STATUS_VARIANT = {
  ACTIVE: 'success',
  INACTIVE: 'danger',
  MAINTENANCE: 'warning',
};

const ROOM_STATUS_VARIANT = {
  AVAILABLE: 'success',
  OCCUPIED: 'info',
  MAINTENANCE: 'warning',
  RESERVED: 'neutral',
};

const CONTRACT_STATUS_VARIANT = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  TERMINATED: 'warning',
  EXPIRED: 'info',
  CANCELLED: 'danger',
};

const ROOM_STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'AVAILABLE', label: 'ទំនេរ' },
  { value: 'OCCUPIED', label: 'មានអ្នកស្នាក់នៅ' },
  { value: 'MAINTENANCE', label: 'កំពុងជួសជុល' },
  { value: 'RESERVED', label: 'បានរក្សាទុក' },
];

const CONTRACT_STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'DRAFT', label: 'សេចក្តីព្រាង' },
  { value: 'ACTIVE', label: 'សកម្ម' },
  { value: 'TERMINATED', label: 'បានបញ្ចប់' },
  { value: 'EXPIRED', label: 'ផុតកំណត់' },
  { value: 'CANCELLED', label: 'បានលុបចោល' },
];

const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value ?? '—'}</p>
      </div>
    </div>
  </div>
);

export default function HouseDetailPage() {
  const { id } = useParams();
  const houseId = Number(id);
  const basePath = useBasePath();

  const { roomTypes } = useRoomTypes();

  const {
    house,
    summary,
    loading,
    error,
    refreshAll,

    rooms,
    roomsLoading,
    roomsError,
    roomsPage,
    roomsTotalPages,
    setRoomsPage,
    roomSearch,
    setRoomSearch,
    roomStatus,
    setRoomStatus,
    roomTypeFilter,
    setRoomTypeFilter,

    tenants,
    tenantsLoading,
    tenantsError,
    tenantsPage,
    tenantsTotalPages,
    setTenantsPage,
    tenantSearch,
    setTenantSearch,

    contracts,
    contractsLoading,
    contractsError,
    contractsPage,
    contractsTotalPages,
    setContractsPage,
    contractSearch,
    setContractSearch,
    contractStatus,
    setContractStatus,
  } = useHouseDetail(houseId);

  const [tab, setTab] = useState('rooms');

  const roomTypeMap = useMemo(
    () => Object.fromEntries(roomTypes.map((rt) => [String(rt.id), rt])),
    [roomTypes]
  );

  const getRoomTypeName = (roomTypeId) => roomTypeMap[String(roomTypeId)]?.name || roomTypeId || '—';

  const roomTypeOptions = useMemo(
    () => [
      { value: '', label: 'គ្រប់ប្រភេទ' },
      ...roomTypes.map((rt) => ({ value: String(rt.id), label: rt.name })),
    ],
    [roomTypes]
  );

  const roomColumns = [
    {
      header: 'បន្ទប់',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BedDouble className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">{row.name || row.roomNumber}</p>
            <p className="font-mono text-xs text-slate-400">#{row.roomNumber || row.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'ប្រភេទ',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{getRoomTypeName(row.roomTypeId)}</span>
      ),
    },
    {
      header: 'ជាន់',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{row.floorNumber ?? '—'}</span>
      ),
    },
    {
      header: 'ថ្លៃជួល/ខែ',
      render: (row) => (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          ${Number(row.monthlyRent || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => (
        <Badge variant={ROOM_STATUS_VARIANT[row.status] || 'default'}>{row.status || '—'}</Badge>
      ),
    },
  ];

  const tenantColumns = [
    {
      header: 'អ្នកជួល',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">
              {`${row.firstName || ''} ${row.lastName || ''}`.trim() || '—'}
            </p>
            <p className="font-mono text-xs text-slate-400">#{row.tenantCode || row.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'ទូរស័ព្ទ',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{row.phone || '—'}</span>
      ),
    },
    {
      header: 'អ៊ីមែល',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{row.email || '—'}</span>
      ),
    },
    {
      header: 'មុខរបរ',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{row.occupationType || '—'}</span>
      ),
    },
  ];

  const contractColumns = [
    {
      header: 'លេខកិច្ចសន្យា',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
            <FileText className="h-4 w-4" />
          </span>
          <Link
            to={`/contracts/${row.id}`}
            className="font-medium text-slate-800 hover:text-violet-600 dark:text-white dark:hover:text-violet-400"
          >
            {row.contractNo || `#${row.id}`}
          </Link>
        </div>
      ),
    },
    {
      header: 'បន្ទប់',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">#{row.roomId || '—'}</span>
      ),
    },
    {
      header: 'ថ្ងៃចាប់ផ្ដើម',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {formatShortDate(row.startDate)}
        </span>
      ),
    },
    {
      header: 'ថ្ងៃបញ្ចប់',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{formatShortDate(row.endDate)}</span>
      ),
    },
    {
      header: 'ថ្លៃជួល/ខែ',
      render: (row) => (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          ${Number(row.monthlyRent || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => (
        <Badge variant={CONTRACT_STATUS_VARIANT[row.status] || 'default'}>
          {CONTRACT_STATUS_LABEL[row.status] || row.status || '—'}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-14 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          to={`${basePath}/properties`}
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅអចលនទ្រព្យ
        </Link>
        <EmptyState
          icon={Building2}
          title="មិនអាចផ្ទុកព័ត៌មានអចលនទ្រព្យបានទេ"
          description={error}
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshAll}>ព្យាយាមម្តងទៀត</Button>
              <Link to={`${basePath}/properties`}>
                <Button variant="primary" size="sm">ទៅកាន់អចលនទ្រព្យ</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to={`${basePath}/properties`}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅអចលនទ្រព្យ
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">{house?.name}</h1>
            {house?.code && <span className="font-mono text-sm text-slate-400">{house.code}</span>}
            <Badge variant={HOUSE_STATUS_VARIANT[house?.status] || 'default'}>{house?.status || '—'}</Badge>
          </div>
          {house?.address && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4 shrink-0" />
              {house.address}
              {house.postalCode ? ` · ${house.postalCode}` : ''}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refreshAll}>
          ធ្វើឱ្យស្រស់
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={BedDouble} label="បន្ទប់សរុប" value={summary?.totalRooms} iconBg="bg-slate-100 dark:bg-gray-800" iconColor="text-slate-600 dark:text-slate-300" />
        <StatCard icon={DoorOpen} label="ទំនេរ" value={summary?.availableRooms} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={CheckCircle2} label="មានអ្នកស្នាក់នៅ" value={summary?.occupiedRooms} iconBg="bg-sky-50 dark:bg-sky-900/20" iconColor="text-sky-600 dark:text-sky-400" />
        <StatCard icon={Wrench} label="កំពុងជួសជុល" value={summary?.maintenanceRooms} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600 dark:text-amber-400" />
        <StatCard icon={Users} label="អ្នកជួលសកម្ម" value={summary?.activeTenants} iconBg="bg-violet-50 dark:bg-violet-900/20" iconColor="text-violet-600 dark:text-violet-400" />
        <StatCard icon={FileText} label="កិច្ចសន្យាសកម្ម" value={summary?.activeContracts} iconBg="bg-rose-50 dark:bg-rose-900/20" iconColor="text-rose-600 dark:text-rose-400" />
      </div>

      {house?.description && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">{house.description}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          { value: 'rooms', label: `បន្ទប់ (${summary?.totalRooms ?? 0})` },
          { value: 'tenants', label: `អ្នកជួល (${summary?.activeTenants ?? 0})` },
          { value: 'contracts', label: `កិច្ចសន្យា (${summary?.activeContracts ?? 0})` },
        ]}
      />

      {/* Rooms tab */}
      {tab === 'rooms' && (
        <div className="space-y-4">
          {roomsError && <Alert variant="danger" title="កំហុស" description={roomsError} dismissible />}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <Input
                placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខបន្ទប់..."
                leftIcon={<Search className="h-4 w-4" />}
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:flex">
              <Select options={ROOM_STATUS_OPTIONS} value={roomStatus} onChange={(e) => setRoomStatus(e.target.value)} />
              <Select options={roomTypeOptions} value={roomTypeFilter} onChange={(e) => setRoomTypeFilter(e.target.value)} />
            </div>
          </div>

          {!roomsLoading && rooms.length === 0 ? (
            <EmptyState icon={BedDouble} title="មិនមានបន្ទប់" description="មិនមានបន្ទប់ត្រូវនឹងលក្ខខណ្ឌនេះទេ។" />
          ) : (
            <Card>
              <Table columns={roomColumns} data={rooms} loading={roomsLoading} emptyMessage="មិនមានបន្ទប់" className="w-full" />
            </Card>
          )}

          {roomsTotalPages > 1 && (
            <div className="flex justify-end">
              <Pagination currentPage={roomsPage + 1} totalPages={roomsTotalPages} onPageChange={(p) => setRoomsPage(p - 1)} />
            </div>
          )}
        </div>
      )}

      {/* Tenants tab */}
      {tab === 'tenants' && (
        <div className="space-y-4">
          {tenantsError && <Alert variant="danger" title="កំហុស" description={tenantsError} dismissible />}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ ឬលេខកូដ..."
                leftIcon={<Search className="h-4 w-4" />}
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
              />
            </div>
          </div>

          {!tenantsLoading && tenants.length === 0 ? (
            <EmptyState icon={Users} title="មិនមានអ្នកជួលសកម្ម" description="មិនមានអ្នកជួលសកម្មនៅក្នុងអចលនទ្រព្យនេះទេ។" />
          ) : (
            <Card>
              <Table columns={tenantColumns} data={tenants} loading={tenantsLoading} emptyMessage="មិនមានអ្នកជួល" className="w-full" />
            </Card>
          )}

          {tenantsTotalPages > 1 && (
            <div className="flex justify-end">
              <Pagination currentPage={tenantsPage + 1} totalPages={tenantsTotalPages} onPageChange={(p) => setTenantsPage(p - 1)} />
            </div>
          )}
        </div>
      )}

      {/* Contracts tab */}
      {tab === 'contracts' && (
        <div className="space-y-4">
          {contractsError && <Alert variant="danger" title="កំហុស" description={contractsError} dismissible />}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <Input
                placeholder="ស្វែងរកតាមលេខកិច្ចសន្យា..."
                leftIcon={<Search className="h-4 w-4" />}
                value={contractSearch}
                onChange={(e) => setContractSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select options={CONTRACT_STATUS_OPTIONS} value={contractStatus} onChange={(e) => setContractStatus(e.target.value)} />
            </div>
          </div>

          {!contractsLoading && contracts.length === 0 ? (
            <EmptyState icon={FileText} title="មិនមានកិច្ចសន្យា" description="មិនមានកិច្ចសន្យាត្រូវនឹងលក្ខខណ្ឌនេះទេ។" />
          ) : (
            <Card>
              <Table columns={contractColumns} data={contracts} loading={contractsLoading} emptyMessage="មិនមានកិច្ចសន្យា" className="w-full" />
            </Card>
          )}

          {contractsTotalPages > 1 && (
            <div className="flex justify-end">
              <Pagination currentPage={contractsPage + 1} totalPages={contractsTotalPages} onPageChange={(p) => setContractsPage(p - 1)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
