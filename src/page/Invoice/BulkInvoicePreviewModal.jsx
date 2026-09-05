import { useCallback, useState, useEffect } from 'react';
import { Download, DownloadCloud, X, Check } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import BatchInvoiceCardsPdf from './BatchInvoiceCardsPdf.jsx';
import { registerPdfFonts } from '../../utils/pdfFonts.js';
import { useBatchPdfDownload } from '../../hooks/useBatchPdfDownload.jsx';

export default function BulkInvoicePreviewModal({ open, onClose, invoices = [], billingYear, billingMonth }) {
  const { downloadAll, downloadOne, downloading, error } = useBatchPdfDownload();
  const [doneAll, setDoneAll] = useState(false);
  const [doneEach, setDoneEach] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewError, setPreviewError] = useState(false);

  // Generate the batch preview PDF whenever the modal opens or data changes.
  useEffect(() => {
    if (!open || invoices.length === 0) {
      setPreviewUrl(null);
      setPreviewError(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        registerPdfFonts();
        const blob = await pdf(
          <BatchInvoiceCardsPdf
            invoices={invoices}
            billingYear={billingYear}
            billingMonth={billingMonth}
          />,
        ).toBlob();
        if (!cancelled) {
          setPreviewUrl(URL.createObjectURL(blob));
          setPreviewError(false);
        }
      } catch (err) {
        console.error('Batch preview PDF generation failed:', err);
        if (!cancelled) setPreviewError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, invoices, billingYear, billingMonth]);

  const handleDownloadAll = useCallback(async () => {
    setDoneAll(false);
    const ok = await downloadAll(invoices, { billingYear, billingMonth });
    if (ok) {
      setDoneAll(true);
      setTimeout(() => setDoneAll(false), 3000);
    }
  }, [downloadAll, invoices, billingYear, billingMonth]);

  const handleDownloadEach = useCallback(async () => {
    if (!invoices || invoices.length === 0) return;
    setDoneEach(false);
    let ok = true;
    for (const invoice of invoices) {
      const success = await downloadOne(invoice);
      if (!success) { ok = false; break; }
    }
    if (ok) {
      setDoneEach(true);
      setTimeout(() => setDoneEach(false), 3000);
    }
  }, [downloadOne, invoices]);

  if (!open) return null;

  return (
    <Modal
      size="xl"
      open={open}
      onClose={onClose}
      title="មើលជាមុន និងទាញយកវិក្កយបត្រ"
      description={`វិក្កយបត្រ ${invoices.length} សន្លឹក · អាចទាញយកជាឯកសារតែមួយ ឬទាញយកម្តងៗ។`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={downloading}>
            <X className="mr-1.5 h-4 w-4" />
            បិទ
          </Button>
          <Button variant="outline" onClick={handleDownloadEach} loading={downloading}>
            {doneEach ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                បានទាញយកម្តងៗ!
              </>
            ) : (
              <>
                <DownloadCloud className="mr-1.5 h-4 w-4" />
                ទាញយកម្តងៗ
              </>
            )}
          </Button>
          <Button onClick={handleDownloadAll} loading={downloading}>
            {downloading ? (
              <span>កំពុងទាញយក PDF...</span>
            ) : doneAll ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                បានទាញយក!
              </>
            ) : (
              <>
                <Download className="mr-1.5 h-4 w-4" />
                ទាញយកទាំងអស់ (PDF)
              </>
            )}
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {invoices.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">គ្មានវិក្កយបត្រដើម្បីបង្ហាញ</p>
        ) : previewError ? (
          <div className="flex h-[60vh] items-center justify-center rounded-lg border border-red-200 bg-red-50 text-center text-sm text-red-700">
            មិនអាចបង្កើត PDF ជាមុនបានទេ។ អ្នកអាចចុច «ទាញយក» ជំនួសវិញ។
          </div>
        ) : !previewUrl ? (
          <div className="flex h-[60vh] items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500">
            កំពុងបង្កើត PDF ជាមុន...
          </div>
        ) : (
          <iframe
            title="batch-invoice-preview"
            src={previewUrl}
            className="h-[65vh] w-full rounded-lg border border-slate-300 bg-white"
            style={{ minHeight: 360 }}
          />
        )}
      </div>
    </Modal>
  );
}