import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Users as UsersIcon,
  PiggyBank,
  Repeat,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { useContracts, useContractDeposits, useContractRenewals, useContractTenants } from '../../hooks/useContracts.js';
import { useRooms } from '../../hooks/useRooms.js';
import { useTenants } from '../../hooks/useTenants.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { Button, Input, Textarea, Select, Badge, Alert, Modal, ConfirmDialog, EmptyState, Skeleton } from '../../components/ui/index.js';

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
const roomLabel = (r) => (r.name ? `${r.name} (${r.roomNumber})` : `Room ${r.roomNumber}`);

export default function ContractEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const {
    getContract,
    createContract,
    updateContract,
  } = useContracts();
  const { rooms } = useRooms();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [contract, setContract] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const roomOptions = useMemo(
    () => rooms.map((r) => ({ value: r.id, label: roomLabel(r) })),
    [rooms]
  );

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

  const validate = () => {
    const errs = {};
    if (!form.contractNo.trim()) errs.contractNo = 'Contract number is required';
    if (!form.roomId) errs.roomId = 'Room is required';
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
        toast.success('Contract updated', `Contract "${form.contractNo}" has been updated.`);
      } else {
        const created = await createContract(buildPayload());
        toast.success('Contract created', `Contract "${form.contractNo}" has been created.`);
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

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="h-6 w-56" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
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
          <Link to="/contracts" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <ArrowLeft className="h-4 w-4" /> Back to Contracts
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            {isEdit ? `Edit Contract ${form.contractNo ? `#${contract?.id} · ${form.contractNo}` : ''}` : 'Create Contract'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isEdit ? 'Manage contract details, tenants, deposits, and renewals.' : 'Create a contract, then add tenants, deposits, and renewals.'}
          </p>
        </div>
        <Button type="submit" form="editorForm" leftIcon={<Save className="h-4 w-4" />} loading={submitting} onClick={() => document.getElementById('editorForm')?.requestSubmit()}>
          Save Contract
        </Button>
      </div>

      {loadError && <Alert variant="danger" title="Error" description={loadError} dismissible />}
      {saveError && <Alert variant="danger" title="Save failed" description={saveError} dismissible />}

      {/* Contract form */}
      <SectionCard
        icon={<FileText className="h-5 w-5" />}
        title="Contract Details"
        subtitle="Core contract information and financial terms."
      >
        <form id="editorForm" onSubmit={handleSave}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Room" required name="roomId" options={roomOptions} value={form.roomId} onChange={handleFormChange} placeholder="Select a room" error={formErrors.roomId} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Contract No." required name="contractNo" value={form.contractNo} onChange={handleFormChange} placeholder="e.g., CT-2026-001" error={formErrors.contractNo} />
            <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleFormChange} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Start Date" required type="date" name="startDate" value={form.startDate} onChange={handleFormChange} error={formErrors.startDate} />
            <Input label="End Date" type="date" name="endDate" value={form.endDate} onChange={handleFormChange} />
            <Input label="Monthly Rent" required type="number" step="0.01" min="0" name="monthlyRent" value={form.monthlyRent} onChange={handleFormChange} error={formErrors.monthlyRent} />
            <Input label="Security Deposit" type="number" step="0.01" min="0" name="securityDeposit" value={form.securityDeposit} onChange={handleFormChange} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <Input label="Due Day" type="number" min="1" max="31" name="dueDay" value={form.dueDay} onChange={handleFormChange} />
            </div>
            <div className="sm:col-span-3">
              <Textarea label="Notes" name="notes" value={form.notes} onChange={handleFormChange} rows={2} />
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

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
        {icon}
      </span>
      <div>
        <h2 className="text-base font-semibold text-slate-800 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const TenantSection = ({ contractId }) => {
  const hook = useContractTenants(contractId);
  const { contractTenants, loading, error, addTenant, removeTenant } = hook;
  const { tenants } = useTenants();
  const toast = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ tenantId: '', isPrimary: false, joinedAt: '', leftAt: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const tenantName = useCallback(
    (tid) => {
      const t = tenants.find((x) => x.id === tid);
      return t ? fullName(t) : `Tenant #${tid}`;
    },
    [tenants]
  );

  const tenantOptions = useMemo(
    () => tenants.map((t) => ({ value: t.id, label: fullName(t) })),
    [tenants]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenantId) {
      setFormErrors({ tenantId: 'Tenant is required' });
      return;
    }
    setSubmitting(true);
    try {
      await addTenant({
        tenantId: Number(form.tenantId),
        isPrimary: form.isPrimary || false,
        joinedAt: form.joinedAt || new Date().toISOString().slice(0, 10),
        leftAt: form.leftAt || null,
      });
      toast.success('Tenant added', 'Tenant assigned to this contract.');
      setAddOpen(false);
      setForm({ tenantId: '', isPrimary: false, joinedAt: '', leftAt: '' });
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to add tenant.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeTenant(deleteTarget.id);
      toast.success('Tenant removed', 'Tenant removed from this contract.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to remove tenant.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SectionCard icon={<UsersIcon className="h-5 w-5" />} title="Tenants" subtitle="Tenants assigned to this contract.">
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Add Tenant</Button>
        </div>
        {error && <Alert variant="danger" title="Error" description={error} dismissible />}
        {loading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : contractTenants.length > 0 ? (
          contractTenants.map((ct) => (
            <div key={ct.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                  <UsersIcon className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{tenantName(ct.tenantId)}</p>
                    {ct.isPrimary && <Badge variant="info">Primary</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Joined {formatDate(ct.joinedAt)}{ct.leftAt ? ` · Left ${formatDate(ct.leftAt)}` : ''}
                  </p>
                </div>
              </div>
              <IconButtonGhost onClick={() => setDeleteTarget(ct)} />
            </div>
          ))
        ) : (
          <EmptyState icon={UsersIcon} title="No tenants assigned" description="Add a tenant to this contract." />
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Tenant to Contract"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="editorTenantForm" onClick={() => document.getElementById('editorTenantForm')?.requestSubmit()} loading={submitting}>Add</Button>
          </div>
        }
      >
        <form id="editorTenantForm" onSubmit={handleSubmit} className="space-y-4">
          <Select label="Tenant" required name="tenantId" options={tenantOptions} value={form.tenantId} onChange={handleChange} placeholder="Select a tenant" error={formErrors.tenantId} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Joined Date" type="date" name="joinedAt" value={form.joinedAt} onChange={handleChange} />
            <Input label="Left Date" type="date" name="leftAt" value={form.leftAt} onChange={handleChange} />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-white" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary tenant</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Tenant"
        description={`Remove ${deleteTarget ? tenantName(deleteTarget.tenantId) : ''} from this contract?`}
        confirmText="Remove"
        cancelText="Cancel"
        danger
        loading={deleting}
        onConfirm={handleRemove}
        onCancel={() => setDeleteTarget(null)}
      />
    </SectionCard>
  );
};

const IconButtonGhost = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
    aria-label="Remove"
  >
    <Trash2 className="h-4 w-4" />
  </button>
);

const DepositSection = ({ contractId }) => {
  const hook = useContractDeposits(contractId);
  const { deposits, loading, error, createDeposit, markPaid } = hook;
  const toast = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [form, setForm] = useState({ amount: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setFormErrors({ amount: 'Amount must be greater than zero' });
      return;
    }
    setSubmitting(true);
    try {
      await createDeposit({ amount: Number(form.amount), notes: form.notes.trim() || null });
      toast.success('Deposit added', 'Deposit recorded for this contract.');
      setAddOpen(false);
      setForm({ amount: '', notes: '' });
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to add deposit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (!payTarget) return;
    setPaying(true);
    try {
      await markPaid(payTarget.id, payTarget.amount);
      toast.success('Deposit marked as paid', 'Deposit payment recorded.');
      setPayTarget(null);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to mark deposit as paid.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <SectionCard icon={<PiggyBank className="h-5 w-5" />} title="Deposits" subtitle="Security deposits recorded for this contract.">
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Add Deposit</Button>
        </div>
        {error && <Alert variant="danger" title="Error" description={error} dismissible />}
        {loading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : deposits.length > 0 ? (
          deposits.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                  <PiggyBank className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(d.amount)}</p>
                    <Badge variant={DEPOSIT_STATUS_VARIANT[d.status] || 'default'}>{d.status || '—'}</Badge>
                  </div>
                  {d.notes && <p className="mt-0.5 text-xs text-slate-400">{d.notes}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    {d.status === 'PAID' ? `Paid ${formatDateTime(d.paidAt)}` : `Created ${formatDateTime(d.createdAt)}`}
                  </p>
                </div>
              </div>
              {d.status === 'PENDING' && (
                <Button variant="primary" size="sm" leftIcon={<BadgeCheck className="h-4 w-4" />} onClick={() => setPayTarget(d)}>Mark Paid</Button>
              )}
            </div>
          ))
        ) : (
          <EmptyState icon={PiggyBank} title="No deposits" description="Add a deposit for this contract." />
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Deposit"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="editorDepositForm" onClick={() => document.getElementById('editorDepositForm')?.requestSubmit()} loading={submitting}>Add</Button>
          </div>
        }
      >
        <form id="editorDepositForm" onSubmit={handleCreate} className="space-y-4">
          <Input label="Amount" required type="number" step="0.01" min="0" name="amount" value={form.amount} onChange={handleChange} error={formErrors.amount} />
          <Input label="Notes" name="notes" value={form.notes} onChange={handleChange} />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!payTarget}
        title="Mark Deposit as Paid"
        description={`Record ${formatCurrency(payTarget?.amount)} as paid for this deposit?`}
        confirmText="Mark Paid"
        cancelText="Cancel"
        loading={paying}
        onConfirm={handlePay}
        onCancel={() => setPayTarget(null)}
      />
    </SectionCard>
  );
};

const RenewalSection = ({ contractId }) => {
  const hook = useContractRenewals(contractId);
  const { renewals, loading, error, createRenewal } = hook;
  const toast = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ previousEndDate: '', newEndDate: '', previousRent: '', newRent: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.newEndDate) errs.newEndDate = 'New end date is required';
    if (form.newRent === '' || Number(form.newRent) <= 0) errs.newRent = 'New rent must be greater than zero';
    if (form.previousRent === '') errs.previousRent = 'Previous rent is required';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await createRenewal({
        previousEndDate: form.previousEndDate || null,
        newEndDate: form.newEndDate,
        previousRent: Number(form.previousRent),
        newRent: Number(form.newRent),
        notes: form.notes.trim() || null,
      });
      toast.success('Renewal added', 'Contract renewed successfully.');
      setAddOpen(false);
      setForm({ previousEndDate: '', newEndDate: '', previousRent: '', newRent: '', notes: '' });
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to add renewal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard icon={<Repeat className="h-5 w-5" />} title="Renewals" subtitle="Renewal history for this contract.">
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Add Renewal</Button>
        </div>
        {error && <Alert variant="danger" title="Error" description={error} dismissible />}
        {loading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : renewals.length > 0 ? (
          renewals.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                  <Repeat className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {formatCurrency(r.previousRent)} → {formatCurrency(r.newRent)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Renewed {formatDateTime(r.renewedAt)} · by {r.createdByName || r.createdById || '—'}
                  </p>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-gray-800 dark:text-slate-400">
                <span>Previous end: {formatDate(r.previousEndDate)}</span>
                <span>New end: {formatDate(r.newEndDate)}</span>
              </div>
              {r.notes && <p className="mt-2 text-xs text-slate-400">{r.notes}</p>}
            </div>
          ))
        ) : (
          <EmptyState icon={Repeat} title="No renewals" description="Add a renewal for this contract." />
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Renewal"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="editorRenewalForm" onClick={() => document.getElementById('editorRenewalForm')?.requestSubmit()} loading={submitting}>Add</Button>
          </div>
        }
      >
        <form id="editorRenewalForm" onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Previous End Date" type="date" name="previousEndDate" value={form.previousEndDate} onChange={handleChange} />
            <Input label="New End Date" required type="date" name="newEndDate" value={form.newEndDate} onChange={handleChange} error={formErrors.newEndDate} />
            <Input label="Previous Rent" required type="number" step="0.01" min="0" name="previousRent" value={form.previousRent} onChange={handleChange} error={formErrors.previousRent} />
            <Input label="New Rent" required type="number" step="0.01" min="0" name="newRent" value={form.newRent} onChange={handleChange} error={formErrors.newRent} />
          </div>
          <Input label="Notes" name="notes" value={form.notes} onChange={handleChange} />
        </form>
      </Modal>
    </SectionCard>
  );
};
