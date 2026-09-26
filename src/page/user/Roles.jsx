import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Shield,
  ShieldCheck,
  Lock,
  UserCircle,
  Filter,
  Hash,
  Calendar,
  KeyRound,
  UserCog,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useRoles } from '../../hooks/useRoles.js';
import { usePermissions } from '../../hooks/usePermissions.js';
import { useUsers } from '../../hooks/useUsers.js';
import { useMyRoles } from '../../hooks/useMyRoles.js';
import { roleApi } from '../../api/role.api.js';
import { userApi } from '../../api/user.api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Modal,
  Input,
  Select,
  Textarea,
  IconButton,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Skeleton,
} from '../../components/ui/index.js';
import PermissionManagerModal from './PermissionManagerModal.jsx';

const ROLE_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500', 'bg-teal-500'];

const pickRoleColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return ROLE_COLORS[Math.abs(hash) % ROLE_COLORS.length];
};

const getInitials = (name) => name?.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';

const isOwnerRole = (role) => !!role?.code && String(role.code).toUpperCase() === 'OWNER';

const isSuperAdminRole = (role) => !!role?.code && String(role.code).toUpperCase() === 'SUPER_ADMIN';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function Roles() {
  const {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  } = useRoles();
  const {
    permissions,
    loading: permissionsLoading,
    error: permissionsError,
  } = usePermissions();
  const { users, loading: usersLoading } = useUsers();
  const { isOwner, isSuperAdmin } = useMyRoles();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'users'
  const [searchTerm, setSearchTerm] = useState('');
  const [scope, setScope] = useState('all'); // 'all' | 'system' | 'custom'

  const [roleModal, setRoleModal] = useState(null); // { mode: 'create'|'edit', role }
  const [form, setForm] = useState({ name: '', code: '', description: '', isSystemRole: false });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [viewRole, setViewRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissionsLoadingRole, setPermissionsLoadingRole] = useState(false);

  const [permModal, setPermModal] = useState(null); // role being managed
  const [selectedPerms, setSelectedPerms] = useState({});
  const [savingPerms, setSavingPerms] = useState(false);

  const [userRoleTarget, setUserRoleTarget] = useState(null); // user in assignments view
  const [userRoles, setUserRoles] = useState([]);
  const [userRolesLoading, setUserRolesLoading] = useState(false);
  const [assigning, setAssigning] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---- Derived ----
  // SUPER_ADMIN is hidden from an OWNER (who is not also a SUPER_ADMIN). The
  // backend enforces the same restriction; this is a defensive UX filter only.
  const visibleRoles = useMemo(() => {
    if (isOwner && !isSuperAdmin) {
      return roles.filter((r) => !isSuperAdminRole(r));
    }
    return roles;
  }, [roles, isOwner, isSuperAdmin]);

  const stats = useMemo(() => {
    const total = visibleRoles.length;
    const system = visibleRoles.filter((r) => r.isSystemRole).length;
    return { total, system, custom: total - system };
  }, [visibleRoles]);

  const filtered = useMemo(() => {
    let result = visibleRoles;
    if (scope === 'system') result = result.filter((r) => r.isSystemRole);
    else if (scope === 'custom') result = result.filter((r) => !r.isSystemRole);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.code && r.code.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [visibleRoles, scope, searchTerm]);

  const handleToggleModule = (modulePerms, checked) => {
    setSelectedPerms((prev) => {
      const next = { ...prev };
      modulePerms.forEach((p) => {
        next[p.id] = checked;
      });
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedPerms((prev) => {
      const next = { ...prev };
      permissions.forEach((p) => {
        next[p.id] = true;
      });
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedPerms((prev) => {
      const next = { ...prev };
      permissions.forEach((p) => {
        next[p.id] = false;
      });
      return next;
    });
  };

  // ---- Role modal helpers ----
  const openCreate = () => {
    setForm({ name: '', code: '', description: '', isSystemRole: false });
    setFormErrors({});
    setRoleModal({ mode: 'create', role: null });
  };

  const openEdit = (role) => {
    setForm({
      name: role.name || '',
      code: role.code || '',
      description: role.description || '',
      isSystemRole: !!role.isSystemRole,
    });
    setFormErrors({});
    setRoleModal({ mode: 'edit', role });
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

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      ...(roleModal?.mode === 'create' ? { isSystemRole: !!form.isSystemRole } : {}),
    };
    try {
      if (roleModal?.mode === 'edit') {
        await updateRole(roleModal.role.id, payload);
        toast.success('បានកែប្រែតួនាទី', `"${payload.name}" ត្រូវបានធ្វើបច្ចុប្បន្នភាព។`);
      } else {
        await createRole(payload);
        toast.success('បានបង្កើតតួនាទី', `"${payload.name}" ត្រូវបានបង្កើត។`);
      }
      setRoleModal(null);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'ប្រតិបត្តិការបានបរាជ័យ។';
      if (/name|c/i.test(message)) {
        setFormErrors((prev) => ({ ...prev, code: message }));
      } else {
        toast.error('កំហុស', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---- View + permissions ----
  const loadRolePermissions = useCallback(
    async (roleId) => {
      setPermissionsLoadingRole(true);
      try {
        const perms = await roleApi.getRolePermissions(roleId);
        setRolePermissions(perms);
      } catch {
        setRolePermissions([]);
      } finally {
        setPermissionsLoadingRole(false);
      }
    },
    []
  );

  const openView = (role) => {
    setViewRole(role);
    setRolePermissions([]);
    loadRolePermissions(role.id);
  };

  const openManagePermissions = (role) => {
    setPermModal(role);
    const init = {};
    for (const p of permissions) init[p.id] = isOwnerRole(role);
    setSelectedPerms(init);
    // Pre-populate existing role permissions
    roleApi.getRolePermissions(role.id)
      .then((perms) => {
        setSelectedPerms((prev) => {
          const next = { ...prev };
          perms.forEach((p) => (next[p.id] = true));
          return next;
        });
      })
      .catch(() => {});
  };

  const handleTogglePerm = (id) => {
    setSelectedPerms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const savePermissions = async () => {
    if (!permModal) return;
    setSavingPerms(true);
    try {
      const ids = Object.entries(selectedPerms)
        .filter(([, v]) => v)
        .map(([k]) => Number(k));
      await roleApi.replacePermissions(permModal.id, ids);
      toast.success('បានរក្សាទុកសិទ្ធិ', `បានធ្វើបច្ចុប្បន្នភាពសិទ្ធិសម្រាប់ "${permModal.name}"។`);
      setPermModal(null);
      loadRolePermissions(permModal.id);
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'ការរក្សាទុកសិទ្ធិបានបរាជ័យ។');
    } finally {
      setSavingPerms(false);
    }
  };

  // ---- User role assignment ----
  const loadUserRoles = useCallback(async (userId) => {
    if (!userId) return;
    setUserRolesLoading(true);
    try {
      const rs = await userApi.getUserRoles(userId);
      setUserRoles(rs);
    } catch {
      setUserRoles([]);
    } finally {
      setUserRolesLoading(false);
    }
  }, []);

  const availableRoles = useMemo(() => {
    const assignedIds = new Set(userRoles.map((r) => r.id));
    return visibleRoles.filter((r) => !assignedIds.has(r.id));
  }, [visibleRoles, userRoles]);

  const handleAssignRole = async (roleId) => {
    if (!userRoleTarget) return;
    setAssigning(roleId);
    try {
      await userApi.assignRole(userRoleTarget.id, roleId);
      toast.success('បានកំណត់តួនាទី', `បានកំណត់តួនាទីឱ្យអ្នកប្រើប្រាស់។`);
      await loadUserRoles(userRoleTarget.id);
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'ការកំណត់តួនាទីបានបរាជ័យ។');
    } finally {
      setAssigning(null);
    }
  };

  const handleRemoveRole = async (roleId) => {
    if (!userRoleTarget) return;
    setAssigning(roleId);
    try {
      await userApi.removeRole(userRoleTarget.id, roleId);
      toast.success('បានដកតួនាទីចេញ', `តួនាទីត្រូវបានដកចេញពីអ្នកប្រើប្រាស់។`);
      await loadUserRoles(userRoleTarget.id);
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'ការដកតួនាទីបានបរាជ័យ។');
    } finally {
      setAssigning(null);
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRole(deleteTarget.id);
      toast.success('បានលុបតួនាទី', `"${deleteTarget.name}" ត្រូវបានដកចេញ។`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('ការលុបបានបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'ការលុបតួនាទីបានបរាជ័យ។');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'តួនាទី',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${pickRoleColor(row.name)}`}>
            {getInitials(row.name)}
          </span>
          <div>
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
      header: 'ប្រភេទ',
      render: (row) =>
        row.isSystemRole ? (
          <Badge variant="info"><Lock className="mr-1 inline h-3 w-3" /> ប្រព័ន្ធ</Badge>
        ) : (
          <Badge variant="neutral">ផ្ទាល់ខ្លួន</Badge>
        ),
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
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="មើល"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => openView(row)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="គ្រប់គ្រងសិទ្ធិ"
            icon={<KeyRound className="h-4 w-4" />}
            onClick={() => openManagePermissions(row)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="កែប្រែ"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => openEdit(row)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip={row.isSystemRole ? 'តួនាទីប្រព័ន្ធមិនអាចលុបបានទេ' : 'លុប'}
            icon={<Trash2 className="h-4 w-4" />}
            disabled={row.isSystemRole}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  if (loading || usersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="mt-3 h-3 w-16" />
              <Skeleton className="mt-1.5 h-5 w-10" />
            </div>
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">តួនាទី</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងតួនាទី សិទ្ធិ និងការកំណត់តួនាទីសម្រាប់អ្នកប្រើប្រាស់ទាំងអស់។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchRoles}>
            ផ្ទុកឡើងវិញ
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            បង្កើតតួនាទី
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកតួនាទី" description={error} dismissible />}
      {permissionsError && <Alert variant="warning" title="កំហុសក្នុងការផ្ទុកសិទ្ធិ" description={permissionsError} dismissible />}

      {/* Stats */}
      {visibleRoles.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="ចំនួនតួនាទីសរុប"
            value={stats.total}
            icon={<Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
          />
          <StatCard
            label="ប្រព័ន្ធ"
            value={stats.system}
            icon={<Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            valueClass="text-blue-700 dark:text-blue-400"
          />
          <StatCard
            label="ផ្ទាល់ខ្លួន"
            value={stats.custom}
            icon={<ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            valueClass="text-emerald-700 dark:text-emerald-400"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
        <TabButton active={activeTab === 'roles'} onClick={() => setActiveTab('roles')} label="តួនាទី" icon={<Shield className="h-4 w-4" />} />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="ការកំណត់តួនាទីអ្នកប្រើប្រាស់" icon={<UserCog className="h-4 w-4" />} />
      </div>

      {activeTab === 'roles' ? (
        <>
          {/* Filters */}
          {visibleRoles.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  placeholder="ស្វែងរកតាមឈ្មោះ លេខកូដ ឬការពិពណ៌នា..."
                  leftIcon={<Search className="h-4 w-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  options={[
                    { value: 'all', label: 'គ្រប់ប្រភេទ' },
                    { value: 'system', label: 'ប្រព័ន្ធ' },
                    { value: 'custom', label: 'ផ្ទាល់ខ្លួន' },
                  ]}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && visibleRoles.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="មិនទាន់មានតួនាទី"
              description="បង្កើតតួនាទីដំបូងរបស់អ្នក ដើម្បីចាប់ផ្តើមគ្រប់គ្រងការចូលប្រើ។"
              action={
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                  បង្កើតតួនាទី
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Filter} title="រកមិនឃើញលទ្ធផល" description="សូមព្យាយាមកែតម្រូវលក្ខណៈវិនិច្ឆ័យស្វែងរក ឬតម្រងរបស់អ្នក។" />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
                {filtered.map((role) => (
                  <div key={role.id} onClick={() => openView(role)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${pickRoleColor(role.name)}`}>
                          {getInitials(role.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{role.name}</p>
                          <p className="font-mono text-xs text-slate-400">{role.code}</p>
                        </div>
                      </div>
                      {role.isSystemRole ? <Badge variant="info">ប្រព័ន្ធ</Badge> : <Badge variant="neutral">ផ្ទាល់ខ្លួន</Badge>}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{role.description || 'គ្មានការពិពណ៌នា'}</p>
                    <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-gray-800">
                      <IconButton variant="ghost" size="sm" tooltip="សិទ្ធិ" icon={<KeyRound className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openManagePermissions(role); }} />
                      <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openEdit(role); }} />
                      <IconButton variant="ghost" size="sm" tooltip={role.isSystemRole ? 'តួនាទីប្រព័ន្ធមិនអាចលុបបានទេ' : 'លុប'} icon={<Trash2 className="h-4 w-4" />} disabled={role.isSystemRole} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeleteTarget(role); }} />
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
        </>
      ) : (
        /* ---- User assignments view ---- */
        <UserAssignmentsView
          users={users}
          selectedUserId={userRoleTarget?.id || ''}
          userRoles={userRoles}
          userRolesLoading={userRolesLoading}
          availableRoles={availableRoles}
          assigning={assigning}
          onSelectUser={(id) => {
            const u = users.find((x) => String(x.id) === String(id));
            setUserRoleTarget(u || null);
            loadUserRoles(id);
          }}
          onAssign={handleAssignRole}
          onRemove={handleRemoveRole}
        />
      )}

      {/* Create/Edit Role modal */}
      <Modal
        open={!!roleModal}
        onClose={() => setRoleModal(null)}
        title={roleModal?.mode === 'edit' ? 'កែប្រែតួនាទី' : 'បង្កើតតួនាទី'}
        description={roleModal?.mode === 'edit' ? `កំពុងកែប្រែ "${roleModal.role.name}"` : 'កំណត់តួនាទីថ្មីសម្រាប់ការគ្រប់គ្រងការចូលប្រើ។'}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setRoleModal(null)} disabled={submitting}>បោះបង់</Button>
            <Button type="submit" form="roleForm" onClick={() => document.getElementById('roleForm')?.requestSubmit()} loading={submitting}>
              {roleModal?.mode === 'edit' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតតួនាទី'}
            </Button>
          </div>
        }
      >
        <form id="roleForm" onSubmit={handleRoleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="ឈ្មោះ" required name="name" value={form.name} onChange={handleFormChange} placeholder="ឧ. អ្នកគ្រប់គ្រងអចលនទ្រព្យ" error={formErrors.name} />
            <Input label="លេខកូដ" required name="code" value={form.code} onChange={handleFormChange} placeholder="ឧ. PROP_MANAGER" error={formErrors.code} />
          </div>
          <Textarea label="ការពិពណ៌នា" name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="រៀបរាប់ពីអ្វីដែលតួនាទីនេះអាចធ្វើបាន..." />
          {roleModal?.mode === 'create' && (
            <Checkbox
              label="កំណត់ជាតួនាទីប្រព័ន្ធ (ការពារពីការលុប)"
              checked={form.isSystemRole}
              onChange={(e) => setForm((prev) => ({ ...prev, isSystemRole: e.target.checked }))}
            />
          )}
          {roleModal?.mode === 'edit' && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              <p className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                ការកំណត់តួនាទីប្រព័ន្ធមិនអាចផ្លាស់ប្តូរបានទេបន្ទាប់ពីបង្កើតរួច។
              </p>
            </div>
          )}
        </form>
      </Modal>

      {/* View role modal */}
      <Modal
        open={!!viewRole}
        onClose={() => setViewRole(null)}
        title="ព័ត៌មានលម្អិតតួនាទី"
        size="lg"
      >
        {viewRole && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white ${pickRoleColor(viewRole.name)}`}>
                  {getInitials(viewRole.name)}
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{viewRole.name}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">{viewRole.code}</p>
                </div>
              </div>
              {viewRole.isSystemRole ? <Badge variant="info"><Lock className="mr-1 inline h-3 w-3" /> ប្រព័ន្ធ</Badge> : <Badge variant="neutral">ផ្ទាល់ខ្លួន</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="លេខសម្គាល់តួនាទី" value={viewRole.id} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="កាលបរិច្ឆេទបង្កើត" value={formatDate(viewRole.createdAt)} />
            </div>

            {viewRole.description && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ការពិពណ៌នា</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewRole.description}</p>
              </div>
            )}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  សិទ្ធិ ({rolePermissions.length})
                </p>
                <Button variant="primary" size="sm" leftIcon={<KeyRound className="h-4 w-4" />} onClick={() => { setViewRole(null); openManagePermissions(viewRole); }}>
                  គ្រប់គ្រង
                </Button>
              </div>
              {permissionsLoadingRole ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : rolePermissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {rolePermissions.map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <ShieldCheck className="h-3 w-3" />
                      {p.name}
                      <span className="opacity-70">({p.module})</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">មិនទាន់មានសិទ្ធិណាមួយត្រូវបានកំណត់សម្រាប់តួនាទីនេះទេ។</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Manage permissions modal */}
      <PermissionManagerModal
        open={!!permModal}
        onClose={() => setPermModal(null)}
        role={permModal}
        permissions={permissions}
        loading={permissionsLoading}
        selected={selectedPerms}
        ownerLocked={isOwnerRole(permModal)}
        onToggle={handleTogglePerm}
        onToggleModule={handleToggleModule}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        onSave={savePermissions}
        saving={savingPerms}
      />

      {/* Delete role */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="លុបតួនាទី"
        description={`តើអ្នកប្រាកដទេថាចង់លុប "${deleteTarget?.name}"? នេះនឹងដកវាចេញពីអ្នកប្រើប្រាស់ និងសិទ្ធិទាំងអស់។`}
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

const TabButton = ({ active, onClick, label, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
      active ? 'bg-slate-900 text-white dark:bg-white dark:text-gray-900' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const UserAssignmentsView = ({
  users,
  selectedUserId,
  userRoles,
  userRolesLoading,
  availableRoles,
  assigning,
  onSelectUser,
  onAssign,
  onRemove,
}) => (
  <div className="space-y-6">
    <Card>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <UserPicker
            users={users}
            value={selectedUserId}
            onSelect={(u) => onSelectUser(u.id)}
            onClear={() => onSelectUser('')}
          />
        </div>
      </div>
    </Card>

    {!selectedUserId ? (
      <EmptyState
        icon={UserCog}
        title="ជ្រើសរើសអ្នកប្រើប្រាស់"
        description="ស្វែងរក និងជ្រើសរើសអ្នកប្រើប្រាស់ខាងលើ ដើម្បីមើល និងគ្រប់គ្រងតួនាទីដែលបានកំណត់របស់ពួកគេ។"
      />
    ) : (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Assigned roles */}
        <Card>
          <div className="border-b border-slate-100 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              តួនាទីដែលបានកំណត់
            </h3>
            <p className="text-xs text-slate-400">{userRoles.length} តួនាទីត្រូវបានកំណត់</p>
          </div>
          <div className="p-4">
            {userRolesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : userRoles.length > 0 ? (
              <ul className="space-y-2">
                {userRoles.map((role) => (
                  <li key={role.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{role.name}</span>
                      {role.isSystemRole && <Badge variant="info">ប្រព័ន្ធ</Badge>}
                    </div>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      tooltip="ដកតួនាទីចេញ"
                      icon={<Trash2 className="h-4 w-4" />}
                      className="text-red-600 dark:text-red-400"
                      disabled={assigning === role.id}
                      onClick={() => onRemove(role.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">មិនទាន់មានតួនាទីដែលបានកំណត់ទេ។</p>
            )}
          </div>
        </Card>

        {/* Assign roles */}
        <Card>
          <div className="border-b border-slate-100 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">តួនាទីដែលអាចកំណត់បាន</h3>
            <p className="text-xs text-slate-400">បន្ថែមតួនាទីសម្រាប់អ្នកប្រើប្រាស់នេះ</p>
          </div>
          <div className="p-4">
            {availableRoles.length > 0 ? (
              <ul className="space-y-2">
                {availableRoles.map((role) => (
                  <li key={role.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <UserCircle className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{role.name}</span>
                      <span className="font-mono text-xs text-slate-400">{role.code}</span>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} disabled={assigning === role.id} loading={assigning === role.id} onClick={() => onAssign(role.id)}>
                      កំណត់
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">អ្នកប្រើប្រាស់នេះមានតួនាទីដែលអាចកំណត់បានទាំងអស់ហើយ។</p>
            )}
          </div>
        </Card>
      </div>
    )}
  </div>
);

const USER_AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const pickUserColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return USER_AVATAR_COLORS[Math.abs(hash) % USER_AVATAR_COLORS.length];
};

const getUserLabel = (u) =>
  `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || `អ្នកប្រើ #${u.id}`;

const getUserInitials = (u) => {
  const f = u.firstName?.[0] || '';
  const l = u.lastName?.[0] || '';
  return (f + l).toUpperCase() || '?';
};

const UserAvatar = ({ user, size = 'h-9 w-9' }) => {
  if (user.avatar) {
    return <img src={user.avatar} alt="" className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${pickUserColor(getUserLabel(user))}`}>
      {getUserInitials(user)}
    </span>
  );
};

const UserPicker = ({ users, value, onSelect, onClear }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);

  const selected = users.find((u) => String(u.id) === String(value)) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.firstName, u.lastName, u.username, u.email, u.phone]
        .filter(Boolean)
        .some((s) => s.toLowerCase().includes(q))
    );
  }, [users, query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handlePick = (u) => {
    onSelect(u);
    setOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    onClear();
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        ជ្រើសរើសអ្នកប្រើប្រាស់
      </p>

      {selected ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-indigo-200 bg-indigo-50/60 px-3 py-2 dark:border-indigo-800/60 dark:bg-indigo-900/15">
          <div className="flex min-w-0 items-center gap-2.5">
            <UserAvatar user={selected} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                {getUserLabel(selected)}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                @{selected.username}
                {selected.email ? ` · ${selected.email}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            aria-label="ដកចេញ"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-slate-700 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Input
          leftIcon={<Search className="h-4 w-4" />}
          placeholder="ស្វែងរកតាមឈ្មោះ អ៊ីមែល ឬលេខទូរស័ព្ទ..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      )}

      {open && !selected && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                រកមិនឃើញអ្នកប្រើ
              </p>
            ) : (
              filtered.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handlePick(u)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-gray-800"
                >
                  <UserAvatar user={u} size="h-8 w-8" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800 dark:text-white">
                      {getUserLabel(u)}
                    </span>
                    <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                      @{u.username}
                      {u.email ? ` · ${u.email}` : ''}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
