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
  DoorOpen,
  RefreshCw,
  Building2,
} from "lucide-react";
import { roomApi } from "../../api/room.api";
import { useBasePath } from "../../hooks/useBasePath.js";
import { useHouses } from "../../hooks/useHouses.js";
import useToast from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import { formatCurrency } from "../../utils/format";

const STATUS_LABELS = {
  AVAILABLE: "ទំនេរ",
  OCCUPIED: "មានអ្នកស្នាក់នៅ",
  MAINTENANCE: "កំពុងជួសជុល",
  RESERVED: "បានរក្សាទុក",
};

const STATUS_STYLES = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  OCCUPIED: "bg-blue-100 text-blue-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  RESERVED: "bg-purple-100 text-purple-700",
};

const TEMPLATE_HEADERS = [
  "RoomTypeId",
  "RoomNumber",
  "Name",
  "FloorNumber",
  "MonthlyRent",
  "SecurityDeposit",
  "Capacity",
  "Status",
  "Description",
];

const RoomImportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = useBasePath();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const { houses, loading: loadingHouses } = useHouses();

  const queryHouseId = new URLSearchParams(location.search).get("houseId") || "";
  const [selectedHouseId, setSelectedHouseId] = useState(queryHouseId);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  // Set default house if query string didn't have one but houses loaded
  useEffect(() => {
    if (!selectedHouseId && houses.length > 0) {
      setSelectedHouseId(String(houses[0].id));
    }
  }, [houses, selectedHouseId]);

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
      const data = await roomApi.previewRoomImport(selectedFile, houseId);
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
        houseId: selectedHouseId,
        roomTypeId: r.roomTypeId,
        roomNumber: r.roomNumber,
        name: r.name,
        floorNumber: r.floorNumber,
        monthlyRent: r.monthlyRent,
        securityDeposit: r.securityDeposit,
        capacity: r.capacity,
        status: r.status,
        description: r.description,
      }));
      const data = await roomApi.confirmRoomImport(rows, selectedHouseId);
      setResult(data);
      toast.success(
        "ការនាំចូលបន្ទប់ជោគជ័យ",
        `បន្ទប់ចំនួន ${data.roomsCreated} ត្រូវបាននាំចូលដោយជោគជ័យ។`
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការនាំចូលបន្ទប់បរាជ័យ។";
      toast.error("កំហុស", message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv =
      TEMPLATE_HEADERS.join(",") +
      "\n" +
      "1,A101,Bedroom A,1,150,150,2,AVAILABLE,\n" +
      "1,A102,Bedroom B,2,180,200,1,AVAILABLE,\n" +
      "1,A103,Bedroom C,2,220,300,1,AVAILABLE,\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rooms-import-template.csv";
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
      header: "ផ្ទះ",
      accessor: "houseId",
      cell: (r) => {
        const hId = r.houseId || selectedHouseId;
        const found = houses.find((h) => String(h.id) === String(hId));
        return found ? found.name : hId ? `ផ្ទះ #${hId}` : <span className="text-red-500">—</span>;
      },
    },
    {
      header: "RoomTypeId",
      accessor: "roomTypeId",
      cell: (r) => r.roomTypeId || <span className="text-red-500">—</span>,
    },
    {
      header: "លេខបន្ទប់",
      accessor: "roomNumber",
      cell: (r) => r.roomNumber || <span className="text-red-500">—</span>,
    },
    {
      header: "ជាន់",
      accessor: "floorNumber",
      cell: (r) => r.floorNumber ?? <span className="text-gray-400">—</span>,
    },
    {
      header: "ថ្លៃឈ្នួល",
      accessor: "monthlyRent",
      cell: (r) =>
        r.monthlyRent ? formatCurrency(Number(r.monthlyRent)) : <span className="text-red-500">—</span>,
    },
    {
      header: "ថ្លៃធានា",
      accessor: "securityDeposit",
      cell: (r) => (r.securityDeposit ? formatCurrency(Number(r.securityDeposit)) : "0"),
    },
    {
      header: "សមត្ថភាព",
      accessor: "capacity",
      cell: (r) => r.capacity || "—",
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
          <h1 className="text-2xl font-bold text-gray-800">នាំចូលបន្ទប់ · CSV/Excel</h1>
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
            onClick={() => navigate(`${basePath}/rooms`)}
          >
            ត្រឡប់ទៅបន្ទប់
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
            label="ជ្រើសរើសផ្ទះដែលត្រូវនាំចូលបន្ទប់ *"
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
              <DoorOpen className="h-5 w-5 text-blue-600" />
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
              អាចបន្តនាំចូលបន្ទប់ចំនួន {validCount} ទៅកាន់{" "}
              <b>{houses.find((h) => String(h.id) === String(selectedHouseId))?.name || `ផ្ទះ #${selectedHouseId}`}</b> បាន។
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
              {importing ? "កំពុងនាំចូល..." : `នាំចូលបន្ទប់ ${validCount} បន្ទប់`}
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
            បន្ទប់ចំនួន <b>{result.roomsCreated}</b> ត្រូវបាននាំចូលដោយជោគជ័យទៅកាន់{" "}
            <b>{houses.find((h) => String(h.id) === String(selectedHouseId))?.name || `ផ្ទះ #${selectedHouseId}`}</b>។
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate(`${basePath}/rooms`)}
            >
              ត្រឡប់ទៅបន្ទប់
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RoomImportPage;