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
  { value: '', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'PENDING', label: 'កំពុងរង់ចាំ' },
  { value: 'IN_PROGRESS', label: 'កំពុងដំណើរការ' },
  { value: 'RESOLVED', label: 'បានបញ្ចប់' },
  { value: 'CANCELLED', label: 'បានលុបចោល' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'ទាប' },
  { value: 'MEDIUM', label: 'មធ្យម' },
  { value: 'HIGH', label: 'ខ្ពស់' },
  { value: 'URGENT', label: 'បន្ទាន់' },
];

const COST_TYPE_OPTIONS = [
  { value: 'LABOR', label: 'កម្លាំងពលកម្ម' },
  { value: 'SPARE_PART', label: 'គ្រឿងបន្លាស់' },
  { value: 'TRANSPORT', label: 'ការដឹកជញ្ជូន' },
  { value: 'MATERIAL', label: 'សម្ភារៈ' },
  { value: 'OTHER', label: 'ផ្សេងទៀត' },
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
    return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || `អ្នកប្រើប្រាស់ #${id}` : id || '—';
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
      header: 'សំណើ',
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
      header: 'ទីតាំង',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {getHouseName(row.houseId)}
          {row.roomId ? ` • ${getRoomName(row.roomId)}` : ''}
        </span>
      ),
    },
    {
      header: 'ប្រភេទ',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Tag className="h-4 w-4 text-slate-400" />
          {getCategoryName(row.categoryId)}
        </span>
      ),
    },
    {
      header: 'អាទិភាព',
      render: (row) => getPriorityBadge(row.priority),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'បានរាយការណ៍',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDateTime(row.reportedAt || row.createdAt)}
        </span>
      ),
    },
    {
      header: 'សកម្មភាព',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton variant="ghost" size="sm" tooltip="មើល" icon={<Eye className="h-4 w-4" />} onClick={() => openView(row)} />
          <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={() => openEdit(row)} />
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
    if (!form.houseId) errs.houseId = 'អចលនទ្រព្យត្រូវបានទាមទារ';
    if (!form.roomId) errs.roomId = 'បន្ទប់ត្រូវបានទាមទារ';
    if (!form.title.trim()) errs.title = 'ចំណងជើងត្រូវបានទាមទារ';
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
        toast.success('សំណើត្រូវបានកែប្រែ', `"${payload.title}" ត្រូវបានកែប្រែរួចរាល់។`);
        setEditTarget(null);
      } else {
        await createRequest(payload);
        toast.success('សំណើត្រូវបានបង្កើត', `"${payload.title}" ត្រូវបានបង្កើតរួចរាល់។`);
        setCreateOpen(false);
      }
      resetForm();
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'ប្រតិបត្តិការបរាជ័យ។');
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
      toast.success('មតិត្រូវបានបន្ថែម', 'មតិត្រូវបានបន្ថែមរួចរាល់។');
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការបន្ថែមមតិ។');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsHook.deleteComment(commentId);
      toast.success('មតិត្រូវបានលុប', 'មតិត្រូវបានដកចេញរួចរាល់។');
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការលុបមតិ។');
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
    if (!costForm.description.trim()) errs.description = 'ការពិពណ៌នាត្រូវបានទាមទារ';
    if (costForm.quantity === '' || Number(costForm.quantity) <= 0) errs.quantity = 'បរិមាណត្រូវតែធំជាង 0';
    if (costForm.unitPrice === '' || Number(costForm.unitPrice) < 0) errs.unitPrice = 'តម្លៃក្នុងមួយឯកតាមិនត្រូវជាអវិជ្ជមានទេ';
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
        toast.success('តម្លៃត្រូវបានកែប្រែ', 'កំណត់ត្រាតម្លៃត្រូវបានកែប្រែរួចរាល់។');
      } else {
        await costsHook.createCost(payload);
        toast.success('តម្លៃត្រូវបានបន្ថែម', 'កំណត់ត្រាតម្លៃត្រូវបានបន្ថែមរួចរាល់។');
      }
      setCostModal(null);
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការរក្សាទុកតម្លៃ។');
    } finally {
      setCostSubmitting(false);
    }
  };

  const handleDeleteCost = async (costId) => {
    try {
      await costsHook.deleteCost(costId);
      toast.success('តម្លៃត្រូវបានលុប', 'កំណត់ត្រាតម្លៃត្រូវបានដកចេញរួចរាល់។');
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការលុបតម្លៃ។');
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
    if (!assignmentForm.assignedTo) errs.assignedTo = 'អ្នកប្រើប្រាស់ត្រូវបានទាមទារ';
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
      toast.success('ការចាត់តាំងត្រូវបានបង្កើត', 'អ្នកប្រើប្រាស់ត្រូវបានចាត់តាំងឱ្យសំណើនេះ។');
      setAssignmentModal(null);
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការបង្កើតការចាត់តាំង។');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleCompleteAssignment = async (assignmentId) => {
    try {
      await assignmentsHook.completeAssignment(assignmentId);
      toast.success('ការចាត់តាំងត្រូវបានបញ្ចប់', 'ការចាត់តាំងត្រូវបានសម្គាល់ថាបញ្ចប់រួចរាល់។');
    } catch (err) {
      toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការបញ្ចប់ការចាត់តាំង។');
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">សំណើជួសជុល</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            តាមដាន ចាត់តាំង និងដោះស្រាយបញ្ហាជួសជុលនៅទូទាំងអចលនទ្រព្យរបស់អ្នក។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>ធ្វើឱ្យស្រស់</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>សំណើថ្មី</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកសំណើ" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      {requests.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="ស្វែងរកតាមចំណងជើង ឬលេខសំណើ..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="ស្ថានភាពទាំងអស់" />
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>សម្អាត</Button>
        </div>
      )}

      {!loading && requests.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="មិនមានសំណើជួសជុល"
          description="បង្កើតសំណើជួសជុល ដើម្បីចាប់ផ្តើម។"
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleCreateOpen}>សំណើថ្មី</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="រកមិនឃើញទិន្នន័យ" description="សូមព្យាយាមកែតម្រូវការស្វែងរក ឬលក្ខខណ្ឌតម្រងរបស់អ្នក។" />
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
        title={editTarget ? 'កែប្រែសំណើ' : 'សំណើជួសជុលថ្មី'}
        description={editTarget ? `កំពុងកែប្រែ "${editTarget.title}"` : 'រាយការណ៍បញ្ហាជួសជុលសម្រាប់បន្ទប់។'}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); }} disabled={submitting}>បោះបង់</Button>
            <Button type="submit" form="requestForm" onClick={() => document.getElementById('requestForm')?.requestSubmit()} loading={submitting}>
              {editTarget ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតសំណើ'}
            </Button>
          </div>
        }
      >
        <form id="requestForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="អចលនទ្រព្យ"
              required
              name="houseId"
              options={houses.map((h) => ({ value: String(h.id), label: h.name || `អចលនទ្រព្យ #${h.id}` }))}
              value={form.houseId}
              onChange={handleFormChange}
              error={formErrors.houseId}
            />
            <Select
              label="បន្ទប់"
              required
              name="roomId"
              options={houseRooms.map((r) => ({ value: String(r.id), label: r.roomNumber || r.number || `បន្ទប់ #${r.id}` }))}
              value={form.roomId}
              onChange={handleFormChange}
              error={formErrors.roomId}
              disabled={!form.houseId}
              placeholder={!form.houseId ? 'ជ្រើសរើសអចលនទ្រព្យជាមុន' : houseRooms.length ? 'ជ្រើសរើសបន្ទប់' : 'គ្មានបន្ទប់សម្រាប់អចលនទ្រព្យនេះ'}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="ប្រភេទ"
              name="categoryId"
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
              value={form.categoryId}
              onChange={handleFormChange}
            />
            <Select
              label="អាទិភាព"
              name="priority"
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={handleFormChange}
            />
          </div>
          <Input label="ចំណងជើង" required name="title" value={form.title} onChange={handleFormChange} placeholder="ឧ. បំពង់ទឹកលេចធ្លាយក្នុងបន្ទប់ទឹក" error={formErrors.title} />
          <Textarea label="ការពិពណ៌នា" name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="ពិពណ៌នាអំពីបញ្ហា..." />
        </form>
      </Modal>

      {/* Detail modal with tabs */}
      <Modal
        open={!!viewRequest}
        onClose={() => setViewRequest(null)}
        title="សំណើជួសជុល"
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
                      toast.success('ស្ថានភាពត្រូវបានកែប្រែ', `សំណើបានផ្លាស់ប្តូរទៅ ${next.replace('_', ' ')}។`);
                      setViewRequest((prev) => ({ ...prev, status: next }));
                    })
                    .catch((err) => toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការកែប្រែស្ថានភាព។'));
                }}
              >
                {viewRequest.status === 'PENDING' ? 'ចាប់ផ្តើមការងារ' : 'សម្គាល់ថាបានបញ្ចប់'}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  changeStatus(viewRequest.id, 'CANCELLED')
                    .then(() => {
                      toast.success('សំណើត្រូវបានលុបចោល', 'សំណើត្រូវបានលុបចោលរួចរាល់។');
                      setViewRequest((prev) => ({ ...prev, status: 'CANCELLED' }));
                    })
                    .catch((err) => toast.error('កំហុស', err.response?.data?.message || err.response?.data?.error || 'បរាជ័យក្នុងការលុបចោលសំណើ។'));
                }}
              >
                លុបចោល
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
              <DetailItem icon={<Building2 className="h-4 w-4 text-slate-400" />} label="អចលនទ្រព្យ" value={getHouseName(viewRequest.houseId)} />
              <DetailItem icon={<DoorOpen className="h-4 w-4 text-slate-400" />} label="បន្ទប់" value={getRoomName(viewRequest.roomId)} />
              <DetailItem icon={<Tag className="h-4 w-4 text-slate-400" />} label="ប្រភេទ" value={getCategoryName(viewRequest.categoryId)} />
              <DetailItem icon={<Calendar className="h-4 w-4 text-slate-400" />} label="បានរាយការណ៍" value={formatDateTime(viewRequest.reportedAt || viewRequest.createdAt)} />
            </div>

            {viewRequest.description && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ការពិពណ៌នា</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewRequest.description}</p>
              </div>
            )}

            <Tabs
              tabs={[
                { value: 'comments', label: `មតិ (${commentsHook.comments.length})` },
                { value: 'costs', label: `តម្លៃ (${costsHook.costs.length})` },
                { value: 'assignments', label: `ការចាត់តាំង (${assignmentsHook.assignments.length})` },
              ]}
              activeTab={detailTab}
              onChange={setDetailTab}
            />

            {detailTab === 'comments' && (
              <div className="space-y-4">
                <form onSubmit={handleCommentSubmit} className="flex items-start gap-2">
                  <Input
                    placeholder="បន្ថែមមតិ..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button type="submit" leftIcon={<Send className="h-4 w-4" />} loading={commentSubmitting} disabled={!newComment.trim()}>
                    បង្ហោះ
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
                          <IconButton variant="ghost" size="sm" tooltip="លុប" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={() => handleDeleteComment(c.id)} />
                        </div>
                        <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200">{c.comment}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-slate-400">មិនទាន់មានមតិនៅឡើយទេ។</p>
                )}
              </div>
            )}

            {detailTab === 'costs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    សរុប: <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(costsHook.costs.reduce((acc, c) => acc + (Number(c.totalAmount) || 0), 0))}</span>
                  </p>
                  <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateCost}>បន្ថែមតម្លៃ</Button>
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
                          <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Edit className="h-4 w-4" />} onClick={() => { setCostForm({ costType: c.costType, description: c.description, quantity: String(c.quantity), unitPrice: String(c.unitPrice) }); setCostErrors({}); setCostModal({ request: viewRequest, cost: c }); }} />
                          <IconButton variant="ghost" size="sm" tooltip="លុប" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400" onClick={() => handleDeleteCost(c.id)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-slate-400">មិនទាន់មានកំណត់ត្រាតម្លៃនៅឡើយទេ។</p>
                )}
              </div>
            )}

            {detailTab === 'assignments' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={openCreateAssignment}>ចាត់តាំងអ្នកប្រើប្រាស់</Button>
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
                            {a.notes || 'គ្មានកំណត់ចំណាំ'} • បានចាត់តាំង {formatDateTime(a.assignedAt)}
                            {a.completedAt ? ` • បានបញ្ចប់ ${formatDateTime(a.completedAt)}` : ''}
                          </p>
                        </div>
                        {!a.completedAt && (
                          <Button variant="outline" size="sm" onClick={() => handleCompleteAssignment(a.id)}>
                            បញ្ចប់
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-slate-400">មិនទាន់មានការចាត់តាំងនៅឡើយទេ។</p>
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
        title={costModal?.cost ? 'កែប្រែតម្លៃ' : 'បន្ថែមតម្លៃ'}
        description="កត់ត្រាតម្លៃដែលទាក់ទងនឹងសំណើជួសជុលនេះ។"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setCostModal(null)} disabled={costSubmitting}>បោះបង់</Button>
            <Button type="submit" form="costForm" onClick={() => document.getElementById('costForm')?.requestSubmit()} loading={costSubmitting}>
              {costModal?.cost ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បន្ថែមតម្លៃ'}
            </Button>
          </div>
        }
      >
        <form id="costForm" onSubmit={handleCostSubmit} className="space-y-4">
          <Select label="ប្រភេទតម្លៃ" name="costType" options={COST_TYPE_OPTIONS} value={costForm.costType} onChange={handleCostChange} />
          <Input label="ការពិពណ៌នា" required name="description" value={costForm.description} onChange={handleCostChange} placeholder="ឧ. គ្រឿងបន្លាស់ជំនួស" error={costErrors.description} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="បរិមាណ" required type="number" step="0.01" min="0.01" name="quantity" value={costForm.quantity} onChange={handleCostChange} error={costErrors.quantity} />
            <Input label="តម្លៃក្នុងមួយឯកតា ($)" required type="number" step="0.01" min="0" name="unitPrice" value={costForm.unitPrice} onChange={handleCostChange} error={costErrors.unitPrice} />
          </div>
        </form>
      </Modal>

      {/* Assign user modal */}
      <Modal
        open={!!assignmentModal}
        onClose={() => setAssignmentModal(null)}
        title="ចាត់តាំងអ្នកប្រើប្រាស់"
        description="ចាត់តាំងអ្នកប្រើប្រាស់ឱ្យធ្វើការលើសំណើជួសជុលនេះ។"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setAssignmentModal(null)} disabled={assignmentSubmitting}>បោះបង់</Button>
            <Button type="submit" form="assignmentForm" onClick={() => document.getElementById('assignmentForm')?.requestSubmit()} loading={assignmentSubmitting}>
              {assignmentSubmitting ? 'កំពុងចាត់តាំង...' : 'ចាត់តាំង'}
            </Button>
          </div>
        }
      >
        <form id="assignmentForm" onSubmit={handleAssignmentSubmit} className="space-y-4">
          <Select
            label="ចាត់តាំងទៅ"
            required
            name="assignedTo"
            options={users.map((u) => ({ value: String(u.id), label: getUserName(u.id) }))}
            value={assignmentForm.assignedTo}
            onChange={handleAssignmentChange}
            error={assignmentErrors.assignedTo}
          />
          <Textarea label="កំណត់ចំណាំ" name="notes" value={assignmentForm.notes} onChange={handleAssignmentChange} rows={2} placeholder="កំណត់ចំណាំស្រេចចិត្តសម្រាប់អ្នកទទួលការចាត់តាំង..." />
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
