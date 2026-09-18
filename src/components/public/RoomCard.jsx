import { useState } from "react";
import {
  ArrowRight,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  MapPin,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
const asImages = (images) =>
  (images || [])
    .map((image) => (typeof image === "string" ? { secureUrl: image } : image))
    .filter((image) => image?.secureUrl);
const status = (value) =>
  ({
    AVAILABLE: { label: "Available now", tone: "bg-emerald-500" },
    OCCUPIED: { label: "Currently occupied", tone: "bg-slate-400" },
    MAINTENANCE: { label: "Under maintenance", tone: "bg-amber-500" },
    RESERVED: { label: "Reserved", tone: "bg-sky-500" },
  })[value] || null;

const RoomCard = ({
  room,
  house,
  roomType,
  images = [],
  isFav,
  onToggleFav,
  onViewDetails,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const list = asImages(images);
  const hero =
    list[activeIndex] || list.find((image) => image.isPrimary) || list[0];
  const heroSource =
    hero?.secureUrl ||
    room?.primaryImage ||
    roomType?.primaryImage ||
    house?.primaryImage;
  const name = room?.name || `Room ${room?.roomNumber || ""}`.trim();
  const location = [
    house?.address || room?.houseAddress,
    house?.name || room?.houseName,
  ]
    .filter(Boolean)
    .join(" · ");
  const roomStatus = status(room?.status);
  const go = (direction) =>
    setActiveIndex((index) => (index + direction + list.length) % list.length);

  return (
    <article className="group overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-[0_6px_24px_rgba(15,41,66,.045)] transition duration-300 hover:-translate-y-1 hover:border-[#bfd1c6] hover:shadow-[0_18px_38px_rgba(15,41,66,.11)]">
      <div className="relative aspect-[1.3/1] overflow-hidden bg-[#163957]">
        {heroSource ? (
          <img
            src={heroSource}
            alt={name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
          />
        ) : (
          <ImageIcon className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-white/45" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0c2438]/60 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {roomType?.name && (
            <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#163957] backdrop-blur">
              {roomType.name}
            </span>
          )}
          {room?.publicationStatus === "PUBLISHED" && (
            <span
              title="Verified listing"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#102f4a] text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        {onToggleFav && (
          <button
            type="button"
            onClick={onToggleFav}
            aria-label={isFav ? "Remove from saved rooms" : "Save room"}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#163957] backdrop-blur transition hover:scale-105 hover:bg-white"
          >
            <Heart
              className={`h-4 w-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`}
            />
          </button>
        )}
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#163957] opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#163957] opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {list.map((image, index) => (
                <span
                  key={`${image.secureUrl}-${index}`}
                  className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/65"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold tracking-[-.015em] text-[#14344e]">
              {name}
            </h3>
            {location && (
              <p className="mt-1 flex items-center gap-1.5 truncate text-[12px] text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#688996]" />
                <span className="truncate">{location}</span>
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[16px] font-bold tracking-[-.02em] text-[#14344e]">
              {formatCurrency(room?.monthlyRent)}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[.1em] text-slate-400">
              per month
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-y border-slate-100 py-3 text-[11.5px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 text-[#688996]" /> Room{" "}
            {room?.roomNumber || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <UsersRound className="h-3.5 w-3.5 text-[#688996]" />{" "}
            {room?.capacity
              ? `${room.capacity} guest${Number(room.capacity) === 1 ? "" : "s"}`
              : "Capacity —"}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          {roomStatus ? (
            <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-600">
              <span className={`h-1.5 w-1.5 rounded-full ${roomStatus.tone}`} />{" "}
              {roomStatus.label}
            </span>
          ) : (
            <span />
          )}
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(room)}
              className="inline-flex items-center gap-1 text-[12px] font-bold text-[#163957] transition hover:gap-1.5"
            >
              View details <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default RoomCard;
