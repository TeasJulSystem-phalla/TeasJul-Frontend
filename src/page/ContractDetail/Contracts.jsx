import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  Trash2,
  FileText,
  DoorOpen,
  Filter,
  CheckCircle2,
  MoreVertical,
  LayoutGrid,
  Rows3,
  Pencil,
  CalendarClock,
  Wallet,
  Building2,
  CircleDot,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useContracts } from '../../hooks/useContracts.js';
import { useRooms } from '../../hooks/useRooms.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Button,
  Badge,
  Alert,
  Input,
  Select,
  IconButton,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Dropdown,
  Table,
} from '../../components/ui/index.js';

const STATUS_META = {
  DRAFT: { label: 'សេចក្តីព្រាង', variant: 'neutral', dot: 'bg-slate-400', bar: 'from-slate-400 to-slate-300', text: 'text-slate-600 dark:text-slate-300' },
  ACTIVE: { label: 'សកម្ម', variant: 'success', dot: 'bg-emerald-500', bar: 'from-emerald-500 to-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' },
  TERMINATED: { label: 'បានបញ្ចប់', variant: 'warning', dot: 'bg-amber-500', bar: 'from-amber-500 to-amber-400', text: 'text-amber-600 dark:text-amber-400' },
  EXPIRED: { label: 'ផុតកំណត់', variant: 'info', dot: 'bg-sky-500', bar: 'from-sky-500 to-sky-400', text: 'text-sky-600 dark:text-sky-400' },
  CANCELLED: { label: 'បានលុបចោល', variant: 'danger', dot: 'bg-rose-500', bar: 'from-rose-500 to-rose-400', text: 'text-rose-600 dark:text-rose-400' },
};

const STATUS_ORDER = ['ACTIVE', 'DRAFT', 'EXPIRED', 'TERMINATED', 'CANCELLED'];

const STATUS_OPTIONS = STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label }));

const SORT_OPTIONS = [
  { value: 'recent', label: 'ថ្មីបំផុតមុន' },
  { value: 'oldest', label: 'ចាស់បំផុតមុន' },
  { value: 'rent-high', label: 'ថ្លៃជួល៖ ខ្ពស់ទៅទាប' },
  { value: 'rent-low', label: 'ថ្លៃជួល៖ ទាបទៅខ្ពស់' },
  { value: 'expiry', label: 'បញ្ចប់លឿនបំផុត' },
];

const EXPIRING_SOON_DAYS = 60;

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);

const formatDate = (dateStr, opts = {}) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', ...opts });
};

const roomLabel = (r) => (r.name ? `${r.name} (${r.roomNumber})` : `បន្ទប់ ${r.roomNumber}`);

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const end = new Date(dateStr);
  const today = new Date();
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((end - today) / 86400000);
};

const contractProgress = (c) => {
  if (!c.startDate || !c.endDate) return null;
  const start = new Date(c.startDate).getTime();
  const end = new Date(c.endDate).getTime();
  const now = Date.now();
  if (end <= start) return 100;
  const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  return pct;
};

export default function Contracts() {
  const { contracts, loading, error, fetchContracts, deleteContract } = useContracts();
  const { rooms } = useRooms();
  const navigate = useNavigate();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [view, setView] = useState('grid');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(() => {
    return fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const stats = useMemo(() => {
    const count = (s) => contracts.filter((c) => c.status === s).length;
    const active = contracts.filter((c) => c.status === 'ACTIVE');
    const expiring = contracts.filter((c) => {
      const d = daysUntil(c.endDate);
      return d !== null && d >= 0 && d <= EXPIRING_SOON_DAYS;
    });
    return {
      total: contracts.length,
      draft: count('DRAFT'),
      active: active.length,
      terminated: count('TERMINATED'),
      expired: count('EXPIRED'),
      cancelled: count('CANCELLED'),
      monthlyRent: active.reduce((sum, c) => sum + (Number(c.monthlyRent) || 0), 0),
      expiring,
    };
  }, [contracts]);

  const roomName = useCallback(
    (rid) => {
      const r = rooms.find((x) => x.id === rid);
      return r ? roomLabel(r) : `បន្ទប់ #${rid}`;
    },
    [rooms]
  );

  const effectiveStatus = activeTab || statusFilter;

  const filtered = useMemo(() => {
    let result = [...contracts];
    if (effectiveStatus) result = result.filter((c) => c.status === effectiveStatus);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.contractNo && c.contractNo.toLowerCase().includes(q)) ||
          roomName(c.roomId).toLowerCase().includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q))
      );
    }
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'rent-high':
        result.sort((a, b) => (Number(b.monthlyRent) || 0) - (Number(a.monthlyRent) || 0));
        break;
      case 'rent-low':
        result.sort((a, b) => (Number(a.monthlyRent) || 0) - (Number(b.monthlyRent) || 0));
        break;
      case 'expiry': {
        const d = (c) => (c.endDate ? new Date(c.endDate).getTime() : Infinity);
        result.sort((a, b) => d(a) - d(b));
        break;
      }
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [contracts, effectiveStatus, searchTerm, roomName, sortBy]);

  const hasFilters = searchTerm || effectiveStatus;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setActiveTab('');
  };

  const openDetail = (c) => navigate(`/contracts/${c.id}`);
  const openEdit = (c) => navigate(`/contracts/${c.id}/edit`);

  const handleTabChange = (status) => {
    setActiveTab(status);
    setStatusFilter('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContract(deleteTarget.id);
      toast.success('បានលុបកិច្ចសន្យា', `កិច្ចសន្យា #${deleteTarget.id} ត្រូវបានលុបចេញ។`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('ការលុបបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'មិនអាចលុបកិច្ចសន្យាបានទេ។');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-44" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-3 h-3 w-24" />
              <Skeleton className="mt-1.5 h-6 w-14" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="h-20 rounded-t-xl bg-slate-100 dark:bg-gray-800" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">កិច្ចសន្យាជួល</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            តាមដានកិច្ចសន្យា អ្នកជួល ប្រាក់កក់ និងការបន្តកិច្ចសន្យា — ទាំងអស់នៅកន្លែងតែមួយ។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>ធ្វើស្រស់</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/contracts/new')}>បង្កើតកិច្ចសន្យា</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="មិនអាចផ្ទុកកិច្ចសន្យាបានទេ" description={error} dismissible>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refresh()}>ព្យាយាមម្តងទៀត</Button>
          </div>
        </Alert>
      )}

      {/* Stats hero */}
      {contracts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <HeroStat
            label="កិច្ចសន្យាសរុប"
            value={stats.total}
            icon={<FileText className="h-5 w-5" />}
            tone="slate"
            sub={`${stats.active} សកម្មនាពេលបច្ចុប្បន្ន`}
          />
          <HeroStat
            label="សកម្ម"
            value={stats.active}
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone="emerald"
            sub={`${stats.expiring.length} ផុតកំណត់ឆាប់ៗ`}
            subTone={stats.expiring.length > 0 ? 'danger' : 'muted'}
          />
          <HeroStat
            label="ថ្លៃជួលប្រចាំខែ"
            value={formatCurrency(stats.monthlyRent)}
            icon={<Wallet className="h-5 w-5" />}
            tone="violet"
            sub="នៃកិច្ចសន្យាសកម្ម"
          />
          <HeroStat
            label="ផុតកំណត់ឆាប់ៗ"
            value={stats.expiring.length}
            icon={<CalendarClock className="h-5 w-5" />}
            tone={stats.expiring.length > 0 ? 'amber' : 'slate'}
            sub={stats.expiring.length > 0 ? `ក្នុងរយៈពេល ${EXPIRING_SOON_DAYS} ថ្ងៃ` : 'មិនមានអ្វីបញ្ចប់ឆាប់ៗ'}
            subTone={stats.expiring.length > 0 ? 'danger' : 'muted'}
          />
        </div>
      )}

      {/* Expiring soon banner */}
      {stats.expiring.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-amber-200/70 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/5">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <Flame className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {stats.expiring.length} កិច្ចសន្យានឹងបញ្ចប់ឆាប់ៗ
              </p>
              <p className="truncate text-xs text-amber-700/80 dark:text-amber-400/80">
                {stats.expiring.map((c) => `${c.contractNo || `#${c.id}`} (${daysUntil(c.endDate)} ថ្ងៃ)`).join(' · ')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => setSortBy('expiry')}
            >
              ពិនិត្យមើល
            </Button>
          </div>
        </div>
      )}

      {/* Status tabs */}
      {contracts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <TabPill
            active={!effectiveStatus}
            label="ទាំងអស់"
            count={stats.total}
            onClick={() => handleTabChange('')}
          />
          {STATUS_ORDER.map((s) => (
            <TabPill
              key={s}
              active={effectiveStatus === s}
              label={STATUS_META[s].label}
              count={stats[s.toLowerCase()] ?? 0}
              dotClass={STATUS_META[s].dot}
              onClick={() => handleTabChange(s)}
            />
          ))}
        </div>
      )}

      {/* Toolbar */}
      {contracts.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="ស្វែងរកកិច្ចសន្យា បន្ទប់ កំណត់ចំណាំ..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <Select
                options={[{ value: '', label: 'ស្ថានភាពទាំងអស់' }, ...STATUS_OPTIONS]}
                value={statusFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setStatusFilter(v);
                  setActiveTab('');
                }}
              />
              <Select
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>សម្អាត</Button>
            )}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
              <ViewToggle active={view === 'grid'} label="ក្រឡាចត្រង្គ" icon={<LayoutGrid className="h-4 w-4" />} onClick={() => setView('grid')} />
              <ViewToggle active={view === 'table'} label="បញ្ជី" icon={<Rows3 className="h-4 w-4" />} onClick={() => setView('table')} />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="មិនទាន់មានកិច្ចសន្យានៅឡើយទេ"
          description="បង្កើតកិច្ចសន្យាជួលដំបូងរបស់អ្នក ដើម្បីចាប់ផ្តើមតាមដានអ្នកជួល ប្រាក់កក់ និងការបន្តកិច្ចសន្យា។"
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/contracts/new')}>បង្កើតកិច្ចសន្យា</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="មិនមានលទ្ធផលត្រូវគ្នាទេ"
          description="សូមព្យាយាមកែតម្រូវការស្វែងរក ស្ថានភាព ឬតម្រងរបស់អ្នក។"
          action={<Button variant="outline" size="sm" onClick={clearFilters}>សម្អាតតម្រង</Button>}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ContractCard
              key={c.id}
              contract={c}
              roomName={roomName(c.roomId)}
              onOpen={() => openDetail(c)}
              onEdit={() => openEdit(c)}
              onDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      ) : (
        <ListView contracts={filtered} roomName={roomName} onOpen={openDetail} onEdit={openEdit} onDelete={setDeleteTarget} />
      )}

      {/* Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="លុបកិច្ចសន្យា"
        description={`តើអ្នកប្រាកដថាចង់លុបកិច្ចសន្យា "${deleteTarget?.contractNo}" មែនទេ? សកម្មភាពនេះមិនអាចយកមកវិញបានទេ។`}
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

/* ---------- Presentational helpers ---------- */

const HeroStat = ({ label, value, icon, tone = 'slate', sub, subTone = 'muted' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  };
  const subTones = {
    muted: 'text-slate-400 dark:text-slate-500',
    danger: 'text-amber-600 dark:text-amber-400',
  };
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md hover:shadow-slate-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
          <p className="truncate text-xl font-bold text-slate-800 dark:text-white">{value}</p>
        </div>
      </div>
      {sub && <p className={`mt-2 text-xs font-medium ${subTones[subTone]}`}>{sub}</p>}
    </div>
  );
};

const TabPill = ({ active, label, count, dotClass, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all
      ${
        active
          ? 'border-transparent bg-slate-800 text-white shadow-sm dark:bg-white dark:text-slate-900'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-300 dark:hover:border-gray-600 dark:hover:bg-gray-800'
      }
    `}
  >
    {dotClass && <span className={`h-2 w-2 rounded-full ${dotClass}`} />}
    {label}
    <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${active ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400'}`}>
      {count}
    </span>
  </button>
);

const ViewToggle = ({ active, label, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={`មើល ${label}`}
    className={`
      inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors
      ${active ? 'bg-slate-100 text-slate-800 dark:bg-gray-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}
    `}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const ContractCard = ({ contract: c, roomName, onOpen, onEdit, onDelete }) => {
  const meta = STATUS_META[c.status] || STATUS_META.DRAFT;
  const pct = contractProgress(c);
  const days = daysUntil(c.endDate);
  const isExpiring = days !== null && days >= 0 && days <= EXPIRING_SOON_DAYS;

  const expiryLabel = () => {
    if (!c.endDate) return null;
    if (days === null) return null;
    if (days < 0) return { text: 'បានបញ្ចប់', cls: 'text-slate-400 dark:text-slate-500' };
    if (days === 0) return { text: 'បញ្ចប់ថ្ងៃនេះ', cls: 'text-rose-600 dark:text-rose-400' };
    if (days <= EXPIRING_SOON_DAYS) return { text: `${days} ថ្ងៃទៀត`, cls: 'text-amber-600 dark:text-amber-400' };
    return { text: `${days} ថ្ងៃទៀត`, cls: 'text-slate-400 dark:text-slate-500' };
  };
  const expiry = expiryLabel();

  return (
    <div
      onClick={onOpen}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-black/20"
    >
      {/* Accent header */}
      <div className={`relative h-2 shrink-0 bg-gradient-to-r ${meta.bar}`} />

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.bar} text-white shadow-sm`}>
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">
              {c.contractNo || `កិច្ចសន្យា #${c.id}`}
            </p>
            <p className="flex items-center gap-1 truncate text-xs text-slate-400">
              <DoorOpen className="h-3 w-3" /> {roomName}
            </p>
          </div>
        </div>
        <Dropdown
          trigger={
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-800 dark:hover:text-slate-200"
              aria-label="សកម្មភាពកិច្ចសន្យា"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          }
          items={[
            { label: 'កែប្រែ', icon: <Pencil className="h-4 w-4" />, onClick: onEdit },
            { divider: true },
            {
              label: 'លុប',
              icon: <Trash2 className="h-4 w-4" />,
              onClick: onDelete,
              danger: true,
            },
          ]}
        />
      </div>

      {/* Body */}
      <div className="flex-1 space-y-4 px-5 py-4">
        <div className="flex items-center gap-2">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {isExpiring && c.status === 'ACTIVE' && (
            <Badge variant="warning">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              ផុតកំណត់ឆាប់ៗ
            </Badge>
          )}
          <span className={`ml-auto text-xs font-semibold ${expiry ? expiry.cls : 'text-slate-400 dark:text-slate-500'}`}>
            {expiry ? expiry.text : 'មិនកំណត់រយៈពេល'}
          </span>
        </div>

        {/* Period progress */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>{formatDate(c.startDate)}</span>
            <span className="text-slate-300 dark:text-slate-600">→</span>
            <span>{formatDate(c.endDate)}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${meta.bar}`}
              style={{ width: `${pct ?? 0}%` }}
            />
          </div>
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">ថ្លៃជួលប្រចាំខែ</p>
            <p className="mt-0.5 truncate text-[15px] font-bold text-slate-800 dark:text-white">
              {formatCurrency(c.monthlyRent)}
            </p>
            <p className="text-[11px] text-slate-400">ថ្ងៃកំណត់បង់: {c.dueDay}</p>
          </div>
          <div className="min-w-0 border-l border-slate-200 pl-3 dark:border-gray-700">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">ប្រាក់កក់</p>
            <p className="mt-0.5 truncate text-[15px] font-bold text-slate-800 dark:text-white">
              {formatCurrency(c.securityDeposit)}
            </p>
            <p className="text-[11px] text-slate-400">{STATUS_META[c.status]?.label || c.status}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.text}`}>
          <CircleDot className="h-3 w-3" /> {c.roomId ? `បន្ទប់ #${c.roomId}` : 'គ្មានបន្ទប់'}
        </span>
        <span className="ml-auto text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white">
          មើលព័ត៌មានលម្អិត <ArrowRight className="inline h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
};

const ListView = ({ contracts, roomName, onOpen, onEdit, onDelete }) => {
  const columns = [
    {
      header: 'កិច្ចសន្យា',
      render: (row) => {
        const meta = STATUS_META[row.status] || STATUS_META.DRAFT;
        return (
          <div className="flex items-center gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.bar} text-white`}>
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800 dark:text-white">#{row.id} · {row.contractNo}</p>
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <DoorOpen className="h-3 w-3" /> {roomName(row.roomId)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={STATUS_META[row.status]?.variant || 'default'}>{STATUS_META[row.status]?.label || row.status || '—'}</Badge>
          <span className="text-[11px] text-slate-400">{row.endDate ? `${daysUntil(row.endDate) ?? '—'} ថ្ងៃទៀត` : '—'}</span>
        </div>
      ),
    },
    {
      header: 'រយៈពេល',
      render: (row) => (
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <p>{formatDate(row.startDate)}</p>
          <p className="text-xs text-slate-400">→ {formatDate(row.endDate)}</p>
        </div>
      ),
    },
    {
      header: 'ថ្លៃជួល',
      render: (row) => (
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <p className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(row.monthlyRent)}</p>
          <p className="text-xs text-slate-400">ថ្ងៃកំណត់បង់: {row.dueDay}</p>
        </div>
      ),
    },
    {
      header: 'ប្រាក់កក់',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{formatCurrency(row.securityDeposit)}</span>,
    },
    {
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton variant="ghost" size="sm" tooltip="កែប្រែ" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(row)} />
          <IconButton variant="ghost" size="sm" tooltip="លុប" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onClick={() => onDelete(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="hidden rounded-xl border border-slate-200 bg-white lg:block dark:border-gray-800 dark:bg-gray-900">
      <Table columns={columns} data={contracts} keyExtractor={(row) => row.id} onRowClick={onOpen} className="w-full" />
    </div>
  );
};
