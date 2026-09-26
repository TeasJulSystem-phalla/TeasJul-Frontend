import { useTranslation } from "react-i18next";
import { MapPin, Heart, Bed, Check, UsersRound } from "lucide-react";

const STATUS_META = {
  AVAILABLE: { tone: "bg-emerald-500" },
  RESERVED: { tone: "bg-sky-500" },
  OCCUPIED: { tone: "bg-slate-400" },
  MAINTENANCE: { tone: "bg-amber-500" },
};

export const SkeletonCard = ({ view }) => {
  if (view === "list") {
    return (
      <div className="flex gap-4 overflow-hidden rounded-lg border border-slate-200 bg-white p-4">
        <div className="h-28 w-[140px] shrink-0 animate-pulse rounded-md bg-slate-200 sm:w-[200px]" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-[340px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="h-[180px] w-full shrink-0 animate-pulse bg-slate-200" />
      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="mt-auto h-5 w-24 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
};

export const RoomCard = ({
  room,
  isFav,
  onToggleFav,
  view,
  showGroupSummary = false,
}) => {
  const { t } = useTranslation();
  const hero =
    (room.images && room.images[0]) ||
    room.roomTypePrimaryImage ||
    room.housePrimaryImage;
  const name =
    room.name ||
    (room.roomNumber
      ? `${t("rooms.card.roomPrefix")} ${room.roomNumber}`
      : t("rooms.card.fallbackName"));
  const location = [room.houseName, room.houseAddress]
    .filter(Boolean)
    .join(" · ");
  const status = STATUS_META[room.status];
  const statusText = room.status ? t(`status.${room.status}`) : "";

  const stopLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFav && onToggleFav();
  };

  /* ======================= LIST VIEW ======================= */
  if (view === "list") {
    return (
      <div className="group flex overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-300">
        <div className="relative w-[140px] shrink-0 overflow-hidden bg-[#e8eef2] sm:w-[200px]">
          {hero && (
            <img src={hero} alt={name} className="h-full w-full object-cover" />
          )}
          {room.roomTypeName && (
            <span className="khmer absolute left-2 top-2 rounded bg-[#0f2942] px-2 py-0.5 text-[10px] font-medium text-white">
              {room.roomTypeName}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="khmer truncate text-[14.5px] font-medium text-[#0f2942]">
                  {name}
                </h3>
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#0f2942]">
                  <Check className="h-2 w-2 text-white" strokeWidth={4} />
                </span>
              </div>
              {location && (
                <p className="khmer mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {location}
                </p>
              )}
            </div>
            <button
              onClick={stopLink}
              className="shrink-0 p-0.5"
              aria-label={t("rooms.card.saveFav")}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFav ? "fill-red-500 text-red-500" : "text-slate-300 hover:text-slate-500"
                }`}
              />
            </button>
          </div>
          {(room.roomNumber || room.capacity) && (
            <div className="mt-2.5 flex items-center gap-3 text-[12px] text-slate-500">
              {room.roomNumber && (
                <span className="khmer flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5" />
                  {t("rooms.card.roomPrefix")} {room.roomNumber}
                </span>
              )}
              {room.capacity && (
                <span className="khmer flex items-center gap-1">
                  <UsersRound className="h-3.5 w-3.5" />
                  {t("rooms.card.persons", { count: room.capacity })}
                </span>
              )}
            </div>
          )}
          <div className="mt-auto flex items-end justify-between pt-3">
            {status ? (
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                <span className={`h-1.5 w-1.5 rounded-full ${status.tone}`} />
                <span className="khmer">{statusText}</span>
              </span>
            ) : (
              <span />
            )}
            <p className="khmer text-[16px] font-semibold text-[#0f2942]">
              ${Number(room.monthlyRent ?? 0)}
              <span className="khmer text-[11px] font-normal text-slate-500">
                {" "}
                {t("rooms.card.perMonth")}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ======================= GRID VIEW ======================= */
  return (
    <div className="group flex h-[340px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-300">
      {/* Image — fixed height */}
      <div className="relative h-[180px] w-full shrink-0 overflow-hidden bg-[#e8eef2]">
        {hero && (
          <img
            src={hero}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {room.roomTypeName && (
          <span className="khmer absolute left-2.5 top-2.5 max-w-[140px] truncate rounded bg-[#0f2942] px-2 py-0.5 text-[10px] font-medium text-white">
            {room.roomTypeName}
          </span>
        )}
        <button
          onClick={stopLink}
          aria-label={t("rooms.card.saveFav")}
          className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white"
        >
          <Heart
            className={`h-3.5 w-3.5 ${
              isFav ? "fill-red-500 text-red-500" : "text-slate-600"
            }`}
          />
        </button>
      </div>

      {/* Body — flex column, fills remaining space */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        {/* Title — always 2 lines' worth of height */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="khmer line-clamp-2 min-h-[2.6em] flex-1 text-[14px] font-medium leading-snug text-[#0f2942]">
            {name}
          </h3>
          <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#0f2942]">
            <Check className="h-2 w-2 text-white" strokeWidth={4} />
          </span>
        </div>

        {/* Location — 1 line only */}
        {location && (
          <p className="khmer mt-1 line-clamp-1 flex items-center gap-1 text-[12px] text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}

        {/* Group summary — 1 line only */}
        {showGroupSummary &&
          (room.availableRoomCount != null || room.fromRent != null) && (
            <p className="khmer mt-2 line-clamp-1 text-[12px] text-slate-500">
              {room.availableRoomCount != null &&
                t("rooms.card.roomsAvailable", { count: room.availableRoomCount })}
              {room.availableRoomCount != null &&
                room.fromRent != null &&
                " · "}
              {room.fromRent != null &&
                t("rooms.card.fromRent", { price: Number(room.fromRent) })}
            </p>
          )}

        {/* Room specs — fixed height row */}
        {(room.roomNumber || room.capacity) && (
          <div className="mt-3 flex h-[20px] items-center gap-3 text-[12px] text-slate-500">
            {room.roomNumber && (
              <span className="khmer flex items-center gap-1 truncate">
                <Bed className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {t("rooms.card.roomPrefix")} {room.roomNumber}
                </span>
              </span>
            )}
            {room.capacity && (
              <span className="khmer flex items-center gap-1 truncate">
                <UsersRound className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {t("rooms.card.persons", { count: room.capacity })}
                </span>
              </span>
            )}
          </div>
        )}

        {/* Bottom row — pinned to bottom */}
        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
          {status ? (
            <span className="flex min-w-0 items-center gap-1.5 truncate text-[12px] font-medium text-slate-600">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.tone}`} />
              <span className="khmer truncate">{statusText}</span>
            </span>
          ) : (
            <span />
          )}
          <p className="khmer shrink-0 text-[15px] font-semibold text-[#0f2942]">
            ${Number(room.monthlyRent ?? 0)}
            <span className="khmer text-[11px] font-normal text-slate-500">
              {" "}
              {t("rooms.card.perMonth")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
