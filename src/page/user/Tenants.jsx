import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Eye,
  Trash2,
  Users as UsersIcon,
  Phone,
  Mail,
  Calendar,
  Hash,
  Briefcase,
  GraduationCap,
  School,
  IdCard,
  MapPin,
  CreditCard,
  UserRound,
  Contact,
  Power,
  ShieldCheck,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useTenants, useEmergencyContacts } from '../../hooks/useTenants.js';
import { useUsers } from '../../hooks/useUsers.js';
import { useAuthStore } from '../../store/auth.store.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Modal,
  Input,
  Textarea,
  Select,
  IconButton,
  ConfirmDialog,
  EmptyState,
  Skeleton,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
};

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const OCCUPATION_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const EMPTY_FORM = {
  userId: '',
  tenantCode: '',
  firstName: '',
  lastName: '',
  gender: 'OTHER',
  dateOfBirth: '',
  phone: '',
  email: '',
  occupationType: 'OTHER',
  occupation: '',
  schoolOrCompany: '',
  idType: '',
  idNumber: '',
  address: '',
};

const EMPTY_CONTACT = {
  name: '',
  relationship: '',
  phone: '',
  address: '',
  isPrimary: false,
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fullName = (t) => `${t.firstName || ''} ${t.lastName || ''}`.trim() || `Tenant #${t.id}`;

export default function Tenants() {
  const {
    tenants,
    loading,
    error,
    fetchTenants,
    getTenant,
    createTenant,
    updateTenant,
    deactivateTenant,
  } = useTenants();
  const { users } = useUsers();
  const currentUser = useAuthStore((s) => s.user);
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const [contactTarget, setContactTarget] = useState(null); // tenant being managed

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => fetchTenants(), [fetchTenants]);

  const stats = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter((t) => t.status === 'ACTIVE').length;
    return { total, active, inactive: total - active };
  }, [tenants]);

  const filtered = useMemo(() => {
    let result = tenants;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          fullName(t).toLowerCase().includes(q) ||
          (t.tenantCode && t.tenantCode.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          (t.phone && t.phone.includes(q))
      );
    }
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    return result;
  }, [tenants, searchTerm, statusFilter]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{status || '—'}</Badge>
  );

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || `User #${u.id}`,
      })),
    [users]
  );

  const columns = [
    {
      header: 'Tenant',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-slate-800 dark:text-white">{fullName(row)}</p>
            <p className="font-mono text-xs text-slate-400">{row.tenantCode}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (row) => (
        <div className="space-y-1">
          {row.phone && (
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Phone className="h-3.5 w-3.5" /> {row.phone}
            </span>
          )}
          {row.email && (
            <span className="flex max-w-[200px] items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{row.email}</span>
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Gender',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{row.gender || '—'}</span>,
    },
    {
      header: 'Occupation',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row.occupationType
              ? row.occupationType.charAt(0) + row.occupationType.slice(1).toLowerCase()
              : '—'}
          </span>
          {row.schoolOrCompany && (
            <span className="block max-w-[200px] truncate text-xs text-slate-400">{row.schoolOrCompany}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Created',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton variant="ghost" size="sm" tooltip="View" icon={<Eye className="h-4 w-4" />} onClick={() => openView(row)} />
          <IconButton variant="ghost" size="sm" tooltip="Edit" icon={<Edit className="h-4 w-4" />} onClick={() => openEdit(row)} />
          <IconButton variant="ghost" size="sm" tooltip="Contacts" icon={<Contact className="h-4 w-4" />} onClick={() => setContactTarget(row)} disabled={row.status !== 'ACTIVE'} />
          {row.status === 'ACTIVE' && (
            <IconButton variant="ghost" size="sm" tooltip="Deactivate" icon={<Power className="h-4 w-4" />} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onClick={() => setDeactivateTarget(row)} />
          )}
        </div>
      ),
    },
  ];

  // ---- Form ----
  const resetForm = () => {
    setForm({ ...EMPTY_FORM, userId: currentUser?.id ?? '' });
    setFormErrors({});
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (t) => {
    setEditTarget(t);
    setForm({
      userId: t.userId ?? currentUser?.id ?? '',
      tenantCode: t.tenantCode || '',
      firstName: t.firstName || '',
      lastName: t.lastName || '',
      gender: t.gender || 'OTHER',
      dateOfBirth: t.dateOfBirth || '',
      phone: t.phone || '',
      email: t.email || '',
      occupationType: t.occupationType || 'OTHER',
      occupation: t.occupation || '',
      schoolOrCompany: t.schoolOrCompany || '',
      idType: t.idType || '',
      idNumber: t.idNumber || '',
      address: t.address || '',
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.userId) errs.userId = 'User is required';
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!editTarget && !form.tenantCode.trim()) errs.tenantCode = 'Tenant code is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const base = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || null,
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      occupationType: form.occupationType,
      occupation: form.occupation.trim() || null,
      schoolOrCompany: form.schoolOrCompany.trim() || null,
      idType: form.idType.trim() || null,
      idNumber: form.idNumber.trim() || null,
      address: form.address.trim() || null,
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateTenant(editTarget.id, base);
        toast.success('Tenant updated', `${fullName({ ...form, id: editTarget.id })} has been updated.`);
        setEditTarget(null);
      } else {
        await createTenant({ ...base, userId: Number(form.userId), tenantCode: form.tenantCode.trim() });
        toast.success('Tenant created', 'New tenant has been added.');
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const openView = async (t) => {
    setViewTarget(t);
    setViewData(t);
    setViewLoading(true);
    try {
      const fresh = await getTenant(t.id);
      setViewData(fresh);
    } catch {
      // keep the row data if the fetch fails
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await deactivateTenant(deactivateTarget.id);
      toast.success('Tenant deactivated', `${fullName(deactivateTarget)} has been marked inactive.`);
      setDeactivateTarget(null);
    } catch (err) {
      toast.error('Deactivation failed', err.response?.data?.message || err.response?.data?.error || 'Failed to deactivate tenant.');
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="mt-3 h-3 w-16" />
              <Skeleton className="mt-1.5 h-5 w-10" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-12 ${i > 0 ? 'mt-3' : ''} w-full px-6`} />
          ))}
          <div className="h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Tenants</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage tenant profiles and their emergency contacts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>Refresh</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>Create Tenant</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error loading tenants" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>Retry</Button>
          </div>
        </Alert>
      )}

      {/* Stats */}
      {tenants.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Tenants" value={stats.total} icon={<UsersIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
          <StatCard label="Active" value={stats.active} icon={<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />} valueClass="text-green-700 dark:text-green-400" />
          <StatCard label="Inactive" value={stats.inactive} icon={<XCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
        </div>
      )}

      {/* Filters */}
      {tenants.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input placeholder="Search by name, code, phone, or email..." leftIcon={<Search className="h-4 w-4" />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Statuses" />
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>Clear</Button>
        </div>
      )}

      {/* Content */}
      {!loading && tenants.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No tenants yet"
          description="Create your first tenant profile to get started."
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>Create Tenant</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="No matches found" description="Try adjusting your search or filter criteria." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((t) => (
              <div key={t.id} onClick={() => openView(t)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{fullName(t)}</p>
                      <p className="font-mono text-xs text-slate-400">{t.tenantCode}</p>
                    </div>
                  </div>
                  {getStatusBadge(t.status)}
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                  {t.phone && (
                    <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {t.phone}</span>
                  )}
                  {t.email && (
                    <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> <span className="truncate">{t.email}</span></span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-gray-800">
                  <IconButton variant="ghost" size="sm" tooltip="Edit" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openEdit(t); }} />
                  <IconButton variant="ghost" size="sm" tooltip="Contacts" icon={<Contact className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); setContactTarget(t); }} disabled={t.status !== 'ACTIVE'} />
                  {t.status === 'ACTIVE' && (
                    <IconButton variant="ghost" size="sm" tooltip="Deactivate" icon={<Power className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeactivateTarget(t); }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden lg:block">
            <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} onRowClick={openView} className="w-full" />
          </Card>
        </>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Tenant' : 'Create Tenant'}
        description={editTarget ? `Editing ${fullName(editTarget)}` : 'Add a new tenant profile.'}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="tenantForm" onClick={() => document.getElementById('tenantForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'Save Changes' : 'Create Tenant'}
            </Button>
          </div>
        }
      >
        <form id="tenantForm" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Account</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {editTarget ? (
                <Input label="Tenant Code" disabled value={form.tenantCode} />
              ) : (
                <Input label="Tenant Code" required name="tenantCode" value={form.tenantCode} onChange={handleFormChange} placeholder="e.g., TN-0001" error={formErrors.tenantCode} />
              )}
              <Select
                label="User Account"
                required={!editTarget}
                name="userId"
                options={userOptions}
                value={form.userId}
                onChange={handleFormChange}
                placeholder={editTarget ? 'Not changeable' : 'Select a user'}
                error={formErrors.userId}
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Personal Information</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" required name="firstName" value={form.firstName} onChange={handleFormChange} error={formErrors.firstName} />
              <Input label="Last Name" required name="lastName" value={form.lastName} onChange={handleFormChange} error={formErrors.lastName} />
              <Select label="Gender" name="gender" options={GENDER_OPTIONS} value={form.gender} onChange={handleFormChange} />
              <Input label="Date of Birth" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleFormChange} />
              <Input label="Phone" required name="phone" value={form.phone} onChange={handleFormChange} placeholder="e.g., 0812-3456-789" error={formErrors.phone} />
              <Input label="Email" type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="email@example.com" />
              <Select label="Occupation Type" name="occupationType" options={OCCUPATION_OPTIONS} value={form.occupationType} onChange={handleFormChange} />
              <Input label="Occupation" name="occupation" value={form.occupation} onChange={handleFormChange} placeholder="e.g., Software Engineer" />
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">School / Company</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="School or Company" name="schoolOrCompany" value={form.schoolOrCompany} onChange={handleFormChange} />
              <Input label="ID Type" name="idType" value={form.idType} onChange={handleFormChange} placeholder="e.g., NIK, Passport" />
              <Input label="ID Number" name="idNumber" value={form.idNumber} onChange={handleFormChange} />
              <Textarea label="Address" name="address" value={form.address} onChange={handleFormChange} rows={2} placeholder="Current address..." />
            </div>
          </div>
        </form>
      </Modal>

      {/* View modal */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Tenant Details" description={viewData ? `Tenant ${viewData.tenantCode}` : undefined} size="lg">
        {viewLoading && !viewData ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : viewData ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                  <UserRound className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{fullName(viewData)}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">{viewData.tenantCode}</p>
                </div>
              </div>
              {getStatusBadge(viewData.status)}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => { openEdit(viewData); setViewTarget(null); }}>Edit</Button>
              <Button variant="outline" size="sm" leftIcon={<Contact className="h-4 w-4" />} onClick={() => { setContactTarget(viewData); setViewTarget(null); }} disabled={viewData.status !== 'ACTIVE'}>Emergency Contacts</Button>
              {viewData.status === 'ACTIVE' && (
                <Button variant="danger" size="sm" leftIcon={<Power className="h-4 w-4" />} onClick={() => { setDeactivateTarget(viewData); setViewTarget(null); }}>Deactivate</Button>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Contact</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem icon={<Phone className="h-4 w-4 text-slate-400" />} label="Phone" value={viewData.phone || '—'} />
                <DetailItem icon={<Mail className="h-4 w-4 text-slate-400" />} label="Email" value={viewData.email || '—'} />
                <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Date of Birth" value={formatDate(viewData.dateOfBirth)} />
                <DetailItem icon={<MapPin className="h-4 w-4 text-slate-400" />} label="Address" value={viewData.address || '—'} />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Occupation</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem icon={<Briefcase className="h-4 w-4 text-slate-400" />} label="Occupation Type" value={viewData.occupationType ? viewData.occupationType.charAt(0) + viewData.occupationType.slice(1).toLowerCase() : '—'} />
                <DetailItem icon={<GraduationCap className="h-4 w-4 text-slate-400" />} label="Occupation" value={viewData.occupation || '—'} />
                <DetailItem icon={<School className="h-4 w-4 text-slate-400" />} label="School / Company" value={viewData.schoolOrCompany || '—'} />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Identification</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem icon={<IdCard className="h-4 w-4 text-slate-400" />} label="ID Type" value={viewData.idType || '—'} />
                <DetailItem icon={<CreditCard className="h-4 w-4 text-slate-400" />} label="ID Number" value={viewData.idNumber || '—'} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="Tenant ID" value={viewData.id} />
              <DetailItem icon={<ShieldCheck className="h-4 w-4 text-slate-400" />} label="User ID" value={viewData.userId ?? '—'} />
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Emergency contacts manager */}
      <EmergencyContactsManager tenant={contactTarget} onClose={() => setContactTarget(null)} />

      {/* Deactivate */}
      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate Tenant"
        description={`Are you sure you want to deactivate "${deactivateTarget ? fullName(deactivateTarget) : ''}"? This will mark the tenant as inactive.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        danger
        loading={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}

const EmergencyContactsManager = ({ tenant, onClose }) => {
  const {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
  } = useEmergencyContacts(tenant?.id);
  const toast = useToast();

  const [contactOpen, setContactOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_CONTACT);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm(EMPTY_CONTACT);
    setFormErrors({});
  };

  const handleAddOpen = () => {
    resetForm();
    setEditContact(null);
    setContactOpen(true);
  };

  const openEditContact = (c) => {
    setEditContact(c);
    setForm({
      name: c.name || '',
      relationship: c.relationship || '',
      phone: c.phone || '',
      address: c.address || '',
      isPrimary: c.isPrimary || false,
    });
    setFormErrors({});
    setContactOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      relationship: form.relationship.trim() || null,
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      isPrimary: form.isPrimary || false,
    };
    setSubmitting(true);
    try {
      if (editContact) {
        await updateContact(editContact.id, payload);
        toast.success('Contact updated', `"${payload.name}" has been updated.`);
      } else {
        await createContact(payload);
        toast.success('Contact added', `"${payload.name}" added to emergency contacts.`);
      }
      setContactOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to save contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContact(deleteTarget.id);
      toast.success('Contact deleted', `"${deleteTarget.name}" has been removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Delete failed', err.response?.data?.message || err.response?.data?.error || 'Failed to delete contact.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Modal
        open={!!tenant}
        onClose={onClose}
        title="Emergency Contacts"
        description={tenant ? `Manage emergency contacts for ${fullName(tenant)}.` : undefined}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddOpen}>Add Contact</Button>
          </div>
        }
      >
        {!tenant ? null : (
          <div className="space-y-4">
            {error && <Alert variant="danger" title="Error" description={error} dismissible />}
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                        <Contact className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{c.name}</p>
                          {c.isPrimary && <Badge variant="info">Primary</Badge>}
                        </div>
                        <div className="mt-1 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {c.relationship && <p className="flex items-center gap-1.5"><UserRound className="h-3 w-3" /> {c.relationship}</p>}
                          {c.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</p>}
                          {c.address && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {c.address}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <IconButton variant="ghost" size="sm" tooltip="Edit" icon={<Edit className="h-4 w-4" />} onClick={() => openEditContact(c)} />
                      <IconButton variant="ghost" size="sm" tooltip="Delete" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={() => setDeleteTarget(c)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Contact}
                title="No emergency contacts"
                description="Add an emergency contact for this tenant."
                action={<Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddOpen}>Add Contact</Button>}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit contact modal */}
      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={editContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setContactOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="contactForm" onClick={() => document.getElementById('contactForm')?.requestSubmit()} loading={submitting}>
              {editContact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </div>
        }
      >
        <form id="contactForm" onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" required name="name" value={form.name} onChange={handleChange} error={formErrors.name} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Relationship" name="relationship" value={form.relationship} onChange={handleChange} placeholder="e.g., Parent, Spouse" />
            <Input label="Phone" required name="phone" value={form.phone} onChange={handleChange} error={formErrors.phone} />
          </div>
          <Input label="Address" name="address" value={form.address} onChange={handleChange} />
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              name="isPrimary"
              checked={form.isPrimary}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-white"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary contact</span>
          </label>
        </form>
      </Modal>

      {/* Delete contact */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Emergency Contact"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

const StatCard = ({ label, value, icon, valueClass = 'text-slate-800 dark:text-white' }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">{icon}</div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      </div>
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-gray-800">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

