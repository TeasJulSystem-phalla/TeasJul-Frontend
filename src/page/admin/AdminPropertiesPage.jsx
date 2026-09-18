import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { Card, Button, Input, Select, Alert } from "../../components/ui/index.js";
import { useAdminProperties } from "../../hooks/useAdminProperties.js";
import AdminPropertiesTable from "./AdminPropertiesTable.jsx";
import { PROPERTY_TYPE_OPTIONS, PUBLICATION_STATUS_OPTIONS } from "./adminPropertyConstants.js";

export default function AdminPropertiesPage() {
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
    statusFilter,
    setPage,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    fetchProperties,
  } = useAdminProperties();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            បញ្ជីអចលនទ្រព្យ (ការផ្សាយជំនួសម្ចាស់)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            អចលនទ្រព្យដែលបានផ្សាយដោយអ្នកបង្កើតប្រព័ន្ធ — ដាច់ដោយឡែកពីផ្ទាំងគ្រប់គ្រងរបស់ OWNER។
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            placeholder="ស្វែងរកតាមឈ្មោះ អាសយដ្ឋាន..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:col-span-1"
          />
          <Select
            placeholder="ប្រភេទទាំងអស់"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={PROPERTY_TYPE_OPTIONS}
          />
          <Select
            placeholder="ស្ថានភាពទាំងអស់"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={PUBLICATION_STATUS_OPTIONS}
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
        actionLabel="កែសម្រួល"
        emptyAction={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate("/admin/properties/new")}
          >
            ផ្សាយអចលនទ្រព្យថ្មី
          </Button>
        }
      />
    </div>
  );
}