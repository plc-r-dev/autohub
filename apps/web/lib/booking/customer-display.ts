/** Stable mock display values for customer UI (no schema fields). */

export function getStoreDisplayRating(serviceStoreId: string) {
  const hash = hashString(serviceStoreId);
  const rating = (4.3 + (hash % 8) / 10).toFixed(1);
  const reviewCount = 40 + (hash % 320);
  return { rating, reviewCount };
}

export function getServiceDisplayDescription(serviceName: string, storeDescription?: string | null) {
  const trimmed = storeDescription?.trim();
  if (trimmed && trimmed.length < 120) {
    return `${serviceName} — ${trimmed}`;
  }
  return `Professional ${serviceName.toLowerCase()} with premium care for your vehicle.`;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
