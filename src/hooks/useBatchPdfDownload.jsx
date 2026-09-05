import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import BatchInvoiceCardsPdf from '../page/Invoice/BatchInvoiceCardsPdf.jsx';
import InvoicePdfDocument from '../page/Invoice/InvoicePdfDocument.jsx';
import { registerPdfFonts } from '../utils/pdfFonts.js';

const formatMonthYear = (yr, mth) => {
  if (!yr || !mth) return '';
  return `${String(mth).padStart(2, '0')}-${yr}`;
};

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/**
 * Download helpers for invoice PDFs. Replaces the broken html2canvas path with
 * native @react-pdf/renderer output.
 */
export function useBatchPdfDownload() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Download a single invoice as a formal Khmer PDF.
   */
  const downloadOne = useCallback(async (invoice) => {
    if (!invoice) {
      setError('No invoice to download');
      return false;
    }

    setDownloading(true);
    setError(null);

    try {
      registerPdfFonts();

      const instance = pdf(<InvoicePdfDocument invoice={invoice} />);
      const blob = await instance.toBlob();
      saveBlob(blob, `វិក្កយបត្រ_${invoice.invoiceNo || 'INV'}.pdf`);
      return true;
    } catch (err) {
      console.error('Invoice PDF download failed:', err);
      setError('Failed to download PDF: ' + (err.message || err));
      return false;
    } finally {
      setDownloading(false);
    }
  }, []);

  /**
   * Download all invoices as a single Khmer PDF with 2-3 compact cards per page.
   */
  const downloadAll = useCallback(async (invoices, { billingYear, billingMonth } = {}) => {
    if (!invoices || invoices.length === 0) {
      setError('No invoices to download');
      return false;
    }

    setDownloading(true);
    setError(null);

    try {
      registerPdfFonts();

      const suffix = formatMonthYear(billingYear, billingMonth);
      const filename = suffix
        ? `វិក្កយបត្រ_${suffix}.pdf`
        : 'វិក្កយបត្រ.pdf';

      const instance = pdf(
        <BatchInvoiceCardsPdf
          invoices={invoices}
          billingYear={billingYear}
          billingMonth={billingMonth}
        />,
      );

      const blob = await instance.toBlob();
      saveBlob(blob, filename);

      return true;
    } catch (err) {
      console.error('Batch PDF download failed:', err);
      setError('Failed to download PDF: ' + (err.message || err));
      return false;
    } finally {
      setDownloading(false);
    }
  }, []);

  return { downloadAll, downloadOne, downloading, error };
}