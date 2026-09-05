import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Check,
  X,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Plug,
  Receipt,
  Download,
  Eye,
} from 'lucide-react';
import InvoicePreviewModal from './InvoicePreviewModal';
import RealInvoiceDocument from './RealInvoiceDocument';
import { invoiceApi } from '../../api/invoice.api';
import { paymentApi } from '../../api/payment.api';
import { useToast } from '../../components/ui/Toast.jsx';
import { useBasePath } from '../../hooks/useBasePath.js';
import {
  Card,
  Button,
  Badge,
  Alert,
  Skeleton,
  Modal,
  Input,
  Select,
  ConfirmDialog,
} from '../../components/ui/index.js';

const STATUS_VARIANT = {
  DRAFT: 'default',
  PENDING: 'warning',
  PARTIAL: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'default',
};

const STATUS_LABELS = {
  DRAFT: 'សេចក្តីព្រាង',
  PENDING: 'កំពុងរង់ចាំ',
  PARTIAL: 'បានបង់មួយផ្នែក',
  PAID: 'បានបង់',
  OVERDUE: 'ហួសកំណត់',
  CANCELLED: 'បានលុបចោល',
};

const ITEM_LABELS = {
  RENT: 'ថ្លៃជួលបន្ទប់',
  ELECTRICITY: 'អគ្គិសនី',
  WATER: 'ទឹក',
  INTERNET: 'អ៊ីនធឺណិត',
  PARKING: 'ចំណត',
  OTHER: 'ផ្សេងៗ',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const basePath = useBasePath();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [paying, setPaying] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceApi.getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'មិនអាចផ្ទុកវិក្កយបត្របានទេ។');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleMarkPaid = async () => {
    try {
      const updated = await invoiceApi.markPaid(id);
      setInvoice(updated);
      toast.success('បានសម្គាល់ជាបង់រួច', 'វិក្កយបត្រត្រូវបានសម្គាល់ថាបានបង់ពេញ។');
    } catch (err) {
      toast.error('ការបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'មិនអាចធ្វើបានទេ។');
    }
  };

  const openPaymentModal = async () => {
    setPaymentAmount('');
    setPaymentMethodId('');
    setPaymentOpen(true);
    try {
      const data = await paymentApi.listPaymentMethods();
      setPaymentMethods((data || []).filter((m) => m.status === 'ACTIVE'));
    } catch {
      setPaymentMethods([]);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentMethodId) {
      toast.info('ជ្រើសរើសវិធីសាស្ត្រ', 'សូមជ្រើសរើសវិធីសាស្ត្រទូទាត់។');
      return;
    }
    setPaying(true);
    try {
      await paymentApi.recordManualPayment({
        invoiceId: Number(id),
        paymentMethodId: Number(paymentMethodId),
        amount: paymentAmount ? Number(paymentAmount) : undefined,
      });
      const updated = await invoiceApi.getInvoiceById(id);
      setInvoice(updated);
      setPaymentOpen(false);
      setPaymentAmount('');
      setPaymentMethodId('');
      toast.success('បានកត់ត្រាការទូទាត់', 'ការទូទាត់បានកត់ត្រាដោយជោគជ័យ។');
    } catch (err) {
      toast.error('ការបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'មិនអាចកត់ត្រាបានទេ។');
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await invoiceApi.cancel(id);
      toast.success('បានលុបចោល', 'វិក្កយបត្រត្រូវបានលុបចោល។');
      setCancelOpen(false);
      fetchInvoice();
    } catch (err) {
      toast.error('ការបរាជ័យ', err.response?.data?.message || err.response?.data?.error || 'មិនអាចលុបចោលបានទេ។');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(`${basePath}/invoices`)} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <ArrowLeft className="h-4 w-4" /> ត្រលប់ទៅបញ្ជីវិក្កយបត្រ
        </button>
        <Alert variant="danger" title="កំហុស" description={error} />
      </div>
    );
  }

  if (!invoice) return null;

  const canMarkPaid = invoice.status === 'PENDING' || invoice.status === 'PARTIAL' || invoice.status === 'OVERDUE';
  const canCancel = invoice.status !== 'CANCELLED' && invoice.status !== 'PAID';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${basePath}/invoices`)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-800"
            aria-label="ត្រលប់"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">{invoice.invoiceNo}</h1>
              <Badge variant={STATUS_VARIANT[invoice.status] || 'default'}>
                {STATUS_LABELS[invoice.status] || invoice.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              បង្កើតនៅ {formatDateTime(invoice.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* ── Preview & Download Real Khmer Invoice ── */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            onClick={() => setPreviewOpen(true)}
          >
            មើលគំរូវិក្កយបត្រ (Preview)
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => setPreviewOpen(true)}
          >
            ទាញយក PDF
          </Button>

          {invoice.status === 'PENDING' && (
            <Button variant="outline" size="sm" leftIcon={<DollarSign className="h-4 w-4" />} onClick={() => setPaymentOpen(true)}>
              កត់ត្រាការទូទាត់
            </Button>
          )}
          {canMarkPaid && (
            <Button variant="outline" size="sm" leftIcon={<Check className="h-4 w-4" />} onClick={handleMarkPaid}>
              សម្គាល់ថាបង់រួច
            </Button>
          )}
          {canCancel && (
            <Button variant="ghost" size="sm" leftIcon={<X className="h-4 w-4" />} onClick={() => setCancelOpen(true)}>
              លុបចោល
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">ពត៌មានអ្នកជួល</h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {invoice.houseName || '—'} · បន្ទប់ {invoice.roomNumber || '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">កាលកំណត់</p>
              <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Calendar className="h-4 w-4 text-slate-400" />
                {formatDateTime(invoice.dueDate)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="h-3.5 w-3.5" /> អ្នកជួល
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {invoice.tenantName || '—'}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Building2 className="h-3.5 w-3.5" /> អចលនទ្រព្យ
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {invoice.houseName || '—'}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Receipt className="h-3.5 w-3.5" /> កិច្ចសន្យា
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {invoice.contractNo || '—'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-400 dark:text-slate-500">សរុបដល់ត្រូវបង់</h3>
          <p className="mt-1 text-3xl font-semibold text-slate-800 dark:text-white">
            {formatCurrency(invoice.totalAmount)}
          </p>
          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm dark:border-gray-800">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>សរុបរង</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>បញ្ចុះតម្លៃ</span>
              <span>{formatCurrency(invoice.discount)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>ថ្លៃពន្យាពេល</span>
              <span>{formatCurrency(invoice.lateFee)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-gray-800">
          <h2 className="font-semibold text-slate-800 dark:text-white">ពត៌មានលម្អិតវិក្កយបត្រ</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-slate-400">
                <th className="px-6 py-3 font-medium">ការពិពណ៌នា</th>
                <th className="px-6 py-3 text-right font-medium">ចំនួន</th>
                <th className="px-6 py-3 text-right font-medium">តម្លៃ/ឯកតា</th>
                <th className="px-6 py-3 text-right font-medium">សរុប</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 dark:border-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      {item.itemType === 'ELECTRICITY' || item.itemType === 'WATER' ? (
                        <Plug className="h-4 w-4 text-teal-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-slate-400" />
                      )}
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {ITEM_LABELS[item.itemType] || item.description || item.itemType}
                        </p>
                        {item.description && item.description !== (ITEM_LABELS[item.itemType] || '') && (
                          <p className="text-xs text-slate-400">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                    {Number(item.quantity)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-200">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
              {(!invoice.items || invoice.items.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-400">
                    គ្មានពត៌មានលម្អិត
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="លុបចោលវិក្កយបត្រ"
        description={`តើអ្នកប្រាកដថាចង់លុបចោលវិក្កយបត្រ ${invoice.invoiceNo} មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`}
        confirmLabel="លុបចោល"
        onConfirm={handleCancel}
        loading={cancelling}
      />

      <Modal open={paymentOpen} onOpenChange={setPaymentOpen} title="កត់ត្រាការទូទាត់">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ចំនួនដែលត្រូវបង់គឺ <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(invoice.totalAmount)}</span>។
          </p>
          <Input
            label="ចំនួនទឹកប្រាក់ ($)"
            type="number"
            min="0"
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setPaymentOpen(false)}>
              បោះបង់
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!paymentAmount || Number(paymentAmount) <= 0}
              loading={paying}
              onClick={handleRecordPayment}
            >
              កត់ត្រា
            </Button>
          </div>
        </div>
      </Modal>

      {/* Real Khmer Invoice Preview Modal */}
      <InvoicePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={invoice}
      />

      {/* Hidden print document for direct window.print() */}
      <div className="hidden print:block">
        <RealInvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
}
