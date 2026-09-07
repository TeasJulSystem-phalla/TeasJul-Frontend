// src/page/owner/OwnerReportPdfDocument.jsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const INK = '#000000';
const MUTED = '#475569';
const FAINT = '#64748b';
const ROW = '#f1f5f9';
const DASH = '#cbd5e1';

const MONTH_NAMES = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
];

const INVOICE_STATUS_LABELS = {
  PAID: 'បានបង់',
  PARTIAL: 'បង់មួយផ្នែក',
  PENDING: 'កំពុងរង់ចាំ',
  OVERDUE: 'ហួសកំណត់',
  CANCELLED: 'បានលុប',
  DRAFT: 'ព្រាង',
};

const fmtUSD = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

const fmtNum = (v) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(v) || 0);

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const s = StyleSheet.create({
  page: {
    fontFamily: 'Khmer',
    backgroundColor: '#ffffff',
    padding: 36,
    paddingBottom: 60,
    fontSize: 9,
    color: INK,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: INK,
    paddingBottom: 12,
  },
  company: { flex: 7, paddingRight: 12 },
  companyName: { fontSize: 13, fontWeight: 700 },
  companyLatin: { fontSize: 8, fontWeight: 700, marginTop: 2, letterSpacing: 1 },
  companyAddress: { fontSize: 7.5, color: MUTED, marginTop: 6, lineHeight: 1.5 },
  titleBox: {
    flex: 5,
    borderWidth: 2,
    borderColor: INK,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: ROW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleKhmer: { fontSize: 15, fontWeight: 700 },
  titleLatin: { fontSize: 8, fontWeight: 700, letterSpacing: 2, marginTop: 1 },
  metaGrid: { flexDirection: 'row', marginTop: 14 },
  metaCol: { flex: 1, paddingRight: 12 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: DASH,
    paddingVertical: 4,
  },
  metaLabel: { fontSize: 8, color: MUTED },
  metaValue: { fontSize: 8.5, fontWeight: 700 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    borderBottomWidth: 1.5,
    borderBottomColor: INK,
    paddingBottom: 3,
    marginBottom: 8,
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#94a3b8' },
  tableRowAlt: { backgroundColor: '#f8fafc' },
  tableRowLast: { borderBottomWidth: 0 },
  labelCol: { flex: 2.2 },
  valueCol: { flex: 1, textAlign: 'right' },
  cell: { fontSize: 8, paddingVertical: 4, paddingHorizontal: 6 },
  cellR: { fontSize: 8, paddingVertical: 4, paddingHorizontal: 6, textAlign: 'right' },
  netRow: { backgroundColor: ROW },
  netLabel: { fontSize: 9, fontWeight: 700, paddingVertical: 6, paddingHorizontal: 6 },
  netValue: { fontSize: 10, fontWeight: 700, paddingVertical: 6, paddingHorizontal: 6, textAlign: 'right' },
  panelRow: { flexDirection: 'row', marginTop: 14 },
  panel: { flex: 1, borderWidth: 1, borderColor: INK },
  panelRight: { flex: 1, borderWidth: 1, borderColor: INK, marginLeft: 10 },
  panelTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    backgroundColor: ROW,
    borderBottomWidth: 1,
    borderBottomColor: INK,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  smallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  smallLabel: { fontSize: 8, color: MUTED },
  smallValue: { fontSize: 8, fontWeight: 700 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: DASH,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerNote: { fontSize: 7, color: FAINT },
});

export default function OwnerReportPdfDocument({ report }) {
  const meta = report?.meta || {};
  const rooms = report?.rooms || {};
  const fin = report?.financial || {};
  const contracts = report?.contracts || {};
  const payments = report?.payments || {};
  const utilities = report?.utilities || {};
  const maintenance = report?.maintenance || {};
  const revenueTrend = report?.revenueTrend || [];
  const paymentStatus = report?.paymentStatus || [];

  const monthName = MONTH_NAMES[Number(meta.month) ? Number(meta.month) - 1 : 0] || '—';
  const periodLabel = `${monthName} ${meta.year ?? '—'}`;
  const houseLabel = meta.houseName || (meta.houseId ? `អចលនទ្រព្យ #${meta.houseId}` : 'អចលនទ្រព្យទាំងអស់');

  return (
    <Document
      title={`របាយការណ៍ប្រចាំខែ ${monthName} ${meta.year || ''}`}
      author="RentalHub"
      subject="Monthly owner report"
      creator="RentalHub Rental Management"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.company}>
            <Text style={s.companyName}>សហគ្រាសជួលផ្ទះ និងអគារ RentalHub</Text>
            <Text style={s.companyLatin}>RENTALHUB PROPERTY MANAGEMENT</Text>
            <Text style={s.companyAddress}>
              អាសយដ្ឋាន៖ រាជធានីភ្នំពេញ, ព្រះរាជាណាចក្រកម្ពុជា
              {'\n'}
              ទំនាក់ទំនងលេខទូរស័ព្ទ៖ 012 345 678 / 098 765 432
              {'\n'}
              សារអេឡិចត្រូនិច (Email)៖ info@rentalhub.com.kh
            </Text>
          </View>
          <View style={s.titleBox}>
            <Text style={s.titleKhmer}>របាយការណ៍ប្រចាំខែ</Text>
            <Text style={s.titleLatin}>MONTHLY REPORT</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={s.metaGrid}>
          <View style={s.metaCol}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>រយៈពេលរបាយការណ៍ / Period:</Text>
              <Text style={s.metaValue}>{periodLabel}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>អចលនទ្រព្យ / Property:</Text>
              <Text style={s.metaValue}>{houseLabel}</Text>
            </View>
          </View>
          <View style={s.metaCol}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>ប្រភេទរបាយការណ៍ / Type:</Text>
              <Text style={s.metaValue}>របាយការណ៍ម្ចាស់ (Owner)</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>កាលបរិច្ឆេទចេញ / Generated:</Text>
              <Text style={s.metaValue}>{fmtDate(meta.generatedAt)}</Text>
            </View>
          </View>
        </View>

        {/* Financial summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>សេចក្តីសង្ខេបហិរញ្ញវត្ថុ / FINANCIAL SUMMARY</Text>
          <FinancialRows fin={fin} />
        </View>

        {/* Rooms + Contracts */}
        <View style={s.panelRow}>
          <View style={s.panel}>
            <Text style={s.panelTitle}>បន្ទប់ / ROOM STATUS</Text>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>បន្ទប់សរុប (Total Rooms)</Text>
              <Text style={s.smallValue}>{fmtNum(rooms.totalRooms)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>កាន់កាប់ (Occupied)</Text>
              <Text style={s.smallValue}>{fmtNum(rooms.occupiedRooms)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>ទំនេរ (Available)</Text>
              <Text style={s.smallValue}>{fmtNum(rooms.availableRooms)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>បម្រុងទុក (Reserved)</Text>
              <Text style={s.smallValue}>{fmtNum(rooms.reservedRooms)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>ជួសជុល (Maintenance)</Text>
              <Text style={s.smallValue}>{fmtNum(rooms.maintenanceRooms)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>អត្រាកាន់កាប់ (Occupancy Rate)</Text>
              <Text style={s.smallValue}>{Number(rooms.occupancyRate) || 0}%</Text>
            </View>
          </View>
          <View style={s.panelRight}>
            <Text style={s.panelTitle}>កិច្ចសន្យា / CONTRACTS</Text>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>ថ្មីក្នុងខែ (New Contracts)</Text>
              <Text style={s.smallValue}>{fmtNum(contracts.newContracts)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>សកម្ម (Active)</Text>
              <Text style={s.smallValue}>{fmtNum(contracts.activeContracts)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>បានផុតកំណត់ (Expired)</Text>
              <Text style={s.smallValue}>{fmtNum(contracts.expiredContracts)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>បានបញ្ចប់ (Terminated)</Text>
              <Text style={s.smallValue}>{fmtNum(contracts.terminatedContracts)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>បានបន្ត (Renewed)</Text>
              <Text style={s.smallValue}>{fmtNum(contracts.renewedContracts)}</Text>
            </View>
          </View>
        </View>

        {/* Payments + Utilities + Maintenance */}
        <View style={s.panelRow}>
          <View style={s.panel}>
            <Text style={s.panelTitle}>ការទូទាត់ / PAYMENTS</Text>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>បានបង់ (Paid)</Text>
              <Text style={s.smallValue}>{fmtNum(payments.paidPayments)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>កំពុងរង់ចាំ (Pending)</Text>
              <Text style={s.smallValue}>{fmtNum(payments.pendingPayments)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>ហួសកំណត់ (Overdue)</Text>
              <Text style={s.smallValue}>{fmtNum(payments.overduePayments)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>ទឹកប្រាក់ទទួលបាន</Text>
              <Text style={s.smallValue}>{fmtUSD(payments.totalPaymentAmount)}</Text>
            </View>
          </View>
          <View style={s.panelRight}>
            <Text style={s.panelTitle}>ទឹកភ្លើង / UTILITIES</Text>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>ទឹកស្អាត (m³)</Text>
              <Text style={s.smallValue}>{fmtNum(utilities.totalWaterUsage)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>អគ្គិសនី (kWh)</Text>
              <Text style={s.smallValue}>{fmtNum(utilities.totalElectricityUsage)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>តម្លៃប្រើប្រាស់សរុប</Text>
              <Text style={s.smallValue}>{fmtUSD(utilities.totalUtilityCharges)}</Text>
            </View>
            <View style={s.smallRow}>
              <Text style={s.smallLabel}>បានបង់ / នៅសល់ (វិក្កយបត្រ)</Text>
              <Text style={s.smallValue}>
                {fmtNum(utilities.paidUtilityBills)} / {fmtNum(utilities.outstandingUtilityBills)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[s.panel, s.section]}>
          <Text style={s.panelTitle}>ការជួសជុល / MAINTENANCE</Text>
          <View style={s.smallRow}>
            <Text style={s.smallLabel}>ស្នើសុំសរុប (Total Requests)</Text>
            <Text style={s.smallValue}>{fmtNum(maintenance.totalRequests)}</Text>
          </View>
          <View style={s.smallRow}>
            <Text style={s.smallLabel}>រង់ចាំ / ដំណើរការ / ដោះស្រាយ / លុប</Text>
            <Text style={s.smallValue}>
              {fmtNum(maintenance.openRequests)} / {fmtNum(maintenance.inProgressRequests)} /{' '}
              {fmtNum(maintenance.completedRequests)} / {fmtNum(maintenance.cancelledRequests)}
            </Text>
          </View>
          <View style={s.smallRow}>
            <Text style={s.smallLabel}>ចំណាយសរុប (Total Cost)</Text>
            <Text style={s.smallValue}>{fmtUSD(maintenance.totalCost)}</Text>
          </View>
        </View>

        {/* Revenue trend + payment status */}
        <View style={s.panelRow}>
          <View style={s.panel}>
            <Text style={s.panelTitle}>និន្នាការចំណូល ១២ ខែ / REVENUE TREND</Text>
            {revenueTrend.length === 0 ? (
              <View style={s.smallRow}>
                <Text style={s.smallLabel}>គ្មានទិន្នន័យ</Text>
              </View>
            ) : (
              revenueTrend.map((p, i) => (
                <View key={p.month} style={[s.smallRow, i % 2 === 1 && s.tableRowAlt]}>
                  <Text style={s.smallLabel}>{p.month}</Text>
                  <Text style={s.smallValue}>{fmtUSD(p.amount)}</Text>
                </View>
              ))
            )}
          </View>
          <View style={s.panelRight}>
            <Text style={s.panelTitle}>ស្ថានភាពវិក្កយបត្រ / INVOICE STATUS</Text>
            {paymentStatus.length === 0 ? (
              <View style={s.smallRow}>
                <Text style={s.smallLabel}>គ្មានទិន្នន័យ</Text>
              </View>
            ) : (
              paymentStatus.map((st, i) => (
                <View key={st.status} style={[s.smallRow, i % 2 === 1 && s.tableRowAlt]}>
                  <Text style={s.smallLabel}>
                    {INVOICE_STATUS_LABELS[st.status] || st.status}
                  </Text>
                  <Text style={s.smallValue}>{fmtNum(st.count)}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Footer */}
        <View fixed style={s.footer}>
          <Text style={s.footerNote}>
            Generated by RentalHub Management System · របាយការណ៍ប្រចាំខែ {periodLabel}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function FinancialRows({ fin }) {
  const rows = [
    ['ថ្លៃឈ្នួលសរុប / Total Rent Billed', fin.totalRent],
    ['ទទួលបាន / Total Collected', fin.totalPaid],
    ['នៅសល់ត្រូវបង់ / Total Outstanding', fin.totalOutstanding],
    ['ប្រាក់កក់ / Total Deposits', fin.totalDeposits],
    ['ចំណាយ / Total Expenses', fin.totalExpenses],
  ];
  return (
    <View>
      {rows.map(([label, value], i) => (
        <View key={label} style={[s.tableRow, i % 2 === 1 && s.tableRowAlt]}>
          <Text style={[s.cell, s.labelCol]}>{label}</Text>
          <Text style={[s.cellR, s.valueCol]}>{fmtUSD(value)}</Text>
        </View>
      ))}
      <View style={[s.tableRow, s.tableRowLast, s.netRow]}>
        <Text style={[s.netLabel, s.labelCol]}>ចំណូលសុទ្ធ / NET REVENUE</Text>
        <Text style={[s.netValue, s.valueCol]}>{fmtUSD(fin.netRevenue)}</Text>
      </View>
    </View>
  );
}
