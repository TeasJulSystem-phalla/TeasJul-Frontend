export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
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
  PARTIALLY_REFUNDED: 'Partially refunded',
  REFUNDED: 'Refunded',
};

export const GENDER_LABEL = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const OCCUPATION_LABEL = {
  STUDENT: 'Student',
  EMPLOYEE: 'Employee',
  OTHER: 'Other',
};

export const fullName = (t) => `${t?.firstName || ''} ${t?.lastName || ''}`.trim() || `Tenant #${t?.id}`;

export const roomLabel = (r) => (r?.name ? `${r.name} (${r.roomNumber})` : r?.roomNumber ? `Room ${r.roomNumber}` : r?.name || '—');

export const genderLabel = (g) => GENDER_LABEL[g] || g || '—';
export const occupationLabel = (o) => OCCUPATION_LABEL[o] || o || '—';
