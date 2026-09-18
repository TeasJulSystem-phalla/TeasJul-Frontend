import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { Card, Button, Input, Select, Alert } from "../../components/ui/index.js";
import { useAdminProperties } from "../../hooks/useAdminProperties.js";
import AdminPropertiesTable from "./AdminPropertiesTable.jsx";
import { PROPERTY_TYPE_OPTIONS } from "./adminPropertyConstants.js";

// Admin drafts list — pinned to publicationStatus=DRAFT. These drafts live
// entirely in the SUPER_ADMIN posting flow and never enter the OWNER portal.
export default function AdminDraftsPage() {
  const navigate = useNavigate();
  const {
    content,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    search,
    typeFilter,
    setPage,
    setSearch,
    setTypeFilter,
    fetchProperties,
  } = useAdminProperties({ initialStatus: "DRAFT" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            ព្រាងអចលនទ្រព្យ
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ព្រាងដែលរក្សាទុកដោយអ្នកបង្កើតប្រព័ន្ធ — អាចបន្តកែសម្រួលបាន ដោយមិនចូលទៅកាន់ផ្ទាំង OWNER ឡើយ។
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate("/admin/properties/new")}
          >
            ផ្សាយអចលនទ្រព្យថ្មី
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchProperties}
            disabled={loading}
          >
            ធ្វើឱ្យស្រស់
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="កំហុស"
          description={error}
          dismissible
          onClose={() => fetchProperties()}
          className="mb-4"
        >
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={fetchProperties}>
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            placeholder="ស្វែងរកតាមឈ្មោះ អាសយដ្ឋាន..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            placeholder="ប្រភេទទាំងអស់"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={PROPERTY_TYPE_OPTIONS}
          />
        </div>
      </Card>

      <AdminPropertiesTable
        content={content}
        loading={loading}
        totalPages={totalPages}
        totalElements={totalElements}
        page={page}
        setPage={setPage}
        actionLabel="បន្តកែសម្រួល"
        emptyAction={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate("/admin/properties/new")}
          >
            បង្កើតអចលនទ្រព្យថ្មី
          </Button>
        }
      />
    </div>
  );
}