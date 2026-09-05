import { Font } from '@react-pdf/renderer';
import khmerRegular from '../assets/fonts/NotoSansKhmer-Regular.ttf';
import khmerBold from '../assets/fonts/NotoSansKhmer-Bold.ttf';

let registered = false;

/**
 * Register the Khmer-capable font family with @react-pdf/renderer.
 * Must run before rendering any PDF that contains Khmer text.
 * Idempotent: safe to call more than once.
 */
export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: 'Khmer',
    fonts: [
      { src: khmerRegular, fontWeight: 400 },
      { src: khmerBold, fontWeight: 700 },
    ],
  });

  // Mirrors the old Helvetica/Helvetica-Bold split so styles using a dedicated
  // bold font family keep working without explicit fontWeight on each node.
  Font.register({
    family: 'Khmer-Bold',
    fonts: [{ src: khmerBold, fontWeight: 400 }],
  });
}