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
  Building2,
  CheckCircle2,
  Search,
  Layers,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useContracts, useContractDeposits, useContractRenewals, useContractTenants } from '../../hooks/useContracts.js';
import { useRooms } from '../../hooks/useRooms.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useRoomTypes } from '../../hooks/useRoomType.js';
import { useTenants } from '../../hooks/useTenants.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { Button, IconButton, Input, Textarea, Select, Badge, Alert, Modal, EmptyState, Skeleton } from '../../components/ui/index.js';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const DEPOSIT_STATUS_VARIANT = {
  PENDING: 'warning',
  PAID: 'success',
  PARTIALLY_REFUNDED: 'info',
  REFUNDED: 'neutral',
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
  contractNo: '',
  roomId: '',
  startDate: '',
  endDate: '',
  monthlyRent: '',
  securityDeposit: '',
  dueDay: 5,
  status: 'DRAFT',
  notes: '',
};

const fullName = (t) => `${t.firstName || ''} ${t.lastName || ''}`.trim() || `Tenant #${t.id}`;

export default function ContractEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id && id !== 'new';

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
    (houseId) => houses.find((h) => h.id === houseId)?.name || `House #${houseId}`,
    [houses]
  );

  const roomTypeName = useCallback(
    (typeId) => roomTypes.find((rt) => rt.id === typeId)?.name || `Type #${typeId}`,
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
        contractNo: data.contractNo || '',
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
      setLoadError(err.response?.data?.message || err.response?.data?.error || 'Failed to load contract.');
    } finally {
      setLoading(false);
    }
  }, [id, getContract]);

  useEffect(() => {
    if (isEdit) {
      loadContract();
    }
  }, [isEdit, loadContract]);

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
    if (!form.contractNo.trim()) errs.contractNo = 'Contract number is required';
    if (!form.roomId) errs.roomId = 'Room selection is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) errs.monthlyRent = 'Monthly rent must be greater than 0';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = () => ({
    contractNo: form.contractNo.trim(),
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
        toast.success('Contract updated', `Contract "${form.contractNo}" updated.`);
      } else {
        const created = await createContract(buildPayload());
        toast.success('Contract created', `Contract "${form.contractNo}" created.`);
        navigate(`/contracts/${created.id}`, { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to save contract.';
      setSaveError(message);
      toast.error('Error', message);
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
          <Link to="/contracts" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4" /> Back to Contracts
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            {isEdit ? `Edit Contract ${form.contractNo ? `#${contract?.id} · ${form.contractNo}` : ''}` : 'Create Contract'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isEdit ? 'Manage contract details, tenants, deposits, and renewals.' : 'Select a room directly below and fill in contract terms on this page.'}
          </p>
        </div>
        <Button type="submit" form="editorForm" leftIcon={<Save className="h-4 w-4" />} loading={submitting} onClick={() => document.getElementById('editorForm')?.requestSubmit()}>
          Save Contract
        </Button>
      </div>

      {loadError && <Alert variant="danger" title="Error" description={loadError} dismissible />}
      {saveError && <Alert variant="danger" title="Save failed" description={saveError} dismissible />}

      {/* Inline Visual Room Selection Section */}
      <SectionCard
        icon={<DoorOpen className="h-5 w-5" />}
        title="1. Select Room"
        subtitle="Click any unit below to select it and auto-fill monthly pricing."
        headerAction={
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowRoomGrid((p) => !p)}
            className="text-slate-500 hover:text-slate-700"
          >
            {showRoomGrid ? <ChevronUp className="h-4 w-4 mr-1 inline" /> : <ChevronDown className="h-4 w-4 mr-1 inline" />}
            {showRoomGrid ? 'Collapse Units' : 'Expand Units'}
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
                    Selected Unit #{selectedRoom.roomNumber} ({selectedRoom.name || `Room ${selectedRoom.roomNumber}`})
                  </span>
                  <Badge variant={selectedRoom.status === 'AVAILABLE' ? 'success' : 'neutral'}>
                    {selectedRoom.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {houseName(selectedRoom.houseId)} · {roomTypeName(selectedRoom.roomTypeId)} · Rent: <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(selectedRoom.monthlyRent)}/mo</span>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowRoomGrid(true)}
              className="text-xs"
            >
              Change Unit
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
                    placeholder="Search unit #..."
                    leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                    value={roomSearchTerm}
                    onChange={(e) => setRoomSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Select
                    options={[
                      { value: '', label: 'All Houses' },
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
                  Available Only
                </Button>
                <Button
                  variant={roomFilterStatus === '' ? 'primary' : 'outline'}
                  size="xs"
                  onClick={() => setRoomFilterStatus('')}
                >
                  All Rooms
                </Button>
              </div>
            </div>

            {/* Inline Room Cards */}
            {inlineFilteredRooms.length === 0 ? (
              <EmptyState icon={DoorOpen} title="No units found" description="Try switching filter to 'All Rooms' or clearing search." />
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
                          toast.error('Occupied Unit', `Unit #${room.roomNumber} is currently occupied and cannot be assigned to a new contract.`);
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
                                {room.name || `Room ${room.roomNumber}`}
                              </p>
                              <p className="font-mono text-xs text-slate-400">Unit #{room.roomNumber}</p>
                            </div>
                          </div>
                          <Badge variant={isAvailable ? 'success' : 'neutral'}>
                            {room.status}
                          </Badge>
                        </div>

                        <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                          <p className="truncate">{houseName(room.houseId)} · {roomTypeName(room.roomTypeId)}</p>
                          {room.floorNumber != null && <p>Floor {room.floorNumber} · Capacity: {room.capacity} Person(s)</p>}
                        </div>
                      </div>

                      <div className="mt-3 border-t border-slate-100 pt-2 dark:border-gray-800 flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {formatCurrency(room.monthlyRent)} <span className="text-xs font-normal text-slate-400">/mo</span>
                        </span>

                        <Button
                          variant={isSelected ? 'primary' : canSelect ? 'outline' : 'ghost'}
                          size="xs"
                          disabled={!canSelect}
                          leftIcon={isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                        >
                          {isSelected ? 'Selected' : canSelect ? 'Select' : 'Occupied'}
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
        title="2. Contract Terms"
        subtitle="Configure contract period, rent payment, and status."
      >
        <form id="editorForm" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Contract No." required name="contractNo" value={form.contractNo} onChange={handleFormChange} placeholder="e.g., CT-2026-001" error={formErrors.contractNo} />
            <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleFormChange} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Start Date" required type="date" name="startDate" value={form.startDate} onChange={handleFormChange} error={formErrors.startDate} />
            <Input label="End Date" type="date" name="endDate" value={form.endDate} onChange={handleFormChange} />
            <Input label="Monthly Rent ($)" required type="number" step="0.01" min="0" name="monthlyRent" value={form.monthlyRent} onChange={handleFormChange} error={formErrors.monthlyRent} />
            <Input label="Security Deposit ($)" type="number" step="0.01" min="0" name="securityDeposit" value={form.securityDeposit} onChange={handleFormChange} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <Input label="Due Day" type="number" min="1" max="31" name="dueDay" value={form.dueDay} onChange={handleFormChange} />
            </div>
            <div className="sm:col-span-3">
              <Textarea label="Notes" name="notes" value={form.notes} onChange={handleFormChange} rows={2} placeholder="Optional contract notes..." />
            </div>
          </div>
        </form>
      </SectionCard>

      {isEdit && contract && (
        <>
          <TenantSection contractId={contract.id} />
          <DepositSection contractId={contract.id} />
          <RenewalSection contractId={contract.id} />
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
    return (tenants || []).filter((t) => {
      if (t.status !== 'ACTIVE') return false;
      if (alreadyAssignedThisContract.has(t.id)) return false;
      if (activelyRentingTenantIds.has(t.id)) return false;
      return true;
    });
  }, [tenants, alreadyAssignedThisContract, activelyRentingTenantIds]);

  const tenantOptions = useMemo(
    () => availableTenants.map((t) => ({ value: t.id, label: `${fullName(t)} (${t.tenantCode})` })),
    [availableTenants]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.tenantId) {
      setFormErrors({ tenantId: 'Tenant selection is required' });
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
      toast.success('Tenant assigned');
      setAddOpen(false);
      setForm({ tenantId: '', isPrimary: false, joinedAt: '', leftAt: '' });
      fetchContractTenants();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Failed to add tenant.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (ctId) => {
    try {
      await removeTenant(ctId);
      toast.success('Tenant removed');
      fetchContractTenants();
    } catch (err) {
      toast.error('Failed to remove tenant');
    }
  };

  return (
    <SectionCard icon={<UsersIcon className="h-5 w-5" />} title="Assigned Tenants" subtitle="Tenants associated with this contract.">
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            Add Tenant
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
                        {t ? fullName(t) : `Tenant #${ct.tenantId}`}
                      </p>
                      {ct.isPrimary && <Badge variant="info">Primary</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Joined: {formatDate(ct.joinedAt)}</p>
                  </div>
                  <IconButton variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4 text-red-500" />} onClick={() => handleRemove(ct.id)} />
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={UsersIcon} title="No tenants assigned" description="Add an unassigned tenant to activate this contract." />
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Assign Tenant to Contract">
        <form onSubmit={handleAdd} className="space-y-4">
          {availableTenants.length === 0 ? (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              No available unassigned tenants. All active tenants are currently renting another house or unit.
            </div>
          ) : (
            <Select
              label="Select Available Tenant"
              required
              name="tenantId"
              options={tenantOptions}
              value={form.tenantId}
              onChange={handleChange}
              error={formErrors.tenantId}
              placeholder="Choose tenant (unassigned only)"
            />
          )}

          <Input label="Joined Date" type="date" name="joinedAt" value={form.joinedAt} onChange={handleChange} />

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
              Set as Primary Tenant
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={availableTenants.length === 0}>
              Assign
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
      toast.success('Deposit recorded');
      setAddOpen(false);
      setForm({ amount: '', status: 'PAID', paidAt: '', notes: '' });
    } catch (err) {
      toast.error('Failed to add deposit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard icon={<PiggyBank className="h-5 w-5" />} title="Security Deposits" subtitle="Deposit records and payment statuses.">
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            Record Deposit
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
                  <p className="text-xs text-slate-400">Paid: {formatDate(d.paidAt)}</p>
                </div>
                <Badge variant={DEPOSIT_STATUS_VARIANT[d.status] || 'neutral'}>{d.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={PiggyBank} title="No deposits recorded" description="Record security deposits for this contract." />
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Record Deposit">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Amount ($)" required type="number" step="0.01" name="amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
          <Select
            label="Status"
            name="status"
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'PAID', label: 'Paid' },
              { value: 'REFUNDED', label: 'Refunded' },
            ]}
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          />
          <Input label="Paid Date" type="date" name="paidAt" value={form.paidAt} onChange={(e) => setForm((p) => ({ ...p, paidAt: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Record</Button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
};

const RenewalSection = ({ contractId }) => {
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
      toast.success('Renewal recorded');
      setAddOpen(false);
      setForm({ previousEndDate: '', newEndDate: '', previousRent: '', newRent: '', notes: '' });
    } catch (err) {
      toast.error('Failed to add renewal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard icon={<Repeat className="h-5 w-5" />} title="Renewals" subtitle="Contract extension history.">
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            Add Renewal
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
          <EmptyState icon={Repeat} title="No renewals" description="Record contract renewals." />
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Contract Renewal">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="New End Date" required type="date" name="newEndDate" value={form.newEndDate} onChange={(e) => setForm((p) => ({ ...p, newEndDate: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Previous Rent" type="number" step="0.01" name="previousRent" value={form.previousRent} onChange={(e) => setForm((p) => ({ ...p, previousRent: e.target.value }))} />
            <Input label="New Rent" required type="number" step="0.01" name="newRent" value={form.newRent} onChange={(e) => setForm((p) => ({ ...p, newRent: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Add Renewal</Button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
};
