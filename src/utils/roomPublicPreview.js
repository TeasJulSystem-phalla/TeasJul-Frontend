// Builds the flat PublicRoomResponse-shaped object consumed by RoomDetailView
// (the REAL public room-detail renderer) from owner-scoped data sources.
//
// Used by BOTH the owner listing editor (mode="owner") and the full-page
// "Preview Public Listing" page so the preview is byte-for-byte the same as
// what a customer will see on the public website.
//
//   room           – Owner RoomResponse (roomApi.getRoomById)
//   house          – owner HouseResponse (houseApi.getHouseById)
//   roomType       – owner RoomTypeResponse (roomTypeApi.getRoomTypeById)
//   houseImages    – list of HouseImageResponse ({ secureUrl })
//   roomTypeImages – list of RoomTypeImageResponse ({ secureUrl })
//   amenities      – list of RoomAmenityResponse ({ amenityName })
//   utilities      – list of RoomUtilityResponse ({ utilityTypeId, utilityTypeName,
//                    billingMethod, isIncluded })
//   nearby         – list of NearbyLocationResponse
//   overrides      – { meta: { name, floorNumber }, listing: { ...fields } }
//                    optional CLIENT-SIDE overrides (editor live state) layered
//                    on top of the persisted room fields.

const toNum = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const numOf = (listing, room, key) => {
  const v = listing?.[key];
  if (typeof v === "string" && v.trim() === "") return null;
  if (v !== undefined) return toNum(v);
  const r = room?.[key];
  return r != null ? toNum(r) : null;
};

const strOf = (listing, room, key) => {
  const v = listing?.[key];
  if (v !== undefined) return v;
  return room?.[key] ?? "";
};

export const buildOwnerListingPreview = ({
  room,
  house = null,
  roomType = null,
  houseImages = [],
  roomTypeImages = [],
  amenities = [],
  utilities = [],
  nearby = [],
  overrides = {},
}) => {
  const listing = overrides.listing || {};
  const meta = overrides.meta || {};

  const effName = meta.name !== undefined ? meta.name : room?.name;
  const effFloor =
    meta.floorNumber !== undefined ? meta.floorNumber : room?.floorNumber;

  const monthlyRent = numOf(listing, room, "monthlyRent");
  const securityDeposit = numOf(listing, room, "securityDeposit");

  const imageUrls = [
    ...(houseImages || []).map((i) => i.secureUrl).filter(Boolean),
    ...(roomTypeImages || []).map((i) => i.secureUrl).filter(Boolean),
  ];
  const images = [...new Set(imageUrls)];
  const imagesFinal = images.length
    ? images
    : [roomType?.primaryImage, house?.primaryImage].filter(Boolean);

  return {
    id: room?.id,
    name: effName || null,
    roomNumber: room?.roomNumber || null,
    floorNumber: effFloor !== "" && effFloor != null ? toNum(effFloor) : null,
    capacity: numOf(listing, room, "capacity") || null,
    monthlyRent: monthlyRent ?? 0,
    securityDeposit: securityDeposit ?? 0,
    status: strOf(listing, room, "status") || "AVAILABLE",
    description: strOf(listing, room, "description"),
    houseId: house?.id,
    houseName: house?.name,
    houseAddress: house?.address,
    housePostalCode: house?.postalCode,
    housePrimaryImage: house?.primaryImage,
    roomTypeId: roomType?.id,
    roomTypeName: roomType?.name,
    roomTypePrimaryImage: roomType?.primaryImage,
    images: imagesFinal,
    amenities: (amenities || []).map((a) => a.amenityName || a.name).filter(Boolean),
    utilities: (utilities || []).map((u) => ({
      id: u.utilityTypeId ?? u.id,
      name: u.utilityTypeName || u.name,
      unit: u.unit || null,
      billingMethod: u.billingMethod,
      rate: u.rate ?? null,
      isIncluded: u.isIncluded,
    })),
    nearbyLocations: nearby || [],
    propertyType: strOf(listing, room, "propertyType") || null,
    listingScope: strOf(listing, room, "listingScope") || null,
    furnishing: strOf(listing, room, "furnishing") || null,
    availableFrom: strOf(listing, room, "availableFrom") || null,
    advancePayment: numOf(listing, room, "advancePayment"),
    bedrooms: numOf(listing, room, "bedrooms"),
    bathrooms: numOf(listing, room, "bathrooms"),
    areaSqm: numOf(listing, room, "areaSqm"),
    landSizeSqm: numOf(listing, room, "landSizeSqm"),
    numberOfFloors: numOf(listing, room, "numberOfFloors"),
    cityProvince: house?.cityProvince || null,
    latitude: house?.latitude ?? null,
    longitude: house?.longitude ?? null,
    googleMapsUrl: house?.googleMapsUrl || null,
  };
};