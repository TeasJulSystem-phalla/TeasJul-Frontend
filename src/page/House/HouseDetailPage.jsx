import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  BedDouble,
  Users,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Mail,
  LocateFixed,
  Calendar,
  Hand,
  FileSpreadsheet,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  useRoomTypes,
} from '../../hooks/useRoomType';
import { useHouseDetail } from '../../hooks/useHouseDetail';
import { useHouseImages } from '../../hooks/useHouseImages';
import { useMyRoles } from '../../hooks/useMyRoles';
import { useBasePath } from '../../hooks/useBasePath.js';
import { houseApi } from '../../api/house.api';
import ImageGallery from '../../components/ImageGallery';
import useToast from '../../components/ui/Toast';
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

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm text-slate-700 dark:text-slate-200">{value ?? '—'}</p>
    </div>
  </div>
);

export default function HouseDetailPage() {
  const { id } = useParams();
  const houseId = Number(id);
  const basePath = useBasePath();
  const navigate = useNavigate();

  const { roomTypes } = useRoomTypes();
  const { isOwner, isManager } = useMyRoles();
  const canManage = isOwner || isManager;
  const houseImages = useHouseImages(houseId);

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
  const toast = useToast();
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const [newNearby, setNewNearby] = useState({ name: '', category: 'SCHOOL', distanceKm: '', travelMinutes: '' });
  const [addingNearby, setAddingNearby] = useState(false);

  const fetchNearby = useCallback(async () => {
    if (!houseId) return;
    setNearbyLoading(true);
    try {
      const data = await houseApi.getNearbyLocations(houseId);
      setNearbyLocations(data || []);
    } catch {
      // ignore
    } finally {
      setNearbyLoading(false);
    }
  }, [houseId]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  const handleAddNearby = async (e) => {
    e.preventDefault();
    setNearbyError(null);

    if (!newNearby.name.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះទីតាំង', 'Name is required');
      return;
    }
    if (newNearby.distanceKm === '' || isNaN(parseFloat(newNearby.distanceKm))) {
      toast.error('សូមបញ្ចូលចម្ងាយ (Km)', 'Distance in km is required');
      return;
    }
    if (newNearby.travelMinutes === '' || isNaN(parseInt(newNearby.travelMinutes))) {
      toast.error('សូមបញ្ចូលរយៈពេលធ្វើដំណើរ (នាទី)', 'Travel minutes is required');
      return;
    }

    setAddingNearby(true);
    try {
      await houseApi.createNearbyLocation(houseId, {
        name: newNearby.name.trim(),
        category: newNearby.category,
        distanceKm: parseFloat(newNearby.distanceKm),
        travelMinutes: parseInt(newNearby.travelMinutes),
      });
      toast.success('ទីតាំងជិតខាងត្រូវបានបន្ថែម', 'បន្ថែមទីតាំងជិតខាងដោយជោគជ័យ');
      setNewNearby({ name: '', category: 'SCHOOL', distanceKm: '', travelMinutes: '' });
      fetchNearby();
    } catch (err) {
      const errRes = err.response?.data;
      let errMsg = errRes?.message || errRes?.error || 'ការបន្ថែមទីតាំងជិតខាងបរាជ័យ';
      if (errRes?.errors && typeof errRes.errors === 'object') {
        const detailErrs = Object.entries(errRes.errors)
          .map(([fld, msg]) => `${fld}: ${msg}`)
          .join('; ');
        errMsg = `${errMsg} (${detailErrs})`;
      }
      setNearbyError(errMsg);
      toast.error('កំហុស Validation', errMsg);
    } finally {
      setAddingNearby(false);
    }
  };

  const handleDeleteNearby = async (locId) => {
    try {
      await houseApi.deleteNearbyLocation(houseId, locId);
      toast.success('ទីតាំងជិតខាងត្រូវបានលុប');
      fetchNearby();
    } catch (err) {
      toast.error('ការលុបបរាជ័យ', err.response?.data?.message || 'មិនអាចលុបទីតាំងបានទេ');
    }
  };

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Hand className="h-4 w-4" />}
            onClick={() => navigate(`${basePath}/properties/${id}/onboarding/manual`)}
          >
            បញ្ចូលដោយដៃ
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="h-4 w-4" />}
            onClick={() => navigate(`${basePath}/properties/${id}/onboarding/import`)}
          >
            នាំចូល CSV/Excel
          </Button>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refreshAll}>
            ធ្វើឱ្យស្រស់
          </Button>
        </div>
      </div>

      {/* House information */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">ព័ត៌មានអចលនទ្រព្យ</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow icon={MapPin} label="អាសយដ្ឋាន" value={house?.address} />
          <InfoRow icon={MapPin} label="ក្រុង/ខេត្ត" value={house?.cityProvince} />
          <InfoRow icon={Mail} label="លេខកូដប្រៃសណីយ៍" value={house?.postalCode} />
          {house?.latitude != null && <InfoRow icon={LocateFixed} label="រយៈទទឹង" value={house.latitude} />}
          {house?.longitude != null && <InfoRow icon={LocateFixed} label="រយៈបណ្តោយ" value={house.longitude} />}
        </div>
        {(house?.googleMapsUrl || (house?.latitude != null && house?.longitude != null)) && (
          <a
            href={house?.googleMapsUrl || `https://www.google.com/maps?q=${house.latitude},${house.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            មើលដោយ Google Maps
          </a>
        )}
        {house?.description && (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600 dark:border-gray-800 dark:text-slate-300">
            {house.description}
          </p>
        )}
      </Card>

      {/* Images */}
      <Card className="p-5">
        <ImageGallery
          images={houseImages.images}
          loading={houseImages.loading}
          error={houseImages.error}
          uploading={houseImages.uploading}
          uploadError={houseImages.uploadError}
          canManage={canManage}
          onUpload={houseImages.upload}
          onRemove={houseImages.removeImage}
          onSetPrimary={houseImages.setAsPrimary}
          onMove={houseImages.moveImage}
          onRetry={houseImages.fetchImages}
        />
      </Card>

      {/* Nearby Locations */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">ទីតាំងនៅជិតខាង (Nearby Locations)</h2>
          </div>
        </div>

        {canManage && (
          <form onSubmit={handleAddNearby} className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-6">
            <Input
              placeholder="ឈ្មោះទីតាំង (ឧ. សាលារៀន ផ្សារ...)"
              value={newNearby.name}
              onChange={(e) => setNewNearby({ ...newNearby, name: e.target.value })}
              className="sm:col-span-2"
            />
            <Select
              options={[
                { value: 'SCHOOL', label: 'សាលារៀន (School)' },
                { value: 'UNIVERSITY', label: 'សាកលវិទ្យាល័យ (University)' },
                { value: 'HOSPITAL', label: 'មន្ទីរពេទ្យ (Hospital)' },
                { value: 'MALL', label: 'ផ្សារទំនើប (Mall)' },
                { value: 'MARKET', label: 'ផ្សារ (Market)' },
                { value: 'RESTAURANT', label: 'ភោជនីយដ្ឋាន (Restaurant)' },
                { value: 'BANK', label: 'ធនាគារ (Bank)' },
                { value: 'TOURIST_SPOT', label: 'កន្លែងទេសចរណ៍ (Tourist Spot)' },
                { value: 'BUS_STOP', label: 'ចំណតឡានក្រុង (Bus Stop)' },
                { value: 'OTHER', label: 'ផ្សេងៗ (Other)' },
              ]}
              value={newNearby.category}
              onChange={(e) => setNewNearby({ ...newNearby, category: e.target.value })}
            />
            <Input
              placeholder="ចម្ងាយ (Km)"
              type="number"
              step="0.1"
              min="0"
              value={newNearby.distanceKm}
              onChange={(e) => setNewNearby({ ...newNearby, distanceKm: e.target.value })}
            />
            <Input
              placeholder="ធ្វើដំណើរ (នាទី)"
              type="number"
              min="0"
              value={newNearby.travelMinutes}
              onChange={(e) => setNewNearby({ ...newNearby, travelMinutes: e.target.value })}
            />
            <Button type="submit" size="sm" loading={addingNearby} leftIcon={<Plus className="h-4 w-4" />}>
              បន្ថែម
            </Button>
          </form>
        )}

        {nearbyError && (
          <Alert variant="danger" title="កំហុស Validation" description={nearbyError} dismissible className="mb-3" />
        )}

        {nearbyLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : nearbyLocations.length === 0 ? (
          <p className="text-xs text-slate-400">មិនទាន់មានទីតាំងនៅជិតខាងទេ</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {nearbyLocations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200"
              >
                <span className="font-medium">{loc.name}</span>
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] dark:bg-gray-700">{loc.category}</span>
                {loc.distanceKm != null && <span className="text-slate-400">{loc.distanceKm} km</span>}
                {loc.travelMinutes != null && <span className="text-slate-400">{loc.travelMinutes} នាទី</span>}
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleDeleteNearby(loc.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

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
