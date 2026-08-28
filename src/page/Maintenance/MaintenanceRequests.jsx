import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Eye,
  Wrench,
  Calendar,
  Filter,
  Tag,
  Building2,
  DoorOpen,
  Flag,
  MessageSquare,
  UserPlus,
  Trash2,
  Send,
} from 'lucide-react';
import { useMaintenanceRequests } from '../../hooks/useMaintenanceRequests.js';
import { useMaintenanceComments } from '../../hooks/useMaintenanceComments.js';
import { useMaintenanceCosts } from '../../hooks/useMaintenanceCosts.js';
import { useMaintenanceAssignments } from '../../hooks/useMaintenanceAssignments.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useRooms, useRoomsByHouse } from '../../hooks/useRooms.js';
import { useMaintenanceCategories } from '../../hooks/useMaintenanceCategories.js';
import { useUsers } from '../../hooks/useUsers.js';
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
  EmptyState,
  Skeleton,
  Tabs,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CANCELLED: 'neutral',
};

const PRIORITY_VARIANT = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const COST_TYPE_OPTIONS = [
  { value: 'LABOR', label: 'Labor' },
  { value: 'SPARE_PART', label: 'Spare Part' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'OTHER', label: 'Other' },
];

const EMPTY_FORM = {
  houseId: '',
  roomId: '',
  tenantId: '',
  categoryId: '',
  title: '',
  description: '',
  priority: 'MEDIUM',
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const withFallback = (map, room) => {
  const existing = map.get(String(room.id));
  if (!existing || (!existing.name && room.name)) map.set(String(room.id), room);
};

export default function MaintenanceRequests() {
  const {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    updateRequest,
    changeStatus,
  } = useMaintenanceRequests();
  const { houses } = useHouses();
  const { rooms } = useRooms();
  const { categories } = useMaintenanceCategories();
  const { users } = useUsers();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);
  const [detailTab, setDetailTab] = useState('comments');

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [costModal, setCostModal] = useState(null); // { request, cost? }
  const [costForm, setCostForm] = useState({ costType: 'LABOR', description: '', quantity: '', unitPrice: '' });
  const [costErrors, setCostErrors] = useState({});
  const [costSubmitting, setCostSubmitting] = useState(false);

  const [assignmentModal, setAssignmentModal] = useState(null); // request
  const [assignmentForm, setAssignmentForm] = useState({ assignedTo: '', notes: '' });
  const [assignmentErrors, setAssignmentErrors] = useState({});
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);

  const refresh = useCallback(() => fetchRequests(), [fetchRequests]);

  const houseMap = useMemo(() => Object.fromEntries(houses.map((h) => [String(h.id), h])), [houses]);
  const roomMap = useMemo(() => Object.fromEntries(rooms.map((r) => [String(r.id), r])), [rooms]);
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [String(c.id), c])), [categories]);
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [String(u.id), u])), [users]);

  const getHouseName = (id) => houseMap[String(id)]?.name || id || '—';
  const getRoomName = (id) => roomMap[String(id)]?.roomNumber || roomMap[String(id)]?.number || id || '—';
  const getCategoryName = (id) => categoryMap[String(id)]?.name || id || '—';
  const getUserName = (id) => {
    const u = userMap[String(id)];
    return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || `User #${id}` : id || '—';
  };

  // Set up detail hooks only when a request is selected
  const commentsHook = useMaintenanceComments(viewRequest?.id);
  const costsHook = useMaintenanceCosts(viewRequest?.id);
  const assignmentsHook = useMaintenanceAssignments(viewRequest?.id);

  // Rooms for the currently selected house. Combines the globally-loaded rooms
  // list (rendered immediately) with the per-house endpoint so the dropdown is
  // populated from whichever data source returns the house's rooms.
  const { rooms: houseRoomsFetched } = useRoomsByHouse(form.houseId);
  const houseRooms = useMemo(() => {
    const fromGlobal = rooms.filter((r) => String(r.houseId) === String(form.houseId));
    const byId = new Map();
    [...fromGlobal, ...houseRoomsFetched].forEach((r) => withFallback(byId, r));
    return Array.from(byId.values());
  }, [rooms, form.houseId, houseRoomsFetched]);

  const getStatusBadge = (status) => (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>{status?.replace('_', ' ') || '—'}</Badge>
  );

  const getPriorityBadge = (priority) => (
    <Badge variant={PRIORITY_VARIANT[priority] || 'default'}>{priority || '—'}</Badge>
  );

  const filtered = useMemo(() => {
    let result = requests;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.requestNo && r.requestNo.toLowerCase().includes(q))
      );
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    return result;
  }, [requests, searchTerm, statusFilter]);

  const columns = [
    {
      header: 'Request',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <Wrench className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-white">{row.title}</p>
            <p className="font-mono text-xs text-slate-400">{row.requestNo || `#${row.id}`}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {getHouseName(row.houseId)}
          {row.roomId ? ` • ${getRoomName(row.roomId)}` : ''}
        </span>
      ),
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Tag className="h-4 w-4 text-slate-400" />
          {getCategoryName(row.categoryId)}
        </span>
      ),
    },
    {
      header: 'Priority',
      render: (row) => getPriorityBadge(row.priority),
    },
    {
      header: 'Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Reported',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDateTime(row.reportedAt || row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton variant="ghost" size="sm" tooltip="View" icon={<Eye className="h-4 w-4" />} onClick={() => openView(row)} />
          <IconButton variant="ghost" size="sm" tooltip="Edit" icon={<Edit className="h-4 w-4" />} onClick={() => openEdit(row)} />
        </div>
      ),
    },
  ];

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openView = (r) => {
    setViewRequest(r);
    setDetailTab('comments');
    setNewComment('');
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setForm({
      houseId: r.houseId != null ? String(r.houseId) : '',
      roomId: r.roomId != null ? String(r.roomId) : '',
      tenantId: r.tenantId != null ? String(r.tenantId) : '',
      categoryId: r.categoryId != null ? String(r.categoryId) : '',
      title: r.title || '',
      description: r.description || '',
      priority: r.priority || 'MEDIUM',
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'houseId') setForm((prev) => ({ ...prev, roomId: '', tenantId: '' }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.houseId) errs.houseId = 'House is required';
    if (!form.roomId) errs.roomId = 'Room is required';
    if (!form.title.trim()) errs.title = 'Title is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      houseId: Number(form.houseId),
      roomId: Number(form.roomId),
      tenantId: form.tenantId ? Number(form.tenantId) : null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
    };

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateRequest(editTarget.id, payload);
        toast.success('Request updated', `"${payload.title}" has been updated.`);
        setEditTarget(null);
      } else {
        await createRequest(payload);
        toast.success('Request created', `"${payload.title}" has been created.`);
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!viewRequest || !newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      await commentsHook.createComment({ comment: newComment.trim() });
      setNewComment('');
      toast.success('Comment added', 'Comment has been added.');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to add comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsHook.deleteComment(commentId);
      toast.success('Comment deleted', 'Comment has been removed.');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to delete comment.');
    }
  };

  // ---- Cost modal ----
  const openCreateCost = () => {
    setCostForm({ costType: 'LABOR', description: '', quantity: '', unitPrice: '' });
    setCostErrors({});
    setCostModal({ request: viewRequest });
  };

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCostForm((prev) => ({ ...prev, [name]: value }));
    if (costErrors[name]) setCostErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateCost = () => {
    const errs = {};
    if (!costForm.description.trim()) errs.description = 'Description is required';
    if (costForm.quantity === '' || Number(costForm.quantity) <= 0) errs.quantity = 'Quantity must be greater than 0';
    if (costForm.unitPrice === '' || Number(costForm.unitPrice) < 0) errs.unitPrice = 'Unit price must not be negative';
    setCostErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCostSubmit = async (e) => {
    e.preventDefault();
    if (!viewRequest || !validateCost()) return;
    setCostSubmitting(true);
    try {
      const payload = {
        costType: costForm.costType,
        description: costForm.description.trim(),
        quantity: Number(costForm.quantity),
        unitPrice: Number(costForm.unitPrice),
      };
      if (costModal?.cost) {
        await costsHook.updateCost(costModal.cost.id, payload);
        toast.success('Cost updated', 'The cost record has been updated.');
      } else {
        await costsHook.createCost(payload);
        toast.success('Cost added', 'The cost record has been added.');
      }
      setCostModal(null);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to save cost.');
    } finally {
      setCostSubmitting(false);
    }
  };

  const handleDeleteCost = async (costId) => {
    try {
      await costsHook.deleteCost(costId);
      toast.success('Cost deleted', 'The cost record has been removed.');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to delete cost.');
    }
  };

  // ---- Assignment modal ----
  const openCreateAssignment = () => {
    setAssignmentForm({ assignedTo: '', notes: '' });
    setAssignmentErrors({});
    setAssignmentModal(viewRequest);
  };

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm((prev) => ({ ...prev, [name]: value }));
    if (assignmentErrors[name]) setAssignmentErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateAssignment = () => {
    const errs = {};
    if (!assignmentForm.assignedTo) errs.assignedTo = 'User is required';
    setAssignmentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!viewRequest || !validateAssignment()) return;
    setAssignmentSubmitting(true);
    try {
      const payload = {
        assignedTo: Number(assignmentForm.assignedTo),
        notes: assignmentForm.notes.trim(),
      };
      await assignmentsHook.createAssignment(payload);
      toast.success('Assignment created', 'The user has been assigned to this request.');
      setAssignmentModal(null);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to create assignment.');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleCompleteAssignment = async (assignmentId) => {
    try {
      await assignmentsHook.completeAssignment(assignmentId);
      toast.success('Assignment completed', 'The assignment has been marked complete.');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to complete assignment.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32" />
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Maintenance Requests</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track, assign, and resolve maintenance issues across your properties.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>Refresh</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>New Request</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error loading requests" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>Retry</Button>
          </div>
        </Alert>
      )}

      {requests.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by title or request number..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Statuses" />
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>Clear</Button>
        </div>
      )}

      {!loading && requests.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests"
          description="Create a maintenance request to get started."
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>New Request</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="No matches found" description="Try adjusting your search or filter criteria." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((r) => (
              <div key={r.id} onClick={() => openView(r)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      <Wrench className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">{r.title}</p>
                      <p className="font-mono text-xs text-slate-400">{r.requestNo || `#${r.id}`}</p>
                    </div>
                  </div>
                  {getStatusBadge(r.status)}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {getHouseName(r.houseId)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="h-4 w-4 text-slate-400" />
                    {r.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Card className="hidden lg:block">
            <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} onRowClick={openView} className="w-full" />
          </Card>
        </>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Request' : 'New Maintenance Request'}
        description={editTarget ? `Editing "${editTarget.title}"` : 'Report a maintenance issue for a room.'}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="requestForm" onClick={() => document.getElementById('requestForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'Save Changes' : 'Create Request'}
            </Button>
          </div>
        }
      >
        <form id="requestForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="House"
              required
              name="houseId"
              options={houses.map((h) => ({ value: String(h.id), label: h.name || `House #${h.id}` }))}
              value={form.houseId}
              onChange={handleFormChange}
              error={formErrors.houseId}
            />
            <Select
              label="Room"
              required
              name="roomId"
              options={houseRooms.map((r) => ({ value: String(r.id), label: r.roomNumber || r.number || `Room #${r.id}` }))}
              value={form.roomId}
              onChange={handleFormChange}
              error={formErrors.roomId}
              disabled={!form.houseId}
              placeholder={!form.houseId ? 'Select a house first' : houseRooms.length ? 'Select a room' : 'No rooms for this house'}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              name="categoryId"
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
              value={form.categoryId}
              onChange={handleFormChange}
            />
            <Select
              label="Priority"
              name="priority"
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={handleFormChange}
            />
          </div>
          <Input label="Title" required name="title" value={form.title} onChange={handleFormChange} placeholder="e.g., Leaking pipe in bathroom" error={formErrors.title} />
          <Textarea label="Description" name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="Describe the issue..." />
        </form>
      </Modal>

      {/* Detail modal with tabs */}
      <Modal
        open={!!viewRequest}
        onClose={() => setViewRequest(null)}
        title="Maintenance Request"
        size="xl"
        footer={
          viewRequest && viewRequest.status !== 'RESOLVED' && viewRequest.status !== 'CANCELLED' ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const next = viewRequest.status === 'PENDING' ? 'IN_PROGRESS' : 'RESOLVED';
                  changeStatus(viewRequest.id, next)
                    .then(() => {
                      toast.success('Status updated', `Request moved to ${next.replace('_', ' ')}.`);
                      setViewRequest((prev) => ({ ...prev, status: next }));
                    })
                    .catch((err) => toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to update status.'));
                }}
              >
                {viewRequest.status === 'PENDING' ? 'Start Work' : 'Mark Resolved'}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  changeStatus(viewRequest.id, 'CANCELLED')
                    .then(() => {
                      toast.success('Request cancelled', 'The request has been cancelled.');
                      setViewRequest((prev) => ({ ...prev, status: 'CANCELLED' }));
                    })
                    .catch((err) => toast.error('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to cancel request.'));
                }}
              >
                Cancel
              </Button>
            </div>
          ) : null
        }
      >
        {viewRequest && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <Wrench className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{viewRequest.title}</p>
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">{viewRequest.requestNo || `#${viewRequest.id}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(viewRequest.priority)}
                {getStatusBadge(viewRequest.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={<Building2 className="h-4 w-4 text-slate-400" />} label="House" value={getHouseName(viewRequest.houseId)} />
              <DetailItem icon={<DoorOpen className="h-4 w-4 text-slate-400" />} label="Room" value={getRoomName(viewRequest.roomId)} />
              <DetailItem icon={<Tag className="h-4 w-4 text-slate-400" />} label="Category" value={getCategoryName(viewRequest.categoryId)} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Reported" value={formatDateTime(viewRequest.reportedAt || viewRequest.createdAt)} />
            </div>

            {viewRequest.description && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewRequest.description}</p>
              </div>
            )}

            <Tabs
              tabs={[
                { value: 'comments', label: `Comments (${commentsHook.comments.length})` },
                { value: 'costs', label: `Costs (${costsHook.costs.length})` },
                { value: 'assignments', label: `Assignments (${assignmentsHook.assignments.length})` },
              ]}
              activeTab={detailTab}
              onChange={setDetailTab}
            />

            {detailTab === 'comments' && (
              <div className="space-y-4">
                <form onSubmit={handleCommentSubmit} className="flex items-start gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button type="submit" leftIcon={<Send className="h-4 w-4" />} loading={commentSubmitting} disabled={!newComment.trim()}>
                    Post
                  </Button>
                </form>
                {commentsHook.loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : commentsHook.comments.length > 0 ? (
                  <ul className="space-y-3">
                    {commentsHook.comments.map((c) => (
                      <li key={c.id} className="rounded-lg border border-slate-200 p-3 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {getUserName(c.userId)} • {formatDateTime(c.createdAt)}
                          </span>
                          <IconButton variant="ghost" size="sm" tooltip="Delete" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={() => handleDeleteComment(c.id)} />
                        </div>
                        <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200">{c.comment}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-slate-400">No comments yet.</p>
                )}
              </div>
            )}

            {detailTab === 'costs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total: <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(costsHook.costs.reduce((acc, c) => acc + (Number(c.totalAmount) || 0), 0))}</span>
                  </p>
                  <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateCost}>Add Cost</Button>
                </div>
                {costsHook.loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : costsHook.costs.length > 0 ? (
                  <ul className="space-y-2">
                    {costsHook.costs.map((c) => (
                      <li key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-gray-800">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-white">{c.description}</p>
                          <p className="text-xs text-slate-400">
                            <Badge variant="neutral">{c.costType?.replace('_', ' ')}</Badge>{' '}
                            {c.quantity} × {formatCurrency(c.unitPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(c.totalAmount)}</span>
                          <IconButton variant="ghost" size="sm" tooltip="Edit" icon={<Edit className="h-4 w-4" />} onClick={() => { setCostForm({ costType: c.costType, description: c.description, quantity: String(c.quantity), unitPrice: String(c.unitPrice) }); setCostErrors({}); setCostModal({ request: viewRequest, cost: c }); }} />
                          <IconButton variant="ghost" size="sm" tooltip="Delete" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={() => handleDeleteCost(c.id)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-slate-400">No cost records yet.</p>
                )}
              </div>
            )}

            {detailTab === 'assignments' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={openCreateAssignment}>Assign User</Button>
                </div>
                {assignmentsHook.loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : assignmentsHook.assignments.length > 0 ? (
                  <ul className="space-y-2">
                    {assignmentsHook.assignments.map((a) => (
                      <li key={a.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-gray-800">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-white">{getUserName(a.assignedTo)}</p>
                          <p className="text-xs text-slate-400">
                            {a.notes || 'No notes'} • Assigned {formatDateTime(a.assignedAt)}
                            {a.completedAt ? ` • Completed ${formatDateTime(a.completedAt)}` : ''}
                          </p>
                        </div>
                        {!a.completedAt && (
                          <Button variant="outline" size="sm" onClick={() => handleCompleteAssignment(a.id)}>
                            Complete
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-slate-400">No assignments yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add cost modal */}
      <Modal
        open={!!costModal}
        onClose={() => setCostModal(null)}
        title={costModal?.cost ? 'Edit Cost' : 'Add Cost'}
        description="Record a cost associated with this maintenance request."
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setCostModal(null)} disabled={costSubmitting}>Cancel</Button>
            <Button type="submit" form="costForm" onClick={() => document.getElementById('costForm')?.requestSubmit()} loading={costSubmitting}>
              {costModal?.cost ? 'Save Changes' : 'Add Cost'}
            </Button>
          </div>
        }
      >
        <form id="costForm" onSubmit={handleCostSubmit} className="space-y-4">
          <Select label="Cost Type" name="costType" options={COST_TYPE_OPTIONS} value={costForm.costType} onChange={handleCostChange} />
          <Input label="Description" required name="description" value={costForm.description} onChange={handleCostChange} placeholder="e.g., Replacement part" error={costErrors.description} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Quantity" required type="number" step="0.01" min="0.01" name="quantity" value={costForm.quantity} onChange={handleCostChange} error={costErrors.quantity} />
            <Input label="Unit Price ($)" required type="number" step="0.01" min="0" name="unitPrice" value={costForm.unitPrice} onChange={handleCostChange} error={costErrors.unitPrice} />
          </div>
        </form>
      </Modal>

      {/* Assign user modal */}
      <Modal
        open={!!assignmentModal}
        onClose={() => setAssignmentModal(null)}
        title="Assign User"
        description="Assign a user to work on this maintenance request."
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setAssignmentModal(null)} disabled={assignmentSubmitting}>Cancel</Button>
            <Button type="submit" form="assignmentForm" onClick={() => document.getElementById('assignmentForm')?.requestSubmit()} loading={assignmentSubmitting}>
              {assignmentSubmitting ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        }
      >
        <form id="assignmentForm" onSubmit={handleAssignmentSubmit} className="space-y-4">
          <Select
            label="Assign To"
            required
            name="assignedTo"
            options={users.map((u) => ({ value: String(u.id), label: getUserName(u.id) }))}
            value={assignmentForm.assignedTo}
            onChange={handleAssignmentChange}
            error={assignmentErrors.assignedTo}
          />
          <Textarea label="Notes" name="notes" value={assignmentForm.notes} onChange={handleAssignmentChange} rows={2} placeholder="Optional notes for the assignee..." />
        </form>
      </Modal>
    </div>
  );
}

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-gray-800">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  </div>
);
