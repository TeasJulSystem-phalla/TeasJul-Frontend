import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  DoorOpen,
  Download,
  Droplets,
  FileUp,
  RefreshCw,
  UploadCloud,
  XCircle,
  Zap,
} from 'lucide-react';
import { roomApi } from '../../api/room.api.js';
import { useBasePath } from '../../hooks/useBasePath.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useRoomTypes } from '../../hooks/useRoomType.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
} from '../../components/ui/index.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const CSV_HEADERS = [
  'Room Number',
  'Room Name',
  'Floor',
  'Monthly Rent',
  'Deposit',
  'Status',
  'Description',
  'Electricity Meter',
  'Electricity Status',
  'Water Meter',
  'Water Status',
];

const TEMPLATE_ROWS = [
  'A01,Room A01,1,150,150,AVAILABLE,Good room,EDC-A01,ACTIVE,WT-A01,ACTIVE',
  'A02,Room A02,1,160,160,AVAILABLE,Good room,EDC-A02,ACTIVE,,',
  'A03,Room A03,2,180,180,AVAILABLE,,EDC-A03,ACTIVE,,',
];

const emptyValue = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
};

const parseCsvRecords = (text) => {
  const records = [];
  let record = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      record.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      record.push(value);
      if (record.some((cell) => cell.trim())) records.push(record);
      record = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (value || record.length) {
    record.push(value);
    if (record.some((cell) => cell.trim())) records.push(record);
  }

  return records;
};

const toCommitRow = (record) => ({
  roomNumber: emptyValue(record[0]),
  name: emptyValue(record[1]),
  floorNumber: emptyValue(record[2]),
  monthlyRent: emptyValue(record[3]),
  securityDeposit: emptyValue(record[4]),
  status: emptyValue(record[5]),
  description: emptyValue(record[6]),
  electricityMeter: emptyValue(record[7]),
  electricityStatus: emptyValue(record[8]),
  waterMeter: emptyValue(record[9]),
  waterStatus: emptyValue(record[10]),
});

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  fallback;

const formatFileSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const SummaryCard = ({ icon, label, count, className }) => (
  <div className={`flex items-center gap-3 rounded-lg border p-4 ${className}`}>
    {icon}
    <div className="min-w-0">
      <p className="text-2xl font-bold leading-none text-slate-900 dark:text-white">{count}</p>
      <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  </div>
);

const RoomMeterImportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = useBasePath();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const { houses, loading: loadingHouses } = useHouses();
  const { roomTypes, loading: loadingRoomTypes } = useRoomTypes();

  const queryHouseId = new URLSearchParams(location.search).get('houseId') || '';
  const [selectedHouseId, setSelectedHouseId] = useState(queryHouseId);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [selectedInstallDate, setSelectedInstallDate] = useState('');
  const [file, setFile] = useState(null);
  const [commitRows, setCommitRows] = useState([]);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);

  const parseSelectedFile = async (selectedFile) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      throw new Error('សូមជ្រើសរើសឯកសារ CSV ប៉ុណ្ណោះ។');
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      throw new Error('ឯកសារ CSV ត្រូវតែមានទំហំតូចជាង 5 MB។');
    }

    const records = parseCsvRecords((await selectedFile.text()).replace(/^\uFEFF/, ''));
    if (records.length < 2) {
      throw new Error('ឯកសារត្រូវមានជួរក្បាល និងទិន្នន័យយ៉ាងហោចណាស់មួយជួរ។');
    }

    const header = records[0].map((cell) => cell.trim());
    if (header.length !== CSV_HEADERS.length || header.some((cell, index) => cell !== CSV_HEADERS[index])) {
      throw new Error('ទម្រង់ CSV មិនត្រឹមត្រូវ។ សូមប្រើគំរូបន្ទប់ + ម៉ែត្រ។');
    }

    const rows = records.slice(1);
    if (rows.some((record) => record.length > CSV_HEADERS.length)) {
      throw new Error('ជួរទិន្នន័យមួយមានចំនួនជួរឈរច្រើនពេក។');
    }

    return rows.map(toCommitRow);
  };

  const runPreview = async ({
    selectedFile = file,
    houseId = selectedHouseId,
    roomTypeId = selectedRoomTypeId,
    installDate = selectedInstallDate,
  } = {}) => {
    if (!selectedFile || !houseId || !roomTypeId || previewing) return;
    setPreview(null);
    setPreviewError(null);
    setPreviewing(true);
    try {
      const rows = await parseSelectedFile(selectedFile);
      const data = await roomApi.previewRoomMeterImport(
        selectedFile,
        houseId,
        roomTypeId,
        installDate || undefined
      );
      setCommitRows(rows);
      setPreview(data);
    } catch (error) {
      setCommitRows([]);
      setPreviewError(error.message || getErrorMessage(error, 'ការអានឯកសារបរាជ័យ។'));
    } finally {
      setPreviewing(false);
    }
  };

  const handleFileChange = async (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFileError(null);
    setFile(selected);
    try {
      const rows = await parseSelectedFile(selected);
      setCommitRows(rows);
      if (selectedHouseId && selectedRoomTypeId) {
        await runPreview({ selectedFile: selected });
      } else {
        setPreview(null);
        setPreviewError(null);
      }
    } catch (error) {
      setCommitRows([]);
      setPreview(null);
      setPreviewError(null);
      setFileError(error.message);
    }
  };

  const chooseAnotherFile = () => {
    setPreview(null);
    setPreviewError(null);
    fileInputRef.current?.click();
  };

  const handleHouseChange = async (event) => {
    const nextHouseId = event.target.value;
    setSelectedHouseId(nextHouseId);
    setPreview(null);
    setPreviewError(null);
    if (file && nextHouseId && selectedRoomTypeId && !previewing) {
      await runPreview({ houseId: nextHouseId });
    }
  };

  const handleRoomTypeChange = async (event) => {
    const nextRoomTypeId = event.target.value;
    setSelectedRoomTypeId(nextRoomTypeId);
    setPreview(null);
    setPreviewError(null);
    if (file && selectedHouseId && nextRoomTypeId && !previewing) {
      await runPreview({ roomTypeId: nextRoomTypeId });
    }
  };

  const handleInstallDateChange = async (event) => {
    const nextDate = event.target.value;
    setSelectedInstallDate(nextDate);
    if (file && selectedHouseId && selectedRoomTypeId && !previewing) {
      await runPreview({ installDate: nextDate });
    }
  };

  const downloadTemplate = () => {
    const csv = `${CSV_HEADERS.join(',')}\n${TEMPLATE_ROWS.join('\n')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'rooms-meters-import-template.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (
      !preview ||
      preview.invalidRows > 0 ||
      !commitRows.length ||
      !selectedHouseId ||
      !selectedRoomTypeId ||
      importing
    ) {
      return;
    }
    setImporting(true);
    try {
      const result = await roomApi.confirmRoomMeterImport({
        houseId: Number(selectedHouseId),
        roomTypeId: Number(selectedRoomTypeId),
        installDate: selectedInstallDate || undefined,
        rows: commitRows,
      });
      toast.success(
        'ការនាំចូលបន្ទប់ + ម៉ែត្រជោគជ័យ',
        `បាននាំចូលបន្ទប់ ${result.roomsCreated} និងម៉ែត្រ ${result.metersCreated} ដោយជោគជ័យ។`
      );
      navigate(`${basePath}/rooms`);
    } catch (error) {
      toast.error('ការនាំចូលបរាជ័យ', getErrorMessage(error, 'ការនាំចូលបន្ទប់ + ម៉ែត្របរាជ័យ។'));
    } finally {
      setImporting(false);
    }
  };

  const rows = preview?.rows || [];
  const roomCount = preview?.totalRows || 0;
  const electricityCount = rows.filter((row) => row.electricityMeter).length;
  const waterCount = rows.filter((row) => row.waterMeter).length;
  const warningCount = rows.reduce((count, row) => count + (row.warnings?.length || 0), 0);
  const errorCount = rows.reduce((count, row) => count + (row.errors?.length || 0), 0);
  const selectedHouse = houses.find((house) => String(house.id) === String(selectedHouseId));
  const selectedRoomType = roomTypes.find((roomType) => String(roomType.id) === String(selectedRoomTypeId));
  const hasFileErrors = Boolean(fileError || previewError);
  const missingSelections = !selectedHouseId || !selectedRoomTypeId;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(`${basePath}/rooms`)}
        >
          ត្រឡប់ទៅការគ្រប់គ្រងបន្ទប់
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          នាំចូលបន្ទប់ + ម៉ែត្រ
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          នាំចូលបន្ទប់ជាមួយម៉ែត្រអគ្គិសនី និងទឹកតាមឯកសារ CSV។
        </p>
      </div>

      {/* Step 1 — CSV File */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">ជំហានទី 1 · ឯកសារ CSV</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              ជ្រើសរើសផ្ទះ ប្រភេទបន្ទប់ និងឯកសារ CSV (ជួរឈរ Room Number ដល់ Water Status)។
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={downloadTemplate}
          >
            ទាញយកគំរូ CSV
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="ផ្ទះ *"
            placeholder="ជ្រើសរើសផ្ទះ"
            options={houses.map((house) => ({ value: String(house.id), label: house.name }))}
            value={selectedHouseId}
            onChange={handleHouseChange}
            disabled={loadingHouses}
          />

          <Select
            label="ប្រភេទបន្ទប់ *"
            placeholder="ជ្រើសរើសប្រភេទបន្ទប់"
            options={roomTypes.map((roomType) => ({ value: String(roomType.id), label: roomType.name }))}
            value={selectedRoomTypeId}
            onChange={handleRoomTypeChange}
            disabled={loadingRoomTypes}
          />
        </div>

        <Input
          type="date"
          label="កាលបរិច្ឆេទដំឡើងម៉ែត្រ (ជាជម្រើស)"
          leftIcon={<CalendarDays className="h-4 w-4" />}
          value={selectedInstallDate}
          onChange={handleInstallDateChange}
          helperText="ទុកទទេ ដើម្បីប្រើថ្ងៃបច្ចុប្បន្នដោយស្វ័យប្រវត្តិ។"
        />

        <button
          type="button"
          onClick={() => {
            if (!previewing) fileInputRef.current?.click();
          }}
          disabled={previewing}
          className="flex min-h-28 w-full items-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 text-left transition hover:border-primary hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary dark:hover:bg-gray-800/60"
        >
          {previewing ? (
            <RefreshCw className="h-9 w-9 shrink-0 animate-spin text-primary" />
          ) : (
            <UploadCloud className="h-9 w-9 shrink-0 text-primary" />
          )}
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-800 dark:text-white">
              {file ? file.name : 'ជ្រើសរើសឯកសារ CSV'}
            </span>
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              {file
                ? `ទំហំ ${formatFileSize(file.size)} · គាំទ្រតែ .csv`
                : 'គាំទ្រតែទ្រង់ទ្រាយ .csv · ទំហំអតិបរមា 5 MB'}
            </span>
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </button>

        {(fileError || previewError) && (
          <Alert variant="danger" title="CSV មិនអាចប្រើបាន" icon={<AlertTriangle className="h-5 w-5" />}>
            {fileError || previewError}
          </Alert>
        )}

        {file && !hasFileErrors && missingSelections && (
          <Alert variant="warning" title="តម្រូវឱ្យជ្រើសរើសផ្ទះ និងប្រភេទបន្ទប់" icon={<AlertTriangle className="h-5 w-5" />}>
            សូមជ្រើសរើសផ្ទះ និងប្រភេទបន្ទប់ ដើម្បីពិនិត្យមុននាំចូល។
          </Alert>
        )}
      </Card>

      {/* Step 2 — Preview */}
      {preview && (
        <Card className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">ជំហានទី 2 · ពិនិត្យមុននាំចូល</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">ឯកសារ {file?.name || ''}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <SummaryCard
              icon={<DoorOpen className="h-5 w-5 text-slate-600 dark:text-slate-300" />}
              label="បន្ទប់"
              count={roomCount}
              className="bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-slate-300"
            />
            <SummaryCard
              icon={<Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
              label="អគ្គិសនី"
              count={electricityCount}
              className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
            />
            <SummaryCard
              icon={<Droplets className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
              label="ទឹក"
              count={waterCount}
              className="bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400"
            />
            <SummaryCard
              icon={<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
              label="ការព្រមាន"
              count={warningCount}
              className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
            />
            <SummaryCard
              icon={<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
              label="កំហុស"
              count={errorCount}
              className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
            />
          </div>

          {preview.invalidRows > 0 ? (
            <Alert variant="danger" title={`មានកំហុស ${preview.invalidRows} ជួរ`} icon={<AlertTriangle className="h-5 w-5" />}>
              <div className="space-y-2">
                <p>សូមកែសម្រួលឯកសារ ហើយផ្ទុកឡើងវិញ មុនពេលនាំចូល។</p>
                <Button variant="outline" size="sm" leftIcon={<FileUp className="h-4 w-4" />} onClick={chooseAnotherFile}>
                  ផ្ទុកឡើងវិញ
                </Button>
              </div>
            </Alert>
          ) : (
            <Alert variant="success" title="ឯកសារអាចនាំចូលបាន" icon={<CheckCircle2 className="h-5 w-5" />}>
              ទិន្នន័យនឹងបញ្ចូលទៅក្នុង {selectedHouse?.name} · ប្រភេទបន្ទប់ {selectedRoomType?.name}។
              {' '}កាលបរិច្ឆេទដំឡើងម៉ែត្រ៖ {selectedInstallDate || 'ថ្ងៃបច្ចុប្បន្ន'}។
            </Alert>
          )}

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-800">
              <thead className="bg-slate-50 dark:bg-gray-800/60">
                <tr>
                  {['#', 'Room', 'Name', 'Floor', 'Rent', 'Deposit', 'Status', 'Electricity', 'Water', 'Row', 'Details'].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td className="px-3 py-3 text-xs text-slate-400">{row.rowNumber}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-slate-800 dark:text-white">
                      {row.roomNumber || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {row.name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {row.floorNumber || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {row.monthlyRent || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {row.securityDeposit || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {row.status || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {row.electricityMeter || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {row.waterMeter || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm">
                      {row.valid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" /> Error
                        </span>
                      )}
                    </td>
                    <td className="min-w-72 px-3 py-3 text-xs">
                      {row.errors?.map((message) => (
                        <p key={`error-${message}`} className="text-red-600">
                          {message}
                        </p>
                      ))}
                      {row.warnings?.map((message) => (
                        <p key={`warning-${message}`} className="text-amber-600">
                          {message}
                        </p>
                      ))}
                      {!row.errors?.length && !row.warnings?.length && (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {preview.invalidRows > 0 && (
              <Button variant="outline" leftIcon={<FileUp className="h-4 w-4" />} onClick={chooseAnotherFile}>
                ផ្ទុកឡើងវិញ
              </Button>
            )}
            <Button
              onClick={handleImport}
              loading={importing}
              disabled={!preview || preview.invalidRows > 0 || previewing || importing || !commitRows.length || hasFileErrors || missingSelections}
              leftIcon={<FileUp className="h-4 w-4" />}
            >
              នាំចូល
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RoomMeterImportPage;