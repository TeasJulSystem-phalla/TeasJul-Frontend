import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// ─── Colour palette ───────────────────────────────────────────────────────────
const BRAND   = '#1e293b'; // slate-800
const ACCENT  = '#3b82f6'; // blue-500
const MUTED   = '#64748b'; // slate-500
const LIGHT   = '#f8fafc'; // slate-50
const BORDER  = '#e2e8f0'; // slate-200
const GREEN   = '#16a34a'; // green-600
const RED     = '#dc2626'; // red-600
const AMBER   = '#d97706'; // amber-600
const CYAN    = '#0891b2'; // cyan-600
const WHITE   = '#ffffff';

// ─── Status colours ───────────────────────────────────────────────────────────
const STATUS_COLOR = {
  DRAFT:     { bg: '#f1f5f9', text: '#475569' },
  PENDING:   { bg: '#fffbeb', text: AMBER },
  PARTIAL:   { bg: '#eff6ff', text: CYAN },
  PAID:      { bg: '#f0fdf4', text: GREEN },
  OVERDUE:   { bg: '#fef2f2', text: RED },
  CANCELLED: { bg: '#f1f5f9', text: '#475569' },
};

const STATUS_LABELS = {
  DRAFT:     'Draft',
  PENDING:   'Pending',
  PARTIAL:   'Partially Paid',
  PAID:      'Paid',
  OVERDUE:   'Overdue',
  CANCELLED: 'Cancelled',
};

const ITEM_LABELS = {
  RENT:        'Room Rent',
  ELECTRICITY: 'Electricity',
  WATER:       'Water',
  INTERNET:    'Internet',
  PARKING:     'Parking',
  OTHER:       'Other',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(v) || 0,
  );

const fmtDate = (v) => {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 44,
    fontSize: 9,
    color: BRAND,
    lineHeight: 1.5,
  },

  // ── Header band ─────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  logoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    backgroundColor: BRAND,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    color: WHITE,
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginTop: -2,
  },
  brandName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
  },
  brandSub: {
    fontSize: 8,
    color: MUTED,
    marginTop: 1,
  },
  invoiceMeta: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    letterSpacing: 1,
  },
  invoiceNo: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    marginTop: 4,
  },
  invoiceDate: {
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
  },

  // ── Divider ─────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 20,
  },
  accentDivider: {
    height: 3,
    backgroundColor: ACCENT,
    borderRadius: 2,
    marginBottom: 20,
  },

  // ── Info row (Bill To / Invoice Details) ────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  infoBox: {
    flex: 1,
    backgroundColor: LIGHT,
    borderRadius: 8,
    padding: 14,
    borderLeft: `3px solid ${ACCENT}`,
  },
  infoBoxRight: {
    flex: 1,
    backgroundColor: LIGHT,
    borderRadius: 8,
    padding: 14,
    borderLeft: `3px solid ${BORDER}`,
  },
  infoLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 8.5,
    color: MUTED,
    marginBottom: 2,
  },

  // ── Status badge ────────────────────────────────────────────────
  statusBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },

  // ── Items table ─────────────────────────────────────────────────
  tableWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    border: `1px solid ${BORDER}`,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BRAND,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottom: `1px solid ${BORDER}`,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: LIGHT,
  },
  tableRowLast: {
    borderBottom: 'none',
  },
  colDesc:  { flex: 3 },
  colQty:   { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1.4, textAlign: 'right' },
  colAmt:   { flex: 1.4, textAlign: 'right' },
  cellText: {
    fontSize: 9,
    color: BRAND,
  },
  cellMuted: {
    fontSize: 8,
    color: MUTED,
  },
  cellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
  },

  // ── Totals block ────────────────────────────────────────────────
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  totalsBox: {
    width: 240,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderBottom: `1px solid ${BORDER}`,
  },
  totalLineLabel: {
    fontSize: 8.5,
    color: MUTED,
  },
  totalLineValue: {
    fontSize: 8.5,
    color: BRAND,
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: BRAND,
    borderRadius: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },

  // ── Payment info (if partial) ────────────────────────────────────
  paymentInfoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentInfoLabel: { fontSize: 8, color: CYAN },
  paymentInfoValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: CYAN },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 44,
    right: 44,
  },
  footerDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerThank: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
  },
  footerNote: {
    fontSize: 7.5,
    color: MUTED,
    marginTop: 2,
  },
  footerPage: {
    fontSize: 7.5,
    color: MUTED,
  },

  // ── Billing period chip ─────────────────────────────────────────
  periodChip: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  periodChipText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    letterSpacing: 0.4,
  },
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function InvoicePdfDocument({ invoice }) {
  const statusColor = STATUS_COLOR[invoice.status] || STATUS_COLOR.DRAFT;
  const statusLabel = STATUS_LABELS[invoice.status] || invoice.status;

  const billingPeriod =
    invoice.billingMonth && invoice.billingYear
      ? `${MONTH_NAMES[(invoice.billingMonth || 1) - 1]} ${invoice.billingYear}`
      : null;

  const items = invoice.items || [];

  return (
    <Document
      title={`Invoice ${invoice.invoiceNo}`}
      author="RentalHub"
      subject={`Invoice for ${invoice.tenantName || 'Tenant'}`}
      creator="RentalHub Rental Management"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={s.header}>
          {/* Brand */}
          <View style={s.logoBlock}>
            <View style={s.logoBox}>
              <Text style={s.logoInitial}>R</Text>
            </View>
            <View>
              <Text style={s.brandName}>RentalHub</Text>
              <Text style={s.brandSub}>Property Management System</Text>
            </View>
          </View>

          {/* Invoice ID block */}
          <View style={s.invoiceMeta}>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <Text style={s.invoiceNo}>{invoice.invoiceNo}</Text>
            <Text style={s.invoiceDate}>
              Issued: {fmtDate(invoice.createdAt)}
            </Text>
          </View>
        </View>

        {/* ── Accent divider ──────────────────────────────────────── */}
        <View style={s.accentDivider} />

        {/* ── Billing period chip ─────────────────────────────────── */}
        {billingPeriod && (
          <View style={s.periodChip}>
            <Text style={s.periodChipText}>
              BILLING PERIOD · {billingPeriod.toUpperCase()}
            </Text>
          </View>
        )}

        {/* ── Info row ────────────────────────────────────────────── */}
        <View style={s.infoRow}>
          {/* Bill To */}
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Bill To</Text>
            <Text style={s.infoValue}>{invoice.tenantName || '—'}</Text>
            {invoice.houseName && (
              <Text style={s.infoText}>{invoice.houseName}</Text>
            )}
            {invoice.roomNumber && (
              <Text style={s.infoText}>Room {invoice.roomNumber}</Text>
            )}
            {invoice.contractNo && (
              <Text style={s.infoText}>Contract: {invoice.contractNo}</Text>
            )}
          </View>

          {/* Invoice Details */}
          <View style={s.infoBoxRight}>
            <Text style={s.infoLabel}>Invoice Details</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={s.infoText}>Invoice No.</Text>
              <Text style={{ ...s.infoText, fontFamily: 'Helvetica-Bold', color: BRAND }}>
                {invoice.invoiceNo}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={s.infoText}>Due Date</Text>
              <Text style={{ ...s.infoText, fontFamily: 'Helvetica-Bold', color: BRAND }}>
                {fmtDate(invoice.dueDate)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.infoText}>Status</Text>
              <View style={{ ...s.statusBadge, backgroundColor: statusColor.bg, marginTop: 0 }}>
                <Text style={{ ...s.statusText, color: statusColor.text }}>
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Items table ─────────────────────────────────────────── */}
        <View style={s.tableWrapper}>
          {/* Table head */}
          <View style={s.tableHeader}>
            <Text style={{ ...s.tableHeaderText, ...s.colDesc }}>Description</Text>
            <Text style={{ ...s.tableHeaderText, ...s.colQty }}>Qty</Text>
            <Text style={{ ...s.tableHeaderText, ...s.colPrice }}>Unit Price</Text>
            <Text style={{ ...s.tableHeaderText, ...s.colAmt }}>Amount</Text>
          </View>

          {/* Table body */}
          {items.length === 0 && (
            <View style={{ ...s.tableRow, justifyContent: 'center' }}>
              <Text style={s.cellMuted}>No items</Text>
            </View>
          )}
          {items.map((item, idx) => {
            const isAlt  = idx % 2 === 1;
            const isLast = idx === items.length - 1;
            return (
              <View
                key={item.id || idx}
                style={[
                  s.tableRow,
                  isAlt  && s.tableRowAlt,
                  isLast && s.tableRowLast,
                ]}
              >
                <View style={s.colDesc}>
                  <Text style={s.cellBold}>
                    {ITEM_LABELS[item.itemType] || item.itemType}
                  </Text>
                  {item.description &&
                    item.description !== (ITEM_LABELS[item.itemType] || '') && (
                      <Text style={s.cellMuted}>{item.description}</Text>
                    )}
                </View>
                <Text style={{ ...s.cellText, ...s.colQty }}>
                  {Number(item.quantity)}
                </Text>
                <Text style={{ ...s.cellText, ...s.colPrice }}>
                  {fmtCurrency(item.unitPrice)}
                </Text>
                <Text style={{ ...s.cellBold, ...s.colAmt }}>
                  {fmtCurrency(item.amount)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── Payment info (partial payment) ──────────────────────── */}
        {invoice.status === 'PARTIAL' && Number(invoice.paidAmount) > 0 && (
          <View style={s.paymentInfoBox}>
            <View>
              <Text style={s.paymentInfoLabel}>Amount Paid</Text>
              <Text style={s.paymentInfoValue}>{fmtCurrency(invoice.paidAmount)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.paymentInfoLabel}>Remaining Balance</Text>
              <Text style={s.paymentInfoValue}>
                {fmtCurrency(Number(invoice.totalAmount) - Number(invoice.paidAmount))}
              </Text>
            </View>
          </View>
        )}

        {/* ── Totals ──────────────────────────────────────────────── */}
        <View style={s.totalsRow}>
          <View style={s.totalsBox}>
            <View style={s.totalLine}>
              <Text style={s.totalLineLabel}>Subtotal</Text>
              <Text style={s.totalLineValue}>{fmtCurrency(invoice.subtotal)}</Text>
            </View>
            {Number(invoice.discount) > 0 && (
              <View style={s.totalLine}>
                <Text style={s.totalLineLabel}>Discount</Text>
                <Text style={{ ...s.totalLineValue, color: GREEN }}>
                  -{fmtCurrency(invoice.discount)}
                </Text>
              </View>
            )}
            {Number(invoice.lateFee) > 0 && (
              <View style={s.totalLine}>
                <Text style={s.totalLineLabel}>Late Fee</Text>
                <Text style={{ ...s.totalLineValue, color: RED }}>
                  +{fmtCurrency(invoice.lateFee)}
                </Text>
              </View>
            )}
            <View style={s.grandTotalLine}>
              <Text style={s.grandTotalLabel}>TOTAL DUE</Text>
              <Text style={s.grandTotalValue}>{fmtCurrency(invoice.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <View style={s.footer}>
          <View style={s.footerDivider} />
          <View style={s.footerRow}>
            <View>
              <Text style={s.footerThank}>Thank you for your business!</Text>
              <Text style={s.footerNote}>
                {invoice.status === 'PAID'
                  ? 'This invoice has been paid in full. Thank you.'
                  : `Please ensure payment is made by ${fmtDate(invoice.dueDate)}.`}
              </Text>
              <Text style={s.footerNote}>
                RentalHub · Property Management System
              </Text>
            </View>
            <Text style={s.footerPage}>
              Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
