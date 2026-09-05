export const INVOICE_STATUS = {
  DRAFT: { label: "ព្រាង (DRAFT)", variant: "neutral" },
  PENDING: { label: "មិនទាន់បង់ (UNPAID)", variant: "warning" },
  PARTIAL: { label: "បង់មួយផ្នែក (PARTIAL)", variant: "info" },
  PAID: { label: "បានបង់ (PAID)", variant: "success" },
  OVERDUE: { label: "ហួសកំណត់ (OVERDUE)", variant: "danger" },
  CANCELLED: { label: "បានលុប (CANCELLED)", variant: "neutral" },
};

export const invoiceStatus = (status) => INVOICE_STATUS[status] || INVOICE_STATUS.DRAFT;