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
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  TERMINATED: 'Terminated',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

export const DEPOSIT_STATUS_LABEL = {
  PENDING: 'Pending',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
  FORFEITED: 'Forfeited',
};

export const genderLabel = (gender) => {
  if (!gender) return '—';
  const labels = {
    MALE: 'ប្រុស',
    FEMALE: 'ស្រី',
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
  return room.name || `Room ${room.roomNumber || room.id}`;
};