import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Building2,
  Users,
  Calendar,
  DollarSign,
  Eye,
  ArrowLeft,
  Plug,
  Layers,
  Download,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices.js';
import { useContracts } from '../../hooks/useContracts.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useRooms } from '../../hooks/useRooms.js';
import { useBasePath } from '../../hooks/useBasePath.js';
import { useToast } from '../../components/ui/Toast.jsx';
import BulkInvoicePreviewModal from './BulkInvoicePreviewModal.jsx';
import {
  Card,
  Button,
  Input,
  Select,
  Alert,
  Skeleton,
  EmptyState,
} from '../../components/ui/index.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const ITEM_LABELS = {
  RENT: 'ថ្លៃជួលបន្ទប់',
  ELECTRICITY: 'អគ្គិសនី',
  WATER: 'ទឹក',
  INTERNET: 'អ៊ីនធឺណិត',
  PARKING: 'ចំណត',
  OTHER: 'ផ្សេងៗ',
};

export default function GenerateInvoice() {
  const navigate = useNavigate();
  const { preview, generate, generateBulk } = useInvoices();
  const { contracts, loading: loadingContracts, fetchContracts } = useContracts();
  const { houses } = useHouses();
  const { rooms } = useRooms();
  const toast = useToast();
  const basePath = useBasePath();

  // Bulk generation state
  const [bulkMonth, setBulkMonth] = useState(String(new Date().getMonth() + 1));
  const [bulkYear, setBulkYear] = useState(String(new Date().getFullYear()));
  const [bulkDiscount, setBulkDiscount] = useState('');
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState(null);
  const [downloadPreviewOpen, setDownloadPreviewOpen] = useState(false);

  // Single generation state
  const [contractId, setContractId] = useState('');
  const [billingYear, setBillingYear] = useState(String(new Date().getFullYear()));
  const [billingMonth, setBillingMonth] = useState(String(new Date().getMonth() + 1));
  const [dueDate, setDueDate] = useState('');
  const [discount, setDiscount] = useState('');
  const [previewResult, setPreviewResult] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `ខែ ${i + 1}` })),
    []
  );

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, i) => {
      const y = new Date().getFullYear() - 2 + i;
      return { value: String(y), label: String(y) };
    }),
    []
  );

  const contractOptions = useMemo(
    () => contracts.map((c) => {
      const room = rooms.find((r) => String(r.id) === String(c.roomId));
      return {
        value: String(c.id),
        label: `${c.contractNo}${room?.roomNumber ? ` - បន្ទប់ ${room.roomNumber}` : ''}`,
      };
    }),
    [contracts, rooms]
  );

  const selectedContract = useMemo(
    () => contracts.find((c) => String(c.id) === contractId),
    [contracts, contractId]
  );

  const selectedRoom = useMemo(
    () => (selectedContract ? rooms.find((r) => String(r.id) === String(selectedContract.roomId)) : null),
    [selectedContract, rooms]
  );

  const selectedHouse = useMemo(
    () => (selectedRoom ? houses.find((h) => String(h.id) === String(selectedRoom.houseId)) : null),
    [selectedRoom, houses]
  );

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handlePreview = async () => {
    setError(null);
    if (!contractId) {
      setError('សូមជ្រើសរើសកិច្ចសន្យា');
      return;
    }
    setPreviewing(true);
    try {
      const result = await preview({
        contractId: Number(contractId),
        billingYear: Number(billingYear),
        billingMonth: Number(billingMonth),
        discount: discount ? Number(discount) : null,
        dueDate: dueDate || null,
      });
      setPreviewResult(result);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'មិនអាចមើលព័ត៌មានជាមុនបានទេ។');
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      const created = await generate({
        contractId: Number(contractId),
        billingYear: Number(billingYear),
        billingMonth: Number(billingMonth),
        discount: discount ? Number(discount) : null,
        dueDate: dueDate || null,
      });
      toast.success('បានបង្កើតវិក្កយបត្រ', `វិក្កយបត្រ ${created.invoiceNo} ត្រូវបានបង្កើតរួចរាល់។`);
      navigate(`${basePath}/invoices/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'ការបង្កើតវិក្កយបត្របរាជ័យ។');
    } finally {
      setGenerating(false);
    }
  };

  // Bulk generation handler - creates one invoice per active contract for the month
  const handleBulkGenerate = async () => {
    setBulkError(null);
    setBulkResult(null);
    setBulkGenerating(true);
    try {
      const result = await generateBulk({
        billingYear: Number(bulkYear),
        billingMonth: Number(bulkMonth),
        discount: bulkDiscount ? Number(bulkDiscount) : null,
      });
      setBulkResult(result);
      if (result.createdCount > 0) {
        toast.success('បានបង្កើតវិក្កយបត្រទាំងអស់', `បានបង្កើត ${result.createdCount} វិក្កយបត្រ សម្រាប់ខែ ${bulkMonth}/${bulkYear}។`);
        fetchContracts();
      } else if (result.skippedCount > 0 || result.errorCount > 0) {
        toast.info('មិនមានវិក្កយបត្រថ្មី', 'វិក្កយបត្រទាំងអស់សម្រាប់ខែនេះត្រូវបានបង្កើតរួចហើយ ឬក៏មានបញ្ហា។');
      }
    } catch (err) {
      setBulkError(err.response?.data?.message || err.response?.data?.error || 'ការបង្កើតវិក្កយបត្រទាំងអស់បរាជ័យ។');
    } finally {
      setBulkGenerating(false);
    }
  };

  // Download all the invoices created by the bulk action (preview first)
  const handleBulkDownload = () => {
    if (!bulkResult || bulkResult.createdInvoices.length === 0) return;
    setDownloadPreviewOpen(true);
  };

  if (loadingContracts) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
        <Card>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-4 h-10 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`${basePath}/invoices`)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-800"
          aria-label="ត្រលប់"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">បង្កើតវិក្កយបត្រ</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            បង្កើតវិក្កយបត្រប្រចាំខែ ប្រព័ន្ធគណនាថ្លៃជួល និងថ្លៃប្រើប្រាស់ទឹកភ្លើងដោយស្វ័យប្រវត្តិ។
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុស" description={error} dismissible onDismiss={() => setError(null)} />
      )}

      {/* ── BULK GENERATION CARD ─────────────────────────────────────── */}
      <Card className="border-2 border-blue-200 p-6 dark:border-blue-900">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Layers className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">បង្កើតវិក្កយបត្រទាំងអស់ក្នុងពេលតែម្តង</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              បង្កើតវិក្កយបត្រសម្រាប់គ្រប់កិច្ចសន្យាដែលកំពុងសកម្ម (ACTIVE) សម្រាប់រយៈពេលមួយខែ។ កិច្ចសន្យានីមួយៗមានតែមួយវិក្កយបត្រប៉ុណ្ណោះ។
            </p>
          </div>
        </div>

        {bulkError && (
          <Alert variant="danger" title="កំហុស" description={bulkError} dismissible onDismiss={() => setBulkError(null)} />
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="ខែ"
              required
              name="bulkMonth"
              options={monthOptions}
              value={bulkMonth}
              onChange={(e) => { setBulkMonth(e.target.value); setBulkResult(null); }}
            />
            <Select
              label="ឆ្នាំ"
              required
              name="bulkYear"
              options={yearOptions}
              value={bulkYear}
              onChange={(e) => { setBulkYear(e.target.value); setBulkResult(null); }}
            />
            <Input
              label="បញ្ចុះតម្លៃ ($)"
              type="number"
              min="0"
              step="0.01"
              name="bulkDiscount"
              value={bulkDiscount}
              onChange={(e) => { setBulkDiscount(e.target.value); setBulkResult(null); }}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              leftIcon={<Layers className="h-4 w-4" />}
              onClick={handleBulkGenerate}
              loading={bulkGenerating}
              className="!bg-blue-600 hover:!bg-blue-700"
            >
              បង្កើតវិក្កយបត្រទាំងអស់ (ខែ {bulkMonth}/{bulkYear})
            </Button>

            {bulkResult && bulkResult.createdInvoices.length > 0 && (
              <Button
                variant="outline"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleBulkDownload}
              >
                {`ទាញយក PDF ទាំងអស់ (${bulkResult.createdInvoices.length})`}
              </Button>
            )}
          </div>

          {bulkResult && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">បានបង្កើត</p>
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{bulkResult.createdCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-900/20">
                <Info className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">បានរំលង (មានស្រាប់)</p>
                  <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{bulkResult.skippedCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-900/20">
                <XCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <div>
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">បរាជ័យ</p>
                  <p className="text-lg font-bold text-rose-800 dark:text-rose-300">{bulkResult.errorCount}</p>
                </div>
              </div>

              {bulkResult.skippedReasons.length > 0 && (
                <div className="sm:col-span-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">ហេតុផលបានរំលង:</p>
                    <ul className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {bulkResult.skippedReasons.map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {bulkResult.errors.length > 0 && (
                <div className="sm:col-span-3">
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-900/20">
                    <p className="mb-1 text-xs font-semibold text-rose-500">បញ្ហា:</p>
                    <ul className="space-y-0.5 text-xs text-rose-700 dark:text-rose-300">
                      {bulkResult.errors.map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ── SINGLE GENERATION CARD ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">ព័ត៌មានវិក្កយបត្រ</h2>

          {contracts.length === 0 ? (
            <EmptyState icon={FileText} title="គ្មានកិច្ចសន្យា" description="មិនមានកិច្ចសន្យាសម្រាប់បង្កើតវិក្កយបត្រទេ។" />
          ) : (
            <div className="space-y-4">
              <Select
                label="កិច្ចសន្យា"
                required
                name="contractId"
                options={contractOptions}
                value={contractId}
                onChange={(e) => { setContractId(e.target.value); setPreviewResult(null); }}
                placeholder="ជ្រើសរើសកិច្ចសន្យា"
              />

              {selectedContract && (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-800/50">
                  <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {selectedHouse?.name || '—'} · បន្ទប់ {selectedRoom?.roomNumber || '—'}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    ថ្លៃជួលប្រចាំខែ: {formatCurrency(selectedContract.monthlyRent)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(selectedContract.startDate)} → {formatDate(selectedContract.endDate)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="ខែ"
                  required
                  name="billingMonth"
                  options={monthOptions}
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                />
                <Select
                  label="ឆ្នាំ"
                  required
                  name="billingYear"
                  options={yearOptions}
                  value={billingYear}
                  onChange={(e) => setBillingYear(e.target.value)}
                />
              </div>

              <Input
                label="ថ្ងៃកំណត់ទូទាត់"
                type="date"
                name="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                helperText="ទុកទទេ ដើម្បីគណនាដោយស្វ័យប្រវត្តិតាមលក្ខខណ្ឌកិច្ចសន្យា។"
              />

              <Input
                label="បញ្ចុះតម្លៃ ($)"
                type="number"
                min="0"
                step="0.01"
                name="discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00"
              />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />} onClick={handlePreview} loading={previewing}>
                  មើលព័ត៌មានជាមុន
                </Button>
                {previewResult && (
                  <Button variant="primary" leftIcon={<FileText className="h-4 w-4" />} onClick={handleGenerate} loading={generating}>
                    បង្កើតវិក្កយបត្រ
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {previewResult && (
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">ព័ត៌មានវិក្កយបត្រជាមុន</h2>

            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-800/50">
              <div className="col-span-2">
                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Users className="h-4 w-4 text-slate-400" />
                  {previewResult.tenantName || 'គ្មានអ្នកជួល'}
                </p>
                <p className="mt-1 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  រយៈពេល: {previewResult.billingMonth}/{previewResult.billingYear}
                </p>
                <p className="mt-1 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  ថ្ងៃកំណត់ទូទាត់: {formatDate(previewResult.dueDate)}
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                កំពុងរង់ចាំ (PENDING)
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-gray-800">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-slate-400">
                <span>ការពិពណ៌នា</span>
                <span>ចំនួន</span>
              </div>
              {previewResult.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm dark:border-gray-800"
                >
                  <div className="flex items-center gap-2">
                    {item.itemType === 'WATER' || item.itemType === 'ELECTRICITY' ? (
                      <Plug className="h-4 w-4 text-teal-500" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="text-slate-700 dark:text-slate-200">
                      {ITEM_LABELS[item.itemType] || item.itemType}
                    </span>
                  </div>
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="text-xs text-slate-400">
                      {Number(item.quantity)} × {formatCurrency(item.unitPrice)}
                    </span>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}

              <div className="space-y-1.5 bg-slate-50 px-4 py-3 text-sm dark:bg-gray-800/50">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>សរុបរង</span>
                  <span>{formatCurrency(previewResult.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>បញ្ចុះតម្លៃ</span>
                  <span>{formatCurrency(previewResult.discount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-800 dark:border-gray-700 dark:text-white">
                  <span>សរុប</span>
                  <span>{formatCurrency(previewResult.total)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <BulkInvoicePreviewModal
        open={downloadPreviewOpen}
        onClose={() => setDownloadPreviewOpen(false)}
        invoices={bulkResult?.createdInvoices || []}
        billingYear={Number(bulkYear)}
        billingMonth={Number(bulkMonth)}
      />
    </div>
  );
}
