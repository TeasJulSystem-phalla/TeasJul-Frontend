// src/page/tenant/TenantMaintenancePage.jsx
import { useEffect, useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { maintenanceRequestApi } from '../../api/maintenanceRequest.api';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  Select,
  Skeleton,
  Textarea,
  Input,
} from '../../components/ui/index.js';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'តិច' },
  { value: 'MEDIUM', label: 'មធ្យម' },
  { value: 'HIGH', label: 'ខ្ពស់' },
  { value: 'URGENT', label: 'បន្ទាន់' },
];

const statusBadge = (status) => {
  const map = {
    PENDING: { variant: 'warning', label: 'កំពុងរង់ចាំ' },
    IN_PROGRESS: { variant: 'info', label: 'កំពុងដំណើរការ' },
    RESOLVED: { variant: 'success', label: 'បានដោះស្រាយ' },
    CANCELLED: { variant: 'neutral', label: 'បានបោះបង់' },
  };
  const item = map[status] || { variant: 'neutral', label: status || '—' };
  return (
    <Badge variant={item.variant}>
      {item.label} {status ? <span className="opacity-60">· {status}</span> : null}
    </Badge>
  );
};

const priorityLabel = (priority) =>
  PRIORITY_OPTIONS.find((o) => o.value === priority)?.label || priority || '—';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-CA') : '—';

export default function TenantMaintenancePage() {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [formErrors, setFormErrors] = useState({});

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceRequestApi.getMyTenantRequests();
      setRequests(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'ការផ្ទុកសំណើជួសជុលបានបរាជ័យ។'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'តម្រូវឱ្យបញ្ចូលចំណងជើង';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await maintenanceRequestApi.createMyRequest({
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
      });
      setOpen(false);
      setForm({ title: '', description: '', priority: 'MEDIUM' });
      toast.success('បានបង្កើត', 'សំណើជួសជុលត្រូវបានដាក់ស្នើ។');
      fetchRequests();
    } catch (err) {
      toast.error(
        'កំហុស',
        err.response?.data?.message ||
          err.response?.data?.error ||
          'ការដាក់ស្នើបានបរាជ័យ។'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">ការជួសជុល</h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            រាយការណ៍បញ្ហា និងតាមដានស្ថានភាពសំណើរបស់អ្នក។
          </p>
        </div>
        <Button onClick={() => setOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          សំណើថ្មី
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : error ? (
        <Alert
          variant="danger"
          title="កំហុស"
          description={error}
        >
          <Button size="sm" className="mt-3" onClick={fetchRequests}>ព្យាយាមម្តងទៀត</Button>
        </Alert>
      ) : requests.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Wrench}
            title="មិនទាន់មានសំណើជួសជុល"
            description="បើបន្ទប់របស់អ្នកមានបញ្ហា សូមបង្កើតសំណើថ្មីដើម្បីឱ្យម្ចាស់ផ្ទះដឹង។"
            action={
              <Button onClick={() => setOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                សំណើថ្មី
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{req.title}</h3>
                    {statusBadge(req.status)}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {req.requestNo} · {formatDate(req.createdAt)} · អាទិភាព: {priorityLabel(req.priority)}
                  </p>
                  {req.description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{req.description}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="សំណើថ្មី"
        description="រាយការណ៍បញ្ហានៅក្នុងបន្ទប់របស់អ្នក"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              បោះបង់
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              ដាក់ស្នើ
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ចំណងជើង"
            name="title"
            value={form.title}
            onChange={handleChange}
            error={formErrors.title}
            placeholder="ឧ. ម៉ាស៊ីនត្រជាក់ខូច"
            required
          />
          <Textarea
            label="ការពិពណ៌នា"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="ពិពណ៌នាលម្អិតអំពីបញ្ហា..."
          />
          <Select
            label="អាទិភាព"
            name="priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={handleChange}
          />
        </form>
      </Modal>
    </div>
  );
}