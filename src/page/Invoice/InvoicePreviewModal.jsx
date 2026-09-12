import { useRef, useState, useEffect, useCallback } from 'react';
import { Printer, Download, X, Eye, Check } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import RealInvoiceDocument from './RealInvoiceDocument';
import InvoicePdfDocument from './InvoicePdfDocument.jsx';
import { registerPdfFonts } from '../../utils/pdfFonts.js';
import { useSettings } from '../../hooks/useSettings.js';

export default function InvoicePreviewModal({ open, onClose, invoice }) {
  const documentRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const { settings, loading: settingsLoading } = useSettings();

  // Generate the preview PDF (same path as download) whenever the modal opens.
  useEffect(() => {
    if (!open || !invoice || settingsLoading) {
      setPreviewUrl(null);
      setPreviewError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        registerPdfFonts();
        const blob = await pdf(<InvoicePdfDocument invoice={invoice} settings={settings} />).toBlob();
        if (!cancelled) {
          setPreviewUrl(URL.createObjectURL(blob));
          setPreviewError(null);
        }
      } catch (err) {
        console.error('Preview PDF generation failed:', err);
        if (!cancelled) setPreviewError(err && (err.message || err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, invoice, settings, settingsLoading]);

  // Handle native high-quality print
  const handlePrint = useCallback(() => {
    const prevTitle = document.title;
    document.title = `វិក្កយបត្រ-${invoice?.invoiceNo || 'Invoice'}`;
    window.print();
    document.title = prevTitle;
  }, [invoice]);

  // Handle Khmer PDF file direct download (native react-pdf)
  const handleDownloadPdf = useCallback(async () => {
    if (!invoice) return;
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      registerPdfFonts();

      const instance = pdf(<InvoicePdfDocument invoice={invoice} settings={settings} />);
      const blob = await instance.toBlob();
      const filename = `វិក្កយបត្រ_${invoice.invoiceNo || 'INV'}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      // Fallback to browser print/save as PDF
      handlePrint();
    } finally {
      setDownloading(false);
    }
  }, [invoice, settings, handlePrint]);

  if (!open || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/75 p-2 sm:p-4 backdrop-blur-sm print:hidden">
      {/* Modal Container */}
      <div className="relative flex max-h-[96vh] w-full max-w-4xl flex-col rounded-xl bg-slate-100 shadow-2xl dark:bg-gray-900">
        {/* ── MODAL HEADER / TOOLBAR ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 dark:border-gray-800 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-khmer dark:text-white">
                មើលគំរូវិក្កយបត្រពិតប្រាកដ (Invoice Preview)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {invoice.invoiceNo} · បន្ទប់ {invoice.roomNumber || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700 font-khmer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              បោះពុម្ព (Print)
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 font-khmer"
            >
              {downloading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  កំពុងទាញយក...
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  បានទាញយក!
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  ទាញយកជា PDF (Download)
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-700 dark:hover:text-slate-200"
              title="បិទ"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── MODAL BODY: PDF PREVIEW (matches the downloaded file) ────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-200/70 dark:bg-gray-950">
          <div className="w-full">
            {previewError ? (
              <div className="flex h-[60vh] items-center justify-center rounded-lg border border-red-200 bg-red-50 text-center text-sm text-red-700">
                មិនអាចបង្កើត PDF ជាមុនបានទេ។ អ្នកអាចចុច «ទាញយកជា PDF» ឬ «បោះពុម្ព» ជំនួសវិញ។
              </div>
            ) : !previewUrl ? (
              <div className="flex h-[60vh] items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500">
                កំពុងបង្កើត PDF ជាមុន...
              </div>
            ) : (
              <iframe
                title="invoice-preview"
                src={previewUrl}
                className="h-[70vh] w-full rounded-lg border border-slate-300 bg-white"
                style={{ minHeight: 400 }}
              />
            )}
          </div>

          {/* Hidden print-only sheet (browser print uses the styled invoice). */}
          <div className="hidden print:block">
            <RealInvoiceDocument invoice={invoice} settings={settings} ref={documentRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
