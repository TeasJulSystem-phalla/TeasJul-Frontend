import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileUp,
  UploadCloud,
  XCircle,
  AlertTriangle,
  Download,
  Gauge,
  RefreshCw,
  Building2,
} from "lucide-react";
import { utilityMeterApi } from "../../api/utilityMeter.api";
import { useBasePath } from "../../hooks/useBasePath.js";
import { useHouses } from "../../hooks/useHouses.js";
import { useRooms } from "../../hooks/useRooms.js";
import { useUtilityTypes } from "../../hooks/useUtilityTypes.js";
import useToast from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";

const STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
  REPLACED: "បានជំនួស",
};

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-amber-100 text-amber-700",
  REPLACED: "bg-gray-100 text-gray-600",
};

const TEMPLATE_HEADERS = [
  "HouseId",
  "RoomId",
  "UtilityTypeId",
  "MeterNumber",
  "InstalledAt",
  "Status",
];

const UtilityMeterImportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = useBasePath();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const { houses, loading: loadingHouses } = useHouses();
  const { rooms } = useRooms();
  const { types } = useUtilityTypes();

  const queryHouseId = new URLSearchParams(location.search).get("houseId") || "";
  const [selectedHouseId, setSelectedHouseId] = useState(queryHouseId);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!selectedHouseId && houses.length > 0) {
      setSelectedHouseId(String(houses[0].id));
    }
  }, [houses, selectedHouseId]);

  const houseMap = Object.fromEntries(houses.map((h) => [String(h.id), h]));
  const roomMap = Object.fromEntries(rooms.map((r) => [String(r.id), r]));
  const typeMap = Object.fromEntries(types.map((t) => [String(t.id), t]));

  const getHouseLabel = (houseId) =>
    houseMap[String(houseId)]?.name || (houseId ? `អចលនទ្រព្យ #${houseId}` : null);
  const getRoomLabel = (roomId) =>
    roomId && roomMap[String(roomId)]
      ? roomMap[String(roomId)].roomNumber || roomMap[String(roomId)].name || `បន្ទប់ #${roomId}`
      : roomId
        ? `បន្ទប់ #${roomId}`
        : null;
  const getTypeLabel = (typeId) =>
    typeMap[String(typeId)]?.name || (typeId ? `ប្រភេទ #${typeId}` : null);

  const handleHouseSelect = (houseId) => {
    setSelectedHouseId(houseId);
    if (file && houseId) {
      triggerPreview(file, houseId);
    } else if (!houseId) {
      setPreview(null);
    }
  };

  const triggerPreview = async (selectedFile, houseId) => {
    setPreview(null);
    setPreviewError(null);
    setResult(null);
    setUploading(true);
    try {
      const data = await utilityMeterApi.previewMeterImport(selectedFile, houseId);
      setPreview(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការអានឯកសារបរាជ័យ។ សូមប្រាកដថាទ្រង់ទ្រាយ CSV/Excel ត្រឹមត្រូវ។";
      setPreviewError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selectedHouseId) {
      toast.error("សូមជ្រើសរើសផ្ទះ", "សូមជ្រើសរើសផ្ទះជាមុនសិន មុននឹងជ្រើសរើសឯកសារ។");
      return;
    }
    setFile(selected);
    await triggerPreview(selected, selectedHouseId);
  };

  const handleImport = async () => {
    if (!preview || preview.invalidRows > 0 || !selectedHouseId) return;
    setImporting(true);
    try {
      const rows = preview.rows.map((r) => ({
        houseId: r.houseId,
        roomId: r.roomId,
        utilityTypeId: r.utilityTypeId,
        meterNumber: r.meterNumber,
        installedAt: r.installedAt,
        status: r.status,
      }));
      const data = await utilityMeterApi.confirmMeterImport(rows, selectedHouseId);
      setResult(data);
      toast.success(
        "ការនាំចូលម៉ែត្រជោគជ័យ",
        `ម៉ែត្រចំនួន ${data.metersCreated} ត្រូវបាននាំចូលដោយជោគជ័យ។`
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការនាំចូលម៉ែត្របរាជ័យ។";
      toast.error("កំហុស", message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv =
      TEMPLATE_HEADERS.join(",") +
      "\n" +
      "1,1,1,EL-001,2026-01-15,ACTIVE\n" +
      "1,2,2,W-001,2026-01-15,ACTIVE\n" +
      "1,3,1,EL-002,2026-01-15,INACTIVE\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meters-import-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: "#",
      accessor: "rowNumber",
      cell: (r) => <span className="text-gray-500">{r.rowNumber}</span>,
    },
    {
      header: "អចលនទ្រព្យ",
      accessor: "houseId",
      cell: (r) => {
        const label = getHouseLabel(r.houseId);
        return label ? (
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-slate-400" />
            {label}
          </span>
        ) : (
          <span className="text-red-500">—</span>
        );
      },
    },
    {
      header: "បន្ទប់",
      accessor: "roomId",
      cell: (r) => getRoomLabel(r.roomId) || <span className="text-gray-400">—</span>,
    },
    {
      header: "ប្រភេទប្រើប្រាស់",
      accessor: "utilityTypeId",
      cell: (r) => getTypeLabel(r.utilityTypeId) || <span className="text-red-500">—</span>,
    },
    {
      header: "លេខម៉ែត្រ",
      accessor: "meterNumber",
      cell: (r) => r.meterNumber || <span className="text-red-500">—</span>,
    },
    {
      header: "បានដំឡើង",
      accessor: "installedAt",
      cell: (r) => r.installedAt || <span className="text-gray-400">—</span>,
    },
    {
      header: "ស្ថានភាព",
      accessor: "status",
      cell: (r) =>
        r.status ? (
          <Badge className={STATUS_STYLES[r.status] || ""}>{STATUS_LABELS[r.status] || r.status}</Badge>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      header: "ស្ថានភាពជួរ",
      accessor: "valid",
      cell: (r) =>
        r.valid ? (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> ត្រឹមត្រូវ
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-500">
            <XCircle className="h-4 w-4" /> មានកំហុស
          </span>
        ),
    },
    {
      header: "ព័ត៌មានលម្អិត",
      accessor: "errors",
      cell: (r) => {
        const errors = r.errors || [];
        const warnings = r.warnings || [];
        return (
          <div className="flex flex-col gap-1 text-xs">
            {errors.map((msg, idx) => (
              <span key={idx} className="text-red-500">• {msg}</span>
            ))}
            {warnings.map((msg, idx) => (
              <span key={idx} className="text-amber-500">• {msg}</span>
            ))}
          </div>
        );
      },
    },
  ];

  const validCount = preview ? preview.totalRows - preview.invalidRows : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">នាំចូលម៉ែត្រប្រើប្រាស់ · CSV/Excel</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={downloadTemplate}
          >
            ទាញយកគំរូ CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(`${basePath}/utilities/meters`)}
          >
            ត្រឡប់ទៅម៉ែត្រ
          </Button>
        </div>
      </div>

      {/* Step 1: House selection & upload */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">ជំហានទី 1 · ជ្រើសរើសផ្ទះ និង ឯកសារ</h2>
        </div>

        <div className="max-w-md">
          <Select
            label="ជ្រើសរើសផ្ទះដែលត្រូវនាំចូលម៉ែត្រ *"
            options={[
              { value: "", label: "-- ជ្រើសរើសផ្ទះ --" },
              ...houses.map((h) => ({ value: String(h.id), label: h.name })),
            ]}
            value={selectedHouseId}
            onChange={(e) => handleHouseSelect(e.target.value)}
            disabled={loadingHouses}
          />
        </div>

        {!selectedHouseId ? (
          <Alert variant="warning" title="មិនទាន់បានជ្រើសរើសផ្ទះ">
            សូមជ្រើសរើសផ្ទះជាមុនសិន មុននឹងជ្រើសរើសឯកសារ ឬទាញយកគំរូ CSV។
          </Alert>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition hover:border-blue-400 hover:bg-blue-50"
          >
            {uploading ? (
              <RefreshCw className="mb-2 h-10 w-10 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="mb-2 h-10 w-10 text-blue-600" />
            )}
            <p className="text-sm font-medium text-gray-700">
              {file ? file.name : "ចុច ឬអូសឯកសារមកទីនេះ"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              គាំទ្រទ្រង់ទ្រាយ .csv, .xlsx, .xls (មិនចាំបាច់មាន HouseId ក្នុងឯកសារទេ)
            </p>
            <span className="mt-3 inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
              <FileUp className="h-3.5 w-3.5" /> ជ្រើសរើសឯកសារ
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={handleFileChange}
            />
          </button>
        )}

        {previewError && (
          <Alert variant="error" title="ការអានឯកសារបរាជ័យ" icon={<AlertTriangle className="h-5 w-5" />}>
            {previewError}
          </Alert>
        )}
      </Card>

      {/* Step 2: preview */}
      {preview && (
        <Card className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">ជំហានទី 2 · ពិនិត្យមុននាំចូល</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge className="bg-gray-100 text-gray-600">សរុប {preview.totalRows}</Badge>
              <Badge className="bg-emerald-100 text-emerald-700">ត្រឹមត្រូវ {validCount}</Badge>
              {preview.invalidRows > 0 && (
                <Badge className="bg-red-100 text-red-700">កំហុស {preview.invalidRows}</Badge>
              )}
            </div>
          </div>

          {preview.invalidRows > 0 ? (
            <Alert variant="error" title="ឯកសារមានជួរដេកដែលមិនត្រឹមត្រូវ">
              សូមកែតម្រូវជួរដេកដែលមានកំហុស ហើយផ្ទុកឡើងវិញ។ គ្មានទិន្នន័យណាត្រូវបាននាំចូលឡើយ។
            </Alert>
          ) : (
            <Alert
              variant="success"
              title="ឯកសារត្រឹមត្រូវទាំងអស់"
              icon={<CheckCircle2 className="h-5 w-5" />}
            >
              អាចបន្តនាំចូលម៉ែត្រចំនួន {validCount} ទៅកាន់{" "}
              <b>{houses.find((h) => String(h.id) === String(selectedHouseId))?.name || `អចលនទ្រព្យ #${selectedHouseId}`}</b> បាន។
            </Alert>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table columns={columns} data={preview.rows} />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleImport}
              disabled={importing || preview.invalidRows > 0 || !selectedHouseId}
              leftIcon={importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            >
              {importing ? "កំពុងនាំចូល..." : `នាំចូលម៉ែត្រ ${validCount} គ្រឿង`}
            </Button>
          </div>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">បានបញ្ចប់ការនាំចូល</h2>
          </div>
          <p className="text-sm text-gray-600">
            ម៉ែត្រចំនួន <b>{result.metersCreated}</b> ត្រូវបាននាំចូលដោយជោគជ័យទៅកាន់{" "}
            <b>{houses.find((h) => String(h.id) === String(selectedHouseId))?.name || `អចលនទ្រព្យ #${selectedHouseId}`}</b>។
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate(`${basePath}/utilities/meters`)}
            >
              ត្រឡប់ទៅម៉ែត្រ
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UtilityMeterImportPage;