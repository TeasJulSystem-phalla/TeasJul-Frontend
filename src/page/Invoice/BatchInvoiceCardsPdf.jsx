import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { invoiceItemName } from '../../utils/invoiceItemName';

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

const STATUS_COLOR = {
  DRAFT:     { bg: '#f1f5f9', text: '#475569' },
  PENDING:   { bg: '#fffbeb', text: AMBER },
  PARTIAL:   { bg: '#eff6ff', text: CYAN },
  PAID:      { bg: '#f0fdf4', text: GREEN },
  OVERDUE:   { bg: '#fef2f2', text: RED },
  CANCELLED: { bg: '#f1f5f9', text: '#475569' },
};

const STATUS_LABELS = {
  DRAFT:     'ព្រាង',
  PENDING:   'រង់ចាំទូទាត់',
  PARTIAL:   'បានបង់មួយផ្នែក',
  PAID:      'បានទូទាត់',
  OVERDUE:   'ហួសកំណត់',
  CANCELLED: 'បានលុបចោល',
};

const MONTH_NAMES = [
  'មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា',
  'កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ',
];

const ITEM_LABELS = {
  RENT:        'ថ្លៃបន្ទប់',
  ELECTRICITY: 'ភ្លើង',
  WATER:       'ទឹក',
  INTERNET:    'អ៊ីនធឺណិត',
  PARKING:     'ចំណត',
  GARBAGE:     'សំរាម',
  OTHER:       'ផ្សេងៗ',
};

const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(v) || 0,
  );

const fmtDate = (v) => {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Khmer',
    flexDirection: 'column',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: BRAND,
  },
  headerSub: {
    fontSize: 9,
    color: MUTED,
    marginTop: 2,
  },
  headerMeta: {
    alignItems: 'flex-end',
  },
  headerMetaText: {
    fontSize: 9,
    color: MUTED,
  },
  headerMetaValue: {
    fontSize: 12,
    fontWeight: 700,
    color: BRAND,
  },

  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    marginBottom: 12,
    padding: 12,
    wrap: false,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardId: {
    fontSize: 13,
    fontWeight: 700,
    color: BRAND,
  },
  cardPeriod: {
    fontSize: 10,
    fontWeight: 700,
    color: ACCENT,
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 8,
    fontWeight: 700,
  },

  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    fontSize: 9,
    color: MUTED,
  },
  value: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    color: BRAND,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 8,
  },

  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 3,
    marginBottom: 3,
  },
  thDesc:   { flex: 2.2, fontSize: 7.5, fontWeight: 700, color: MUTED },
  thQty:    { flex: 0.5, fontSize: 7.5, fontWeight: 700, color: MUTED, textAlign: 'right' },
  thPrice:  { flex: 1,   fontSize: 7.5, fontWeight: 700, color: MUTED, textAlign: 'right' },
  thAmt:    { flex: 1,   fontSize: 7.5, fontWeight: 700, color: MUTED, textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  tdDesc:  { flex: 2.2, fontSize: 8, color: BRAND },
  tdQty:   { flex: 0.5, fontSize: 8, color: BRAND, textAlign: 'right' },
  tdPrice: { flex: 1,   fontSize: 8, color: BRAND, textAlign: 'right' },
  tdAmt:   { flex: 1,   fontSize: 8, fontWeight: 700, color: BRAND, textAlign: 'right' },
  itemMeta: {
    fontSize: 7,
    color: MUTED,
    marginTop: 1,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: LIGHT,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: BRAND,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: BRAND,
  },
});

// ─── Compact invoice card (summary only) ──────────────────────────────────────
function InvoiceCard({ invoice }) {
  const status = invoice.status || 'DRAFT';
  const sc = STATUS_COLOR[status] || STATUS_COLOR.DRAFT;
  const period =
    invoice.billingMonth && invoice.billingYear
      ? `${MONTH_NAMES[(invoice.billingMonth || 1) - 1]} ${invoice.billingYear}`
      : '—';

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View>
          <Text style={s.cardId}>វិក្កយបត្រ · {invoice.invoiceNo || '—'}</Text>
          <Text style={s.cardPeriod}>{period}</Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
          <Text style={[s.statusText, { color: sc.text }]}>
            {STATUS_LABELS[status] || status}
          </Text>
        </View>
      </View>

      <View style={s.row}>
        <Text style={s.label}>អ្នកជួល / Tenant</Text>
        <Text style={s.value}>{invoice.tenantName || '—'}</Text>
      </View>

      <View style={s.row}>
        <Text style={s.label}>បន្ទប់ / Room</Text>
        <Text style={s.value}>បន្ទប់លេខ {invoice.roomNumber || '—'}</Text>
      </View>

      {invoice.houseName && (
        <View style={s.row}>
          <Text style={s.label}>អគារ / Building</Text>
          <Text style={s.value}>{invoice.houseName}</Text>
        </View>
      )}

      <View style={s.row}>
        <Text style={s.label}>ថ្ងៃផុតកំណត់ / Due Date</Text>
        <Text style={s.value}>{fmtDate(invoice.dueDate)}</Text>
      </View>

      {(invoice.items || []).length > 0 && (
        <View style={s.divider} />
      )}

      {(invoice.items || []).length > 0 && (
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={s.thDesc}>បរិយាយ / Item</Text>
            <Text style={s.thQty}>ចំ.</Text>
            <Text style={s.thPrice}>តម្លៃឯកតា</Text>
            <Text style={s.thAmt}>ចំនួន</Text>
          </View>
          {invoice.items.map((item, idx) => (
            <View
              key={item.id || idx}
              style={[s.tableRow, idx === invoice.items.length - 1 && s.rowLast]}
            >
              <View style={s.tdDesc}>
                <Text>{invoiceItemName(item, ITEM_LABELS) || '—'}</Text>
                {item.description &&
                  item.description !== invoiceItemName(item, ITEM_LABELS) && (
                    <Text style={s.itemMeta}>{item.description}</Text>
                  )}
              </View>
              <Text style={s.tdQty}>{Number(item.quantity) || 1}</Text>
              <Text style={s.tdPrice}>{fmtCurrency(item.unitPrice)}</Text>
              <Text style={s.tdAmt}>{fmtCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={s.divider} />

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>សរុបត្រូវបង់ / Total Due</Text>
        <Text style={s.totalValue}>{fmtCurrency(invoice.totalAmount)}</Text>
      </View>
    </View>
  );
}

// ─── Batch document: one PDF, 3 compact cards per page ───────────────────────
export default function BatchInvoiceCardsPdf({ invoices = [], billingYear, billingMonth }) {
  const period = billingMonth && billingYear
    ? `${String(billingMonth).padStart(2, '0')}/${billingYear}`
    : null;

  const totalSum = (invoices || []).reduce(
    (acc, inv) => acc + (Number(inv.totalAmount) || 0),
    0,
  );

  const PER_PAGE = 3;
  const chunks = [];
  for (let i = 0; i < (invoices || []).length; i += PER_PAGE) {
    chunks.push((invoices || []).slice(i, i + PER_PAGE));
  }

  return (
    <Document
      title={period ? `វិក្កយបត្រ_${period}` : 'វិក្កយបត្រ'}
      author="TeasJul"
      subject="របាយការណ៍វិក្កយបត្រ"
      creator="TeasJul Rental Management"
    >
      {chunks.map((cards, index) => (
        <Page key={index} size="A4" style={s.page}>
          <View style={s.pageHeader}>
            <View>
              <Text style={s.headerTitle}>របាយការណ៍វិក្កយបត្រ</Text>
              <Text style={s.headerSub}>ចំនួនវិក្កយបត្រ / Invoices: {invoices.length}</Text>
            </View>
            <View style={s.headerMeta}>
              {period && <Text style={s.headerMetaValue}>ខែ {period}</Text>}
              <Text style={s.headerMetaText}>
                ទំព័រ {index + 1} / {chunks.length}
              </Text>
            </View>
          </View>

          {cards.map((inv) => (
            <InvoiceCard key={inv.id || inv.invoiceNo} invoice={inv} />
          ))}

          <View style={s.totalRow}>
            <Text style={s.totalLabel}>សរុបរួម / Grand Total</Text>
            <Text style={s.totalValue}>{fmtCurrency(totalSum)}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}