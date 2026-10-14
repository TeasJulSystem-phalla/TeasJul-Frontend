import { useNavigate } from "react-router-dom";
import { Pencil, Home, Building2, DoorOpen, Layers } from "lucide-react";
import {
  Card,
  Button,
  Table,
  Badge,
  Skeleton,
  EmptyState,
  Pagination,
} from "../../components/ui/index.js";
import PublicationStatusBadge from "../../components/room/PublicationStatusBadge.jsx";
import { formatCurrency, formatDate } from "../../utils/format.js";
import {
  PROPERTY_TYPE_LABELS,
} from "./adminPropertyConstants.js";

const PROPERTY_TYPE_ICONS = {
  ROOM: DoorOpen,
  HOUSE: Home,
  VILLA: Home,
  APARTMENT: Building2,
  CONDO: Building2,
  OTHER: Layers,
};

// Shared table + pagination + empty state for the admin property posts list.
// The list page and the drafts page delegate their rendering here.
// `actionLabel` controls the row action wording: "បន្តកែសម្រួល" on a draft
// (continue editing) vs "កែសម្រួល" on the general listing.
const AdminPropertiesTable = ({
  content,
  loading,
  totalPages,
  totalElements,
  page,
  setPage,
  emptyAction,
  actionLabel = "កែសម្រួល",
}) => {
  const navigate = useNavigate();

  if (loading && !content.length) {
    return <Skeleton className="h-80 rounded-xl" />;
  }

  const columns = [
    {
      header: "អចលនទ្រព្យ",
      render: (row) => {
        const Icon = PROPERTY_TYPE_ICONS[row.propertyType] || Home;
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
              <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-white">
                {row.propertyName || "—"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {row.roomName || row.roomNumber
                  ? `${row.roomName || "បន្ទប់"} ${row.roomNumber ? `#${row.roomNumber}` : ""}`.trim()
                  : "អចលនទ្រព្យទាំងមូល"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "ទីតាំង",
      render: (row) => (
        <span className="block max-w-[180px] truncate text-sm text-slate-600 dark:text-slate-300">
          {row.address || "—"}
        </span>
      ),
    },
    {
      header: "ប្រភេទ",
      render: (row) => (
        <Badge variant="neutral">
          {PROPERTY_TYPE_LABELS[row.propertyType] || row.propertyType || "—"}
        </Badge>
      ),
    },
    {
      header: "ថ្លៃជួល",
      render: (row) => (
        <span className="text-sm font-medium text-slate-800 dark:text-white">
          {formatCurrency(row.monthlyRent)}
        </span>
      ),
    },
    {
      header: "ម្ចាស់",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
            {row.ownerName || "—"}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {row.accountOwner ? "គណនី OWNER" : "កំណត់ត្រាក្រៅប្រព័ន្ធ"}
          </p>
        </div>
      ),
    },
    {
      header: "ស្ថានភាព",
      render: (row) => <PublicationStatusBadge status={row.publicationStatus} />,
    },
    {
      header: "ធ្វើបច្ចុប្បន្នភាព",
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(row.updatedAt)}
        </span>
      ),
    },
    {
      header: "",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Pencil className="h-3.5 w-3.5" />}
          onClick={() => navigate(`/admin/properties/${row.roomId}/edit`)}
        >
          {actionLabel}
        </Button>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden rounded-xl">
      <div className="hidden md:block">
        <Table columns={columns} data={content} />
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {content.map((row) => {
          const Icon = PROPERTY_TYPE_ICONS[row.propertyType] || Home;
          return (
            <div
              key={row.id}
              className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
                    <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-white">
                      {row.propertyName || "—"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {row.roomName || row.roomNumber
                        ? `${row.roomName || "បន្ទប់"} ${row.roomNumber ? `#${row.roomNumber}` : ""}`.trim()
                        : "អចលនទ្រព្យទាំងមូល"}
                    </p>
                  </div>
                </div>
                <PublicationStatusBadge status={row.publicationStatus} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="neutral">
                  {PROPERTY_TYPE_LABELS[row.propertyType] || row.propertyType || "—"}
                </Badge>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">
                  {formatCurrency(row.monthlyRent)}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <p className="truncate">{row.address || "—"}</p>
                <p className="truncate">
                  ម្ចាស់: {row.ownerName || "—"}
                  <span className="ml-1 text-slate-400">
                    {row.accountOwner ? "(គណនី OWNER)" : "(កំណត់ត្រាក្រៅប្រព័ន្ធ)"}
                  </span>
                </p>
                <p>ធ្វើបច្ចុប្បន្នភាព {formatDate(row.updatedAt)}</p>
              </div>

              <div className="mt-3 flex justify-end border-t border-slate-100 pt-3 dark:border-gray-800">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Pencil className="h-3.5 w-3.5" />}
                  onClick={() => navigate(`/admin/properties/${row.roomId}/edit`)}
                >
                  {actionLabel}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && !content.length && (
        <div className="p-6">
          <EmptyState
            icon={Home}
            title="រកមិនឃើញអចលនទ្រព្យ"
            description="មិនមានអចលនទ្រព្យត្រូវនឹងលក្ខខណ្ឌទេ។"
            action={emptyAction}
          />
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2 border-t border-slate-100 p-3 dark:border-gray-800 sm:flex-row sm:justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            សរុប {totalElements} អចលនទ្រព្យ
          </span>
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
        </div>
      )}
    </Card>
  );
};

export default AdminPropertiesTable;