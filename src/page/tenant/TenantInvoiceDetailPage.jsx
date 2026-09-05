// src/page/tenant/TenantInvoiceDetailPage.jsx
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  FileText,
  Wallet,
  Droplets,
  Zap,
  Receipt,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import { useTenantInvoiceDetail } from '../../hooks/useTenantDashboard';
import { Alert, Badge, Button, Card, EmptyState, Skeleton, Table } from '../../components/ui/index.js';
import { formatCurrency, formatDate, formatMonth, formatNumber } from '../../utils/format';
import { invoiceStatus } from '../../utils/invoiceStatus';

const utilityIcon = (type) => {
  if (type === 'WATER') return <Droplets className="h-4 w-4" />;
  if (type === 'ELECTRICITY') return <Zap className="h-4 w-4" />;
  return <Receipt className="h-4 w-4" />;
};

export default function TenantInvoiceDetailPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { invoice, loading, error, fetchInvoice } = useTenantInvoiceDetail(invoiceId);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tenant/dashboard')}>
          <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង
        </Button>
        <Alert variant="danger" title="កំហុស" description={error || 'មិនអាចផ្ទុកវិក្កយបត្របានទេ។'} dismissible={false} />
        <div className="text-center">
          <Button variant="outline" onClick={fetchInvoice} leftIcon={<RefreshCw className="h-4 w-4" />}>
            ព្យាយាមម្តងទៀត
          </Button>
        </div>
      </div>
    );
  }

  const statusCfg = invoiceStatus(invoice.status);
  const isPayable = invoice.status === 'PENDING' || invoice.status === 'PARTIAL';

  const summaryRows = [
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'ថ្លៃជួល',
      value: formatCurrency(invoice.rent),
    },
    {
      icon: <Droplets className="h-4 w-4" />,
      label: 'ទឹក និងភ្លើង',
      value: formatCurrency(
        (invoice.utilities || []).reduce((sum, u) => sum + Number(u.amount || 0), 0)
      ),
    },
    {
      icon: <Receipt className="h-4 w-4" />,
      label: 'ផ្សេងៗ',
      value: formatCurrency(invoice.otherCharges),
    },
    {
      icon: <Wallet className="h-4 w-4" />,
      label: 'សរុបត្រូវបង់',
      value: formatCurrency(invoice.total),
      highlight: true,
    },
  ];

  const utilityColumns = [
    {
      header: 'ប្រភេទ',
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          {utilityIcon(row.type)}
          <span className="font-medium capitalize text-slate-800 dark:text-white">
            {row.type === 'ELECTRICITY' ? 'ភ្លើង' : 'ទឹក'}
          </span>
        </span>
      ),
    },
    {
      header: 'បរិមាណប្រើប្រាស់',
      render: (row) => `${formatNumber(row.usage)} ${row.unit || ''}`.trim(),
    },
    { header: 'ចំនួនទឹកប្រាក់', render: (row) => formatCurrency(row.amount) },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/tenant/dashboard')}>
        <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            វិក្កយបត្រ {invoice.invoiceNo}
          </h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            រយៈពេលវិក្កយបត្រ {formatMonth(invoice.billingMonth)}
          </p>
        </div>
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="ព័ត៌មានវិក្កយបត្រ" description="ព័ត៌មានលម្អិតទូទៅ" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">ផ្ទះ</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{invoice.houseName || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
                <DoorOpen className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">បន្ទប់</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{invoice.roomNumber || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">ថ្ងៃកំណត់បង់ប្រាក់</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
                <Wallet className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">ស្ថានភាព</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{statusCfg.label}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="ចំនួនទឹកប្រាក់" description="ការបំបែកតម្លៃ">
          <div className="space-y-3">
            {summaryRows.map((row) => (
              <div
                key={row.label}
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                  row.highlight
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-slate-50 dark:bg-gray-800'
                }`}
              >
                <span
                  className={`inline-flex items-center gap-2 text-sm font-medium ${
                    row.highlight
                      ? 'text-white dark:text-gray-900'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {row.icon}
                  {row.label}
                </span>
                <span className={`text-sm font-bold ${row.highlight ? '' : 'text-slate-800 dark:text-white'}`}>
                  {row.value}
                </span>
              </div>
            ))}
            {isPayable && (
              <Button fullWidth leftIcon={<CreditCard className="h-4 w-4" />} onClick={() => navigate('/tenant/payments')}>
                បង់ប្រាក់ឥឡូវនេះ
              </Button>
            )}
          </div>
        </Card>
      </div>

      <Card title="ការប្រើប្រាស់ទឹក និងភ្លើង" description="លម្អិតការប្រើប្រាស់ក្នុងវិក្កយបត្រ">
        {!invoice.utilities?.length ? (
          <EmptyState
            icon={Receipt}
            title="គ្មានការប្រើប្រាស់ទឹកភ្លើង"
            description="វិក្កយបត្រនេះមានតែថ្លៃជួល និងតម្លៃផ្សេងៗប៉ុណ្ណោះ។"
          />
        ) : (
          <Table columns={utilityColumns} data={invoice.utilities} />
        )}
      </Card>
    </div>
  );
}