import { useState, useEffect, useCallback } from 'react';
import { CreditCard, RefreshCw, Plus, Pencil } from 'lucide-react';
import { paymentApi } from '../../api/payment.api';
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
  IconButton,
  EmptyState,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  ACTIVE: 'success',
  INACTIVE: 'default',
};

const STATUS_LABELS = {
  ACTIVE: 'សកម្ម',
  INACTIVE: 'អសកម្ម',
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

const EMPTY_FORM = { name: '', code: '', description: '', status: 'ACTIVE' };

export default function PaymentMethodsPage() {
  const toast = useToast();

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentApi.listPaymentMethods();
      setMethods(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to load payment methods. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name,
      code: row.code,
      description: row.description || '',
      status: row.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing == null && !form.code.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await paymentApi.updatePaymentMethod(editing.id, {
          name: form.name,
          description: form.description || undefined,
          status: form.status,
        });
        toast.success('បានកែប្រែវិធីសាស្ត្រ', 'វិធីសាស្ត្រទូទាត់ត្រូវបានធ្វើបច្ចុប្បន្នភាព។');
      } else {
        await paymentApi.createPaymentMethod(form);
        toast.success('បានបន្ថែមវិធីសាស្ត្រ', 'វិធីសាស្ត្រទូទាត់ថ្មីត្រូវបានបង្កើត។');
      }
      setModalOpen(false);
      await fetchMethods();
    } catch (err) {
      toast.error(
        'ការបរាជ័យ',
        err.response?.data?.message || err.response?.data?.error || 'មិនអាចរក្សាទុកបានទេ។'
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'វិធីសាស្ត្រ',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <CreditCard className="h-4 w-4" />
          </span>
          <p className="font-medium text-slate-800 dark:text-white">{row.name}</p>
        </div>
      ),
    },
    {
      header: 'លេខកូដ',
      render: (row) => (
        <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-gray-800 dark:text-slate-300">
          {row.code || '—'}
        </code>
      ),
    },
    {
      header: 'ការពិពណ៌នា',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{row.description || '—'}</span>
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'default'}>
          {STATUS_LABELS[row.status] || row.status || '—'}
        </Badge>
      ),
    },
    {
      header: 'សកម្មភាព',
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="កែសម្រួល"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => openEdit(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">វិធីសាស្ត្រទូទាត់</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងវិធីសាស្ត្រទូទាត់ដូចជា សាច់ប្រាក់ (Cash), កម្មវិធីធនាគារ ជាដើម។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchMethods}>
            ធ្វើឱ្យស្រស់
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            បន្ថែមវិធីសាស្ត្រ
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុកវិធីសាស្ត្រទូទាត់" description={error} dismissible />
      )}

      {!loading && methods.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="មិនទាន់មានវិធីសាស្ត្រទូទាត់"
          description="បន្ថែមវិធីសាស្ត្រទូទាត់ដូចជា Cash ដើម្បីកត់ត្រាការទូទាត់ផ្ទាល់។"
          action={<Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>បន្ថែមវិធីសាស្ត្រ</Button>}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Card>
              <Table columns={columns} data={methods} keyExtractor={(row) => row.id} className="w-full" />
            </Card>
          </div>

          <div className="space-y-3 md:hidden">
            {methods.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800 dark:text-white">{row.name}</p>
                      {row.code && (
                        <code className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-gray-800 dark:text-slate-300">
                          {row.code}
                        </code>
                      )}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[row.status] || 'default'}>
                    {STATUS_LABELS[row.status] || row.status || '—'}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
                    {row.description || '—'}
                  </p>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    tooltip="កែសម្រួល"
                    icon={<Pencil className="h-4 w-4" />}
                    onClick={() => openEdit(row)}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'កែសម្រួលវិធីសាស្ត្រទូទាត់' : 'បន្ថែមវិធីសាស្ត្រទូទាត់'}
      >
        <div className="space-y-4">
          <Input
            label="ឈ្មោះ"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="ឧ. Cash, Bakong, Wing..."
            required
          />
          <Input
            label="លេខកូដ"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="ឧ. CASH, BAKONG"
            disabled={editing != null}
            required={editing == null}
          />
          <Input
            label="ការពិពណ៌នា"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="ការពិពណ៌នាខ្លី (ស្រេចចិត្ត)"
          />
          {editing && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                ស្ថានភាព
              </label>
              <Select
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              បោះបង់
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!form.name.trim() || (editing == null && !form.code.trim())}
              loading={saving}
              onClick={handleSave}
            >
              {editing ? 'រក្សាទុក' : 'បន្ថែម'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}