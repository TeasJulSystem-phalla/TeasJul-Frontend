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
import { useNavigate } from 'react-router-dom';
import { useTenantsList } from '../../hooks/useTenantsList.js';
import { useEmergencyContacts } from '../../hooks/useTenants.js';
import { useBasePath } from '../../hooks/useBasePath.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Card,
  CountUp,
  Button,
  Table,
  Badge,
  Alert,
  Modal,
  Input,
  Select,
  IconButton,
  ConfirmDialog,
  EmptyState,
  Pagination,
  Skeleton,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  ACTIVE: 'success',
  RENTING: 'info',
  INACTIVE: 'neutral',
  PENDING: 'warning',
};

const STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'ACTIVE', label: 'សកម្ម (ទំនេរ)' },
  { value: 'RENTING', label: 'កំពុងជួលផ្ទះ' },
  { value: 'PENDING', label: 'រង់ចាំ (មិនទាន់មានកិច្ចសន្យា)' },
  { value: 'INACTIVE', label: 'អសកម្ម' },
];

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

const fullName = (t) => `${t.firstName || ''} ${t.lastName || ''}`.trim() || `អ្នកជួល #${t.id}`;

export default function Tenants() {
  const {
    tenants,
    summary,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    setPage,
    fetchTenants,
    fetchSummary,
    getTenant,
    deactivateTenant,
  } = useTenantsList();
  const toast = useToast();
  const navigate = useNavigate();
  const basePath = useBasePath();

  const [viewTarget, setViewTarget] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const [contactTarget, setContactTarget] = useState(null); // tenant being managed

  const refresh = useCallback(() => {
    fetchSummary();
    fetchTenants();
  }, [fetchSummary, fetchTenants]);

  const stats = useMemo(() => {
    if (summary) {
      const total = summary.total || 0;
      const active = summary.statusCounts?.ACTIVE || 0;
      const renting = summary.statusCounts?.RENTING || 0;
      const inactive = summary.statusCounts?.INACTIVE || 0;
      return { total, active, renting, inactive };
    }
    const total = totalElements || tenants.length;
    const active = tenants.filter((t) => t.status === 'ACTIVE').length;
    const renting = tenants.filter((t) => t.status === 'RENTING').length;
    const inactive = tenants.filter((t) => t.status === 'INACTIVE').length;
    return { total, active, renting, inactive };
  }, [summary, totalElements, tenants]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{status || '—'}</Badge>
  );

  const columns = [
    {
      header: 'អ្នកជួល',
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
      header: 'ទំនាក់ទំនង',
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
      header: 'ភេទ',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{row.gender || '—'}</span>,
    },
    {
      header: 'មុខរបរ',
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
      header: 'ស្ថានភាព',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'កាលបរិច្ឆេទបង្កើត',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'សកម្មភាព',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton variant="ghost" size="sm" tooltip="មើល" icon={<Eye className="h-4 w-4" />} onClick={() => openView(row)} />
          <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={() => navigate(`${basePath}/tenants/${row.id}/edit`)} />
          <IconButton variant="ghost" size="sm" tooltip="ទំនាក់ទំនង" icon={<Contact className="h-4 w-4" />} onClick={() => setContactTarget(row)} disabled={row.status !== 'ACTIVE'} />
          {row.status === 'ACTIVE' && (
            <IconButton variant="ghost" size="sm" tooltip="បិទដំណើរការ" icon={<Power className="h-4 w-4" />} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onClick={() => setDeactivateTarget(row)} />
          )}
        </div>
      ),
    },
  ];

  // ---- View ----
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
      toast.success('បានបិទដំណើរការអ្នកជួល', `${fullName(deactivateTarget)} ត្រូវបានកំណត់ជាអសកម្ម។`);
      setDeactivateTarget(null);
    } catch (err) {
      toast.error('ការបិទដំណើរការបានបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'ការបិទដំណើរការអ្នកជួលបានបរាជ័យ។');
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">អ្នកជួល</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងប្រវត្តិរូបអ្នកជួល និងទំនាក់ទំនងសង្គ្រោះបន្ទាន់របស់ពួកគេ។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>ផ្ទុកឡើងវិញ</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(`${basePath}/tenants/new`)}>បង្កើតអ្នកជួល</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកអ្នកជួល" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      {/* Stats */}
      {tenants.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="ចំនួនអ្នកជួលសរុប" value={stats.total} icon={<UsersIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
          <StatCard label="សកម្ម" value={stats.active} icon={<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />} valueClass="text-green-700 dark:text-green-400" />
          <StatCard label="អសកម្ម" value={stats.inactive} icon={<XCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
        </div>
      )}

      {/* Filters */}
      {tenants.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input placeholder="ស្វែងរកតាមឈ្មោះ លេខកូដ លេខទូរស័ព្ទ ឬអ៊ីមែល..." leftIcon={<Search className="h-4 w-4" />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="ស្ថានភាពទាំងអស់" />
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>សម្អាត</Button>
        </div>
      )}

      {/* Content */}
      {!loading && tenants.length === 0 ? (
        searchTerm || statusFilter ? (
          <EmptyState icon={Filter} title="រកមិនឃើញលទ្ធផល" description="សូមព្យាយាមកែតម្រូវលក្ខណៈវិនិច្ឆ័យស្វែងរក ឬតម្រងរបស់អ្នក។" />
        ) : (
          <EmptyState
            icon={UsersIcon}
            title="មិនទាន់មានអ្នកជួល"
            description="បង្កើតប្រវត្តិរូបអ្នកជួលដំបូងរបស់អ្នក ដើម្បីចាប់ផ្តើម។"
            action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(`${basePath}/tenants/new`)}>បង្កើតអ្នកជួល</Button>}
          />
        )
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {tenants.map((t) => (
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
                  <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/tenants/${t.id}/edit`); }} />
                  <IconButton variant="ghost" size="sm" tooltip="ទំនាក់ទំនង" icon={<Contact className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); setContactTarget(t); }} disabled={t.status !== 'ACTIVE'} />
                  {t.status === 'ACTIVE' && (
                    <IconButton variant="ghost" size="sm" tooltip="បិទដំណើរការ" icon={<Power className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeactivateTarget(t); }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden lg:block">
            <Table columns={columns} data={tenants} keyExtractor={(row) => row.id} onRowClick={openView} className="w-full" />
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-end pt-4">
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          )}
        </>
      )}

      {/* View modal */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="ព័ត៌មានលម្អិតអ្នកជួល" description={viewData ? `អ្នកជួល ${viewData.tenantCode}` : undefined} size="lg">
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
              <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => { const id = viewData.id; setViewTarget(null); navigate(`${basePath}/tenants/${id}/edit`); }}>កែប្រែ</Button>
              <Button variant="outline" size="sm" leftIcon={<Contact className="h-4 w-4" />} onClick={() => { setContactTarget(viewData); setViewTarget(null); }} disabled={viewData.status !== 'ACTIVE'}>ទំនាក់ទំនងសង្គ្រោះបន្ទាន់</Button>
              {viewData.status === 'ACTIVE' && (
                <Button variant="danger" size="sm" leftIcon={<Power className="h-4 w-4" />} onClick={() => { setDeactivateTarget(viewData); setViewTarget(null); }}>បិទដំណើរការ</Button>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ទំនាក់ទំនង</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem icon={<Phone className="h-4 w-4 text-slate-400" />} label="លេខទូរស័ព្ទ" value={viewData.phone || '—'} />
                <DetailItem icon={<Mail className="h-4 w-4 text-slate-400" />} label="អ៊ីមែល" value={viewData.email || '—'} />
                <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="ថ្ងៃខែឆ្នាំកំណើត" value={formatDate(viewData.dateOfBirth)} />
                <DetailItem icon={<MapPin className="h-4 w-4 text-slate-400" />} label="អាសយដ្ឋាន" value={viewData.address || '—'} />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">មុខរបរ</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem icon={<Briefcase className="h-4 w-4 text-slate-400" />} label="ប្រភេទមុខរបរ" value={viewData.occupationType ? viewData.occupationType.charAt(0) + viewData.occupationType.slice(1).toLowerCase() : '—'} />
                <DetailItem icon={<GraduationCap className="h-4 w-4 text-slate-400" />} label="មុខរបរ" value={viewData.occupation || '—'} />
                <DetailItem icon={<School className="h-4 w-4 text-slate-400" />} label="សាលារៀន / ក្រុមហ៊ុន" value={viewData.schoolOrCompany || '—'} />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">អត្តសញ្ញាណប័ណ្ណ</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem icon={<IdCard className="h-4 w-4 text-slate-400" />} label="ប្រភេទអត្តសញ្ញាណប័ណ្ណ" value={viewData.idType || '—'} />
                <DetailItem icon={<CreditCard className="h-4 w-4 text-slate-400" />} label="លេខអត្តសញ្ញាណប័ណ្ណ" value={viewData.idNumber || '—'} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="លេខសម្គាល់អ្នកជួល" value={viewData.id} />
              <DetailItem icon={<ShieldCheck className="h-4 w-4 text-slate-400" />} label="លេខសម្គាល់អ្នកប្រើប្រាស់" value={viewData.userId ?? '—'} />
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Emergency contacts manager */}
      <EmergencyContactsManager tenant={contactTarget} onClose={() => setContactTarget(null)} />

      {/* Deactivate */}
      <ConfirmDialog
        open={!!deactivateTarget}
        title="បិទដំណើរការអ្នកជួល"
        description={`តើអ្នកប្រាកដទេថាចង់បិទដំណើរការ "${deactivateTarget ? fullName(deactivateTarget) : ''}"? នេះនឹងកំណត់អ្នកជួលជាអសកម្ម។`}
        confirmText="បិទដំណើរការ"
        cancelText="បោះបង់"
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
    if (!form.name.trim()) errs.name = 'តម្រូវឱ្យបញ្ចូលឈ្មោះ';
    if (!form.phone.trim()) errs.phone = 'តម្រូវឱ្យបញ្ចូលលេខទូរស័ព្ទ';
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
        toast.success('បានកែប្រែទំនាក់ទំនង', `"${payload.name}" ត្រូវបានធ្វើបច្ចុប្បន្នភាព។`);
      } else {
        await createContact(payload);
        toast.success('បានបន្ថែមទំនាក់ទំនង', `"${payload.name}" ត្រូវបានបន្ថែមទៅក្នុងទំនាក់ទំនងសង្គ្រោះបន្ទាន់។`);
      }
      setContactOpen(false);
      resetForm();
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'ការរក្សាទុកទំនាក់ទំនងបានបរាជ័យ។');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContact(deleteTarget.id);
      toast.success('បានលុបទំនាក់ទំនង', `"${deleteTarget.name}" ត្រូវបានដកចេញ។`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('ការលុបបានបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'ការលុបទំនាក់ទំនងបានបរាជ័យ។');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Modal
        open={!!tenant}
        onClose={onClose}
        title="ទំនាក់ទំនងសង្គ្រោះបន្ទាន់"
        description={tenant ? `គ្រប់គ្រងទំនាក់ទំនងសង្គ្រោះបន្ទាន់សម្រាប់ ${fullName(tenant)}។` : undefined}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>បិទ</Button>
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddOpen}>បន្ថែមទំនាក់ទំនង</Button>
          </div>
        }
      >
        {!tenant ? null : (
          <div className="space-y-4">
            {error && <Alert variant="danger" title="កំហុស" description={error} dismissible />}
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
                          {c.isPrimary && <Badge variant="info">ចម្បង</Badge>}
                        </div>
                        <div className="mt-1 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {c.relationship && <p className="flex items-center gap-1.5"><UserRound className="h-3 w-3" /> {c.relationship}</p>}
                          {c.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</p>}
                          {c.address && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {c.address}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={() => openEditContact(c)} />
                      <IconButton variant="ghost" size="sm" tooltip="លុប" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={() => setDeleteTarget(c)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Contact}
                title="មិនមានទំនាក់ទំនងសង្គ្រោះបន្ទាន់"
                description="បន្ថែមទំនាក់ទំនងសង្គ្រោះបន្ទាន់សម្រាប់អ្នកជួលនេះ។"
                action={<Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddOpen}>បន្ថែមទំនាក់ទំនង</Button>}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit contact modal */}
      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={editContact ? 'កែប្រែទំនាក់ទំនងសង្គ្រោះបន្ទាន់' : 'បន្ថែមទំនាក់ទំនងសង្គ្រោះបន្ទាន់'}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setContactOpen(false)} disabled={submitting}>បោះបង់</Button>
            <Button type="submit" form="contactForm" onClick={() => document.getElementById('contactForm')?.requestSubmit()} loading={submitting}>
              {editContact ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បន្ថែមទំនាក់ទំនង'}
            </Button>
          </div>
        }
      >
        <form id="contactForm" onSubmit={handleSubmit} className="space-y-4">
          <Input label="ឈ្មោះ" required name="name" value={form.name} onChange={handleChange} error={formErrors.name} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="ទំនាក់ទំនង" name="relationship" value={form.relationship} onChange={handleChange} placeholder="ឧ. ឪពុកម្តាយ ប្តីប្រពន្ធ" />
            <Input label="លេខទូរស័ព្ទ" required name="phone" value={form.phone} onChange={handleChange} error={formErrors.phone} />
          </div>
          <Input label="អាសយដ្ឋាន" name="address" value={form.address} onChange={handleChange} />
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              name="isPrimary"
              checked={form.isPrimary}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-white"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ទំនាក់ទំនងចម្បង</span>
          </label>
        </form>
      </Modal>

      {/* Delete contact */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="លុបទំនាក់ទំនងសង្គ្រោះបន្ទាន់"
        description={`តើអ្នកប្រាកដទេថាចង់លុប "${deleteTarget?.name}"? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`}
        confirmText="លុប"
        cancelText="បោះបង់"
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
        <p className={`text-xl font-bold ${valueClass}`}><CountUp value={value} /></p>
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

