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
  Search,
  X,
  Loader2,
  AlertCircle,
  Check,
  DoorOpen,
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices.js';
import { useInvoiceGeneration } from '../../hooks/useInvoiceGeneration.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useBasePath } from '../../hooks/useBasePath.js';
import { useToast } from '../../components/ui/Toast.jsx';
import BulkInvoicePreviewModal from './BulkInvoicePreviewModal.jsx';
import { invoiceItemName } from '../../utils/invoiceItemName';
import {
  Card,
  Button,
  Input,
  Select,
  Alert,
  Skeleton,
  EmptyState,
  Pagination,
  Tabs,
  Label,
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

/* Searchable, server-driven contract picker for the "Create one invoice" tab.
   Contracts come from the backend eligible-contracts endpoint and are already
   restricted to ACTIVE contracts in accessible houses. */
function ContractPicker({ gen, value, onChange, disabled = false }) {
  const selected = gen.contracts.find((c) => String(c.contractId) === String(value));

  return (
    <div className="w-full">
      {selected && (
        <div className="mb-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-white">
                <Building2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {selected.tenantName || 'គ្មានអ្នកជួល'} · {selected.contractNo}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {selected.houseName || '—'} · បន្ទប់ {selected.roomNumber || '—'} ·{' '}
                {formatCurrency(selected.monthlyRent)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled}
              aria-label="ដកចេញ"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={gen.searchTerm}
          onChange={(e) => gen.handleSearchChange(e.target.value)}
          placeholder="ស្វែងរកតាមលេខបន្ទប់ លេខកិច្ចសន្យា ឬឈ្មោះអ្នកជួល..."
          disabled={disabled}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-white"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
          <Search className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-400 dark:bg-gray-800 dark:text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">បន្ទប់</th>
                <th className="hidden px-3 py-2 font-semibold sm:table-cell">កិច្ចសន្យា</th>
                <th className="hidden px-3 py-2 font-semibold md:table-cell">អចលនទ្រព្យ</th>
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {gen.contractsLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> កំពុងស្វែងរក...
                    </div>
                  </td>
                </tr>
              ) : gen.contractsError ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4">
                    <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{gen.contractsError}</span>
                    </div>
                  </td>
                </tr>
              ) : gen.contracts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm text-slate-400 dark:text-slate-500">
                    រកមិនឃើញកិច្ចសន្យាសកម្ម
                  </td>
                </tr>
              ) : (
                gen.contracts.map((c) => {
                  const isSelected = String(c.contractId) === String(value);
                  return (
                    <tr
                      key={c.contractId}
                      onClick={() => !disabled && onChange(String(c.contractId))}
                      className={`cursor-pointer border-t border-gray-100 transition-colors dark:border-gray-800 ${
                        isSelected
                          ? 'bg-gray-900/5 dark:bg-gray-700/40'
                          : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-300">
                            <DoorOpen className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-800 dark:text-white">
                              {c.roomNumber || '—'}
                              {c.alreadyInvoiced && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  បានបង្កើតរួច
                                </span>
                              )}
                            </span>
                            <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                              {c.contractNo} · {c.tenantName || 'គ្មានអ្នកជួល'}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-3 py-2 text-sm text-slate-600 sm:table-cell dark:text-slate-300">
                        {formatCurrency(c.monthlyRent)}
                      </td>
                      <td className="hidden px-3 py-2 text-sm text-slate-500 md:table-cell dark:text-slate-400">
                        {c.houseName || '—'}
                      </td>
                      <td className="w-10 px-3 py-2 text-center">
                        {isSelected && <Check className="ml-auto h-4 w-4 text-gray-900 dark:text-white" />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!gen.contractsLoading && gen.contracts.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 dark:border-gray-800">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ទំព័រ {gen.page + 1} / {Math.max(1, gen.totalPages)}
            </span>
            <Pagination
              currentPage={gen.page + 1}
              totalPages={Math.max(1, gen.totalPages)}
              onPageChange={(p) => gen.handlePageChange(p - 1)}
              disabled={gen.contractsLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function GenerateInvoice() {
  const navigate = useNavigate();
  const basePath = useBasePath();
  const toast = useToast();
  const { houses } = useHouses();
  const { preview, generate, generateBulk } = useInvoices();
  const gen = useInvoiceGeneration();

  const [activeTab, setActiveTab] = useState('bulk');

  // Bulk generation state
  const [bulkDiscount, setBulkDiscount] = useState('');
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState(null);
  const [downloadPreviewOpen, setDownloadPreviewOpen] = useState(false);

  // Single generation state
  const [contractId, setContractId] = useState('');
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

  const propertyOptions = useMemo(
    () => [
      { value: '', label: 'អចលនទ្រព្យទាំងអស់' },
      ...houses.map((h) => ({ value: String(h.id), label: h.name })),
    ],
    [houses]
  );

  const selectedContract = useMemo(
    () => gen.contracts.find((c) => String(c.contractId) === contractId),
    [gen.contracts, contractId]
  );
  const contractAlreadyInvoiced = selectedContract?.alreadyInvoiced ?? false;

  // When the property filter changes the previously selected contract may no
  // longer be in scope, so clear the manual selection.
  useEffect(() => {
    setContractId('');
    setPreviewResult(null);
  }, [gen.propertyId]);

  const handlePreview = async () => {
    setError(null);
    if (!contractId) {
      setError('សូមជ្រើសរើសកិច្ចសន្យា');
      return;
    }
    if (contractAlreadyInvoiced) {
      setError('កិច្ចសន្យានេះមានវិក្កយបត្រសម្រាប់រយៈពេលនេះរួចហើយ។');
      return;
    }
    setPreviewing(true);
    try {
      const result = await preview({
        contractId: Number(contractId),
        billingYear: Number(gen.year),
        billingMonth: Number(gen.month),
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
        billingYear: Number(gen.year),
        billingMonth: Number(gen.month),
        discount: discount ? Number(discount) : null,
        dueDate: dueDate || null,
      });
      toast.success('បានបង្កើតវិក្កយបត្រ', `វិក្កយបត្រ ${created.invoiceNo} ត្រូវបានបង្កើតរួចរាល់។`);
      gen.refresh();
      navigate(`${basePath}/invoices/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'ការបង្កើតវិក្កយបត្របរាជ័យ។');
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    setBulkError(null);
    setBulkResult(null);
    setBulkGenerating(true);
    try {
      const result = await generateBulk({
        billingYear: Number(gen.year),
        billingMonth: Number(gen.month),
        discount: bulkDiscount ? Number(bulkDiscount) : null,
        ...(gen.propertyId ? { houseId: Number(gen.propertyId) } : {}),
      });
      setBulkResult(result);
      gen.refresh();
      if (result.createdCount > 0) {
        toast.success('បានបង្កើតវិក្កយបត្រទាំងអស់', `បានបង្កើត ${result.createdCount} វិក្កយបត្រ សម្រាប់ខែ ${gen.month}/${gen.year}។`);
      } else if (result.skippedCount > 0 || result.errorCount > 0) {
        toast.info('មិនមានវិក្កយបត្រថ្មី', 'វិក្កយបត្រទាំងអស់សម្រាប់ខែនេះត្រូវបានបង្កើតរួចហើយ ឬក៏មានបញ្ហា។');
      }
    } catch (err) {
      setBulkError(err.response?.data?.message || err.response?.data?.error || 'ការបង្កើតវិក្កយបត្រទាំងអស់បរាជ័យ។');
    } finally {
      setBulkGenerating(false);
    }
  };

  const handleBulkDownload = () => {
    if (!bulkResult || bulkResult.createdInvoices.length === 0) return;
    setDownloadPreviewOpen(true);
  };

  const toGenerate = gen.preview?.toGenerate ?? 0;
  const bulkButtonDisabled = gen.previewLoading || toGenerate === 0;

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

      <Tabs
        tabs={[
          { value: 'bulk', label: 'បង្កើតទាំងអស់ (Bulk)' },
          { value: 'single', label: 'បង្កើតមួយសន្លឹក' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ── BULK GENERATION TAB ─────────────────────────────────────── */}
      {activeTab === 'bulk' && (
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

          {gen.previewError && (
            <Alert variant="danger" title="កំហុស" description={gen.previewError} />
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Select
                label="អចលនទ្រព្យ"
                name="propertyId"
                placeholder={null}
                options={propertyOptions}
                value={gen.propertyId}
                onChange={(e) => {
                  gen.handlePropertyChange(e.target.value);
                  setBulkResult(null);
                }}
              />
              <Select
                label="ខែ"
                required
                name="bulkMonth"
                options={monthOptions}
                value={gen.month}
                onChange={(e) => {
                  gen.handleMonthChange(e.target.value);
                  setBulkResult(null);
                }}
              />
              <Select
                label="ឆ្នាំ"
                required
                name="bulkYear"
                options={yearOptions}
                value={gen.year}
                onChange={(e) => {
                  gen.handleYearChange(e.target.value);
                  setBulkResult(null);
                }}
              />
              <Input
                label="បញ្ចុះតម្លៃ ($)"
                type="number"
                min="0"
                step="0.01"
                name="bulkDiscount"
                value={bulkDiscount}
                onChange={(e) => {
                  setBulkDiscount(e.target.value);
                  setBulkResult(null);
                }}
                placeholder="0.00"
              />
            </div>

            {/* Preview counts */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {gen.previewLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                    <FileText className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">កិច្ចសន្យាសកម្ម</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{gen.preview?.activeContracts ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-900/20">
                    <Info className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">បានបង្កើតរួច</p>
                      <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{gen.preview?.alreadyInvoiced ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-900/20">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">នឹងបង្កើត</p>
                      <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{toGenerate}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!gen.previewLoading && toGenerate === 0 && (
              <Alert
                variant="info"
                title="គ្មានវិក្កយបត្រថ្មីដើម្បីបង្កើត"
                description="កិច្ចសន្យាសកម្មទាំងអស់នៅក្នុងជួរដែលបានជ្រើសរើសមានវិក្កយបត្រសម្រាប់រយៈពេលនេះរួចហើយ។"
              />
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                leftIcon={<Layers className="h-4 w-4" />}
                onClick={handleBulkGenerate}
                loading={bulkGenerating}
                disabled={bulkButtonDisabled}
                className="!bg-blue-600 hover:!bg-blue-700"
              >
                {`បង្កើតវិក្កយបត្រ (${toGenerate}) · ខែ ${gen.month}/${gen.year}`}
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
      )}

      {/* ── SINGLE GENERATION TAB ───────────────────────────────────── */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">ព័ត៌មានវិក្កយបត្រ</h2>

            {error && (
              <Alert variant="danger" title="កំហុស" description={error} dismissible onDismiss={() => setError(null)} />
            )}

            <div className="space-y-4">
              <Select
                label="អចលនទ្រព្យ"
                name="manualPropertyId"
                placeholder={null}
                options={propertyOptions}
                value={gen.propertyId}
                onChange={(e) => gen.handlePropertyChange(e.target.value)}
              />

              <div>
                <Label required className="mb-1.5 block">
                  កិច្ចសន្យា
                </Label>
                <ContractPicker gen={gen} value={contractId} onChange={(id) => { setContractId(id); setPreviewResult(null); }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="ខែ"
                  required
                  name="billingMonth"
                  options={monthOptions}
                  value={gen.month}
                  onChange={(e) => { gen.handleMonthChange(e.target.value); setPreviewResult(null); }}
                />
                <Select
                  label="ឆ្នាំ"
                  required
                  name="billingYear"
                  options={yearOptions}
                  value={gen.year}
                  onChange={(e) => { gen.handleYearChange(e.target.value); setPreviewResult(null); }}
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

              {contractAlreadyInvoiced && (
                <Alert
                  variant="info"
                  title="វិក្កយបត្រមានស្រាប់"
                  description="កិច្ចសន្យានេះមានវិក្កយបត្រសម្រាប់រយៈពេលនេះរួចហើយ។ មិនអាចបង្កើតបានម្តងទៀតទេ។"
                />
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />} onClick={handlePreview} loading={previewing}>
                  មើលព័ត៌មានជាមុន
                </Button>
                {previewResult && (
                  <Button
                    variant="primary"
                    leftIcon={<FileText className="h-4 w-4" />}
                    onClick={handleGenerate}
                    loading={generating}
                    disabled={contractAlreadyInvoiced}
                  >
                    បង្កើតវិក្កយបត្រ
                  </Button>
                )}
              </div>

              {gen.contracts.length === 0 && (
                <div className="pt-2">
                  <EmptyState
                    icon={FileText}
                    title="គ្មានកិច្ចសន្យាសកម្ម"
                    description="មិនមានកិច្ចសន្យាសកម្មនៅក្នុងជួរដែលបានជ្រើសរើសសម្រាប់បង្កើតវិក្កយបត្រទេ។"
                  />
                </div>
              )}
            </div>
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
                        {invoiceItemName(item, ITEM_LABELS)}
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
      )}

      <BulkInvoicePreviewModal
        open={downloadPreviewOpen}
        onClose={() => setDownloadPreviewOpen(false)}
        invoices={bulkResult?.createdInvoices || []}
        billingYear={Number(gen.year)}
        billingMonth={Number(gen.month)}
      />
    </div>
  );
}