import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  QrCode,
  Copy,
  Trash2,
  Mail,
  Building2,
  Users as UsersIcon,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Search,
  Filter,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMyRoles } from '../../hooks/useMyRoles.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useTenantInvitations } from '../../hooks/useTenantInvitations.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Card,
  Button,
  Badge,
  Alert,
  Modal,
  Input,
  Select,
  IconButton,
  ConfirmDialog,
  EmptyState,
  Table,
  Pagination,
  Skeleton,
} from '../../components/ui/index.js';

const STATUS_MAP = {
  PENDING: { label: 'រង់ចាំមានសុពលភាព', variant: 'warning' },
  USED: { label: 'បានប្រើ', variant: 'info' },
  EXPIRED: { label: 'ផុតកំណត់', variant: 'danger' },
  REVOKED: { label: 'បានលុបចោល', variant: 'neutral' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getServerMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

const secondsUntil = (expiresAt) =>
  Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));

const formatClock = (total) => {
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const InvitationPreviewModal = ({ created, onClose }) => {
  const toast = useToast();
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(created.expiresAt));

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft(secondsUntil(created.expiresAt)), 1000);
    return () => clearInterval(id);
  }, [created.expiresAt]);

  const inviteUrl = `${window.location.origin}${created.invitationPath}`;
  const expired = secondsLeft <= 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('បានចម្លងតំណភ្ជាប់', 'សូមផ្ញើតំណនេះទៅកាន់អ្នកជួល។');
    } catch {
      toast.error(
        'ការចម្លងបានបរាជ័យ',
        'សូមជ្រើសរើស និងចម្លងតំណដោយដៃពីប្រអប់ខាងលើ។'
      );
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="អញ្ជើញអ្នកជួល"
      description={`បានបង្កើតសម្រាប់អចលនទ្រព្យ "${created.houseName}"`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            បិទ
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {expired
                ? 'តំណបានផុតកំណត់ហើយ។ សូមបង្កើតការអញ្ជើញថ្មី។'
                : `តំណនឹងផុតកំណត់ក្នុងរយៈពេល ${formatClock(secondsLeft)}`}
            </span>
          </p>
        </div>

        {/* Responsive: stack on mobile, side-by-side on sm+ */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700">
            {expired ? (
              <div className="flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
                <ShieldAlert className="h-10 w-10 text-gray-400" />
              </div>
            ) : (
              <QRCodeSVG
                value={inviteUrl}
                size={160}
                level="M"
                bgColor="#ffffff"
                fgColor="#111827"
              />
            )}
          </div>
          <div className="w-full min-w-0 flex-1 space-y-3">
            <div>
              <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                តំណអញ្ជើញ
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <Input readOnly value={inviteUrl} className="font-mono text-xs" />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  disabled={expired}
                  leftIcon={<Copy className="h-4 w-4" />}
                  className="w-full shrink-0 sm:w-auto"
                >
                  ចម្លង
                </Button>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">អចលនទ្រព្យ: {created.houseName}</span>
              </p>
              {created.email && (
                <p className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-all">អ៊ីមែល: {created.email}</span>
                </p>
              )}
              <p className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">ផុតកំណត់: {formatDate(created.expiresAt)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default function TenantInvitationsPage() {
  const toast = useToast();
  const { houses, loading: housesLoading } = useHouses();
  const {
    invitations,
    loading,
    error,
    submitting,
    createInvitation,
    revokeInvitation,
    fetchInvitations,
  } = useTenantInvitations();
  const { isOwner, isManager, loading: rolesLoading } = useMyRoles();

  const [houseId, setHouseId] = useState('');
  const [email, setEmail] = useState('');
  const [created, setCreated] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 10;

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPage(0);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(0);
  };

  const canInvite = !rolesLoading && (isOwner || isManager);
  const houseOptions = houses.map((h) => ({ value: h.id, label: h.name }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!houseId) {
      toast.error('កំហុស', 'សូមជ្រើសរើសអចលនទ្រព្យសម្រាប់អ្នកជួល។');
      return;
    }
    try {
      const result = await createInvitation({ houseId, email: email.trim() || null });
      setCreated(result);
      setEmail('');
      toast.success('បានបង្កើតការអញ្ជើញ', 'តំណអញ្ជើញបានត្រៀមខ្លួនជាស្រេច។');
    } catch (err) {
      toast.error('ការបង្កើតបានបរាជ័យ', getServerMessage(err, 'សូមព្យាយាមម្តងទៀត។'));
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeInvitation(revokeTarget.id);
      setRevokeTarget(null);
      toast.success('បានលុបចោលការអញ្ជើញ', 'ការអញ្ជើញមិនអាចប្រើប្រាស់បានទៀតទេ។');
    } catch (err) {
      toast.error('ការលុបបានបរាជ័យ', getServerMessage(err, 'សូមព្យាយាមម្តងទៀត។'));
    } finally {
      setRevoking(false);
    }
  };

  const filteredInvitations = useMemo(() => {
    let result = invitations;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          (i.houseName && i.houseName.toLowerCase().includes(q)) ||
          (i.email && i.email.toLowerCase().includes(q))
      );
    }
    if (statusFilter) {
      result = result.filter((i) => i.status === statusFilter);
    }
    return result;
  }, [invitations, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredInvitations.length / pageSize);

  const paginatedInvitations = useMemo(() => {
    const start = page * pageSize;
    return filteredInvitations.slice(start, start + pageSize);
  }, [filteredInvitations, page, pageSize]);

  if (rolesLoading) {
    return (
      <div className="min-w-0 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!canInvite) {
    return (
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">អញ្ជើញអ្នកជួល</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            បង្កើតតំណអញ្ជើញសម្រាប់អ្នកជួលថ្មី
          </p>
        </div>
        <Card className="p-6">
          <Alert
            variant="warning"
            title="គ្មានសិទ្ធិចូលដំណើរការ"
            description="អ្នកគ្មានសិទ្ធិអញ្ជើញអ្នកជួលទេ។ ត្រូវការតួនាទីម្ចាស់ផ្ទះ ឬអ្នកគ្រប់គ្រង។"
          />
        </Card>
      </div>
    );
  }

  const columns = [
    {
      header: 'អចលនទ្រព្យ',
      render: (row) => (
        <span className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">{row.houseName}</span>
        </span>
      ),
    },
    {
      header: 'អ៊ីមែល',
      accessor: 'email',
      render: (row) => <span className="truncate">{row.email || '—'}</span>,
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => {
        const s = STATUS_MAP[row.status] || { label: row.status, variant: 'neutral' };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      header: 'បង្កើតនៅ',
      accessor: 'createdAt',
      render: (row) => <span className="whitespace-nowrap">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'ផុតកំណត់',
      accessor: 'expiresAt',
      render: (row) => <span className="whitespace-nowrap">{formatDate(row.expiresAt)}</span>,
    },
    {
      header: 'សកម្មភាព',
      render: (row) =>
        row.status === 'PENDING' ? (
          <IconButton
            icon={<Trash2 className="h-4 w-4" />}
            tooltip="លុបចោលការអញ្ជើញ"
            onClick={() => setRevokeTarget(row)}
            variant="danger"
            size="sm"
          />
        ) : null,
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">អញ្ជើញអ្នកជួល</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            បង្កើតតំណអញ្ជើញមានសុវត្ថិភាពសម្រាប់អ្នកជួលថ្មីចុះឈ្មោះ
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchInvitations}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          loading={loading}
          className="self-start sm:self-auto"
        >
          ធ្វើឱ្យស្រស់
        </Button>
      </div>

      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <QrCode className="h-5 w-5 shrink-0 text-gray-400" />
          បង្កើតការអញ្ជើញថ្មី
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <Select
              label="អចលនទ្រព្យ"
              placeholder="ជ្រើសរើសអចលនទ្រព្យ"
              required
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
              options={houseOptions}
              disabled={housesLoading}
            />
          </div>
          <div className="md:col-span-4">
            <Input
              label="អ៊ីមែល (មិនចាំបាច់)"
              type="email"
              placeholder="tenant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-end md:col-span-3">
            <Button
              type="submit"
              fullWidth
              leftIcon={<Plus className="h-4 w-4" />}
              loading={submitting}
            >
              បង្កើតការអញ្ជើញ
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
              <UsersIcon className="h-5 w-5 shrink-0 text-gray-400" />
              ការអញ្ជើញរបស់ខ្ញុំ
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              តំណអញ្ជើញត្រូវផុតកំណត់បន្ទាប់ពីរយៈពេល ៥ នាទី ឬក្រោយពេលអ្នកជួលចុះឈ្មោះ។
            </p>
          </div>
        </div>

        {invitations.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="ស្វែងរកតាមអចលនទ្រព្យ ឬអ៊ីមែល..."
                leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={[
                  { value: '', label: 'ស្ថានភាពទាំងអស់' },
                  { value: 'PENDING', label: 'រង់ចាំមានសុពលភាព' },
                  { value: 'USED', label: 'បានប្រើ' },
                  { value: 'EXPIRED', label: 'ផុតកំណត់' },
                  { value: 'REVOKED', label: 'បានលុបចោល' },
                ]}
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              />
            </div>
          </div>
        )}

        {error && (
          <Alert variant="danger" title="កំហុស" description={error} dismissible className="mb-4" />
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : invitations.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="មិនទាន់មានការអញ្ជើញ"
            description="បង្កើតការអញ្ជើញដំបូងរបស់អ្នក ហើយចែករំលែកតំណ ឬ QR ជាមួយអ្នកជួលថ្មី។"
          />
        ) : filteredInvitations.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="រកមិនឃើញលទ្ធផល"
            description="សូមព្យាយាមកែតម្រូវលក្ខណៈវិនិច្ឆ័យស្វែងរក ឬតម្រងរបស់អ្នក។"
          />
        ) : (
          <>
            <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="w-full min-w-0 overflow-x-auto">
                <Table
                  columns={columns}
                  data={paginatedInvitations}
                  className="border-0"
                  emptyMessage="មិនមានការអញ្ជើញទេ"
                />
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center sm:justify-end">
                <Pagination
                  currentPage={page + 1}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p - 1)}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {created && <InvitationPreviewModal created={created} onClose={() => setCreated(null)} />}

      <ConfirmDialog
        open={!!revokeTarget}
        title="លុបចោលការអញ្ជើញ"
        description={`តើអ្នកប្រាកដថាចង់លុបចោលការអញ្ជើញ សម្រាប់ "${revokeTarget?.houseName}" ឬទេ? អ្នកជួលនឹងមិនអាចចុះឈ្មោះបានទេ។`}
        confirmText="លុបចោល"
        cancelText="បោះបង់"
        danger
        loading={revoking}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  );
}