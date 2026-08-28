import { useState, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import { useRoles } from '../../hooks/useRoles.js';
import { usePermissions } from '../../hooks/usePermissions.js';
import { useUsers } from '../../hooks/useUsers.js';
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

const ROLE_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500', 'bg-teal-500'];

const pickRoleColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return ROLE_COLORS[Math.abs(hash) % ROLE_COLORS.length];
};

const getInitials = (name) => name?.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';

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
  const stats = useMemo(() => {
    const total = roles.length;
    const system = roles.filter((r) => r.isSystemRole).length;
    return { total, system, custom: total - system };
  }, [roles]);

  const filtered = useMemo(() => {
    let result = roles;
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
  }, [roles, scope, searchTerm]);

  const permissionsByModule = useMemo(() => {
    const map = {};
    for (const p of permissions) {
      (map[p.module || 'Other'] = map[p.module || 'Other'] || []).push(p);
    }
    return map;
  }, [permissions]);

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
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.code.trim()) errs.code = 'Code is required';
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
        toast.success('Role updated', `"${payload.name}" has been updated.`);
      } else {
        await createRole(payload);
        toast.success('Role created', `"${payload.name}" has been created.`);
      }
      setRoleModal(null);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Operation failed.';
      if (/name|c/i.test(message)) {
        setFormErrors((prev) => ({ ...prev, code: message }));
      } else {
        toast.error('Error', message);
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
    for (const p of permissions) init[p.id] = false;
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
      toast.success('Permissions saved', `Updated permissions for "${permModal.name}".`);
      setPermModal(null);
      loadRolePermissions(permModal.id);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to save permissions.');
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
    return roles.filter((r) => !assignedIds.has(r.id));
  }, [roles, userRoles]);

  const handleAssignRole = async (roleId) => {
    if (!userRoleTarget) return;
    setAssigning(roleId);
    try {
      await userApi.assignRole(userRoleTarget.id, roleId);
      toast.success('Role assigned', `Role assigned to the user.`);
      await loadUserRoles(userRoleTarget.id);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to assign role.');
    } finally {
      setAssigning(null);
    }
  };

  const handleRemoveRole = async (roleId) => {
    if (!userRoleTarget) return;
    setAssigning(roleId);
    try {
      await userApi.removeRole(userRoleTarget.id, roleId);
      toast.success('Role removed', `Role removed from the user.`);
      await loadUserRoles(userRoleTarget.id);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to remove role.');
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
      toast.success('Role deleted', `"${deleteTarget.name}" has been removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Delete failed', err.response?.data?.message || err.response?.data?.error || 'Failed to delete role.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Role',
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
      header: 'Description',
      render: (row) => (
        <span className="block max-w-[260px] truncate text-sm text-slate-500 dark:text-slate-400">
          {row.description || '—'}
        </span>
      ),
    },
    {
      header: 'Type',
      render: (row) =>
        row.isSystemRole ? (
          <Badge variant="info"><Lock className="mr-1 inline h-3 w-3" /> System</Badge>
        ) : (
          <Badge variant="neutral">Custom</Badge>
        ),
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
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="View"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => openView(row)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="Manage permissions"
            icon={<KeyRound className="h-4 w-4" />}
            onClick={() => openManagePermissions(row)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="Edit"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => openEdit(row)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            tooltip={row.isSystemRole ? 'System roles cannot be deleted' : 'Delete'}
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Roles</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage roles, permissions, and role assignments across users.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchRoles}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Create Role
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" title="Error loading roles" description={error} dismissible />}
      {permissionsError && <Alert variant="warning" title="Error loading permissions" description={permissionsError} dismissible />}

      {/* Stats */}
      {roles.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Roles"
            value={stats.total}
            icon={<Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
          />
          <StatCard
            label="System"
            value={stats.system}
            icon={<Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            valueClass="text-blue-700 dark:text-blue-400"
          />
          <StatCard
            label="Custom"
            value={stats.custom}
            icon={<ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            valueClass="text-emerald-700 dark:text-emerald-400"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
        <TabButton active={activeTab === 'roles'} onClick={() => setActiveTab('roles')} label="Roles" icon={<Shield className="h-4 w-4" />} />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="User Assignments" icon={<UserCog className="h-4 w-4" />} />
      </div>

      {activeTab === 'roles' ? (
        <>
          {/* Filters */}
          {roles.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, code, or description..."
                  leftIcon={<Search className="h-4 w-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'system', label: 'System' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && roles.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No roles yet"
              description="Create your first role to start managing access."
              action={
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                  Create Role
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Filter} title="No matches found" description="Try adjusting your search or filter criteria." />
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
                      {role.isSystemRole ? <Badge variant="info">System</Badge> : <Badge variant="neutral">Custom</Badge>}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{role.description || 'No description'}</p>
                    <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-gray-800">
                      <IconButton variant="ghost" size="sm" tooltip="Permissions" icon={<KeyRound className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openManagePermissions(role); }} />
                      <IconButton variant="ghost" size="sm" tooltip="Edit" icon={<Edit className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); openEdit(role); }} />
                      <IconButton variant="ghost" size="sm" tooltip={role.isSystemRole ? 'System roles cannot be deleted' : 'Delete'} icon={<Trash2 className="h-4 w-4" />} disabled={role.isSystemRole} className="text-red-600 dark:text-red-400" onClick={(e) => { e.stopPropagation(); setDeleteTarget(role); }} />
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
        title={roleModal?.mode === 'edit' ? 'Edit Role' : 'Create Role'}
        description={roleModal?.mode === 'edit' ? `Editing "${roleModal.role.name}"` : 'Define a new role for access control.'}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setRoleModal(null)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="roleForm" onClick={() => document.getElementById('roleForm')?.requestSubmit()} loading={submitting}>
              {roleModal?.mode === 'edit' ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        }
      >
        <form id="roleForm" onSubmit={handleRoleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Name" required name="name" value={form.name} onChange={handleFormChange} placeholder="e.g., Property Manager" error={formErrors.name} />
            <Input label="Code" required name="code" value={form.code} onChange={handleFormChange} placeholder="e.g., PROP_MANAGER" error={formErrors.code} />
          </div>
          <Textarea label="Description" name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="Describe what this role can do..." />
          {roleModal?.mode === 'create' && (
            <Checkbox
              label="Mark as system role (protected from deletion)"
              checked={form.isSystemRole}
              onChange={(e) => setForm((prev) => ({ ...prev, isSystemRole: e.target.checked }))}
            />
          )}
          {roleModal?.mode === 'edit' && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              <p className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                The system role flag cannot be changed after creation.
              </p>
            </div>
          )}
        </form>
      </Modal>

      {/* View role modal */}
      <Modal
        open={!!viewRole}
        onClose={() => setViewRole(null)}
        title="Role Details"
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
              {viewRole.isSystemRole ? <Badge variant="info"><Lock className="mr-1 inline h-3 w-3" /> System</Badge> : <Badge variant="neutral">Custom</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Hash className="h-4 w-4 text-slate-400" />} label="Role ID" value={viewRole.id} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Created" value={formatDate(viewRole.createdAt)} />
            </div>

            {viewRole.description && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewRole.description}</p>
              </div>
            )}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Permissions ({rolePermissions.length})
                </p>
                <Button variant="primary" size="sm" leftIcon={<KeyRound className="h-4 w-4" />} onClick={() => { setViewRole(null); openManagePermissions(viewRole); }}>
                  Manage
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
                <p className="text-sm text-slate-400 dark:text-slate-500">No permissions assigned to this role yet.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Manage permissions modal */}
      <Modal
        open={!!permModal}
        onClose={() => setPermModal(null)}
        title={`Manage Permissions`}
        description={permModal ? `Assign permissions for "${permModal.name}".` : undefined}
        size="xl"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setPermModal(null)} disabled={savingPerms}>Cancel</Button>
            <Button variant="primary" onClick={savePermissions} loading={savingPerms}>
              {savingPerms ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        }
      >
        {permissionsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tick the permissions this role should have. Saving replaces the full set.
            </p>
            {Object.keys(permissionsByModule).length === 0 ? (
              <EmptyState icon={Shield} title="No permissions found" description="There are no permissions to assign." />
            ) : (
              Object.entries(permissionsByModule).map(([module, perms]) => (
                <div key={module} className="rounded-lg border border-slate-200 p-4 dark:border-gray-800">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{module}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {perms.map((p) => (
                      <Checkbox
                        key={p.id}
                        label={
                          <span>
                            <span className="font-medium">{p.name}</span>
                            <span className="ml-1 font-mono text-xs text-slate-400">{p.code}</span>
                          </span>
                        }
                        checked={!!selectedPerms[p.id]}
                        onChange={() => handleTogglePerm(p.id)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* Delete role */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Role"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will unassign it from all users and permissions.`}
        confirmText="Delete"
        cancelText="Cancel"
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
          <Select
            label="Select a user"
            placeholder="Choose a user"
            options={users.map((u) => ({
              value: String(u.id),
              label: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || `User #${u.id}`,
            }))}
            value={selectedUserId}
            onChange={(e) => onSelectUser(e.target.value)}
          />
        </div>
      </div>
    </Card>

    {!selectedUserId ? (
      <EmptyState
        icon={UserCog}
        title="Select a user"
        description="Choose a user above to view and manage their assigned roles."
      />
    ) : (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Assigned roles */}
        <Card>
          <div className="border-b border-slate-100 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              Assigned Roles
            </h3>
            <p className="text-xs text-slate-400">{userRoles.length} role(s) assigned</p>
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
                      {role.isSystemRole && <Badge variant="info">System</Badge>}
                    </div>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      tooltip="Remove role"
                      icon={<Trash2 className="h-4 w-4" />}
                      className="text-red-600 dark:text-red-400"
                      disabled={assigning === role.id}
                      onClick={() => onRemove(role.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">No roles assigned yet.</p>
            )}
          </div>
        </Card>

        {/* Assign roles */}
        <Card>
          <div className="border-b border-slate-100 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Available Roles</h3>
            <p className="text-xs text-slate-400">Add a role to this user</p>
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
                      Assign
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">This user already has all available roles.</p>
            )}
          </div>
        </Card>
      </div>
    )}
  </div>
);
