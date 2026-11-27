// format.ts

/** Text shown in the printable agreement when a required detail was never supplied. */
export const MISSING_INFO_LABEL = 'មិនបានបញ្ជាក់';

/** Blanks from the API and from the formatters are all treated as missing. */
export const isBlank = (value) =>
  value === undefined ||
  value === null ||
  value === '' ||
  value === '—' ||
  String(value).trim() === '';

/** Age printed in the party paragraphs, derived from the stored date of birth. */
export const ageFromDob = (dob) => {
  if (isBlank(dob)) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? String(age) : undefined;
};

/** Split a free-form address into the fields used by the official form. */
export const addressFields = (address) => {
  if (isBlank(address)) return {};
  const text = String(address);
  const pick = (...patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return undefined;
  };

  return {
    houseNumber: pick(/(?:ផ្ទះ\s*លេខ|ផ្ទះលេខ|ផ្ទះ|House\s*No\.?)\s*([^\s,]+)/i),
    streetNumber: pick(/(?:ផ្លូវ\s*លេខ|ផ្លូវលេខ|ផ្លូវ|Street\s*No\.?)\s*([^\s,]+)/i),
    sangkat: pick(/សង្កាត់\s*([^,]+)/i, /Sangkat\s+([^,]+)/i),
    khan: pick(/ខណ្ឌ\s*([^,]+)/i, /Khan\s+([^,]+)/i),
    cityProvince: pick(/(?:រាជធានី|ខេត្ត|Province|City)\s*([^,]+)/i),
  };
};

/**
 * Resolves structured address components with field-by-field snapshot-first precedence:
 * 1. Prefer non-blank snapshot value for each individual field.
 * 2. If a specific field is missing/blank, fall back to the parsed legacy address component if legacyAddress is provided.
 * 3. Trims whitespace and treats blank strings as undefined.
 * 4. Never fabricates values or cross-contaminates sources.
 */
export const resolveAddress = (snapshot = {}, legacyAddress = null) => {
  const legacy = legacyAddress ? addressFields(legacyAddress) : {};

  const clean = (val) => {
    if (val === undefined || val === null) return undefined;
    const str = String(val).trim();
    return str === '' ? undefined : str;
  };

  return {
    houseNumber: clean(snapshot?.houseNumber) ?? clean(legacy?.houseNumber),
    streetNumber: clean(snapshot?.streetNumber) ?? clean(legacy?.streetNumber),
    sangkat: clean(snapshot?.sangkat) ?? clean(legacy?.sangkat),
    khan: clean(snapshot?.khan) ?? clean(legacy?.khan),
    cityProvince: clean(snapshot?.cityProvince) ?? clean(legacy?.cityProvince),
  };
};

/** Express the stored start/end dates as a number of years for Article 2. */
export const durationInYears = (contract) => {
  if (isBlank(contract?.startDate) || isBlank(contract?.endDate)) return undefined;
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return undefined;

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  if (months <= 0) return undefined;

  const years = months / 12;
  return String(Number.isInteger(years) ? years : Number(years.toFixed(2)));
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatShortDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const CONTRACT_STATUS_LABEL = {
  DRAFT: 'សេចក្តីព្រាង',
  ACTIVE: 'សកម្ម',
  TERMINATED: 'បានបញ្ចប់',
  EXPIRED: 'ផុតកំណត់',
  CANCELLED: 'បានលុបចោល',
};

export const DEPOSIT_STATUS_LABEL = {
  PENDING: 'កំពុងរង់ចាំ',
  PAID: 'បានបង់',
  REFUNDED: 'បានសងវិញ',
  FORFEITED: 'បានបាត់បង់',
};

export const genderLabel = (gender) => {
  if (!gender) return '—';
  const labels = {
    MALE: 'ប្រុស',
    FEMALE: 'ស្រី',
    OTHER: 'ផ្សេងទៀត',
  };
  return labels[gender] || gender;
};

export const occupationLabel = (occupation) => {
  if (!occupation) return '—';
  const labels = {
    STUDENT: 'សិស្ស',
    BUSINESS: 'អាជីវករ',
    EMPLOYEE: 'បុគ្គលិក',
    TEACHER: 'គ្រូបង្រៀន',
    OTHER: 'ផ្សេងៗ',
  };
  return labels[occupation] || occupation;
};

export const fullName = (tenant) => {
  if (!tenant) return '—';
  return `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || '—';
};

export const roomLabel = (room) => {
  if (!room) return '—';
  return room.name || `បន្ទប់ ${room.roomNumber || room.id}`;
};

/**
 * Rental term derived from the contract's own start/end dates. The contract API
 * exposes no duration field, so it is computed here once and reused by both the
 * property summary and the agreement clauses. Months are preferred; a term shorter
 * than a month is shown in days so a short let never reads as "0 months".
 */
export const contractDuration = (contract) => {
  if (!contract?.startDate || !contract?.endDate) return null;
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  if (months >= 1) return `${months} ខែ`;

  const days = Math.max(1, Math.round((end - start) / 86400000));
  return `${days} ថ្ងៃ`;
};

/** Monthly asking price of the room itself, falling back to its type's default. */
export const roomPrice = (room, roomType) => {
  const rent = room?.monthlyRent ?? roomType?.defaultRent;
  return rent === null || rent === undefined ? null : Number(rent);
};
