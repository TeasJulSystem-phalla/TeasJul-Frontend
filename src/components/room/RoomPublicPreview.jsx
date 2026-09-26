import { useState } from "react";
import {
  BedDouble,
  UsersRound,
  Ruler,
  Banknote,
  Image as ImageIcon,
  Building2,
  Layers,
  CheckCircle2,
  Star,
  Zap,
} from "lucide-react";
import { Modal } from "../ui/index.js";
import RoomCard from "../public/RoomCard.jsx";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value) || 0
  );

const asImages = (images) =>
  (images || [])
    .map((img) => (typeof img === "string" ? { secureUrl: img } : img))
    .filter((img) => img && img.secureUrl);

const toAmenityNames = (amenities) =>
  (amenities || [])
    .map((a) => a?.amenityName || a?.name)
    .filter(Boolean);

const statusLabel = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "ទំនេរ (Available)";
    case "OCCUPIED":
      return "មានអ្នកស្នាក់នៅ (Occupied)";
    case "MAINTENANCE":
      return "កំពុងជួសជុល (Maintenance)";
    case "RESERVED":
      return "បានកក់ (Reserved)";
    default:
      return status || "—";
  }
};

/**
 * Public-facing preview of a room listing. Renders the SAME card component
 * used on the real website (`components/public/RoomCard`), then appends the
 * full listing details (deposit, house, room type, description, amenities,
 * utilities) when `expanded` so a "view details" flow shows everything.
 */
const RoomPublicPreview = ({
  room,
  house,
  roomType,
  images = [],
  amenities = [],
  utilities = [],
  expanded = true,
  onViewDetails,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const list = asImages(images);
  const amenityNames = toAmenityNames(amenities);
  const houseName = house?.name || room?.houseName || "";
  const roomTypeName = roomType?.name || room?.roomTypeName || "";
  const detailsOpen = expanded || showDetails;

  const detailsRow = [
    { icon: Banknote, label: "ប្រាក់កក់", value: formatCurrency(room?.securityDeposit) },
    { icon: Building2, label: "ផ្ទះ", value: houseName || "—" },
    { icon: Layers, label: "ប្រភេទបន្ទប់", value: roomTypeName || "—" },
    { icon: Star, label: "ស្ថានភាព", value: statusLabel(room?.status) },
  ];

  return (
    <div>
      <RoomCard
        room={room}
        house={house}
        roomType={roomType}
        images={images}
        onViewDetails={expanded ? null : onViewDetails}
      />

      {!expanded && !onViewDetails && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-[#0f2942]/30 px-3 py-2 text-[12.5px] font-semibold text-[#0f2942] transition-colors hover:bg-[#0f2942]/5 dark:border-white/20 dark:text-white"
          >
            {detailsOpen ? "បង្រួមលម្អិត (Collapse)" : "មើលលម្អិត (View details)"}
          </button>
        </div>
      )}

      {detailsOpen && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {detailsRow.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5 dark:border-gray-800 dark:bg-gray-800/40"
              >
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {label}
                  </span>
                </div>
                <p className="mt-1 truncate text-[12.5px] font-semibold text-slate-800 dark:text-slate-100">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {room?.description && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ការពិពណ៌នា
              </p>
              <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                {room.description}
              </p>
            </div>
          )}

          {amenityNames.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                គ្រឿងបរិក្ខារ (Amenities)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {amenityNames.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-medium text-slate-700 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-200"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {utilities.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ប្រើប្រាស់ (Utilities)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {utilities.map((u, idx) => (
                  <span
                    key={u.utilityTypeId || idx}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-medium text-slate-700 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-200"
                  >
                    <Zap className="h-3 w-3 text-amber-500" />
                    {u.utilityTypeName || u.utilityName}
                    {u.billingMethod && (
                      <span className="ml-1 text-[10px] text-slate-400">
                        ({u.billingMethod === "FIXED" ? "Fixed" : "Metered"})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-400">
            {list.length > 0 && (
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" />
                {list.length} រូបភាព
              </span>
            )}
            {room?.floorNumber != null && room?.floorNumber !== "" && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5" />
                ជាន់ {room.floorNumber}
              </span>
            )}
            {room?.capacity && (
              <span className="flex items-center gap-1">
                <UsersRound className="h-3.5 w-3.5" />
                {room.capacity} នាក់
              </span>
            )}
            {room?.roomNumber && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                បន្ទប់ {room.roomNumber}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


/**
 * Modal wrapper that shows a room listing exactly as visitors would see it on
 * the public website. `footer` is optional (used by the submit-flow preview to
 * add a confirm action).
 */
const RoomPreviewModal = ({
  open,
  onClose,
  title = "ការមើលជាមុន (Preview)",
  description,
  footer,
  ...previewProps
}) => (
  <Modal open={open} onClose={onClose} title={title} description={description} size="lg" footer={footer}>
    <RoomPublicPreview {...previewProps} />
  </Modal>
);

export default RoomPublicPreview;
export { RoomPreviewModal };