import { Link } from "react-router-dom";
import { MapPin, ArrowRight, BedDouble } from "lucide-react";

const PROPERTY_TYPE_LABEL = {
  HOUSE: "House",
  VILLA: "Villa",
  APARTMENT: "Apartment",
  CONDO: "Condo",
  ROOM: "Room",
  SINGLE_ROOM: "Single Room",
};

const HomePropertyCard = ({ room }) => {
  const hero =
    (room.images && room.images[0]) ||
    room.roomTypePrimaryImage ||
    room.housePrimaryImage;

  const houseName = room.houseName || "Property";
  const typeLabel = room.propertyType
    ? PROPERTY_TYPE_LABEL[room.propertyType] || room.propertyType
    : null;
  const location = [room.houseAddress, room.cityProvince]
    .filter(Boolean)
    .join(", ");
  const startingRent = room.fromRent != null ? room.fromRent : room.monthlyRent;

  return (
    <Link
      to={`/public/rooms/${room.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-[#0f2942]/40 hover:shadow-[0_12px_36px_rgb(15,41,66,0.08)]"
    >
      <div className="relative h-[170px] w-full shrink-0 overflow-hidden bg-[#e8eef2]">
        {hero && (
          <img
            src={hero}
            alt={houseName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {room.roomTypeName && (
          <span className="absolute left-2.5 top-2.5 max-w-[150px] truncate rounded bg-[#0f2942] px-2 py-0.5 text-[10.5px] font-medium text-white">
            {room.roomTypeName}
          </span>
        )}
        {typeLabel && (
          <span className="absolute right-2.5 top-2.5 rounded border border-white/60 bg-white/85 px-2 py-0.5 text-[10.5px] font-medium text-[#0f2942] backdrop-blur-sm">
            {typeLabel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-[14.5px] font-semibold text-[#0f2942]">
          {houseName}
        </h3>
        {room.roomTypeName && (
          <p className="mt-0.5 line-clamp-1 text-[12.5px] text-slate-500">
            {room.roomTypeName}
          </p>
        )}
        {location && (
          <p className="mt-1.5 line-clamp-1 flex items-center gap-1 text-[12px] text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
          {room.availableRoomCount != null ? (
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e8f0f7]">
                <BedDouble className="h-2.5 w-2.5 text-[#0f2942]" />
              </span>
              {room.availableRoomCount} room
              {room.availableRoomCount === 1 ? "" : "s"} available
            </span>
          ) : (
            <span />
          )}
          <p className="shrink-0 text-right">
            <span className="text-[14.5px] font-semibold text-[#0f2942]">
              {startingRent != null ? `$${Number(startingRent)}` : "\u2014"}
            </span>
            {startingRent != null && (
              <span className="text-[11px] font-normal text-slate-500">
                /mo
              </span>
            )}
          </p>
        </div>

        <span className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-[#0f2942] px-3 py-2 text-[12.5px] font-medium text-white transition-colors group-hover:bg-[#1a3d5f]">
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
};

export default HomePropertyCard;
