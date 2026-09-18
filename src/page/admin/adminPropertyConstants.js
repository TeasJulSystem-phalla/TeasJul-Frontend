// Shared labels/options for the SUPER_ADMIN property-posting flow
// (`/admin/properties*`). Kept in a separate module (no component export) so
// fast-refresh lint stays clean when components import them.

export const PROPERTY_TYPE_OPTIONS = [
  { value: "HOUSE", label: "ផ្ទះ (House)" },
  { value: "VILLA", label: "វីឡា (Villa)" },
  { value: "APARTMENT", label: "អាផាតមិន (Apartment)" },
  { value: "CONDO", label: "ខុនដូ (Condo)" },
  { value: "ROOM", label: "បន្ទប់ (Room)" },
];

export const PROPERTY_TYPE_LABELS = {
  ROOM: "បន្ទប់ (Room)",
  HOUSE: "ផ្ទះ (House)",
  VILLA: "វីឡា (Villa)",
  APARTMENT: "អាផាតមិន (Apartment)",
  CONDO: "ខុនដូ (Condo)",
  OTHER: "ផ្សេងៗ (Other)",
};

export const LISTING_SCOPE_LABELS = {
  ENTIRE_PROPERTY: "ផ្ទះទាំងមូល",
  INDIVIDUAL_ROOM: "បន្ទប់នីមួយៗ",
};

export const ROOM_STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "ទំនេរ (Available)" },
  { value: "OCCUPIED", label: "មានអ្នកស្នាក់នៅ (Occupied)" },
  { value: "MAINTENANCE", label: "កំពុងជួសជុល (Maintenance)" },
  { value: "RESERVED", label: "បានកក់ (Reserved)" },
];

export const FURNISHING_OPTIONS = [
  { value: "", label: "មិនកំណត់" },
  { value: "FULLY_FURNISHED", label: "មានសង្ហារិមពេញលេញ (Fully Furnished)" },
  { value: "SEMI_FURNISHED", label: "មានសង្ហារិមខ្លះ (Semi Furnished)" },
  { value: "UNFURNISHED", label: "គ្មានសង្ហារិម (Unfurnished)" },
];

export const NEARBY_CATEGORY_OPTIONS = [
  { value: "SCHOOL", label: "សាលារៀន (School)" },
  { value: "UNIVERSITY", label: "សាកលវិទ្យាល័យ (University)" },
  { value: "HOSPITAL", label: "មន្ទីរពេទ្យ (Hospital)" },
  { value: "MALL", label: "ផ្សារទំនើប (Mall)" },
  { value: "MARKET", label: "ផ្សារ (Market)" },
  { value: "RESTAURANT", label: "ភោជនីយដ្ឋាន (Restaurant)" },
  { value: "BANK", label: "ធនាគារ (Bank)" },
  { value: "TOURIST_SPOT", label: "កន្លែងទេសចរណ៍ (Tourist Spot)" },
  { value: "BUS_STOP", label: "ចំណតឡាន (Bus Stop)" },
  { value: "OTHER", label: "ផ្សេងៗ (Other)" },
];

export const PUBLICATION_STATUS_OPTIONS = [
  { value: "", label: "ស្ថានភាពទាំងអស់" },
  { value: "DRAFT", label: "ព្រាង (Draft)" },
  { value: "PENDING_APPROVAL", label: "រង់ចាំយល់ព្រម (Pending)" },
  { value: "PUBLISHED", label: "បានផ្សាយ (Published)" },
  { value: "REJECTED", label: "បានបដិសេធ (Rejected)" },
];