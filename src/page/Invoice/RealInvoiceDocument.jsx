import { forwardRef } from 'react';
import { invoiceItemName } from '../../utils/invoiceItemName';

// Format currency
const formatUSD = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(Number(val) || 0);

const formatKHR = (val, rate = 4100) => {
  const khr = Math.round((Number(val) || 0) * (Number(rate) || 4100));
  return new Intl.NumberFormat('km-KH').format(khr) + ' ៛';
};

// Format standard date
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatKhmerDateText = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const monthNamesKhmer = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
  ];
  return `ថ្ងៃទី ${day} ខែ ${monthNamesKhmer[d.getMonth()]} ឆ្នាំ ${d.getFullYear()}`;
};

const ITEM_LABELS = {
  RENT: 'ថ្លៃឈ្នួលបន្ទប់ស្នាក់នៅ (Room Rent)',
  ELECTRICITY: 'ថ្លៃប្រើប្រាស់អគ្គិសនី (Electricity)',
  WATER: 'ថ្លៃប្រើប្រាស់ទឹកស្អាត (Water Supply)',
  INTERNET: 'ថ្លៃសេវាអ៊ីនធឺណិត (Internet / Wi-Fi)',
  PARKING: 'ថ្លៃសេវាចំណតយានយន្ត (Parking)',
  GARBAGE: 'ថ្លៃសេវាប្រមូលសំរាម (Garbage Collection)',
  OTHER: 'ថ្លៃសេវាផ្សេងៗ (Other Services)',
};

const STATUS_TEXT = {
  DRAFT: 'សេចក្តីព្រាង (DRAFT)',
  PENDING: 'រង់ចាំទូទាត់ (PENDING)',
  PARTIAL: 'បានបង់មួយផ្នែក (PARTIAL)',
  PAID: 'បានទូទាត់រួចរាល់ (PAID)',
  OVERDUE: 'ហួសកាលកំណត់ (OVERDUE)',
  CANCELLED: 'បានលុបចោល (CANCELLED)',
};

// Helper: number to Khmer words for common amounts
const numberToKhmerWords = (num) => {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'សូន្យដុល្លារអាមេរិកគត់';

  const khmerDigits = ['', 'មួយ', 'ពីរ', 'បី', 'បួន', 'ប្រាំ', 'ប្រាំមួយ', 'ប្រាំពីរ', 'ប្រាំបី', 'ប្រាំបួន'];
  const khmerTens = ['', 'ដប់', 'ម្ភៃ', 'សាមសិប', 'សែសិប', 'ហាសិប', 'ហុកសិប', 'ចិតសិប', 'ប៉ែតសិប', 'កៅសិប'];

  const convertThreeDigits = (val) => {
    let res = '';
    const h = Math.floor(val / 100);
    const t = Math.floor((val % 100) / 10);
    const u = val % 10;

    if (h > 0) res += khmerDigits[h] + 'រយ';
    if (t > 0) {
      res += khmerTens[t];
      if (u > 0) res += khmerDigits[u];
    } else if (u > 0) {
      if (h > 0) res += '';
      res += khmerDigits[u];
    }
    return res;
  };

  let words = '';
  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;

  if (thousands > 0) {
    words += convertThreeDigits(thousands) + 'ពាន់';
  }
  if (remainder > 0) {
    words += convertThreeDigits(remainder);
  }

  const cents = Math.round(((Number(num) || 0) - n) * 100);
  if (cents > 0) {
    words += ' ដុល្លារ និង ' + convertThreeDigits(cents) + ' សេន';
  } else {
    words += ' ដុល្លារអាមេរិកគត់';
  }

  return words;
};

const RealInvoiceDocument = forwardRef(function RealInvoiceDocument(
  { invoice, settings },
  ref
) {
  if (!invoice) return null;

  const items = invoice.items || [];
  const exchangeRate = invoice.exchangeRate || settings?.exchangeRate || 4100;
  const billingMonth = invoice.billingMonth
    ? `ខែ ${String(invoice.billingMonth).padStart(2, '0')}/${invoice.billingYear}`
    : '—';

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

  // Fill up to at least 4 rows so table looks like an authentic formal document
  const emptyRowsNeeded = Math.max(0, 4 - items.length);

  return (
    <div
      id="invoice-document"
      ref={ref}
      className="mx-auto w-full max-w-[794px] bg-white text-black font-khmer p-8 sm:p-10 border border-slate-300 shadow-xl print:shadow-none print:border-none print:m-0 print:p-0"
      style={{
        boxSizing: 'border-box',
        color: '#000000',
        backgroundColor: '#ffffff',
      }}
    >
      {/* ── 1. OFFICIAL INVOICE HEADER ────────────────────────────────────────── */}
      <div className="border-b-2 border-black pb-4">
        <div className="flex justify-between items-start">
          {/* Company / Enterprise details */}
          <div className="w-7/12 pr-4 space-y-1">
            {showLogo && (
              <img
                src={S.logoUrl}
                alt="logo"
                className="max-h-12 max-w-[150px] object-contain"
              />
            )}
            {!showLogo && showBizInfo && (
              <h2 className="text-base font-bold uppercase tracking-wide text-black">
                {bizName}
              </h2>
            )}
            <p className="text-[12px] font-bold tracking-wider text-slate-800 uppercase font-sans">
              {bizLatin}
            </p>
            {showBizInfo && (
              <div className="text-[11px] text-slate-700 leading-relaxed pt-1 space-y-0.5">
                <p>អាសយដ្ឋាន៖ {addressText}</p>
                <p>ទំនាក់ទំនងលេខទូរស័ព្ទ៖ {phoneText}</p>
                <p>សារអេឡិចត្រូនិច (Email)៖ {emailText}</p>
              </div>
            )}
          </div>

          {/* Title & Reference Box */}
          <div className="w-5/12 flex flex-col items-end">
            <div className="border-2 border-black px-6 py-2 text-center w-full max-w-[220px] bg-slate-50">
              <h1 className="text-xl font-bold tracking-wider text-black leading-tight">
                វិក្កយបត្រ
              </h1>
              <p className="text-[12px] font-bold tracking-[0.2em] text-black uppercase font-sans">
                INVOICE
              </p>
            </div>

            <div className="mt-2 text-right text-[11.5px] space-y-1 w-full">
              <div className="flex justify-between border-b border-dotted border-slate-300 pb-0.5">
                <span className="text-slate-600">លេខវិក្កយបត្រ / Inv. No:</span>
                <span className="font-bold font-mono text-black">{invoice.invoiceNo || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-300 pb-0.5">
                <span className="text-slate-600">កាលបរិច្ឆេទ / Date:</span>
                <span className="font-semibold text-black">{formatDate(invoice.createdAt)}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-300 pb-0.5">
                <span className="text-slate-600">ថ្ងៃផុតកំណត់ / Due Date:</span>
                <span className="font-bold text-black">{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. CUSTOMER / TENANT & BILLING DETAILS GRID ───────────────────────── */}
      <div className="mt-4 border border-black">
        <div className="grid grid-cols-12 text-[11.5px]">
          {/* Left Column: Tenant Information */}
          <div className="col-span-7 border-r border-black p-3 space-y-1.5">
            <div className="font-bold text-[11px] uppercase tracking-wider text-black border-b border-slate-300 pb-1 mb-1">
              ព័ត៌មានអ្នកជួល / CUSTOMER (BILL TO)
            </div>
            <div className="grid grid-cols-12 gap-y-1 text-slate-800">
              <span className="col-span-4 text-slate-600">ឈ្មោះអ្នកជួល៖</span>
              <span className="col-span-8 font-bold text-black">{invoice.tenantName || '—'}</span>

              <span className="col-span-4 text-slate-600">បន្ទប់ស្នាក់នៅ៖</span>
              <span className="col-span-8 font-bold text-black">បន្ទប់លេខ {invoice.roomNumber || '—'}</span>

              <span className="col-span-4 text-slate-600">អគារ/ទីតាំង៖</span>
              <span className="col-span-8 font-semibold text-black">{invoice.houseName || '—'}</span>

              <span className="col-span-4 text-slate-600">កិច្ចសន្យាលេខ៖</span>
              <span className="col-span-8 font-mono text-slate-900">{invoice.contractNo || '—'}</span>
            </div>
          </div>

          {/* Right Column: Period & Payment Terms */}
          <div className="col-span-5 p-3 space-y-1.5 bg-slate-50/50">
            <div className="font-bold text-[11px] uppercase tracking-wider text-black border-b border-slate-300 pb-1 mb-1">
              លក្ខខណ្ឌទូទាត់ / BILLING TERMS
            </div>
            <div className="grid grid-cols-12 gap-y-1 text-slate-800">
              <span className="col-span-6 text-slate-600">សម្រាប់រយៈពេល៖</span>
              <span className="col-span-6 font-bold text-black">{billingMonth}</span>

              <span className="col-span-6 text-slate-600">កាលបរិច្ឆេទចេញ៖</span>
              <span className="col-span-6 font-medium text-black">{formatKhmerDateText(invoice.createdAt)}</span>

              <span className="col-span-6 text-slate-600">ស្ថានភាព៖</span>
              <span className="col-span-6 font-bold text-black">{STATUS_TEXT[invoice.status] || invoice.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. PROFESSIONAL LINE ITEMS TABLE ──────────────────────────────────── */}
      <div className="mt-4">
        <table className="w-full text-left border-collapse border border-black">
          <thead>
            <tr className="bg-slate-100 text-black text-[11.5px] border-b-2 border-black">
              <th className="border border-black px-2 py-2 text-center w-10 font-bold">ល.រ<br/><span className="text-[9px] font-normal text-slate-600">No.</span></th>
              <th className="border border-black px-3 py-2 font-bold">បរិយាយមុខទំនិញ / សេវាកម្ម<br/><span className="text-[9px] font-normal text-slate-600">Description of Items & Services</span></th>
              <th className="border border-black px-2 py-2 text-center w-16 font-bold">បរិមាណ<br/><span className="text-[9px] font-normal text-slate-600">Qty</span></th>
              <th className="border border-black px-3 py-2 text-right w-24 font-bold">តម្លៃឯកតា<br/><span className="text-[9px] font-normal text-slate-600">Unit Price</span></th>
              <th className="border border-black px-3 py-2 text-right w-28 font-bold">ចំនួនទឹកប្រាក់<br/><span className="text-[9px] font-normal text-slate-600">Amount (USD)</span></th>
            </tr>
          </thead>
          <tbody className="text-[11.5px]">
            {items.map((item, idx) => (
              <tr key={item.id || idx} className="border-b border-black">
                <td className="border border-black px-2 py-2.5 text-center font-mono">
                  {idx + 1}
                </td>
                <td className="border border-black px-3 py-2.5">
                  <div className="font-semibold text-black">
                    {invoiceItemName(item, ITEM_LABELS)}
                  </div>
                  {item.description && item.description !== invoiceItemName(item, ITEM_LABELS) && (
                    <div className="text-[10.5px] text-slate-600 mt-0.5">
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="border border-black px-2 py-2.5 text-center font-mono">
                  {Number(item.quantity) || 1}
                </td>
                <td className="border border-black px-3 py-2.5 text-right font-mono">
                  {formatUSD(item.unitPrice)}
                </td>
                <td className="border border-black px-3 py-2.5 text-right font-mono font-bold text-black">
                  {formatUSD(item.amount)}
                </td>
              </tr>
            ))}

            {/* Empty filler rows to maintain standard invoice height and structure */}
            {Array.from({ length: emptyRowsNeeded }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-slate-200 h-8">
                <td className="border border-black px-2 py-1 text-center text-transparent">.</td>
                <td className="border border-black px-3 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-3 py-1"></td>
                <td className="border border-black px-3 py-1"></td>
              </tr>
            ))}
          </tbody>

          {/* Calculation & Summary Footer rows */}
          <tfoot className="text-[11.5px]">
            <tr className="border-t-2 border-black">
              <td colSpan={3} rowSpan={4} className="border border-black p-3 align-top bg-slate-50/40">
                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-black text-[11px] uppercase tracking-wide">
                      ចំនួនទឹកប្រាក់ជាអក្សរ / Amount in words:
                    </span>
                    <p className="italic font-medium text-slate-800 text-[11.5px] mt-0.5 underline">
                      {numberToKhmerWords(invoice.totalAmount)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-300 text-[11px] text-slate-700 space-y-0.5">
                    <p className="font-bold text-black">ព័ត៌មាននៃការទូទាត់ប្រាក់ (Payment Info):</p>
                    <p>• គណនីធនាគារ ABA / KHQR: <span className="font-mono font-bold text-black">000 123 456 (TeasJul)</span></p>
                    <p>• សូមមេត្តាទូទាត់ប្រាក់ត្រឹមថ្ងៃទី៖ <span className="font-bold text-black">{formatDate(invoice.dueDate)}</span></p>
                  </div>
                </div>
              </td>
              <td className="border border-black px-3 py-1.5 text-right text-slate-700">
                សរុបរង / Subtotal:
              </td>
              <td className="border border-black px-3 py-1.5 text-right font-mono font-medium">
                {formatUSD(invoice.subtotal)}
              </td>
            </tr>

            <tr>
              <td className="border border-black px-3 py-1.5 text-right text-slate-700">
                បញ្ចុះតម្លៃ / Discount:
              </td>
              <td className="border border-black px-3 py-1.5 text-right font-mono">
                {Number(invoice.discount) > 0 ? `-${formatUSD(invoice.discount)}` : '$0.00'}
              </td>
            </tr>

            <tr>
              <td className="border border-black px-3 py-1.5 text-right text-slate-700">
                ថ្លៃយឺតយ៉ាវ / Late Fee:
              </td>
              <td className="border border-black px-3 py-1.5 text-right font-mono">
                {Number(invoice.lateFee) > 0 ? `+${formatUSD(invoice.lateFee)}` : '$0.00'}
              </td>
            </tr>

            <tr className="bg-slate-100 font-bold border-b-2 border-black">
              <td className="border border-black px-3 py-2 text-right text-black uppercase">
                សរុបត្រូវបង់ / Total Due:
              </td>
              <td className="border border-black px-3 py-2 text-right">
                <div className="font-mono text-sm text-black font-black leading-tight">
                  {showUsd && formatUSD(invoice.totalAmount)}
                </div>
                {showKhr && (
                  <div className="text-[10px] text-slate-600 font-normal">
                    ≈ {formatKHR(invoice.totalAmount, exchangeRate)}
                  </div>
                )}
              </td>
            </tr>

            {/* If partial status */}
            {invoice.status === 'PARTIAL' && Number(invoice.paidAmount) > 0 && (
              <tr>
                <td colSpan={3} className="border border-black bg-white"></td>
                <td className="border border-black px-3 py-1 text-right text-slate-700 font-medium">
                  បានបង់រួច / Paid:
                </td>
                <td className="border border-black px-3 py-1 text-right font-mono font-bold text-black">
                  {formatUSD(invoice.paidAmount)}
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* ── 4. OFFICIAL SIGNATURES & STAMP SECTION ───────────────────────────── */}
      <div className="mt-8 pt-4">
        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          {/* Customer / Tenant */}
          <div className="space-y-1">
            <p className="font-bold text-black uppercase">
              ហត្ថលេខា និងឈ្មោះអ្នកបង់ប្រាក់
            </p>
            <p className="text-[10px] text-slate-500 font-sans uppercase">
              Customer / Tenant's Signature
            </p>
            <p className="text-[10.5px] text-slate-500 pt-1">
              ថ្ងៃទី.......... ខែ.......... ឆ្នាំ២០២...
            </p>
            <div className="h-20 flex items-end justify-center">
              <div className="w-52 border-b border-dotted border-black"></div>
            </div>
            <p className="font-bold text-black pt-1">
              {invoice.tenantName || '—'}
            </p>
          </div>

          {/* Authorized Seller / Landlord */}
          <div className="space-y-1">
            <p className="font-bold text-black uppercase">
              ហត្ថលេខា និងឈ្មោះអ្នករៀបចំវិក្កយបត្រ
            </p>
            <p className="text-[10px] text-slate-500 font-sans uppercase">
              Authorized Signature & Official Stamp
            </p>
            <p className="text-[10.5px] text-slate-500 pt-1">
              ថ្ងៃទី.......... ខែ.......... ឆ្នាំ២០២...
            </p>
            <div className="h-20 flex items-end justify-center">
              <div className="w-52 border-b border-dotted border-black"></div>
            </div>
            <p className="font-bold text-black pt-1">
              {bizName}
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. FORMAL FOOTER NOTE ────────────────────────────────────────────── */}
      <div className="mt-10 pt-3 border-t border-slate-300 text-center text-[10.5px] text-slate-500 space-y-0.5">
        <p>
          {footerNote}
        </p>
        <p className="font-mono text-[9.5px]">
          Generated by TeasJul Management System · Reference ID: {invoice.invoiceNo}
        </p>
      </div>
    </div>
  );
});

export default RealInvoiceDocument;
