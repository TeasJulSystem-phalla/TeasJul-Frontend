// format.ts
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
