import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  FileUp,
  Save,
} from "lucide-react";
import { onboardingApi } from "../../api/onboarding.api";
import { useHouses } from "../../hooks/useHouses";
import { useBasePath } from "../../hooks/useBasePath.js";
import useToast from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import { formatCurrency } from "../../utils/format";

const EMPTY_ROW = {
  roomNumber: "",
  tenantFirstName: "",
  tenantLastName: "",
  tenantPhone: "",
  tenantEmail: "",
  moveInDate: "",
  monthlyRent: "",
  securityDeposit: "",
  dueDay: "5",
  contractStatus: "ACTIVE",
  notes: "",
};

const CONTRACT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "សកម្ម" },
  { value: "DRAFT", label: "សេចក្តីព្រាង" },
  { value: "EXPIRED", label: "ផុតកំណត់" },
  { value: "TERMINATED", label: "បញ្ចប់" },
  { value: "CANCELLED", label: "បោះបង់" },
];

const STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  DRAFT: "សេចក្តីព្រាង",
  TERMINATED: "បញ្ចប់",
  EXPIRED: "ផុតកំណត់",
  CANCELLED: "បោះបង់",
};

const HouseManualSetupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const toast = useToast();
  const { houses, loading: housesLoading } = useHouses();

  const house = houses.find((h) => String(h.id) === String(id));

  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const addRow = () => {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const hasContent = useMemo(
    () => rows.some((r) => r.roomNumber.trim() || r.tenantFirstName.trim()),
    [rows]
  );

  const handlePreview = async () => {
    if (!hasContent) {
      toast.warning("ព័ត៌មានមិនគ្រប់គ្រាន់", "សូមបញ្ចូលយ៉ាងហោចណាស់មួយជួរ។");
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const payload = rows
        .filter((r) => r.roomNumber.trim() || r.tenantFirstName.trim())
        .map((r) => ({
          roomNumber: r.roomNumber.trim() || null,
          tenantFirstName: r.tenantFirstName.trim() || null,
          tenantLastName: r.tenantLastName.trim() || null,
          tenantPhone: r.tenantPhone.trim() || null,
          tenantEmail: r.tenantEmail.trim() || null,
          moveInDate: r.moveInDate || null,
          monthlyRent: r.monthlyRent ? parseFloat(r.monthlyRent) : null,
          securityDeposit: r.securityDeposit ? parseFloat(r.securityDeposit) : 0,
          dueDay: r.dueDay ? parseInt(r.dueDay) : 5,
          contractStatus: r.contractStatus || "ACTIVE",
          notes: r.notes.trim() || null,
        }));
      const data = await onboardingApi.previewManualSetup(id, payload);
      setPreview(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការពិនិត្យមើលបរាជ័យ។";
      setPreviewError(message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preview || preview.invalidRows > 0) return;
    setSaving(true);
    try {
      const payload = rows
        .filter((r) => r.roomNumber.trim() || r.tenantFirstName.trim())
        .map((r) => ({
          roomNumber: r.roomNumber.trim() || null,
          tenantFirstName: r.tenantFirstName.trim() || null,
          tenantLastName: r.tenantLastName.trim() || null,
          tenantPhone: r.tenantPhone.trim() || null,
          tenantEmail: r.tenantEmail.trim() || null,
          moveInDate: r.moveInDate || null,
          monthlyRent: r.monthlyRent ? parseFloat(r.monthlyRent) : null,
          securityDeposit: r.securityDeposit ? parseFloat(r.securityDeposit) : 0,
          dueDay: r.dueDay ? parseInt(r.dueDay) : 5,
          contractStatus: r.contractStatus || "ACTIVE",
          notes: r.notes.trim() || null,
        }));
      const data = await onboardingApi.manualSetup(id, payload);
      setResult(data);
      setConfirmOpen(false);
      toast.success(
        "រក្សាទុកទិន្នន័យជោគជ័យ",
        "ទិន្នន័យនៃអចលនទ្រព្យត្រូវបានរក្សាទុកដោយជោគជ័យ។"
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការរក្សាទុកទិន្នន័យបរាជ័យ។";
      toast.error("កំហុស", message);
    } finally {
      setSaving(false);
    }
  };

  const previewColumns = [
    { header: "#", accessor: "rowNumber", width: "48px" },
    {
      header: "លេខបន្ទប់",
      render: (row) => <span className="font-mono">{row.roomNo || "—"}</span>,
    },
    { header: "ឈ្មោះអ្នកជួល", render: (row) => row.tenantName || "—" },
    {
      header: "ថ្ងៃចូលស្នាក់នៅ",
      render: (row) => row.moveInDate || "—",
    },
    {
      header: "ថ្លៃឈ្នួលប្រចាំខែ",
      render: (row) =>
        row.rent ? formatCurrency(Number(row.rent)) : "—",
    },
    {
      header: "ថ្លៃធានា",
      render: (row) =>
        row.deposit ? formatCurrency(Number(row.deposit)) : "—",
    },
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
              បញ្ចូលទិន្នន័យដែលមានស្រាប់
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Building2 className="h-4 w-4" />
              {house?.name || `អចលនទ្រព្យ #${id}`}
            </p>
          </div>
        </div>
        {!result && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={addRow}
            >
              បន្ថែមជួរ
            </Button>
            <Button
              size="sm"
              leftIcon={<FileUp className="h-4 w-4" />}
              loading={previewLoading}
              disabled={!hasContent}
              onClick={handlePreview}
            >
              ពិនិត្យមើល
            </Button>
          </div>
        )}
      </div>

      {/* Success result */}
      {result && (
        <Alert variant="success" title="រក្សាទុកទិន្នន័យបានជោគជ័យ">
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
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => navigate(`${basePath}/properties/${id}`)}
            >
              ទៅមើលអចលនទ្រព្យ
            </Button>
          </div>
        </Alert>
      )}

      {/* Preview error */}
      {previewError && (
        <Alert variant="danger" title="ការពិនិត្យមើលបរាជ័យ" description={previewError} dismissible />
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
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => setPreview(null)}
              >
                កែសម្រួល
              </Button>
              <Button
                size="sm"
                leftIcon={<Save className="h-4 w-4" />}
                disabled={preview.invalidRows > 0}
                onClick={() => setConfirmOpen(true)}
              >
                រក្សាទុក
              </Button>
            </div>
          </div>

          {preview.invalidRows > 0 && (
            <Alert variant="warning" title="មានជួរដេរមានកំហុស">
              សូមកែតម្រូវកំហុសក្នុងទម្រង់ជាមុន។
            </Alert>
          )}

          <Table columns={previewColumns} data={preview.rows} />
        </div>
      )}

      {/* Editable rows form */}
      {!preview && !result && (
        <Card>
          <div className="p-6">
            <div className="space-y-4">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="relative rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      ជួរ #{index + 1}
                    </p>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Input
                      label="លេខបន្ទប់"
                      required
                      placeholder="ឧ. A101"
                      value={row.roomNumber}
                      onChange={(e) => updateRow(index, "roomNumber", e.target.value)}
                    />
                    <Input
                      label="ឈ្មោះដំបូងអ្នកជួល"
                      required
                      placeholder="ឧ. John"
                      value={row.tenantFirstName}
                      onChange={(e) => updateRow(index, "tenantFirstName", e.target.value)}
                    />
                    <Input
                      label="ឈ្មោះចុងអ្នកជួល"
                      placeholder="ឧ. Doe"
                      value={row.tenantLastName}
                      onChange={(e) => updateRow(index, "tenantLastName", e.target.value)}
                    />
                    <Input
                      label="លេខទូរស័ព្ទ"
                      placeholder="ឧ. 012345678"
                      value={row.tenantPhone}
                      onChange={(e) => updateRow(index, "tenantPhone", e.target.value)}
                    />
                    <Input
                      label="អ៊ីមែល"
                      placeholder="ឧ. john@example.com"
                      value={row.tenantEmail}
                      onChange={(e) => updateRow(index, "tenantEmail", e.target.value)}
                    />
                    <Input
                      label="ថ្ងៃចូលស្នាក់នៅ"
                      type="date"
                      required
                      value={row.moveInDate}
                      onChange={(e) => updateRow(index, "moveInDate", e.target.value)}
                    />
                    <Input
                      label="ថ្លៃឈ្នួលប្រចាំខែ"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={row.monthlyRent}
                      onChange={(e) => updateRow(index, "monthlyRent", e.target.value)}
                    />
                    <Input
                      label="ថ្លៃធានា"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={row.securityDeposit}
                      onChange={(e) => updateRow(index, "securityDeposit", e.target.value)}
                    />
                    <Input
                      label="ថ្ងៃផ្តល់ប្រាក់"
                      type="number"
                      min="1"
                      max="31"
                      value={row.dueDay}
                      onChange={(e) => updateRow(index, "dueDay", e.target.value)}
                    />
                    <Select
                      label="ស្ថានភាពកិច្ចសន្យា"
                      options={CONTRACT_STATUS_OPTIONS}
                      value={row.contractStatus}
                      onChange={(e) => updateRow(index, "contractStatus", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={addRow}
              >
                បន្ថែមជួរថ្មី
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Confirm dialog */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="បញ្ជាក់ការរក្សាទុក"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={saving}>
              បោះបង់
            </Button>
            <Button onClick={handleSave} loading={saving}>
              រក្សាទុក
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          តើអ្នកប្រាកដថាចង់រក្សាទុកទិន្នន័យនេះ? ទិន្នន័យនឹងត្រូវបានបង្កើតជាបន្ទប់ អ្នកជួល និងកិច្ចសន្យា។
        </p>
        {preview && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-[13px] text-slate-600 dark:text-slate-400">
              សរុប៖ {preview.validRows} ជួរត្រឹមត្រូវ
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

const ResultStat = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-gray-700 dark:bg-slate-800">
    <p className="text-lg font-semibold text-slate-800 dark:text-white">{value ?? 0}</p>
    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

export default HouseManualSetupPage;
