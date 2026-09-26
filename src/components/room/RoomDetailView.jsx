import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  MapPin,
  BedDouble,
  Maximize,
  UsersRound,
  CheckCircle2,
  Info,
  Home,
  Building2,
  Image as ImageIcon,
  ChevronRight,
  Zap,
  Compass,
  ExternalLink,
  Bath,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  Phone,
  Send,
} from "lucide-react";
import i18n from "../../i18n";
import HomePropertyCard from "../public/HomePropertyCard";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value) || 0,
  );

const STATUS_TONE = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  RESERVED: "bg-sky-100 text-sky-700",
  OCCUPIED: "bg-slate-200 text-slate-600",
  MAINTENANCE: "bg-amber-100 text-amber-700",
};

const statusLabel = (status) => {
  if (!status) return null;
  const tone = STATUS_TONE[status] || "bg-slate-200 text-slate-600";
  return {
    label: i18n.t(`status.${status}`, { defaultValue: status }),
    tone,
  };
};

const categoryLabel = (category) =>
  category
    ? i18n.t(`nearbyCategory.${category}`, { defaultValue: category })
    : "";

const billingLabel = (method) =>
  method
    ? i18n.t(`billing.${String(method).toLowerCase()}`, {
        defaultValue: String(method),
      })
    : "";

/* -----------------------------------------------------------
   Telegram phone URL
   ----------------------------------------------------------- */
const telegramPhoneUrl = (raw) => {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 6) return null;
  return `https://t.me/+${digits}`;
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f2942]/5">
      <Icon className="h-4.5 w-4.5 text-[#0f2942]" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="truncate text-[13.5px] font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  </div>
);

const RoomDetailView = ({
  room,
  showBreadcrumb = true,
  showContact = false,
  contactLabel,
  showAvailableRooms = false,
  similarRooms = [],
}) => {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(0);

  const images = (room.images || []).filter(Boolean);
  const status = statusLabel(room.status);
  const mapUrl =
    room.googleMapsUrl ||
    (room.latitude && room.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${room.latitude},${room.longitude}`
      : null);

  const amenities = (room.amenities || []).filter(Boolean);
  const utilities = (room.utilities || []).filter(Boolean);
  const nearbyLocations = (room.nearbyLocations || []).filter(Boolean);
  const availableRooms = Array.isArray(room.availableRooms)
    ? room.availableRooms.filter(Boolean)
    : [];
  const availableRoomNumbers = availableRooms
    .map((availableRoom) => availableRoom.roomNumber)
    .filter(Boolean)
    .join(", ");
  const displayedRoomNumbers =
    showAvailableRooms && availableRoomNumbers
      ? availableRoomNumbers
      : room.roomNumber;

  // ---------- Owner contact ----------
  const owner = room.owner;
  const ownerName = owner?.name || owner?.fullName || null;
  const ownerPhone = owner?.phone || null;
  const ownerEmail = owner?.email || null;
  const hasOwnerInfo = Boolean(ownerName || ownerPhone || ownerEmail);

  const telegramUrl = telegramPhoneUrl(ownerPhone) || "https://t.me/";
  const telHref = ownerPhone
    ? `tel:${String(ownerPhone).replace(/\D/g, "")}`
    : null;

  const title = room.roomTypeName
    ? `${room.houseName || t("propertyType.HOUSE")} — ${room.roomTypeName} (${displayedRoomNumbers || ""})`
    : room.name || `${t("propertyType.ROOM")} ${displayedRoomNumbers || ""}`;

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      {showBreadcrumb && (
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-500">
          <Link to="/" className="hover:text-[#0f2942]">
            {t("roomDetail.breadcrumbHome")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/rooms" className="hover:text-[#0f2942]">
            {t("roomDetail.breadcrumbRooms")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate font-medium text-[#0f2942]">{title}</span>
        </nav>
      )}

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-khmer text-2xl font-bold text-[#0f2942]">
            {title}
          </h1>
          {(room.houseAddress || room.houseName || room.cityProvince) && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-500">
              <MapPin className="h-4 w-4 shrink-0 text-[#0f2942]" />
              <span>
                {[room.houseName, room.houseAddress, room.cityProvince]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </p>
          )}
        </div>
        {status && (
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-medium ${status.tone}`}
          >
            {status.label}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="flex-1">
          {/* Gallery */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#0f2942]">
            {images.length > 0 ? (
              <img
                src={images[activeIdx]}
                alt={`${title} — ${activeIdx + 1}`}
                className="aspect-[4/2] w-full object-cover"
              />
            ) : room.roomTypePrimaryImage ? (
              <img
                src={room.roomTypePrimaryImage}
                alt={title}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center">
                <ImageIcon className="h-12 w-12 text-slate-500" />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="scrollbar-hide mt-2.5 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveIdx(i)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === activeIdx
                      ? "border-[#0f2942]"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Room & Room Type Info */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#0f2942]">
              <Info className="h-4 w-4" />
              {t("roomDetail.roomInfo")}
            </h2>
            {room.description && (
              <p className="mt-3 text-[13.5px] leading-relaxed text-slate-600">
                {room.description}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <InfoTile
                icon={BedDouble}
                label={t("roomDetail.roomNumber")}
                value={room.roomNumber}
              />
              <InfoTile
                icon={Layers}
                label={t("roomDetail.floor")}
                value={
                  room.floorNumber != null
                    ? t("roomDetail.floorN", { n: room.floorNumber })
                    : "—"
                }
              />
              <InfoTile
                icon={UsersRound}
                label={t("roomDetail.capacity")}
                value={room.capacity ? t("roomDetail.persons", { count: room.capacity }) : "—"}
              />
              <InfoTile
                icon={BedDouble}
                label={t("roomDetail.bedrooms")}
                value={room.bedrooms != null ? t("roomDetail.bedroomCount", { count: room.bedrooms }) : "—"}
              />
              <InfoTile
                icon={Bath}
                label={t("roomDetail.bathrooms")}
                value={room.bathrooms != null ? t("roomDetail.bathroomCount", { count: room.bathrooms }) : "—"}
              />
              <InfoTile
                icon={Maximize}
                label={t("roomDetail.roomSize")}
                value={room.areaSqm ? `${room.areaSqm} m²` : "—"}
              />
              <InfoTile
                icon={Sparkles}
                label={t("roomDetail.furnishing")}
                value={room.furnishing}
              />
              <InfoTile
                icon={Building2}
                label={t("roomDetail.propertyType")}
                value={room.propertyType}
              />
            </div>
          </div>

          {showAvailableRooms && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#0f2942]">
                <Building2 className="h-4 w-4" />
                {t("roomDetail.nRoomsAvailable", {
                  count: availableRooms.length,
                })}
              </h2>
              {availableRooms.length > 0 ? (
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {availableRooms.map((availableRoom) => {
                    const availableStatus = statusLabel(availableRoom.status);
                    return (
                      <div
                        key={
                          availableRoom.id ||
                          `${availableRoom.roomNumber}-${availableRoom.floorNumber}`
                        }
                        className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-semibold text-slate-800">
                              {t("roomDetail.roomLabel", {
                                n: availableRoom.roomNumber || "—",
                              })}
                            </p>
                            <p className="mt-0.5 text-[11.5px] text-slate-500">
                              {t("roomDetail.floorLabel", {
                                n: availableRoom.floorNumber ?? "—",
                              })}
                            </p>
                          </div>
                          {availableStatus && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${availableStatus.tone}`}
                            >
                              {availableStatus.label}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-[13px] font-semibold text-[#0f2942]">
                          {formatCurrency(availableRoom.monthlyRent)}{" "}
                          {t("roomDetail.perMonth")}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-slate-500">
                          {t("roomDetail.deposit")}{" "}
                          {formatCurrency(availableRoom.securityDeposit)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-slate-500">
                  {t("roomDetail.noRoomsAvailable")}
                </p>
              )}
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#0f2942]">
                <Sparkles className="h-4 w-4" />
                {t("roomDetail.amenities")}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[12.5px] font-medium text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Utilities */}
          {utilities.length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#0f2942]">
                <Zap className="h-4 w-4 text-[#0f2942]" />
                {t("roomDetail.utilities")}
              </h2>
              <div className="mt-3 space-y-2.5">
                {utilities.map((u, idx) => {
                  const name = u.name || u.utilityTypeName || u.utilityName;
                  const isIncluded = Boolean(
                    u.isIncluded ?? u.isIncludedInRent,
                  );
                  const rate = u.rate != null ? u.rate : u.pricePerUnit;
                  const unit = u.unit || u.unitName;
                  const secondary =
                    u.billingMethod ||
                    u.utilityType ||
                    u.utilityTypeName === name
                      ? billingLabel(u.billingMethod)
                      : "";
                  return (
                    <div
                      key={u.id || idx}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <Zap className="h-4 w-4 text-[#0f2942]" />
                        <div>
                          <p className="text-[13px] font-medium text-slate-800">
                            {name}
                          </p>
                          {secondary && (
                            <p className="text-[11px] text-slate-400">
                              {secondary}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {isIncluded ? (
                          <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {t("roomDetail.included")}
                          </span>
                        ) : rate != null ? (
                          <p className="text-[13px] font-semibold text-[#0f2942]">
                            ${rate} {unit ? `/ ${unit}` : ""}
                          </p>
                        ) : (
                          <p className="text-[13px] font-semibold text-[#0f2942]">
                            {secondary || name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nearby */}
          {nearbyLocations.length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#0f2942]">
                <Compass className="h-4 w-4 text-[#0f2942]" />
                {t("roomDetail.nearby")}
              </h2>
              <div className="mt-3 space-y-2.5">
                {nearbyLocations.map((loc, idx) => (
                  <div
                    key={loc.id || idx}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-[#0f2942]" />
                      <div>
                        <p className="text-[13px] font-medium text-slate-800">
                          {loc.name || loc.locationName}
                        </p>
                        {loc.category && (
                          <p className="text-[11px] text-slate-400">
                            {categoryLabel(loc.category)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-[12.5px] font-medium text-slate-600">
                      {loc.distanceKm != null && (
                        <span>{loc.distanceKm} km</span>
                      )}
                      {loc.distanceKm != null && loc.travelMinutes != null && (
                        <span> · </span>
                      )}
                      {loc.travelMinutes != null && (
                        <span>
                          {t("roomDetail.nearbyMeta", {
                            count: loc.travelMinutes,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-[340px]">
          {/* Rent & Deposit card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {showAvailableRooms && availableRooms.length > 0 ? (
              <>
                <h3 className="text-[13.5px] font-semibold text-[#0f2942]">
                  {t("roomDetail.availablePricing")}
                </h3>
                <div className="mt-3 space-y-2.5">
                  {availableRooms.map((availableRoom) => (
                    <div
                      key={
                        availableRoom.id ||
                        `${availableRoom.roomNumber}-${availableRoom.floorNumber}`
                      }
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12.5px] font-semibold text-slate-800">
                          {t("roomDetail.roomLabel", {
                            n: availableRoom.roomNumber || "—",
                          })}
                        </span>
                        <span className="text-[14px] font-bold text-[#0f2942]">
                          {formatCurrency(availableRoom.monthlyRent)}{" "}
                          {t("roomDetail.perMonth")}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11.5px]">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#0f2942]" />
                          {t("roomDetail.depositLabel")}
                        </span>
                        <span className="font-medium text-slate-700">
                          {formatCurrency(availableRoom.securityDeposit)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold text-[#0f2942]">
                    {formatCurrency(room.monthlyRent)}
                  </p>
                  <span className="text-[13px] text-slate-500">{t("roomDetail.perMonth")}</span>
                </div>

                <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0f2942]" />
                      {t("roomDetail.depositLabel")}
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(room.securityDeposit)}
                    </span>
                  </div>
                  {room.advancePayment != null && (
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-slate-500">
                        {t("roomDetail.advance")}
                      </span>
                      <span className="font-medium text-slate-800">
                        {t("roomDetail.advanceMonths", {
                          count: room.advancePayment,
                        })}
                      </span>
                    </div>
                  )}
                  {room.availableFrom && (
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-[#0f2942]" />
                        {t("roomDetail.availableFrom")}
                      </span>
                      <span className="font-medium text-slate-800">
                        {room.availableFrom}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {showAvailableRooms && room.availableFrom && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-[12.5px]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-[#0f2942]" />
                  {t("roomDetail.availableFrom")}
                </span>
                <span className="font-medium text-slate-800">
                  {room.availableFrom}
                </span>
              </div>
            )}
          </div>

          {/* House details card */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold text-[#0f2942]">
              <Home className="h-4 w-4" />
              {t("roomDetail.houseInfo")}
            </h3>
            <p className="mt-2.5 text-[13px] font-semibold text-[#0f2942]">
              {room.houseName || "—"}
            </p>
            {room.houseAddress && (
              <p className="mt-1 flex items-start gap-1.5 text-[12.5px] text-slate-600">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>{room.houseAddress}</span>
              </p>
            )}
            {room.cityProvince && (
              <p className="mt-1 text-[12px] text-slate-500">
                {t("roomDetail.cityProvince")}
                <span className="font-medium text-slate-700">
                  {room.cityProvince}
                </span>
              </p>
            )}
            {room.housePostalCode && (
              <p className="mt-0.5 text-[12px] text-slate-400">
                {t("roomDetail.postalCode")} {room.housePostalCode}
              </p>
            )}
            {room.numberOfFloors != null && (
              <p className="mt-1 text-[12px] text-slate-500">
                {t("roomDetail.numberOfFloors")}
                <span className="font-medium text-slate-700">
                  {t("roomDetail.floors", { count: room.numberOfFloors })}
                </span>
              </p>
            )}
            {room.landSizeSqm != null && (
              <p className="mt-0.5 text-[12px] text-slate-500">
                {t("roomDetail.landSize")}
                <span className="font-medium text-slate-700">
                  {room.landSizeSqm} m²
                </span>
              </p>
            )}

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#0f2942] bg-[#0f2942]/5 py-2.5 text-[12.5px] font-semibold text-[#0f2942] transition-colors hover:bg-[#0f2942] hover:text-white"
              >
                <MapPin className="h-4 w-4" />
                {t("roomDetail.viewOnMaps")}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* ---------- Owner / Contact card ---------- */}
          {hasOwnerInfo && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-[13.5px] font-semibold text-[#0f2942]">
                <Phone className="h-4 w-4" />
                {t("roomDetail.ownerContact")}
              </h3>

              {ownerName && (
                <div className="mt-3">
                  <p className="text-[11px] text-slate-400">
                    {t("roomDetail.name")}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-[#0f2942]">
                    {ownerName}
                  </p>
                </div>
              )}

              {ownerPhone && (
                <div className="mt-3">
                  <p className="text-[11px] text-slate-400">
                    {t("roomDetail.phone")}
                  </p>
                  <a
                    href={telHref}
                    className="mt-0.5 block text-[13.5px] font-semibold text-[#0f2942] hover:underline"
                  >
                    {ownerPhone}
                  </a>
                </div>
              )}

              {ownerEmail && (
                <div className="mt-3">
                  <p className="text-[11px] text-slate-400">
                    {t("roomDetail.email")}
                  </p>
                  <a
                    href={`mailto:${ownerEmail}`}
                    className="mt-0.5 block break-all text-[13px] font-medium text-[#0f2942] hover:underline"
                  >
                    {ownerEmail}
                  </a>
                </div>
              )}

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#229ED9] py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#1b8cc1]"
              >
                <Send className="h-4 w-4" />
                {t("roomDetail.telegram")}
              </a>
            </div>
          )}

          {showContact ? (
            <Link
              to="/login"
              className="font-khmer mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#0f2942] py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#173a5c]"
            >
              {contactLabel || t("roomDetail.contactCta")}
            </Link>
          ) : (
            <Link
              to="/rooms"
              className="font-khmer mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-3 text-[13px] font-medium text-slate-600 transition-colors hover:border-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("roomDetail.backToRooms")}
            </Link>
          )}
        </aside>
      </div>

      {similarRooms && similarRooms.length > 0 && (
        <div className="mt-8 border-t border-slate-200 pt-8">
          <h2 className="khmer text-[20px] font-bold text-[#0f2942]">
            {t("roomDetail.similar")}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similarRooms.map((similarRoom) => (
              <HomePropertyCard key={similarRoom.id} room={similarRoom} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default RoomDetailView;
