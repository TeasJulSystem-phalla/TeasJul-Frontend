import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Users as UsersIcon,
  PiggyBank,
  Repeat,
  FileText,
  DoorOpen,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useContracts, useContractDeposits, useContractRenewals, useContractTenants } from '../../hooks/useContracts.js';
import { useRooms } from '../../hooks/useRooms.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useRoomTypes } from '../../hooks/useRoomType.js';
import { useTenants } from '../../hooks/useTenants.js';
import { tenantApi } from '../../api/tenant.api.js';
import { useBasePath } from '../../hooks/useBasePath.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { Button, IconButton, Input, Textarea, Select, Badge, Alert, Modal, EmptyState, Skeleton } from '../../components/ui/index.js';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'សេចក្តីព្រាង' },
  { value: 'ACTIVE', label: 'សកម្ម' },
  { value: 'TERMINATED', label: 'បានបញ្ចប់' },
  { value: 'EXPIRED', label: 'ផុតកំណត់' },
  { value: 'CANCELLED', label: 'បានលុបចោល' },
];

const DEPOSIT_STATUS_VARIANT = {
  PENDING: 'warning',
  PAID: 'success',
  PARTIALLY_REFUNDED: 'info',
  REFUNDED: 'neutral',
};

const DEPOSIT_STATUS_LABEL = {
  PENDING: 'កំពុងរង់ចាំ',
  PAID: 'បានបង់',
  PARTIALLY_REFUNDED: 'បានសងមួយផ្នែក',
  REFUNDED: 'បានសងវិញ',
  FORFEITED: 'បានបាត់បង់',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const EMPTY_FORM = {
  roomId: '',
  startDate: '',
  endDate: '',
  monthlyRent: '',
  securityDeposit: '',
  dueDay: 5,
  status: 'DRAFT',
  notes: '',
};

const fullName = (t) => `${t.firstName || ''} ${t.lastName || ''}`.trim() || `អ្នកជួល #${t.id}`;

export default function ContractEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id && id !== 'new';
  const basePath = useBasePath();

  const {
    getContract,
    createContract,
    updateContract,
  } = useContracts();
  const { rooms } = useRooms();
  const { houses } = useHouses();
  const { roomTypes } = useRoomTypes();
  const toast = useToast();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const queryRoomId = searchParams.get('roomId');

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [contract, setContract] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Inline Room Selector State
  const [roomFilterStatus, setRoomFilterStatus] = useState(isEdit ? '' : 'AVAILABLE');
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
  const [showRoomGrid, setShowRoomGrid] = useState(true);

  const selectedRoom = useMemo(
    () => rooms.find((r) => String(r.id) === String(form.roomId)),
    [rooms, form.roomId]
  );

  const houseName = useCallback(
    (houseId) => houses.find((h) => h.id === houseId)?.name || `ផ្ទះ #${houseId}`,
    [houses]
  );

  const roomTypeName = useCallback(
    (typeId) => roomTypes.find((rt) => rt.id === typeId)?.name || `ប្រភេទ #${typeId}`,
    [roomTypes]
  );

  // Auto select room from URL query param when creating new contract
  useEffect(() => {
    if (!isEdit && queryRoomId && rooms.length > 0 && !form.roomId) {
      const match = rooms.find((r) => String(r.id) === String(queryRoomId));
      if (match) {
        setForm((prev) => ({
          ...prev,
          roomId: String(match.id),
          monthlyRent: match.monthlyRent ?? prev.monthlyRent,
          securityDeposit: match.securityDeposit ?? prev.securityDeposit,
        }));
      }
    }
  }, [isEdit, queryRoomId, rooms, form.roomId]);

  const loadContract = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getContract(Number(id));
      setContract(data);
      setForm({
        roomId: data.roomId ?? '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        monthlyRent: data.monthlyRent ?? '',
        securityDeposit: data.securityDeposit ?? 0,
        dueDay: data.dueDay ?? 5,
        status: data.status || 'DRAFT',
        notes: data.notes || '',
      });
    } catch (err) {
      setLoadError(err.response?.data?.message || err.response?.data?.error || 'មិនអាចផ្ទុកកិច្ចសន្យាបានទេ។');
    } finally {
      setLoading(false);
    }
  }, [id, getContract]);

  useEffect(() => {
    if (isEdit) {
      loadContract();
    }
  }, [isEdit, loadContract]);

  const refreshAfterRenewal = useCallback(async () => {
    if (!isEdit || !id) return;
    try {
      const data = await getContract(Number(id));
      setContract(data);
      setForm((prev) => ({
        ...prev,
        endDate: data.endDate || prev.endDate,
        status: data.status || prev.status,
      }));
    } catch {
      // keep the current view if the refresh fails; the saved renewal is unaffected
    }
  }, [isEdit, id, getContract]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectRoom = (room) => {
    setForm((prev) => ({
      ...prev,
      roomId: String(room.id),
      monthlyRent: room.monthlyRent ?? prev.monthlyRent,
      securityDeposit: room.securityDeposit ?? prev.securityDeposit,
    }));
    if (formErrors.roomId) setFormErrors((prev) => ({ ...prev, roomId: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.roomId) errs.roomId = 'តម្រូវឱ្យជ្រើសរើសបន្ទប់';
    if (!form.startDate) errs.startDate = 'តម្រូវឱ្យបញ្ចូលថ្ងៃចាប់ផ្តើម';
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) errs.monthlyRent = 'ថ្លៃជួលប្រចាំខែត្រូវតែធំជាង 0';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = () => ({
    roomId: Number(form.roomId),
    startDate: form.startDate,
    endDate: form.endDate || null,
    monthlyRent: Number(form.monthlyRent),
    securityDeposit: Number(form.securityDeposit) || 0,
    dueDay: Number(form.dueDay) || 5,
    status: form.status,
    notes: form.notes.trim() || null,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaveError(null);
    setSubmitting(true);
    try {
      if (isEdit) {
        const updated = await updateContract(Number(id), buildPayload());
        setContract(updated);
        toast.success('បានកែប្រែកិច្ចសន្យា', `កិច្ចសន្យា "${updated?.contractNo || updated?.id}" ត្រូវបានកែប្រែ។`);
      } else {
        const created = await createContract(buildPayload());
        toast.success('បានបង្កើតកិច្ចសន្យា', `កិច្ចសន្យា "${created?.contractNo || created?.id}" ត្រូវបានបង្កើត។`);
        navigate(`${basePath}/contracts/${created.id}`, { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'មិនអាចរក្សាទុកកិច្ចសន្យាបានទេ។';
      setSaveError(message);
      toast.error('កំហុស', message);
    } finally {
      setSubmitting(false);
    }
  };

  // Inline Filtered rooms
  const inlineFilteredRooms = useMemo(() => {
    let result = rooms;
    if (roomFilterStatus) {
      result = result.filter((r) => r.status === roomFilterStatus);
    }
    if (houseFilter) {
      result = result.filter((r) => String(r.houseId) === String(houseFilter));
    }
    if (roomSearchTerm) {
      const q = roomSearchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
          (r.name && r.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [rooms, roomFilterStatus, houseFilter, roomSearchTerm]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="h-6 w-56" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to={`${basePath}/contracts`} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅកិច្ចសន្យា
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            {isEdit ? `កែប្រែកិច្ចសន្យា ${contract?.contractNo ? `#${contract?.id} · ${contract?.contractNo}` : ''}` : 'បង្កើតកិច្ចសន្យា'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isEdit ? 'គ្រប់គ្រងព័ត៌មានលម្អិតកិច្ចសន្យា អ្នកជួល ប្រាក់កក់ និងការបន្តកិច្ចសន្យា។' : 'ជ្រើសរើសបន្ទប់ខាងក្រោមដោយផ្ទាល់ និងបំពេញលក្ខខណ្ឌកិច្ចសន្យាក្នុងទំព័រនេះ។'}
          </p>
        </div>
        <Button type="submit" form="editorForm" leftIcon={<Save className="h-4 w-4" />} loading={submitting} onClick={() => document.getElementById('editorForm')?.requestSubmit()}>
          រក្សាទុកកិច្ចសន្យា
        </Button>
      </div>

      {loadError && <Alert variant="danger" title="កំហុស" description={loadError} dismissible />}
      {saveError && <Alert variant="danger" title="ការរក្សាទុកបរាជ័យ" description={saveError} dismissible />}

      {/* Inline Visual Room Selection Section */}
      <SectionCard
        icon={<DoorOpen className="h-5 w-5" />}
        title="1. ជ្រើសរើសបន្ទប់"
        subtitle="ចុចលើបន្ទប់ណាមួយខាងក្រោម ដើម្បីជ្រើសរើស និងបំពេញតម្លៃប្រចាំខែដោយស្វ័យប្រវត្តិ។"
        headerAction={
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowRoomGrid((p) => !p)}
            className="text-slate-500 hover:text-slate-700"
          >
            {showRoomGrid ? <ChevronUp className="h-4 w-4 mr-1 inline" /> : <ChevronDown className="h-4 w-4 mr-1 inline" />}
            {showRoomGrid ? 'បត់បន្ទប់' : 'ពង្រីកបន្ទប់'}
          </Button>
        }
      >
        {/* Selected Room Banner Summary */}
        {selectedRoom && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/70 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-white text-sm">
                    បានជ្រើសរើសបន្ទប់ #{selectedRoom.roomNumber} ({selectedRoom.name || `បន្ទប់ ${selectedRoom.roomNumber}`})
                  </span>
                  <Badge variant={selectedRoom.status === 'AVAILABLE' ? 'success' : 'neutral'}>
                    {selectedRoom.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {houseName(selectedRoom.houseId)} · {roomTypeName(selectedRoom.roomTypeId)} · ថ្លៃជួល: <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(selectedRoom.monthlyRent)}/ខែ</span>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowRoomGrid(true)}
              className="text-xs"
            >
              ផ្លាស់ប្តូរបន្ទប់
            </Button>
          </div>
        )}

        {formErrors.roomId && <p className="mb-3 text-xs font-semibold text-red-500">{formErrors.roomId}</p>}

        {showRoomGrid && (
          <div className="space-y-4">
            {/* Inline Filter Controls */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-gray-800/50 border border-slate-200/60 dark:border-gray-800">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-56">
                  <Input
                    placeholder="ស្វែងរកបន្ទប់ #..."
                    leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                    value={roomSearchTerm}
                    onChange={(e) => setRoomSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Select
                    options={[
                      { value: '', label: 'ផ្ទះទាំងអស់' },
                      ...houses.map((h) => ({ value: String(h.id), label: h.name })),
                    ]}
                    value={houseFilter}
                    onChange={(e) => setHouseFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant={roomFilterStatus === 'AVAILABLE' ? 'primary' : 'outline'}
                  size="xs"
                  onClick={() => setRoomFilterStatus('AVAILABLE')}
                >
                  មានទំនេរតែប៉ុណ្ណោះ
                </Button>
                <Button
                  variant={roomFilterStatus === '' ? 'primary' : 'outline'}
                  size="xs"
                  onClick={() => setRoomFilterStatus('')}
                >
                  បន្ទប់ទាំងអស់
                </Button>
              </div>
            </div>

            {/* Inline Room Cards */}
            {inlineFilteredRooms.length === 0 ? (
              <EmptyState icon={DoorOpen} title="រកមិនឃើញបន្ទប់" description="សូមព្យាយាមប្តូរតម្រងទៅ 'បន្ទប់ទាំងអស់' ឬសម្អាតការស្វែងរក។" />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inlineFilteredRooms.map((room) => {
                  const isSelected = String(room.id) === String(form.roomId);
                  const isAvailable = room.status === 'AVAILABLE';
                  const canSelect = isAvailable || (isEdit && String(room.id) === String(contract?.roomId));

                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        if (canSelect) {
                          handleSelectRoom(room);
                        } else {
                          toast.error('បន្ទប់មានអ្នកស្នាក់នៅ', `បន្ទប់ #${room.roomNumber} កំពុងមានអ្នកស្នាក់នៅ ហើយមិនអាចផ្តល់ឲ្យកិច្ចសន្យាថ្មីបានទេ។`);
                        }
                      }}
                      className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 cursor-pointer'
                          : canSelect
                          ? 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900 cursor-pointer'
                          : 'border-slate-200/60 bg-slate-50/80 opacity-70 dark:border-gray-800 dark:bg-gray-900/40 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                              <DoorOpen className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white text-sm">
                                {room.name || `បន្ទប់ ${room.roomNumber}`}
                              </p>
                              <p className="font-mono text-xs text-slate-400">បន្ទប់ #{room.roomNumber}</p>
                            </div>
                          </div>
                          <Badge variant={isAvailable ? 'success' : 'neutral'}>
                            {room.status}
                          </Badge>
                        </div>

                        <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                          <p className="truncate">{houseName(room.houseId)} · {roomTypeName(room.roomTypeId)}</p>
                          {room.floorNumber != null && <p>ជាន់ {room.floorNumber} · សមត្ថភាព: {room.capacity} នាក់</p>}
                        </div>
                      </div>

                      <div className="mt-3 border-t border-slate-100 pt-2 dark:border-gray-800 flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {formatCurrency(room.monthlyRent)} <span className="text-xs font-normal text-slate-400">/ខែ</span>
                        </span>

                        <Button
                          variant={isSelected ? 'primary' : canSelect ? 'outline' : 'ghost'}
                          size="xs"
                          disabled={!canSelect}
                          leftIcon={isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                        >
                          {isSelected ? 'បានជ្រើសរើស' : canSelect ? 'ជ្រើសរើស' : 'មានអ្នកស្នាក់នៅ'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Contract Terms & Dates */}
      <SectionCard
        icon={<FileText className="h-5 w-5" />}
        title="2. លក្ខខណ្ឌកិច្ចសន្យា"
        subtitle="កំណត់រយៈពេលកិច្ចសន្យា ការបង់ថ្លៃជួល និងស្ថានភាព។"
      >
        <form id="editorForm" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isEdit ? (
              <Input label="លេខកិច្ចសន្យា" name="contractNo" value={contract?.contractNo || ''} disabled />
            ) : (
              <div>
                <Input label="លេខកិច្ចសន្យា" name="contractNo" value="" disabled placeholder="បង្កើតដោយស្វ័យប្រវត្តិ" />
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">លេខកិច្ចសន្យានឹងត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិពីប្រព័ន្ធ។</p>
              </div>
            )}
            <Select label="ស្ថានភាព" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleFormChange} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="ថ្ងៃចាប់ផ្តើម" required type="date" name="startDate" value={form.startDate} onChange={handleFormChange} error={formErrors.startDate} />
            <Input label="ថ្ងៃបញ្ចប់" type="date" name="endDate" value={form.endDate} onChange={handleFormChange} />
            <Input label="ថ្លៃជួលប្រចាំខែ ($)" required type="number" step="0.01" min="0" name="monthlyRent" value={form.monthlyRent} onChange={handleFormChange} error={formErrors.monthlyRent} />
            <Input label="ប្រាក់កក់ ($)" type="number" step="0.01" min="0" name="securityDeposit" value={form.securityDeposit} onChange={handleFormChange} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <Input label="ថ្ងៃកំណត់បង់" type="number" min="1" max="31" name="dueDay" value={form.dueDay} onChange={handleFormChange} />
            </div>
            <div className="sm:col-span-3">
              <Textarea label="កំណត់ចំណាំ" name="notes" value={form.notes} onChange={handleFormChange} rows={2} placeholder="កំណត់ចំណាំកិច្ចសន្យាស្រេចចិត្ត..." />
            </div>
          </div>
        </form>
      </SectionCard>

      {isEdit && contract && (
        <>
          <TenantSection contractId={contract.id} />
          <DepositSection contractId={contract.id} />
          <RenewalSection contractId={contract.id} onRenewed={refreshAfterRenewal} />
        </>
      )}
    </div>
  );
}

const SectionCard = ({ icon, title, subtitle, headerAction, children }) => (
  <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {headerAction}
    </div>
    {children}
  </div>
);

/* Sub-sections for Edit mode (Tenants, Deposits, Renewals) */
const TenantSection = ({ contractId }) => {
  const { contractTenants, loading, fetchContractTenants, addTenant, removeTenant } = useContractTenants(contractId);
  const { tenants } = useTenants();
  const { contracts } = useContracts();
  const toast = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ tenantId: '', isPrimary: false, joinedAt: '', leftAt: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activelyRentingTenantIds, setActivelyRentingTenantIds] = useState(new Set());

  // Fetch active renting tenant IDs when modal is opened
  useEffect(() => {
    if (!addOpen || !contracts) return;
    const activeContracts = contracts.filter((c) => c.status === 'ACTIVE');
    if (activeContracts.length === 0) {
      setActivelyRentingTenantIds(new Set());
      return;
    }
    Promise.all(
      activeContracts.map((c) =>
        tenantApi.getTenantsByContract(c.id).catch(() => [])
      )
    ).then((results) => {
      const rentingIds = new Set();
      const today = new Date().toISOString().split('T')[0];
      results.flat().forEach((ct) => {
        if (!ct.leftAt || ct.leftAt >= today) {
          rentingIds.add(ct.tenantId);
        }
      });
      setActivelyRentingTenantIds(rentingIds);
    });
  }, [addOpen, contracts]);

  const tenantsById = useMemo(
    () => Object.fromEntries((tenants || []).map((t) => [t.id, t])),
    [tenants]
  );

  const alreadyAssignedThisContract = useMemo(
    () => new Set(contractTenants.map((ct) => ct.tenantId)),
    [contractTenants]
  );

  const availableTenants = useMemo(() => {
    const allowedStatuses = ['ACTIVE', 'PENDING'];
    return (tenants || []).filter((t) => {
      if (!allowedStatuses.includes(t.status)) return false;
      if (alreadyAssignedThisContract.has(t.id)) return false;
      if (activelyRentingTenantIds.has(t.id)) return false;
      return true;
    });
  }, [tenants, alreadyAssignedThisContract, activelyRentingTenantIds]);

  const tenantOptions = useMemo(
    () =>
      availableTenants.map((t) => ({
        value: t.id,
        label:
          t.status === 'PENDING'
            ? `${fullName(t)} (${t.tenantCode}) · [រង់ចាំ]`
            : `${fullName(t)} (${t.tenantCode}) · [សកម្ម]`,
      })),
    [availableTenants]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.tenantId) {
      setFormErrors({ tenantId: 'តម្រូវឱ្យជ្រើសរើសអ្នកជួល' });
      return;
    }
    setSubmitting(true);
    try {
      await addTenant({
        contractId,
        tenantId: Number(form.tenantId),
        isPrimary: form.isPrimary || false,
        joinedAt: form.joinedAt || new Date().toISOString().split('T')[0],
        leftAt: form.leftAt || null,
      });
      toast.success('បានចាត់តាំងអ្នកជួល');
      setAddOpen(false);
      setForm({ tenantId: '', isPrimary: false, joinedAt: '', leftAt: '' });
      fetchContractTenants();
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || 'មិនអាចបន្ថែមអ្នកជួលបានទេ។');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (ctId) => {
    try {
      await removeTenant(ctId);
      toast.success('បានដកអ្នកជួលចេញ');
      fetchContractTenants();
    } catch {
      toast.error('មិនអាចដកអ្នកជួលចេញបានទេ');
    }
  };

  return (
    <SectionCard icon={<UsersIcon className="h-5 w-5" />} title="អ្នកជួលដែលបានចាត់តាំង" subtitle="អ្នកជួលដែលទាក់ទងនឹងកិច្ចសន្យានេះ។">
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            បន្ថែមអ្នកជួល
          </Button>
        </div>

        {loading ? (
          <Skeleton className="h-12 w-full rounded-lg" />
        ) : contractTenants.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {contractTenants.map((ct) => {
              const t = tenantsById[ct.tenantId];
              return (
                <div key={ct.id} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {t ? fullName(t) : `អ្នកជួល #${ct.tenantId}`}
                      </p>
                      {ct.isPrimary && <Badge variant="info">ចម្បង</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">ចូលរួម: {formatDate(ct.joinedAt)}</p>
                  </div>
                  <IconButton variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4 text-red-500" />} onClick={() => handleRemove(ct.id)} />
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={UsersIcon} title="មិនទាន់មានអ្នកជួលដែលបានចាត់តាំងទេ" description="បន្ថែមអ្នកជួលដែលមិនទាន់ត្រូវបានចាត់តាំង ដើម្បីធ្វើឱ្យកិច្ចសន្យានេះសកម្ម។" />
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="ចាត់តាំងអ្នកជួលឲ្យកិច្ចសន្យា">
        <form onSubmit={handleAdd} className="space-y-4">
          {availableTenants.length === 0 ? (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              មិនមានអ្នកជួលដែលនៅទំនេរទេ។ អ្នកជួលទាំងអស់ (សកម្ម ឬ រង់ចាំ) កំពុងជួលផ្ទះ ឬបន្ទប់ផ្សេងទៀត ឬត្រូវបានចាត់តាំងហើយ។
            </div>
          ) : (
            <div className="space-y-2">
              <Select
                label="ជ្រើសរើសអ្នកជួល (សកម្ម ឬ រង់ចាំ)"
                required
                name="tenantId"
                options={tenantOptions}
                value={form.tenantId}
                onChange={handleChange}
                error={formErrors.tenantId}
                placeholder="ជ្រើសរើសអ្នកជួល..."
              />
              {/* Show status badge for selected tenant */}
              {form.tenantId && (() => {
                const sel = availableTenants.find((t) => String(t.id) === String(form.tenantId));
                if (!sel) return null;
                return (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800">
                    <span className="text-slate-500 dark:text-slate-400">ស្ថានភាព:</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        sel.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        sel.status === 'PENDING' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      {sel.status === 'PENDING' ? 'រង់ចាំ (PENDING)' : 'សកម្ម (ACTIVE)'}
                    </span>
                    <span className="ml-auto font-medium text-slate-700 dark:text-slate-300">{sel.tenantCode}</span>
                  </div>
                );
              })()}
              {/* Pending tenants note */}
              {availableTenants.some((t) => t.status === 'PENDING') && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  * អ្នកជួលដែលមានស្ថានភាព <strong>រង់ចាំ [PENDING]</strong> ជាអ្នកដែលបានចុះឈ្មោះតាម link ជូនដំណឹង ប៉ុន្តែមិនទាន់ត្រូវបានចាត់តាំងទៅកិច្ចសន្យានៅឡើយ។
                </p>
              )}
            </div>
          )}

          <Input label="ថ្ងៃចូលរួម" type="date" name="joinedAt" value={form.joinedAt} onChange={handleChange} />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPrimary"
              name="isPrimary"
              checked={form.isPrimary}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="isPrimary" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              កំណត់ជាអ្នកជួលចម្បង
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              បោះបង់
            </Button>
            <Button type="submit" loading={submitting} disabled={availableTenants.length === 0}>
              ចាត់តាំង
            </Button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
};

const DepositSection = ({ contractId }) => {
  const { deposits, loading, createDeposit } = useContractDeposits(contractId);
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', status: 'PAID', paidAt: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    setSubmitting(true);
    try {
      await createDeposit({
        contractId,
        amount: Number(form.amount),
        status: form.status,
        paidAt: form.paidAt || new Date().toISOString().split('T')[0],
        notes: form.notes || null,
      });
      toast.success('បានកត់ត្រាប្រាក់កក់');
      setAddOpen(false);
      setForm({ amount: '', status: 'PAID', paidAt: '', notes: '' });
    } catch {
      toast.error('មិនអាចបន្ថែមប្រាក់កក់បានទេ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard icon={<PiggyBank className="h-5 w-5" />} title="ប្រាក់កក់" subtitle="កំណត់ត្រាប្រាក់កក់ និងស្ថានភាពទូទាត់។">
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            កត់ត្រាប្រាក់កក់
          </Button>
        </div>
        {loading ? (
          <Skeleton className="h-12 w-full rounded-lg" />
        ) : deposits.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {deposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(d.amount)}</p>
                  <p className="text-xs text-slate-400">បានបង់: {formatDate(d.paidAt)}</p>
                </div>
                <Badge variant={DEPOSIT_STATUS_VARIANT[d.status] || 'neutral'}>{DEPOSIT_STATUS_LABEL[d.status] || d.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={PiggyBank} title="មិនទាន់មានកំណត់ត្រាប្រាក់កក់ទេ" description="កត់ត្រាប្រាក់កក់សម្រាប់កិច្ចសន្យានេះ។" />
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="កត់ត្រាប្រាក់កក់">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="ចំនួនទឹកប្រាក់ ($)" required type="number" step="0.01" name="amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
          <Select
            label="ស្ថានភាព"
            name="status"
            options={[
              { value: 'PENDING', label: 'កំពុងរង់ចាំ' },
              { value: 'PAID', label: 'បានបង់' },
              { value: 'REFUNDED', label: 'បានសងវិញ' },
            ]}
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          />
          <Input label="ថ្ងៃបានបង់" type="date" name="paidAt" value={form.paidAt} onChange={(e) => setForm((p) => ({ ...p, paidAt: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>បោះបង់</Button>
            <Button type="submit" loading={submitting}>កត់ត្រា</Button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
};

const RenewalSection = ({ contractId, onRenewed }) => {
  const { renewals, createRenewal } = useContractRenewals(contractId);
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ previousEndDate: '', newEndDate: '', previousRent: '', newRent: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRenewal({
        contractId,
        previousEndDate: form.previousEndDate || null,
        newEndDate: form.newEndDate,
        previousRent: Number(form.previousRent) || 0,
        newRent: Number(form.newRent),
        notes: form.notes || null,
      });
      toast.success('បានកត់ត្រាការបន្ត');
      setAddOpen(false);
      setForm({ previousEndDate: '', newEndDate: '', previousRent: '', newRent: '', notes: '' });
      await onRenewed?.();
    } catch {
      toast.error('មិនអាចបន្ថែមការបន្តបានទេ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard icon={<Repeat className="h-5 w-5" />} title="ការបន្តកិច្ចសន្យា" subtitle="ប្រវត្តិនៃការបន្តកិច្ចសន្យា។">
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            បន្ថែមការបន្ត
          </Button>
        </div>
        {renewals.length > 0 ? (
          renewals.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200/80 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(r.previousRent)} → {formatCurrency(r.newRent)}</span>
                <span className="text-slate-400">{formatDateTime(r.renewedAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon={Repeat} title="មិនទាន់មានការបន្តទេ" description="កត់ត្រាការបន្តកិច្ចសន្យា។" />
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="បន្ថែមការបន្តកិច្ចសន្យា">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="ថ្ងៃបញ្ចប់ថ្មី" required type="date" name="newEndDate" value={form.newEndDate} onChange={(e) => setForm((p) => ({ ...p, newEndDate: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="ថ្លៃជួលមុន" type="number" step="0.01" name="previousRent" value={form.previousRent} onChange={(e) => setForm((p) => ({ ...p, previousRent: e.target.value }))} />
            <Input label="ថ្លៃជួលថ្មី" required type="number" step="0.01" name="newRent" value={form.newRent} onChange={(e) => setForm((p) => ({ ...p, newRent: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>បោះបង់</Button>
            <Button type="submit" loading={submitting}>បន្ថែមការបន្ត</Button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
};
