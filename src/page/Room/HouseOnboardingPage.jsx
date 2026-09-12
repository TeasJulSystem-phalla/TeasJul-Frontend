import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  FileUp,
  UploadCloud,
  XCircle,
  AlertTriangle,
  Download,
  Building2,
  RefreshCw,
} from "lucide-react";
import { onboardingApi } from "../../api/onboarding.api";
import { useHouses } from "../../hooks/useHouses";
import { useBasePath } from "../../hooks/useBasePath.js";
import useToast from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import Card from "../../components/ui/Card";
import { formatCurrency } from "../../utils/format";

const STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  DRAFT: "សេចក្តីព្រាង",
  TERMINATED: "បញ្ចប់",
  EXPIRED: "ផុតកំណត់",
  CANCELLED: "បោះបង់",
};

const TEMPLATE_HEADERS = [
  "RoomNo",
  "TenantName",
  "Phone",
  "Email",
  "MoveInDate",
  "MonthlyRent",
  "Deposit",
  "ContractStatus",
  "DueDay",
  "Notes",
];

const HouseOnboardingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const toast = useToast();
  const { houses, loading: housesLoading } = useHouses();
  const fileInputRef = useRef(null);

  const house = houses.find((h) => String(h.id) === String(id));

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(null);
    setPreviewError(null);
    setResult(null);
    setUploading(true);
    try {
      const data = await onboardingApi.previewImport(id, selected);
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

  const handleImport = async () => {
    if (!preview || preview.invalidRows > 0) return;
    setImporting(true);
    try {
      const rows = preview.rows.map((r) => ({
        roomNo: r.roomNo,
        tenantName: r.tenantName,
        phone: r.phone,
        email: r.email,
        moveInDate: r.moveInDate,
        rent: r.rent,
        deposit: r.deposit,
        contractStatus: r.contractStatus,
        dueDay: r.dueDay,
        notes: null,
      }));
      const data = await onboardingApi.importExisting(id, rows);
      setResult(data);
      toast.success("នាំចូលទិន្នន័យជោគជ័យ", "ទិន្នន័យនៃអចលនទ្រព្យត្រូវបាននាំចូលដោយជោគជ័យ។");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការនាំចូលទិន្នន័យបរាជ័យ។";
      toast.error("កំហុស", message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = TEMPLATE_HEADERS.join(",") + "\n" +
      "A101,John Doe,012345678,john@example.com,01 Jan 2026,150,150,ACTIVE,5,\n" +
      "A102,Jane Smith,098765432,jane@example.com,01 Feb 2026,180,0,ACTIVE,5,\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    { header: "#", accessor: "rowNumber", width: "48px" },
    {
      header: "លេខបន្ទប់",
      render: (row) => <span className="font-mono">{row.roomNo || "—"}</span>,
    },
    { header: "ឈ្មោះអ្នកជួល", render: (row) => row.tenantName || "—" },
    {
      header: "លេខទូរស័ព្ទ",
      render: (row) => <span className="font-mono">{row.phone || "—"}</span>,
    },
    { header: "ថ្ងៃចូលស្នាក់នៅ", render: (row) => row.moveInDate || "—" },
    {
      header: "ថ្លៃឈ្នួលប្រចាំខែ",
      render: (row) =>
        row.rent ? formatCurrency(Number(row.rent)) : "—",
    },
    { header: "ថ្លៃធានា", render: (row) => (row.deposit ? formatCurrency(Number(row.deposit)) : "—") },
    {
      header: "ស្ថានភាព",
      render: (row) =>
        row.contractStatus ? (
          <Badge variant={row.contractStatus === "ACTIVE" ? "success" : "default"}>
            {STATUS_LABELS[row.contractStatus] || row.contractStatus}
          </Badge>
        ) : (
          "—"
        ),
    },
    {
      header: "ស្ថានភាពជួរ",
      render: (row) =>
        row.valid ? (
          <Badge variant="success">ត្រឹមត្រូវ</Badge>
        ) : (
          <Badge variant="danger">មានកំហុស</Badge>
        ),
      cellClassName: "whitespace-nowrap",
    },
    {
      header: "ព័ត៌មានលម្អិត",
      render: (row) => (
        <div className="space-y-0.5">
          {row.errors?.map((e, i) => (
            <p key={`e${i}`} className="flex items-center gap-1 text-[12px] text-red-600 dark:text-red-400">
              <XCircle className="h-3 w-3 shrink-0" /> {e}
            </p>
          ))}
          {row.warnings?.map((w, i) => (
            <p key={`w${i}`} className="flex items-center gap-1 text-[12px] text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 shrink-0" /> {w}
            </p>
          ))}
        </div>
      ),
      cellClassName: "min-w-[220px]",
    },
  ];

  if (housesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(`${basePath}/properties/${id}`)}
          >
            ត្រឡប់ក្រោយ
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
              នាំចូលទិន្នន័យអចលនទ្រព្យ
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Building2 className="h-4 w-4" />
              {house?.name || `អចលនទ្រព្យ #${id}`}
            </p>
          </div>
        </div>
      </div>

      {/* Success result */}
      {result && (
        <Alert variant="success" title="នាំចូលទិន្នន័យបានជោគជ័យ">
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <ResultStat label="បន្ទប់ថ្មី" value={result.roomsCreated} />
            <ResultStat label="អ្នកជួលថ្មី" value={result.tenantsCreated} />
            <ResultStat label="អ្នកជួលដែលមានស្រាប់" value={result.tenantsReused} />
            <ResultStat label="កិច្ចសន្យា" value={result.contractsCreated} />
            <ResultStat label="កិច្ចសន្យាអ្នកជួល" value={result.contractTenantsCreated} />
          </div>
          {result.messages?.length > 0 && (
            <ol className="mt-3 list-inside list-decimal space-y-1 text-[13px] text-slate-700 dark:text-slate-300">
              {result.messages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ol>
          )}
        </Alert>
      )}

      {/* Upload card */}
      {!preview && !result && (
        <Card>
          <div className="p-6">
            <div
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-800/50"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) {
                  fileInputRef.current.files = e.dataTransfer.files;
                  await handleFileChange({ target: { files: e.dataTransfer.files } });
                }
              }}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {uploading
                  ? "កំពុងអានឯកសារ..."
                  : "ចុច ឬអូសឯកសារមកទីនេះ ដើម្បីផ្ទុកឡើង"}
              </p>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                ទ្រង់ទ្រាយដែលគាំទ្រ៖ CSV, XLSX — ជួរទីមួយត្រូវជាចំណងជើង (header)
              </p>
              {file && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-sky-600 dark:text-sky-400">
                  <FileSpreadsheet className="h-4 w-4" /> {file.name}
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-gray-800">
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                ត្រូវការគំរូឯកសារ?
              </p>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={downloadTemplate}
              >
                ទាញយកគំរូ (CSV)
              </Button>
            </div>

            <div className="mt-4">
              <Alert variant="info" title="ផ្ទាំងជួរឈរដែលគាំទ្រ">
                <ol className="mt-1 list-inside list-decimal space-y-0.5 text-[13px] text-slate-600 dark:text-slate-300">
                  {TEMPLATE_HEADERS.map((h) => (
                    <li key={h}>
                      <span className="font-mono text-[12px]">{h}</span>
                    </li>
                  ))}
                </ol>
              </Alert>
            </div>
          </div>
        </Card>
      )}

      {/* Preview error */}
      {previewError && (
        <Alert variant="danger" title="ការអានឯកសារបរាជ័យ" description={previewError} dismissible>
          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              setPreviewError(null);
              fileInputRef.current?.click();
            }}
          >
            ព្យាយាមម្តងទៀត
          </Button>
        </Alert>
      )}

      {/* Preview table */}
      {preview && !result && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default">
                {preview.totalRows} ជួរសរុប
              </Badge>
              <Badge variant={preview.invalidRows > 0 ? "danger" : "success"}>
                {preview.invalidRows > 0 ? (
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {preview.invalidRows} មានកំហុស
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {preview.validRows} ត្រឹមត្រូវ
                  </span>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => fileInputRef.current?.click()}
              >
                ផ្លាស់ប្តូរឯកសារ
              </Button>
              <Button
                size="sm"
                leftIcon={<FileUp className="h-4 w-4" />}
                loading={importing}
                disabled={preview.invalidRows > 0}
                onClick={handleImport}
              >
                បញ្ជាក់ការនាំចូល
              </Button>
            </div>
          </div>

          {preview.invalidRows > 0 && (
            <Alert variant="warning" title="មានជួរដេរមានកំហុស">
              សូមកែតម្រូវកំហុសក្នុងឯកសារជាមុន ឬដកជួរដេរដែលមិនត្រឹមត្រូវ រួចផ្ទុកឡើងម្តងទៀត។
            </Alert>
          )}

          <Table columns={columns} data={preview.rows} />
        </div>
      )}
    </div>
  );
};

const ResultStat = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-gray-700 dark:bg-slate-800">
    <p className="text-lg font-semibold text-slate-800 dark:text-white">{value ?? 0}</p>
    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

export default HouseOnboardingPage;