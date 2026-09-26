// The main name shown for an invoice item. On utility items the backend stores
// the real utility type name in `description` (e.g. "ថ្លៃទឹក", "សំរាម") — the
// tenant-facing name the owner configured — while `itemType` is only a coarse
// bucket with `OTHER` covering every custom utility type. So the description is
// the trustworthy name to display. RENT keeps its fixed label.
export function invoiceItemName(item, labels) {
  const bucket = (labels && (labels[item?.itemType] || item?.itemType)) || '';
  if (item?.itemType === 'RENT') return bucket;
  if (item?.description && item.description !== bucket) return item.description;
  return bucket;
}