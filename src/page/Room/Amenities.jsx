import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Sparkles,
  Hash,
  Calendar,
  Filter,
  ShieldCheck,
  Archive,
  CheckCircle2,
  XCircle,
  Layers,
  Power,
} from 'lucide-react';
import { useAmenities } from '../../hooks/useAmenities.js';
import { useSystemDefaults } from '../../hooks/useSystemDefaults.js';
import { useMyRoles } from '../../hooks/useMyRoles.js';
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
  Textarea,
  Select,
  IconButton,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Tabs,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  ARCHIVED: 'neutral',
};

const STATUS_OPTIONS = [
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'ACTIVE', label: 'សកម្ម' },
  { value: 'INACTIVE', label: 'អសកម្ម' },
  { value: 'ARCHIVED', label: 'បានរក្សាទុក' },
];

const EMPTY_FORM = {
  name: '',
  code: '',
  description: '',
  icon: '',
  status: 'ACTIVE',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function Amenities() {
  const {
    amenities,
    loading,
    error,
    fetchAmenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
  } = useAmenities();
  const { isOwner } = useMyRoles();
  const {
    defaults: systemDefaults,
    loading: systemLoading,
    error: systemError,
    fetchDefaults,
    enable: enableDefault,
    disable: disableDefault,
  } = useSystemDefaults('AMENITY', isOwner);
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('system');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => fetchAmenities(), [fetchAmenities]);

  const linkedIds = useMemo(
    () =>
      new Set(
        systemDefaults
          .filter((d) => d.enabled && d.linkedId)
          .map((d) => d.linkedId)
      ),
    [systemDefaults]
  );

  const customAmenities = useMemo(
    () => (isOwner ? amenities.filter((a) => !linkedIds.has(a.id)) : amenities),
    [isOwner, amenities, linkedIds]
  );

  const enabledDefaults = useMemo(
    () => systemDefaults.filter((d) => d.enabled),
    [systemDefaults]
  );
  const availableDefaults = useMemo(
    () => systemDefaults.filter((d) => !d.enabled),
    [systemDefaults]
  );

  const stats = useMemo(() => {
    const total = customAmenities.length;
    const count = (s) => customAmenities.filter((a) => a.status === s).length;
    return { total, active: count('ACTIVE'), inactive: count('INACTIVE'), archived: count('ARCHIVED') };
  }, [customAmenities]);

  const filtered = useMemo(() => {
    let result = customAmenities;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          (a.name && a.name.toLowerCase().includes(q)) ||
          (a.code && a.code.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }
    if (statusFilter) result = result.filter((a) => a.status === statusFilter);
    return result;
  }, [customAmenities, searchTerm, statusFilter]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{STATUS_OPTIONS.find((o) => o.value === status)?.label || status || '—'}</Badge>
  );

  const handleToggleDefault = async (d, action) => {
    setBusyId(d.definition.id);
    try {
      if (action === 'enable') {
        await enableDefault(d.definition.id);
        toast.success('បានបើកដំណើរការ', `"${d.definition.name}" ត្រូវបានបើកដំណើរការ។`);
      } else {
        await disableDefault(d.definition.id);
        toast.success('បានបិទដំណើរការ', `"${d.definition.name}" ត្រូវបានបិទដំណើរការ។`);
      }
      fetchDefaults();
      fetchAmenities();
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'ប្រតិបត្តិការបរាជ័យ។');
    } finally {
      setBusyId(null);
    }
  };

  const SYSTEM_TABS = [
    { value: 'system', label: 'ប្រព័ន្ធ' },
    { value: 'enabled', label: 'បានបើកដំណើរការ' },
    { value: 'custom', label: 'ផ្ទាល់ខ្លួន' },
  ];

  const columns = [
    {
      header: 'សម្ភារ:ប្រើប្រាស់',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-slate-800 dark:text-white">{row.name}</p>
            <p className="font-mono text-xs text-slate-400">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'ការពិពណ៌នា',
      render: (row) => (
        <span className="block max-w-[260px] truncate text-sm text-slate-500 dark:text-slate-400">
          {row.description || '—'}
        </span>
      ),
    },
    {
      header: 'រូបតំណាង',
      render: (row) => (
        <span className="font-mono text-xs text-slate-400">{row.icon || '—'}</span>
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'បានបង្កើត',
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
          <IconButton variant="ghost" size="sm" tooltip="មើល" icon={<Eye className="h-4 w-4" />} onClick={() => setViewTarget(row)} />
          <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={() => openEdit(row)} />
          <IconButton variant="ghost" size="sm" tooltip="លុប" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onClick={() => setDeleteTarget(row)} />
        </div>
      ),
    },
  ];

  // ---- Form ----
  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (a) => {
    setEditTarget(a);
    setForm({
      name: a.name || '',
      code: a.code || '',
      description: a.description || '',
      icon: a.icon || '',
      status: a.status || 'ACTIVE',
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
    if (!form.name.trim()) errs.name = 'តម្រូវឱ្យបញ្ចូលឈ្មោះ';
    if (!form.code.trim()) errs.code = 'តម្រូវឱ្យបញ្ចូលលេខកូដ';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      icon: form.icon.trim(),
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateAmenity(editTarget.id, payload);
        toast.success('សម្ភារ:ប្រើប្រាស់ត្រូវបានកែប្រែ', `"${payload.name}" ត្រូវបានកែប្រែ។`);
        setEditTarget(null);
      } else {
        await createAmenity(payload);
        toast.success('សម្ភារ:ប្រើប្រាស់ត្រូវបានបង្កើត', `"${payload.name}" ត្រូវបានបង្កើត។`);
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'ប្រតិបត្តិការបរាជ័យ។';
      if (/name|c/i.test(message)) {
        setFormErrors((prev) => ({ ...prev, code: message }));
      } else {
        toast.error('កំហុស', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAmenity(deleteTarget.id);
      toast.success('សម្ភារ:ប្រើប្រាស់ត្រូវបានលុប', `"${deleteTarget.name}" ត្រូវបានលុប។`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('ការលុបបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'ការលុបសម្ភារ:ប្រើប្រាស់បរាជ័យ។');
    } finally {
      setDeleting(false);
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="mt-3 h-3 w-16" />
              <Skeleton className="mt-1.5 h-5 w-10" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
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

  const renderSystemDefaultRow = (d, action) => {
    const def = d.definition;
    return (
      <div
        key={def.id}
        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {action === 'enable' ? <Layers className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{def.name}</p>
              {action === 'disable' && (
                <Badge variant="success">បានបើកដំណើរការ</Badge>
              )}
            </div>
            <p className="font-mono text-xs text-slate-400">{def.code}</p>
            {def.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{def.description}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {action === 'disable' && d.linkedId && (
            <span className="font-mono text-xs text-slate-400">#{d.linkedId}</span>
          )}
          <Button
            size="sm"
            variant={action === 'enable' ? 'primary' : 'outline'}
            leftIcon={action === 'enable' ? <Power className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            loading={busyId === def.id}
            onClick={() => handleToggleDefault(d, action)}
          >
            {action === 'enable' ? 'បើកដំណើរការ' : 'បិទដំណើរការ'}
          </Button>
        </div>
      </div>
    );
  };

  const renderSystemSection = () => {
    if (systemLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      );
    }
    if (systemError) {
      return (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកប្រព័ន្ធ" description={systemError} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => fetchDefaults()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      );
    }
    return (
      <div className="space-y-3">
        {availableDefaults.map((d) => renderSystemDefaultRow(d, 'enable'))}
        {availableDefaults.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title="មិនមានប្រព័ន្ធដែលអាចបើកបានទេ"
            description="អ្នកបានបើកដំណើរការប្រព័ន្ធលំនាំដើមទាំងអស់រួចហើយ។"
          />
        )}
      </div>
    );
  };

  const renderEnabledSection = () => {
    if (systemLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      );
    }
    if (systemError) {
      return (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកប្រព័ន្ធ" description={systemError} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => fetchDefaults()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      );
    }
    return (
      <div className="space-y-3">
        {enabledDefaults.map((d) => renderSystemDefaultRow(d, 'disable'))}
        {enabledDefaults.length === 0 && (
          <EmptyState
            icon={Power}
            title="មិនទាន់បានបើកដំណើរការ"
            description="បើកដំណើរការប្រព័ន្ធលំនាំដើមពីផ្ទាំង «ប្រព័ន្ធ» ដើម្បីប្រើប្រាស់ភ្លាមៗ។"
          />
        )}
      </div>
    );
  };

  const renderCustomList = () => (
    <>
      {customAmenities.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input placeholder="ស្វែងរកតាមឈ្មោះ លេខកូដ ឬការពិពណ៌នា..." leftIcon={<Search className="h-4 w-4" />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="ស្ថានភាពទាំងអស់" />
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>សម្អាត</Button>
        </div>
      )}

      {customAmenities.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="សរុប" value={stats.total} icon={<Sparkles className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
          <StatCard label="សកម្ម" value={stats.active} icon={<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />} valueClass="text-green-700 dark:text-green-400" />
          <StatCard label="អសកម្ម" value={stats.inactive} icon={<XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />} valueClass="text-amber-700 dark:text-amber-400" />
          <StatCard label="បានរក្សាទុក" value={stats.archived} icon={<Archive className="h-5 w-5 text-slate-600 dark:text-slate-400" />} />
        </div>
      )}

      {!loading && customAmenities.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={isOwner ? 'មិនទាន់មានសម្ភារ:ប្រើប្រាស់ផ្ទាល់ខ្លួន' : 'មិនទាន់មានសម្ភារ:ប្រើប្រាស់ទេ'}
          description={isOwner ? 'បង្កើតសម្ភារ:ប្រើប្រាស់ផ្ទាល់ខ្លួន ឬបើកដំណើរការប្រព័ន្ធលំនាំដើមពីផ្ទាំង «ប្រព័ន្ធ»។' : 'បង្កើតសម្ភារ:ប្រើប្រាស់ដំបូងរបស់អ្នកដើម្បីចាប់ផ្តើមកំណត់វាទៅបន្ទប់។'}
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បង្កើតសម្ភារ:ប្រើប្រាស់</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="រកមិនឃើញលទ្ធផលត្រូវនឹងលក្ខខណ្ឌទេ" description="សូមព្យាយាមកែតម្រូវលក្ខខណ្ឌនៃការស្វែងរក ឬតម្រង។" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((a) => (
              <div key={a.id} onClick={() => setViewTarget(a)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{a.name}</p>
                      <p className="font-mono text-xs text-slate-400">{a.code}</p>
                    </div>
                  </div>
                  {getStatusBadge(a.status)}
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{a.description || 'គ្មានការពិពណ៌នា'}</p>
                <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-gray-800">
                  <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openEdit(a); }} />
                  <IconButton variant="ghost" size="sm" tooltip="លុប" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeleteTarget(a); }} />
                </div>
              </div>
            ))}
          </div>

          <Card className="hidden lg:block">
            <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} onRowClick={setViewTarget} className="w-full" />
          </Card>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">សម្ភារ:ប្រើប្រាស់</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងសម្ភារ:ប្រើប្រាស់ និងកំណត់វាទៅបន្ទប់នីមួយៗ។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>ធ្វើឱ្យស្រស់</Button>
          {(!isOwner || activeTab === 'custom') && (
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>បង្កើតសម្ភារ:ប្រើប្រាស់</Button>
          )}
        </div>
      </div>

      {isOwner && (
        <Tabs tabs={SYSTEM_TABS} activeTab={activeTab} onChange={setActiveTab} className="overflow-x-auto" />
      )}

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកសម្ភារ:ប្រើប្រាស់" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      {isOwner && activeTab === 'system' && renderSystemSection()}

      {isOwner && activeTab === 'enabled' && renderEnabledSection()}

      {isOwner && activeTab === 'custom' && renderCustomList()}

      {!isOwner && renderCustomList()}

      <Modal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        title={editTarget ? 'កែប្រែសម្ភារ:ប្រើប្រាស់' : 'បង្កើតសម្ភារ:ប្រើប្រាស់'}
        description={editTarget ? `កំពុងកែប្រែ "${editTarget.name}"` : 'កំណត់សម្ភារ:ប្រើប្រាស់ដែលអ្នកអាចកំណត់ទៅបន្ទប់បាន។'}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>បោះបង់</Button>
            <Button type="submit" form="amenityForm" onClick={() => document.getElementById('amenityForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតសម្ភារ:ប្រើប្រាស់'}
            </Button>
          </div>
        }
      >
        <form id="amenityForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="ឈ្មោះ" required name="name" value={form.name} onChange={handleFormChange} placeholder="ឧ. WiFi" error={formErrors.name} />
            <Input label="លេខកូដ" required name="code" value={form.code} onChange={handleFormChange} placeholder="ឧ. WIFI" error={formErrors.code} />
          </div>
          <Input label="រូបតំណាង" name="icon" value={form.icon} onChange={handleFormChange} placeholder="ឧ. wifi, pool, parking" />
          <Textarea label="ការពិពណ៌នា" name="description" value={form.description} onChange={handleFormChange} rows={2} placeholder="ពិណ៌នាអំពីសម្ភារ:ប្រើប្រាស់នេះ..." />
          <Select
            label="ស្ថានភាព"
            name="status"
            options={[
              { value: 'ACTIVE', label: 'សកម្ម' },
              { value: 'INACTIVE', label: 'អសកម្ម' },
              { value: 'ARCHIVED', label: 'បានរក្សាទុក' },
            ]}
            value={form.status}
            onChange={handleFormChange}
          />
        </form>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="ព័ត៌មានលម្អិតនៃសម្ភារ:ប្រើប្រាស់" size="md">
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{viewTarget.name}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">{viewTarget.code}</p>
                </div>
              </div>
              {getStatusBadge(viewTarget.status)}
            </div>

            {viewTarget.description && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ការពិពណ៌នា</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewTarget.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="លេខសម្គាល់សម្ភារ:ប្រើប្រាស់" value={viewTarget.id} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="បានបង្កើត" value={formatDate(viewTarget.createdAt)} />
              <DetailItem icon={<ShieldCheck className="h-4 w-4 text-slate-400" />} label="រូបតំណាង" value={viewTarget.icon || '—'} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="លុបសម្ភារ:ប្រើប្រាស់"
        description={`តើអ្នកប្រាកដថាចង់លុប "${deleteTarget?.name}"? សកម្មភាពនេះមិនអាចបញ្ឈប់បានទេ។`}
        confirmText="លុប"
        cancelText="បោះបង់"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

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