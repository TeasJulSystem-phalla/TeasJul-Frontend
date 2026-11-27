import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Home,
  Users,
  CreditCard,
  RotateCcw,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
} from 'lucide-react';
import {
  useContracts,
  useContractTenants,
  useContractDeposits,
  useContractRenewals,
} from '../../hooks/useContracts';
import { useTenants } from '../../hooks/useTenants';
import { useRooms } from '../../hooks/useRooms';
import { useRoomAmenities } from '../../hooks/useRooms';
import { useHouses } from '../../hooks/useHouses';
import { useRoomTypes } from '../../hooks/useRoomType';
import { useSettings } from '../../hooks/useSettings';
import { useAuthStore } from '../../store/auth.store';
import { useBasePath } from '../../hooks/useBasePath.js';
import { EmptyState, Button, Skeleton, Badge } from '../../components/ui/index.js';
import ContractDetailView from './ContractDetailView';
import {
  formatCurrency,
  formatShortDate,
  formatDateTime,
  CONTRACT_STATUS_LABEL,
  DEPOSIT_STATUS_LABEL,
  fullName,
  roomLabel,
  isBlank,
  resolveAddress,
  ageFromDob,
} from './format';

const STATUS_VARIANT = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  TERMINATED: 'warning',
  EXPIRED: 'info',
  CANCELLED: 'danger',
};

const docTitle = (contract, ext = '') =>
  `${contract?.contractNo || `កិច្ចសន្យា-${contract?.id}`}-កិច្ចសន្យាជួលផ្ទះ${ext}`;

export default function ContractDetailPage() {
  const { id } = useParams();
  const contractId = Number(id);
  const basePath = useBasePath();

  const { getContract } = useContracts();
  const { tenants } = useTenants();
  const { getRoom } = useRooms();
  const { houses } = useHouses();
  const { roomTypes } = useRoomTypes();
  const { settings } = useSettings();
  const user = useAuthStore((s) => s.user);

  const { contractTenants, fetchContractTenants } = useContractTenants(contractId);
  const { deposits, fetchDeposits } = useContractDeposits(contractId);
  const { renewals, fetchRenewals } = useContractRenewals(contractId);

  const [contract, setContract] = useState(null);
  const [room, setRoom] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const documentRef = useRef(null);

  const { amenities: roomAmenities = [] } = useRoomAmenities(roomId);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const c = await getContract(contractId);
      setContract(c);
      setRoomId(c.roomId || null);
      let r = null;
      if (c.roomId) {
        try {
          r = await getRoom(c.roomId);
        } catch {
          r = null;
        }
      }
      setRoom(r);
    } catch (err) {
      setLoadError(
        err.response?.data?.message || err.response?.data?.error || 'មិនអាចផ្ទុកកិច្ចសន្យាបានទេ។'
      );
    } finally {
      setLoading(false);
    }
  }, [contractId, getContract, getRoom]);

  const fitContractToPage = useCallback(() => {
    const page = documentRef.current;
    const body = page?.querySelector('.contract-body');
    if (!page || !body) return;
    body.style.transform = 'none';
    body.style.width = '100%';
    const styles = window.getComputedStyle(page);
    const padTop = parseFloat(styles.paddingTop) || 0;
    const padBottom = parseFloat(styles.paddingBottom) || 0;
    const buffer = 8;
    const available = page.clientHeight - padTop - padBottom - buffer;
    const natural = body.scrollHeight;
    if (natural > available && natural > 0) {
      const scale = Math.max(0.62, available / natural);
      body.style.transform = `scale(${scale})`;
      body.style.width = `${100 / scale}%`;
    }
  }, []);

  const handlePrint = useCallback(() => {
    fitContractToPage();
    const prev = document.title;
    document.title = docTitle(contract);
    window.print();
    document.title = prev;
  }, [contract, fitContractToPage]);

  const handleDownloadPdf = useCallback(() => {
    fitContractToPage();
    const prev = document.title;
    document.title = docTitle(contract, '.pdf');
    window.print();
    document.title = prev;
  }, [contract, fitContractToPage]);

  const handleRefresh = useCallback(() => {
    load();
    fetchContractTenants();
    fetchDeposits();
    fetchRenewals();
  }, [load, fetchContractTenants, fetchDeposits, fetchRenewals]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) fitContractToPage();
      });
    }
    return () => {
      active = false;
    };
  }, [fitContractToPage]);

  // Party A comes from the snapshot stored on the contract itself, not from the
  // signed-in user. A manager previewing another owner's lease would otherwise
  // print their own identity as the landlord, and a contract would change retro-
  // actively whenever the owner edited their settings. The session user is only a
  // fallback for contracts created before the snapshot existed.
  const landlord = useMemo(() => {
    const sessionName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    return {
      name: contract?.ownerFullName || sessionName || user?.username || 'ម្ចាស់ផ្ទះ',
      email: user?.email,
      phone: contract?.ownerPhone || user?.phone,
      gender: contract?.ownerGender,
      dob: contract?.ownerDateOfBirth,
      nationality: contract?.ownerNationality,
      idNumber: contract?.ownerNationalId,
      address: contract?.ownerAddress,
      occupation: contract?.ownerOccupation,
    };
  }, [contract, user]);

  const tenantsById = useMemo(
    () => Object.fromEntries((tenants || []).map((t) => [t.id, t])),
    [tenants]
  );

  const house = useMemo(
    () => (room?.houseId ? houses.find((h) => h.id === room.houseId) : null),
    [room, houses]
  );

  const roomType = useMemo(
    () => (room?.roomTypeId ? roomTypes.find((rt) => rt.id === room.roomTypeId) : null),
    [room, roomTypes]
  );

  const primaryTenant = useMemo(() => {
    const sorted = [...(contractTenants || [])].sort((a, b) =>
      a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
    );
    return sorted[0] ? tenantsById?.[sorted[0].tenantId] : null;
  }, [contractTenants, tenantsById]);

  // Only details that the printable agreement actually reads are checked here.
  // Owner details come from the contract's Party A snapshot with legacy fallback;
  // Tenant details come from the contract's Party B snapshot. Nothing is back-filled from live profiles.
  const missingInfo = useMemo(() => {
    const owner = [];
    const tenant = [];

    const ownerAddress = resolveAddress(
      {
        houseNumber: contract?.ownerHouseNumber,
        streetNumber: contract?.ownerStreetNumber,
        sangkat: contract?.ownerSangkat,
        khan: contract?.ownerKhan,
        cityProvince: contract?.ownerCityProvince,
      },
      contract?.ownerAddress || landlord?.address
    );

    if (isBlank(landlord?.name)) owner.push('ឈ្មោះ');
    if (isBlank(landlord?.gender)) owner.push('ភេទ');
    if (isBlank(ageFromDob(landlord?.dob))) owner.push('ថ្ងៃខែឆ្នាំកំណើត');
    const ownerAddressParts = [
      ['ផ្ទះលេខ', ownerAddress.houseNumber],
      ['ផ្លូវលេខ', ownerAddress.streetNumber],
      ['សង្កាត់', ownerAddress.sangkat],
      ['ខណ្ឌ', ownerAddress.khan],
    ]
      .filter(([, value]) => isBlank(value))
      .map(([label]) => label);
    if (ownerAddressParts.length) {
      owner.push(`អាស័យដ្ឋាន (${ownerAddressParts.join(', ')})`);
    }

    if (!primaryTenant) {
      tenant.push('អ្នកជួល (មិនមានទិន្នន័យ)');
    } else {
      const tenantAddress = resolveAddress(
        {
          houseNumber: contract?.tenantHouseNumber,
          streetNumber: contract?.tenantStreetNumber,
          sangkat: contract?.tenantSangkat,
          khan: contract?.tenantKhan,
          cityProvince: contract?.tenantCityProvince,
        },
        null
      );

      if (isBlank(fullName(primaryTenant))) tenant.push('ឈ្មោះ');
      if (isBlank(primaryTenant.gender)) tenant.push('ភេទ');
      if (isBlank(ageFromDob(primaryTenant.dateOfBirth))) tenant.push('ថ្ងៃខែឆ្នាំកំណើត');
      const tenantAddressParts = [
        ['ផ្ទះលេខ', tenantAddress.houseNumber],
        ['ផ្លូវលេខ', tenantAddress.streetNumber],
        ['សង្កាត់', tenantAddress.sangkat],
        ['ខណ្ឌ', tenantAddress.khan],
      ]
        .filter(([, value]) => isBlank(value))
        .map(([label]) => label);
      if (tenantAddressParts.length) {
        tenant.push(`អាស័យដ្ឋាន (${tenantAddressParts.join(', ')})`);
      }
    }

    return { owner, tenant };
  }, [contract, landlord, primaryTenant]);

  const totalDepositPaid = useMemo(
    () => (deposits || []).reduce((sum, d) => sum + (d.paidAmount || 0), 0),
    [deposits]
  );

  const daysRemaining = useMemo(() => {
    if (!contract?.endDate) return null;
    const end = new Date(contract.endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  }, [contract]);

  useEffect(() => {
    if (loading || loadError || !contract) return undefined;
    const raf = requestAnimationFrame(fitContractToPage);
    return () => cancelAnimationFrame(raf);
  }, [
    loading,
    loadError,
    contract,
    deposits,
    contractTenants,
    roomAmenities,
    house,
    roomType,
    primaryTenant,
    fitContractToPage,
  ]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <div className="rounded-xl border border-slate-200 bg-slate-100 py-8 dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="mx-auto h-[700px] w-full max-w-[794px] bg-white" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <Link
          to={`${basePath}/contracts`}
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅកិច្ចសន្យា
        </Link>
        <EmptyState
          icon={FileText}
          title="មិនអាចផ្ទុកកិច្ចសន្យាបានទេ"
          description={loadError}
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={load}>ព្យាយាមម្តងទៀត</Button>
              <Link to={`${basePath}/contracts`}>
                <Button variant="primary" size="sm">ទៅកាន់កិច្ចសន្យា</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-khmer">
      {/* Header */}
      <div className="flex flex-col gap-4 print:hidden lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            to={`${basePath}/contracts`}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅកិច្ចសន្យា
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {contract?.contractNo || `កិច្ចសន្យា #${contract?.id}`}
            </h1>
            <Badge variant={STATUS_VARIANT[contract?.status] || 'default'}>
              {CONTRACT_STATUS_LABEL[contract?.status] || contract?.status || '—'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            មើល បោះពុម្ភ ឬទាញយកឯកសារកិច្ចសន្យាជួលផ្ទះរបស់អ្នក។
          </p>
        </div>
      </div>

      {/* Management-only warning: never part of the printable agreement */}
      {(missingInfo.owner.length > 0 || missingInfo.tenant.length > 0) && (
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-2 print:hidden dark:border-amber-500/20 dark:bg-amber-500/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="shrink-0 text-xs font-semibold text-amber-800 dark:text-amber-300">
              ព័ត៌មានកិច្ចសន្យាមិនពេញលេញ
            </p>
            <p className="min-w-0 flex-1 truncate text-[11px] text-amber-700/80 dark:text-amber-400/80">
              ក៖ {missingInfo.owner.join(', ') || '—'} · ខ៖ {missingInfo.tenant.join(', ') || '—'}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              {missingInfo.owner.length > 0 && (
                <Link to="/owner/settings">
                  <Button variant="ghost" size="sm" className="text-amber-700 dark:text-amber-300">
                    Settings
                  </Button>
                </Link>
              )}
              {missingInfo.tenant.length > 0 && (
                <Link to={primaryTenant ? `${basePath}/tenants/${primaryTenant.id}/edit` : `${basePath}/tenants`}>
                  <Button variant="ghost" size="sm" className="text-amber-700 dark:text-amber-300">
                    កែអ្នកជួល
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Document + Sidebar */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* Document Preview */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 py-6 dark:border-gray-800 dark:bg-gray-900 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:py-0 sm:py-10">
          <ContractDetailView
            ref={documentRef}
            contract={contract}
            landlord={landlord}
            house={house}
            room={room}
            roomType={roomType}
            roomAmenities={roomAmenities}
            tenantsById={tenantsById}
            contractTenants={contractTenants}
            deposits={deposits}
            renewals={renewals}
            settings={settings}
            onPrint={handlePrint}
            onDownload={handleDownloadPdf}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 print:hidden">
          {/* Actions Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-white">សកម្មភាព</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={handleRefresh}>
                ធ្វើស្រស់
              </Button>
              <Button variant="outline" size="sm" leftIcon={<FileText className="h-4 w-4" />} onClick={handlePrint}>
                បោះពុម្ភ
              </Button>
              <Button variant="primary" size="sm" leftIcon={<FileText className="h-4 w-4" />} onClick={handleDownloadPdf}>
                ទាញយក PDF
              </Button>
              <Link to={`${basePath}/contracts/${contract?.id}/edit`}>
                <Button variant="secondary" size="sm" leftIcon={<FileText className="h-4 w-4" />}>
                  កែសម្រួល
                </Button>
              </Link>
            </div>
          </div>

          {/* Contract Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-white">ព័ត៌មានកិច្ចសន្យា</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">លេខកិច្ចសន្យា</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{contract?.contractNo || `CT-${contract?.id}`}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">ថ្ងៃចាប់ផ្ដើម</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{formatShortDate(contract?.startDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">ថ្ងៃបញ្ចប់</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{formatShortDate(contract?.endDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/30">
                  <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">រយៈពេល</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{contract?.durationMonths || '—'} ខែ</p>
                </div>
              </div>

              {daysRemaining !== null && (
                <div className={`flex items-center gap-3 rounded-lg p-2 ${daysRemaining <= 30 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-gray-800'}`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${daysRemaining <= 30 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-slate-100 dark:bg-gray-700'}`}>
                    <AlertTriangle className={`h-4 w-4 ${daysRemaining <= 30 ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">នៅសល់</p>
                    <p className={`text-sm font-semibold ${daysRemaining <= 30 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                      {daysRemaining <= 0 ? 'បានផុតកំណត់' : `${daysRemaining} ថ្ងៃ`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-white">ព័ត៌មានហិរញ្ញវត្ថុ</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">ថ្លៃជួល/ខែ</span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-white">${formatCurrency(contract?.monthlyRent)}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">ប្រាក់កក់</span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-white">${formatCurrency(contract?.securityDeposit)}</span>
              </div>

              {deposits && deposits.length > 0 && (
                <>
                  <div className="h-px bg-slate-200 dark:bg-gray-700" />
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">ប្រាក់កក់ទាំងអស់ ({deposits.length})</p>
                    <div className="space-y-1.5">
                      {deposits.map((dep) => (
                        <div key={dep.id} className="flex items-center justify-between text-sm">
                          <Badge variant={dep.status === 'PAID' ? 'success' : dep.status === 'REFUNDED' ? 'info' : 'neutral'} className="text-[10px]">
                            {DEPOSIT_STATUS_LABEL[dep.status] || dep.status}
                          </Badge>
                          <span className="font-medium text-slate-700 dark:text-slate-300">${formatCurrency(dep.paidAmount || dep.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="h-px bg-slate-200 dark:bg-gray-700" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">បានបង់សរុប</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${formatCurrency(totalDepositPaid)}</span>
              </div>
            </div>
          </div>

          {/* Property Info Card */}
          {(house || room) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-white">ព័ត៌មានអចលនទ្រព្យ</h3>
              <div className="space-y-3">
                {house && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/30">
                      <Home className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ផ្ទះ</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{house.name || '—'}</p>
                    </div>
                  </div>
                )}

                {room && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                      <Home className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">បន្ទប់</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{roomLabel(room)}</p>
                    </div>
                  </div>
                )}

                {roomType && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-900/30">
                      <Home className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ប្រភេទបន្ទប់</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{roomType.name || '—'}</p>
                    </div>
                  </div>
                )}

                {house?.address && (
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-slate-500">អាស័យដ្ឋាន</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{house.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tenant Card */}
          {primaryTenant && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-white">ព័ត៌មានអ្នកជួល</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/30">
                    <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ឈ្មោះ</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{fullName(primaryTenant)}</p>
                  </div>
                </div>

                {primaryTenant.phone && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 dark:bg-gray-800">
                      <Phone className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ទូរស័ព្ទ</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{primaryTenant.phone}</p>
                    </div>
                  </div>
                )}

                {primaryTenant.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 dark:bg-gray-800">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">អ៊ីមែល</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{primaryTenant.email}</p>
                    </div>
                  </div>
                )}

                {primaryTenant.idNumber && (
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-gray-800">
                    <p className="text-xs text-slate-500">អត្តសញ្ញាណប័ណ្ណ</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{primaryTenant.idNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Renewals Card */}
          {renewals && renewals.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-white">ការបន្តកិច្ចសន្យា</h3>
              <div className="space-y-2">
                {renewals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-gray-800">
                    <div>
                      <p className="text-xs text-slate-500">ការបន្ត</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{formatShortDate(r.startDate)} - {formatShortDate(r.endDate)}</p>
                    </div>
                    <Badge variant={r.status === 'APPROVED' ? 'success' : 'neutral'}>{r.status || '—'}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-white">ព័ត៌មានបន្ថែម</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">បង្កើតនៅ</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{formatDateTime(contract?.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">កែប្រែចុងក្រោយ</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{formatDateTime(contract?.updatedAt)}</span>
              </div>
              {contract?.occupants && (
                <div className="flex justify-between">
                  <span className="text-slate-500">ចំនួនអ្នកស្នាក់នៅ</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{contract.occupants}</span>
                </div>
              )}
              {contract?.furniture && (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 dark:bg-gray-800">
                  <p className="text-xs text-slate-500">គ្រឿងសង្ហារឹម</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{contract.furniture}</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
