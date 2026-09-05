// src/page/tenant/TenantPaymentsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Wallet,
  BadgeCheck,
  Hourglass,
  ArrowLeft,
  QrCode,
  Receipt,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTenantProfile } from '../../hooks/useTenantProfile';
import { invoiceApi } from '../../api/invoice.api';
import { paymentApi } from '../../api/payment.api';
import {
  Alert,
  Badge,
  Button,
  Card,
  Skeleton,
  Modal,
  EmptyState,
} from '../../components/ui/index.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const INVOICE_STATUS_CONFIG = {
  PAID: { label: 'បានបង់រួច (PAID)', variant: 'success' },
  PENDING: { label: 'រង់ចាំការបង់ប្រាក់ (PENDING)', variant: 'warning' },
  PARTIAL: { label: 'បង់មួយផ្នែក (PARTIAL)', variant: 'info' },
  OVERDUE: { label: 'ហួសកំណត់ (OVERDUE)', variant: 'danger' },
  CANCELLED: { label: 'បានបោះបង់ (CANCELLED)', variant: 'neutral' },
  DRAFT: { label: 'ព្រាង (DRAFT)', variant: 'neutral' },
};

const PAYMENT_STATUS_CONFIG = {
  PAID: { label: 'បានបង់ប្រាក់ដោយជោគជ័យ (PAID)', variant: 'success' },
  PENDING: { label: 'រង់ចាំការបង់ប្រាក់ (PENDING)', variant: 'warning' },
  EXPIRED: { label: 'ផុតកំណត់ (EXPIRED)', variant: 'neutral' },
  FAILED: { label: 'ការបង់ប្រាក់បរាជ័យ (FAILED)', variant: 'danger' },
  CANCELLED: { label: 'បានបោះបង់ (CANCELLED)', variant: 'neutral' },
};

const TERMINAL_PAYMENT_STATUSES = ['PAID', 'FAILED', 'EXPIRED', 'CANCELLED'];

const PaymentStatusBadge = ({ paymentStatus, initialStatus }) => {
  const effective = paymentStatus?.paymentStatus || initialStatus || 'PENDING';
  const cfg = PAYMENT_STATUS_CONFIG[effective] || { label: effective, variant: 'neutral' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

const InfoItem = ({ icon, label, value, highlight }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p
        className={`truncate text-sm font-semibold ${
          highlight
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-800 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default function TenantPaymentsPage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, error: profileError, fetchProfile } = useTenantProfile();

  // Invoices state
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);

  // KHQR Payment modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Authoritative payment status (server-side reconciliation with ABA)
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Fetch invoices for this tenant
  const loadInvoices = useCallback(async (tenantId) => {
    if (!tenantId) return;
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const res = await invoiceApi.getInvoices({ tenantId, size: 20 });
      // res could be a PageResponse with .content or direct array
      const list = res?.content || (Array.isArray(res) ? res : []);
      setInvoices(list);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'មិនអាចទាញយកបញ្ជីវិក្កយបត្របានទេ។';
      setInvoicesError(msg);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.id) {
      loadInvoices(profile.id);
    }
  }, [profile?.id, loadInvoices]);

  // Handle Pay with KHQR
  const handleInitiatePayment = async (inv) => {
    setSelectedInvoice(inv);
    setPaymentLoading(true);
    setPaymentError(null);
    setPaymentData(null);
    setPaymentStatus(null);
    setStatusError(null);

    try {
      const res = await paymentApi.createPayment({
        invoiceId: inv.id,
      });
      setPaymentData(res);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'មិនអាចបង្កើត KHQR Payment បានទេ។ សូមទាក់ទងម្ចាស់ផ្ទះ។';
      setPaymentError(msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  const closePaymentModal = () => {
    setSelectedInvoice(null);
    setPaymentData(null);
    setPaymentError(null);
    setPaymentStatus(null);
    setStatusError(null);
    if (profile?.id) {
      loadInvoices(profile.id);
    }
  };

  // Manual status check for the modal
  const checkPaymentStatus = async (transactionId) => {
    if (!transactionId) return;
    setStatusLoading(true);
    setStatusError(null);
    try {
      const res = await paymentApi.getPaymentStatus(transactionId);
      setPaymentStatus(res);
      if (res.paymentStatus === 'PAID' && profile?.id) {
        loadInvoices(profile.id);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'មិនអាចពិនិត្យស្ថានភាពការទូទាត់បានទេ។';
      setStatusError(msg);
    } finally {
      setStatusLoading(false);
    }
  };

  // Poll the authoritative ABA status while the KHQR payment is in the air
  useEffect(() => {
    const transactionId = paymentData?.transactionId;
    if (!transactionId) return;

    setPaymentStatus(null);
    setStatusError(null);

    let stopped = false;
    let retryTimer = null;
    let closeTimer = null;
    let pollCount = 0;
    const MAX_POLLS = 40; // 3s * 40 = ~2 minutes
    const POLL_INTERVAL_MS = 3000;

    const poll = async () => {
      if (stopped) return;
      try {
        const res = await paymentApi.getPaymentStatus(transactionId);
        if (stopped) return;
        setPaymentStatus(res);

        if (TERMINAL_PAYMENT_STATUSES.includes(res.paymentStatus)) {
          if (res.paymentStatus === 'PAID') {
            if (profile?.id) loadInvoices(profile.id);
            closeTimer = setTimeout(() => {
              if (!stopped) closePaymentModal();
            }, 2500);
          }
          return; // stop polling
        }
      } catch (err) {
        if (!stopped) {
          setStatusError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              'មិនអាចពិនិត្យស្ថានភាពការទូទាត់បានទេ។'
          );
        }
      }

      pollCount += 1;
      if (!stopped && pollCount < MAX_POLLS) {
        retryTimer = setTimeout(poll, POLL_INTERVAL_MS);
      } else if (!stopped) {
        setStatusError('មិនទាន់ទទួលការបញ្ជាក់ពី PayWay នៅឡើយទេ។ សូមពិនិត្យស្ថានភាពម្តងទៀត។');
      }
    };

    retryTimer = setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData?.transactionId]);

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <Alert
        variant="danger"
        title="កំហុសក្នុងការផ្ទុក"
        description={profileError || 'មិនអាចផ្ទុកព័ត៌មានអ្នកជួលបានទេ។'}
      >
        <Button size="sm" className="mt-3" onClick={fetchProfile}>
          ព្យាយាមម្តងទៀត
        </Button>
      </Alert>
    );
  }

  const contract = profile.contract;

  // Authoritative payment status UI (server-side reconciled with ABA)
  const renderPaymentStatusArea = () => {
    const effectiveStatus = paymentStatus?.paymentStatus || paymentData?.status || 'PENDING';
    const statusCfg = PAYMENT_STATUS_CONFIG[effectiveStatus] || {
      label: effectiveStatus,
      variant: 'neutral',
    };

    if (effectiveStatus === 'PAID') {
      return (
        <Alert
          variant="success"
          title="ការទូទាត់បានជោគជ័យ"
          description="ABA PayWay បានបញ្ជាក់ពីការទូទាត់របស់អ្នក។ វិក្កយបត្រនេះត្រូវបានកត់ត្រាថា បានបង់រួចហើយ។"
        >
          <div className="flex items-center justify-center">
            <Badge variant="success">{statusCfg.label}</Badge>
          </div>
        </Alert>
      );
    }

    if (TERMINAL_PAYMENT_STATUSES.includes(effectiveStatus)) {
      return (
        <Alert
          variant="danger"
          title={
            effectiveStatus === 'EXPIRED'
              ? 'ការទូទាត់បានផុតកំណត់'
              : 'ការទូទាត់មិនបានជោគជ័យ'
          }
          description={
            statusError || 'សូមព្យាយាមបង្កើតការទូទាត់ម្តងទៀត។'
          }
        >
          <div className="flex items-center justify-center gap-2">
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<QrCode className="h-4 w-4" />}
              onClick={() => handleInitiatePayment(selectedInvoice)}
            >
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {statusLoading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
          ) : (
            <Clock className="h-3.5 w-3.5" />
          )}
          <span>កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់ពី ABA PayWay...</span>
        </div>
        <div className="flex items-center justify-center">
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
        </div>
        {statusError && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{statusError}</span>
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => checkPaymentStatus(paymentData?.transactionId)}
          disabled={statusLoading}
        >
          ពិនិត្យស្ថានភាពឥឡូវនេះ
        </Button>
      </div>
    );
  };

  if (!contract) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Hourglass className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-800 dark:text-white">
              គ្មានកិច្ចសន្យាសកម្ម
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              ព័ត៌មានការទូទាត់នឹងបង្ហាញនៅពេលអ្នកត្រូវបានចាត់តាំងទៅកិច្ចសន្យាជួល។
            </p>
            <Button
              className="mt-6"
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate('/tenant')}
            >
              ត្រឡប់ទៅទំព័រដើម
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const depositPaid = Number(contract.depositPaidAmount || 0);
  const depositTotal = Number(contract.securityDeposit || 0);
  const depositRatio =
    depositTotal > 0 ? Math.min(100, Math.round((depositPaid / depositTotal) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            ការទូទាត់ (Payments)
          </h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            ថ្លៃជួល ប្រាក់កក់ និងវិក្កយបត្រប្រចាំខែសម្រាប់កិច្ចសន្យា {contract.contractNo}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className={`h-4 w-4 ${invoicesLoading ? 'animate-spin' : ''}`} />}
            onClick={() => loadInvoices(profile.id)}
            disabled={invoicesLoading}
          >
            ធ្វើឱ្យស្រស់
          </Button>
          <Badge variant="success">ACTIVE</Badge>
        </div>
      </div>

      {/* Contract & Deposit Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="ថ្លៃជួលរៀងរាល់ខែ" description={`លេខកិច្ចសន្យា: ${contract.contractNo}`}>
          <div className="space-y-4">
            <InfoItem
              icon={<Wallet className="h-4 w-4" />}
              label="ថ្លៃជួលប្រចាំខែ"
              value={formatCurrency(contract.monthlyRent)}
              highlight
            />
            <InfoItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="ថ្ងៃកំណត់បង់"
              value={`ថ្ងៃទី ${contract.dueDay} នៃរៀងរាល់ខែ`}
            />
            <InfoItem
              icon={<Receipt className="h-4 w-4" />}
              label="ថ្លៃជួលសរុបក្នុងមួយឆ្នាំ"
              value={formatCurrency(contract.monthlyRent * 12)}
            />
          </div>
        </Card>

        <Card title="ប្រាក់កក់ (Security Deposit)" description="ស្ថានភាពប្រាក់កក់របស់កិច្ចសន្យា">
          <div className="space-y-4">
            <InfoItem
              icon={<BadgeCheck className="h-4 w-4" />}
              label="ប្រាក់កក់សរុប"
              value={formatCurrency(depositTotal)}
            />
            <InfoItem
              icon={<Wallet className="h-4 w-4" />}
              label="បានបង់រួច"
              value={formatCurrency(depositPaid)}
            />
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400 dark:text-slate-500">
                  ការបង់ប្រាក់កក់
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {depositRatio}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${depositRatio}%` }}
                />
              </div>
              <div className="mt-2">
                {contract.depositFullyPaid ? (
                  <Badge variant="success">បានបង់ពេញ</Badge>
                ) : (
                  <Badge variant="warning">បង់មិនទាន់ពេញ</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices List / Payment Gateway section */}
      <Card
        title="វិក្កយបត្រ និងការទូទាត់ KHQR"
        description="បញ្ជីវិក្កយបត្រថ្លៃជួល និងទឹកភ្លើងរបស់អ្នក។ អ្នកអាចទូទាត់ប្រាក់តាម KHQR PayWay បាន។"
      >
        {invoicesError && (
          <Alert
            variant="danger"
            title="មិនអាចទាញយកវិក្កយបត្របានទេ"
            description={invoicesError}
            className="mb-4"
          />
        )}

        {invoicesLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="គ្មានវិក្កយបត្រដែលត្រូវបង់ទេ"
            description="កិច្ចសន្យារបស់អ្នកមិនទាន់មានវិក្កយបត្រថ្មី ឬអ្នកបានទូទាត់គ្រប់ចំនួនរួចរាល់ហើយ។"
          />
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 dark:divide-gray-800 dark:border-gray-800">
            {invoices.map((inv) => {
              const statusCfg = INVOICE_STATUS_CONFIG[inv.status] || {
                label: inv.status,
                variant: 'neutral',
              };
              const isPayable = inv.status === 'PENDING' || inv.status === 'PARTIAL';
              const totalAmount = inv.totalAmount || inv.total || 0;
              const discount = inv.discount || 0;
              const netAmount = Math.max(0, totalAmount - discount);

              return (
                <div
                  key={inv.id}
                  className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-gray-800/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">
                        {inv.invoiceNo}
                      </span>
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      កាលបរិច្ឆេទ: {formatDate(inv.createdAt)} • ថ្ងៃផុតកំណត់:{' '}
                      {formatDate(inv.dueDate)}
                    </p>
                    {inv.billingMonth && inv.billingYear && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        សម្រាប់ខែ: {inv.billingMonth}/{inv.billingYear}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 dark:text-slate-500">ចំនួនទឹកប្រាក់</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {formatCurrency(netAmount)}
                      </p>
                    </div>

                    {isPayable && (
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<QrCode className="h-4 w-4" />}
                        onClick={() => handleInitiatePayment(inv)}
                      >
                        បង់ប្រាក់ KHQR
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* PayWay KHQR Modal */}
      {selectedInvoice && (
        <Modal
          open={!!selectedInvoice}
          onClose={closePaymentModal}
          title="ទូទាត់ប្រាក់តាម KHQR (PayWay)"
          description={`វិក្កយបត្រ: ${selectedInvoice.invoiceNo}`}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-slate-400">PayWay Sandbox KHQR</span>
              <Button variant="secondary" onClick={closePaymentModal}>
                បិទ
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-center">
            {paymentLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  កំពុងបង្កើតកូដ KHQR ពី PayWay Sandbox...
                </p>
              </div>
            ) : paymentError ? (
              <div className="space-y-4 py-2">
                <Alert
                  variant="danger"
                  title="កំហុសក្នុងការបង្កើតការទូទាត់"
                  description={paymentError}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ប្រសិនបើប្រព័ន្ធកំណត់ការទូទាត់សម្រាប់តែម្ចាស់ ឬអ្នកគ្រប់គ្រង សូមទាក់ទងម្ចាស់ផ្ទះដើម្បីទូទាត់ផ្ទាល់។
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInitiatePayment(selectedInvoice)}
                >
                  ព្យាយាមម្តងទៀត
                </Button>
              </div>
            ) : paymentData ? (
              <div className="space-y-4">
                {/* QR Display */}
                <div className="mx-auto flex w-fit flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700">
                  {paymentData.qrCode ? (
                    <QRCodeSVG
                      value={paymentData.qrCode}
                      size={200}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#111827"
                    />
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center bg-slate-50 dark:bg-gray-800">
                      <QrCode className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
                  <p className="mt-3 text-xs font-semibold text-slate-600">
                    ស្កេនជាមួយ Bakong ឬ Mobile Banking ណាមួយ
                  </p>
                </div>

                {/* Details */}
                <div className="rounded-lg bg-slate-50 p-4 text-left dark:bg-gray-800/60 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ចំនួនទឹកប្រាក់:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(paymentData.amount)} {paymentData.currency || 'USD'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">លេខប្រតិបត្តិការ (Tran ID):</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {paymentData.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">លេខសម្គាល់ការបង់ (Payment No):</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {paymentData.paymentNo}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ស្ថានភាព:</span>
                    <PaymentStatusBadge
                      paymentStatus={paymentStatus}
                      initialStatus={paymentData.status}
                    />
                  </div>
                </div>

                {renderPaymentStatusArea()}

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>កូដ QR នេះមានសុពលភាពតាមស្តង់ដារ KHQR</span>
                </div>
              </div>
            ) : null}
          </div>
        </Modal>
      )}
    </div>
  );
}