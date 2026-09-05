export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatCompactCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-CA") : "—";

export const formatNumber = (value, digits = 1) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(Number(value) || 0);

/** "2026-08" -> "Aug 2026" */
export const formatMonth = (month) => {
  if (!month || typeof month !== "string" || month.length !== 7) return month || "—";
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};