import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import { invoiceItemName } from '../../utils/invoiceItemName';

// ─── Palette (formal black-on-white) ──────────────────────────────────────────
const INK   = '#000000';
const MUTED = '#475569'; // slate-600
const FAINT = '#64748b'; // slate-500
const ROW   = '#f1f5f9'; // slate-100
const DASH  = '#cbd5e1'; // slate-300

const STATUS_TEXT = {
  DRAFT:     'សេចក្តីព្រាង (DRAFT)',
  PENDING:   'រង់ចាំទូទាត់ (PENDING)',
  PARTIAL:   'បានបង់មួយផ្នែក (PARTIAL)',
  PAID:      'បានទូទាត់រួចរាល់ (PAID)',
  OVERDUE:   'ហួសកាលកំណត់ (OVERDUE)',
  CANCELLED: 'បានលុបចោល (CANCELLED)',
};

const ITEM_LABELS = {
  RENT:        'ថ្លៃឈ្នួលបន្ទប់ស្នាក់នៅ',
  ELECTRICITY: 'ថ្លៃប្រើប្រាស់អគ្គិសនី',
  WATER:       'ថ្លៃប្រើប្រាស់ទឹកស្អាត',
  INTERNET:    'ថ្លៃសេវាអ៊ីនធឺណិត',
  PARKING:     'ថ្លៃសេវាចំណតយានយន្ត',
  GARBAGE:     'ថ្លៃសេវាប្រមូលសំរាម',
  OTHER:       'ថ្លៃសេវាផ្សេងៗ',
};

const MONTH_NAMES = [
  'មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា',
  'កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ',
];

const fmtUSD = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

const fmtKHR = (v, rate = 4100) => {
  const khr = Math.round((Number(v) || 0) * (Number(rate) || 4100));
  return new Intl.NumberFormat('km-KH').format(khr) + ' ៛';
};

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const fmtDateKhmer = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return `ថ្ងៃទី ${String(d.getDate()).padStart(2, '0')} ខែ ${MONTH_NAMES[d.getMonth()]} ឆ្នាំ ${d.getFullYear()}`;
};

function numberToKhmerWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'សូន្យដុល្លារអាមេរិកគត់';

  const d = ['', 'មួយ', 'ពីរ', 'បី', 'បួន', 'ប្រាំ', 'ប្រាំមួយ', 'ប្រាំពីរ', 'ប្រាំបី', 'ប្រាំបួន'];
  const t = ['', 'ដប់', 'ម្ភៃ', 'សាមសិប', 'សែសិប', 'ហាសិប', 'ហុកសិប', 'ចិតសិប', 'ប៉ែតសិប', 'កៅសិប'];

  const three = (val) => {
    let r = '';
    const h = Math.floor(val / 100);
    const ten = Math.floor((val % 100) / 10);
    const u = val % 10;
    if (h > 0) r += d[h] + 'រយ';
    if (ten > 0) {
      r += t[ten];
      if (u > 0) r += d[u];
    } else if (u > 0) {
      r += d[u];
    }
    return r;
  };

  let w = '';
  const th = Math.floor(n / 1000);
  const rem = n % 1000;
  if (th > 0) w += three(th) + 'ពាន់';
  if (rem > 0) w += three(rem);

  const cents = Math.round(((Number(num) || 0) - n) * 100);
  if (cents > 0) w += ' ដុល្លារ និង ' + three(cents) + ' សេន';
  else w += ' ដុល្លារអាមេរិកគត់';

  return w;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Khmer',
    backgroundColor: '#ffffff',
    padding: 36,
    fontSize: 9.5,
    color: INK,
  },
  border: { borderWidth: 1, borderColor: INK },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: INK, paddingBottom: 12 },
  company: { flex: 7, paddingRight: 12 },
  companyName: { fontSize: 13, fontWeight: 700 },
  companyLatin: { fontFamily: 'Times-Italic', fontSize: 9, marginTop: 2, letterSpacing: 0.5 },
  companyAddress: { fontSize: 8, color: MUTED, marginTop: 6, lineHeight: 1.5 },
  logo: { maxHeight: 42, maxWidth: 150, marginBottom: 6, objectFit: 'contain' },
  meta: { flex: 5, alignItems: 'flex-end' },
  titleBox: { borderWidth: 2, borderColor: INK, paddingVertical: 6, paddingHorizontal: 22, backgroundColor: ROW, alignItems: 'center' },
  titleKhmer: { fontFamily: 'Khmer-Bold', fontSize: 17 },
  titleLatin: { fontFamily: 'Times-Italic', fontSize: 9, letterSpacing: 2, marginTop: 1 },
  metaLine: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: DASH, paddingVertical: 3, marginTop: 6, minWidth: 200 },
  metaLabel: { fontSize: 8, color: MUTED },
  metaValue: { fontSize: 8.5, fontWeight: 700 },

  /* English document typography style (mirrors .english-doc: Times New Roman italic) */
  englishLabel: { fontFamily: 'Times-Italic', fontSize: 7.5, color: MUTED },
  englishTh: { fontFamily: 'Times-Italic', fontSize: 7, color: MUTED },

  /* Numeric typography style (mirrors .doc-number: Arial/Helvetica) */
  numValue: { fontFamily: 'Helvetica', fontSize: 8.5 },
  numBold: { fontFamily: 'Helvetica-Bold', fontSize: 8.5 },
  numCell: { fontFamily: 'Helvetica', fontSize: 8, color: INK, paddingVertical: 5, paddingHorizontal: 6 },
  numCellC: { fontFamily: 'Helvetica', fontSize: 8, color: INK, paddingVertical: 5, paddingHorizontal: 6, textAlign: 'center' },
  numCellR: { fontFamily: 'Helvetica', fontSize: 8, color: INK, paddingVertical: 5, paddingHorizontal: 6, textAlign: 'right' },
  numCellBoldR: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: INK, paddingVertical: 5, paddingHorizontal: 6, textAlign: 'right' },

  /* Info grid */
  infoGrid: { flexDirection: 'row', borderWidth: 1, borderColor: INK, marginTop: 14 },
  infoCol: { flex: 7, padding: 10, borderRightWidth: 1, borderRightColor: INK },
  infoColRight: { flex: 5, padding: 10 },
  infoTitle: { fontSize: 8.5, fontWeight: 700, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 4, marginBottom: 6 },
  infoRow: { flexDirection: 'row', marginBottom: 3 },
  infoK: { width: 150, fontSize: 8.5, color: MUTED },
  infoV: { flex: 1, fontSize: 8.5, fontWeight: 700 },
  status: { fontSize: 8.5, fontWeight: 700 },

  /* Items table */
  tableWrap: { borderWidth: 1, borderColor: INK, marginTop: 12 },
  thRow: { flexDirection: 'row', backgroundColor: ROW, borderBottomWidth: 1.5, borderBottomColor: INK },
  th: { fontSize: 8, fontWeight: 700, paddingVertical: 6, paddingHorizontal: 6 },
  thC: { fontSize: 8, fontWeight: 700, paddingVertical: 6, paddingHorizontal: 6, textAlign: 'center' },
  thR: { fontSize: 8, fontWeight: 700, paddingVertical: 6, paddingHorizontal: 6, textAlign: 'right' },
  tr: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#94a3b8' },
  trAlt: { backgroundColor: '#f8fafc' },
  trLast: { borderBottomWidth: 0 },
  cell: { fontSize: 8, color: INK, paddingVertical: 5, paddingHorizontal: 6 },
  cellC: { fontSize: 8, color: INK, paddingVertical: 5, paddingHorizontal: 6, textAlign: 'center' },
  cellR: { fontSize: 8, color: INK, paddingVertical: 5, paddingHorizontal: 6, textAlign: 'right' },
  cellBold: { fontSize: 8, fontWeight: 700, color: INK, paddingVertical: 5, paddingHorizontal: 6 },
  cellBoldR: { fontSize: 8, fontWeight: 700, color: INK, paddingVertical: 5, paddingHorizontal: 6, textAlign: 'right' },
  itemMeta: { fontSize: 7, color: MUTED, marginTop: 1 },
  emptyCell: { fontSize: 8, paddingVertical: 5, textAlign: 'center', color: '#ffffff' },

  /* Totals */
  totalCol: { flexDirection: 'row', marginTop: 4 },
  totalLeft: { flex: 1, borderWidth: 1, borderColor: INK, padding: 8 },
  totalRight: { width: 250, borderWidth: 1, borderColor: INK, marginLeft: 6 },
  totalLeftTitle: { fontSize: 8, fontWeight: 700 },
  wordsLine: { fontSize: 8.5, marginTop: 4, textDecoration: 'underline' },
  payInfoTitle: { fontSize: 8, fontWeight: 700, marginTop: 6, borderTopWidth: 0.5, borderTopColor: '#cbd5e1', paddingTop: 4 },
  payInfoText: { fontSize: 8, color: MUTED, marginTop: 2 },
  payInfoBold: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: INK },
  tLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#cbd5e1' },
  tLabel: { fontSize: 8.5, color: MUTED },
  tValue: { fontSize: 8.5 },
  tLineGreen: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#cbd5e1' },
  grand: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: ROW, paddingVertical: 6, paddingHorizontal: 8 },
  grandLabel: { fontSize: 9, fontWeight: 700 },
  grandValue: { fontFamily: 'Helvetica-Bold', fontSize: 10, textAlign: 'right' },
  grandKhr: { fontSize: 7.5, color: MUTED, textAlign: 'right' },
  paid: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 8 },
  paidLabel: { fontSize: 8.5, fontWeight: 700 },
  paidValue: { fontFamily: 'Helvetica-Bold', fontSize: 8.5 },

  /* Signatures */
  sigWrap: { flexDirection: 'row', marginTop: 40 },
  sig: { flex: 1, alignItems: 'center' },
  sigTitle: { fontSize: 8.5, fontWeight: 700, textAlign: 'center' },
  sigLatin: { fontFamily: 'Times-Italic', fontSize: 7.5, color: MUTED, textAlign: 'center', marginTop: 2 },
  sigDate: { fontSize: 8, color: MUTED, textAlign: 'center', marginTop: 6 },
  sigLine: { borderBottomWidth: 1, borderBottomColor: INK, width: 165, marginTop: 40 },
  sigName: { fontSize: 8.5, fontWeight: 700, textAlign: 'center', marginTop: 8 },

  /* Footer */
  footer: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 8, alignItems: 'center' },
  footerNote: { fontSize: 7.5, color: MUTED, textAlign: 'center', lineHeight: 1.5 },
  footerGen: { fontSize: 7, color: FAINT, marginTop: 3 },
});

const colNo =   { flex: 0.6 };
const colDesc = { flex: 3 };
const colQty =  { flex: 1, textAlign: 'right' };
const colPrice ={ flex: 1.4, textAlign: 'right' };
const colAmt =  { flex: 1.4, textAlign: 'right' };

// ─── Component ────────────────────────────────────────────────────────────────
export default function InvoicePdfDocument({ invoice, settings }) {
  const items = invoice.items || [];
  const exchangeRate = invoice.exchangeRate || settings?.exchangeRate || 4100;
  const emptyRowsNeeded = Math.max(0, 4 - items.length);
  const billingMonth = invoice.billingMonth
    ? `ខែ ${String(invoice.billingMonth).padStart(2, '0')}/${invoice.billingYear}`
    : '—';
  const statusLabel = STATUS_TEXT[invoice.status] || invoice.status;

  const S = settings || {};
  const bizName = (S.businessName && S.businessName.trim()) || invoice.houseName || 'TeasJul';
  const bizLatin = (S.businessName && S.businessName.trim())
    ? `${S.businessName.trim().toUpperCase()} RESIDENCE & APARTMENTS`
    : invoice.houseName
      ? `${invoice.houseName.toUpperCase()} RESIDENCE & APARTMENTS`
      : 'RENTALHUB PROPERTY MANAGEMENT';
  const showLogo = S.invoiceShowLogo !== false && !!S.logoUrl;
  const showBizInfo = S.invoiceShowBusinessInfo !== false;
  const addressText = (S.address && S.address.trim()) || 'រាជធានីភ្នំពេញ, ព្រះរាជាណាចក្រកម្ពុជា';
  const phoneText = (S.phone && S.phone.trim()) || '012 345 678 / 098 765 432';
  const emailText = (S.email && S.email.trim()) || 'info@rentalhub.com.kh';
  const showUsd = S.invoiceShowUsd !== false || S.invoiceShowKhr === false;
  const showKhr = S.invoiceShowKhr !== false;
  const footerNote = (S.invoiceFooter && S.invoiceFooter.trim())
    ? S.invoiceFooter.trim()
    : '* សម្គាល់៖ វិក្កយបត្រនេះជាឯកសារផ្លូវការសម្រាប់បញ្ជាក់ការទូទាត់ប្រាក់ថ្លៃឈ្នួលបន្ទប់ និងសេវាកម្មប្រចាំខែ។';

  return (
    <Document
      title={`Invoice ${invoice.invoiceNo}`}
      author={bizName}
      subject={`Invoice for ${invoice.tenantName || 'Tenant'}`}
      creator="TeasJul Rental Management"
    >
      <Page size="A4" style={s.page}>
        {/* 1. Header */}
        <View style={s.header}>
          <View style={s.company}>
            {showLogo ? (
              <Image src={S.logoUrl} style={s.logo} />
            ) : showBizInfo ? (
              <Text style={s.companyName}>{bizName}</Text>
            ) : null}
            <Text style={s.companyLatin}>{bizLatin}</Text>
            {showBizInfo && (
              <Text style={s.companyAddress}>
                អាសយដ្ឋាន៖ {addressText}
                {'\n'}
                ទំនាក់ទំនងលេខទូរស័ព្ទ៖ <Text style={s.numValue}>{phoneText}</Text>
                {'\n'}
                សារអេឡិចត្រូនិច (Email)៖ <Text style={s.numValue}>{emailText}</Text>
              </Text>
            )}
          </View>
          <View style={s.meta}>
            <View style={s.titleBox}>
              <Text style={s.titleKhmer}>វិក្កយបត្រ</Text>
              <Text style={s.titleLatin}>INVOICE</Text>
            </View>
            <View style={s.metaLine}>
              <Text style={s.metaLabel}>លេខវិក្កយបត្រ / <Text style={s.englishLabel}>Inv. No:</Text></Text>
              <Text style={[s.metaValue, s.numBold]}>{invoice.invoiceNo || '—'}</Text>
            </View>
            <View style={s.metaLine}>
              <Text style={s.metaLabel}>កាលបរិច្ឆេទ / <Text style={s.englishLabel}>Date:</Text></Text>
              <Text style={[s.metaValue, s.numValue]}>{fmtDate(invoice.createdAt)}</Text>
            </View>
            <View style={s.metaLine}>
              <Text style={s.metaLabel}>ថ្ងៃផុតកំណត់ / <Text style={s.englishLabel}>Due Date:</Text></Text>
              <Text style={[s.metaValue, s.numBold]}>{fmtDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* 2. Customer & billing grid */}
        <View style={s.infoGrid}>
          <View style={s.infoCol}>
            <Text style={s.infoTitle}>ព័ត៌មានអ្នកជួល / <Text style={s.englishLabel}>CUSTOMER (BILL TO)</Text></Text>
            <View style={s.infoRow}>
              <Text style={s.infoK}>ឈ្មោះអ្នកជួល៖</Text>
              <Text style={s.infoV}>{invoice.tenantName || '—'}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoK}>បន្ទប់ស្នាក់នៅ៖</Text>
              <Text style={s.infoV}>បន្ទប់លេខ <Text style={s.numBold}>{invoice.roomNumber || '—'}</Text></Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoK}>អគារ/ទីតាំង៖</Text>
              <Text style={s.infoV}>{invoice.houseName || '—'}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoK}>កិច្ចសន្យាលេខ៖</Text>
              <Text style={[s.infoV, s.numBold]}>{invoice.contractNo || '—'}</Text>
            </View>
          </View>
          <View style={s.infoColRight}>
            <Text style={s.infoTitle}>លក្ខខណ្ឌទូទាត់ / <Text style={s.englishLabel}>BILLING TERMS</Text></Text>
            <View style={s.infoRow}>
              <Text style={s.infoK}>សម្រាប់រយៈពេល៖</Text>
              <Text style={[s.infoV, s.numBold]}>{billingMonth}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoK}>កាលបរិច្ឆេទចេញ៖</Text>
              <Text style={s.infoV}>{fmtDateKhmer(invoice.createdAt)}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoK}>ស្ថានភាព៖</Text>
              <Text style={s.status}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* 3. Items table */}
        <View style={s.tableWrap}>
          <View style={s.thRow}>
            <View style={[colNo, { paddingVertical: 5, paddingHorizontal: 4, alignItems: 'center' }]}>
              <Text style={s.thC}>ល.រ</Text>
              <Text style={s.englishTh}>No.</Text>
            </View>
            <View style={[colDesc, { paddingVertical: 5, paddingHorizontal: 6 }]}>
              <Text style={s.th}>បរិយាយមុខទំនិញ / សេវាកម្ម</Text>
              <Text style={s.englishTh}>Description of Items & Services</Text>
            </View>
            <View style={[colQty, { paddingVertical: 5, paddingHorizontal: 6, alignItems: 'center' }]}>
              <Text style={s.thC}>បរិមាណ</Text>
              <Text style={s.englishTh}>Qty</Text>
            </View>
            <View style={[colPrice, { paddingVertical: 5, paddingHorizontal: 6, alignItems: 'flex-end' }]}>
              <Text style={s.thR}>តម្លៃឯកតា</Text>
              <Text style={s.englishTh}>Unit Price</Text>
            </View>
            <View style={[colAmt, { paddingVertical: 5, paddingHorizontal: 6, alignItems: 'flex-end' }]}>
              <Text style={s.thR}>ចំនួនទឹកប្រាក់</Text>
              <Text style={s.englishTh}>Amount (USD)</Text>
            </View>
          </View>

          {items.map((item, idx) => {
            const isAlt = idx % 2 === 1;
            const isLast = idx === items.length - 1;
            return (
              <View key={item.id || idx} style={[s.tr, isAlt && s.trAlt, isLast && s.trLast]}>
                <Text style={[s.numCellC, colNo]}>{idx + 1}</Text>
                <View style={colDesc}>
                  <Text style={s.cellBold}>{invoiceItemName(item, ITEM_LABELS)}</Text>
                  {item.description && item.description !== invoiceItemName(item, ITEM_LABELS) && (
                    <Text style={[s.itemMeta, { fontFamily: 'Times-Italic' }]}>{item.description}</Text>
                  )}
                </View>
                <Text style={[s.numCellC, colQty]}>{Number(item.quantity) || 1}</Text>
                <Text style={[s.numCellR, colPrice]}>{fmtUSD(item.unitPrice)}</Text>
                <Text style={[s.numCellBoldR, colAmt]}>{fmtUSD(item.amount)}</Text>
              </View>
            );
          })}

          {Array.from({ length: emptyRowsNeeded }).map((_, i) => (
            <View key={`empty-${i}`} style={[s.tr, i !== emptyRowsNeeded - 1 && s.trLast]}>
              <Text style={[s.emptyCell, colNo]}>.</Text>
              <Text style={colDesc} />
              <Text style={colQty} />
              <Text style={colPrice} />
              <Text style={colAmt} />
            </View>
          ))}

          <View style={s.trLast}>
            <Text style={[s.emptyCell, colNo]}>.</Text>
            <Text style={[s.cell, colDesc]}>.</Text>
            <Text style={[s.cellR, colQty]}>.</Text>
            <Text style={[s.cellR, colPrice]}>.</Text>
            <Text style={[s.cellR, colAmt]}>.</Text>
          </View>
        </View>

        {/* 4. Totals + amount in words */}
        <View style={s.totalCol}>
          <View style={s.totalLeft}>
            <Text style={s.totalLeftTitle}>ចំនួនទឹកប្រាក់ជាអក្សរ / <Text style={s.englishLabel}>Amount in words:</Text></Text>
            <Text style={s.wordsLine}>{numberToKhmerWords(invoice.totalAmount)}</Text>
            <Text style={s.payInfoTitle}>ព័ត៌មាននៃការទូទាត់ប្រាក់ <Text style={s.englishLabel}>(Payment Info):</Text></Text>
            <Text style={s.payInfoText}>
              {'• '}គណនីធនាគារ ABA / KHQR: <Text style={s.payInfoBold}>000 123 456 (TeasJul)</Text>
            </Text>
            <Text style={s.payInfoText}>
              {'• '}សូមមេត្តាទូទាត់ប្រាក់ត្រឹមថ្ងៃទី៖ <Text style={s.payInfoBold}>{fmtDate(invoice.dueDate)}</Text>
            </Text>
          </View>
          <View style={s.totalRight}>
            <View style={s.tLine}>
              <Text style={s.tLabel}>សរុបរង / <Text style={s.englishLabel}>Subtotal:</Text></Text>
              <Text style={[s.tValue, s.numValue]}>{fmtUSD(invoice.subtotal)}</Text>
            </View>
            <View style={s.tLine}>
              <Text style={s.tLabel}>បញ្ចុះតម្លៃ / <Text style={s.englishLabel}>Discount:</Text></Text>
              <Text style={[s.tValue, s.numValue]}>{Number(invoice.discount) > 0 ? `-${fmtUSD(invoice.discount)}` : '$0.00'}</Text>
            </View>
            <View style={s.tLine}>
              <Text style={s.tLabel}>ថ្លៃយឺតយ៉ាវ / <Text style={s.englishLabel}>Late Fee:</Text></Text>
              <Text style={[s.tValue, s.numValue]}>{Number(invoice.lateFee) > 0 ? `+${fmtUSD(invoice.lateFee)}` : '$0.00'}</Text>
            </View>
            <View style={s.grand}>
              <Text style={s.grandLabel}>សរុបត្រូវបង់ / <Text style={s.englishLabel}>Total Due:</Text></Text>
              <View>
                {showUsd && <Text style={[s.grandValue, s.numBold]}>{fmtUSD(invoice.totalAmount)}</Text>}
                {showKhr && <Text style={[s.grandKhr, s.numValue]}>≈ {fmtKHR(invoice.totalAmount, exchangeRate)}</Text>}
              </View>
            </View>
            <View style={s.paid}>
              <Text style={s.paidLabel}>បានបង់រួច / <Text style={s.englishLabel}>Paid:</Text></Text>
              <Text style={[s.paidValue, s.numBold]}>{fmtUSD(invoice.paidAmount || 0)}</Text>
            </View>
            <View style={s.paid}>
              <Text style={s.paidLabel}>នៅសល់ / <Text style={s.englishLabel}>Remaining:</Text></Text>
              <Text style={[s.paidValue, s.numBold]}>{fmtUSD(invoice.remainingAmount != null
                ? invoice.remainingAmount
                : Math.max(Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0), 0))}</Text>
            </View>
          </View>
        </View>        

        {/* 6. Footer note */}
        <View style={s.footer}>
          <Text style={s.footerNote}>{footerNote}</Text>
          <Text style={s.footerGen}>
            <Text style={{ fontFamily: 'Times-Italic' }}>Generated by TeasJul Management System · Reference ID: </Text>
            <Text style={{ fontFamily: 'Helvetica' }}>{invoice.invoiceNo}</Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
}
