const EARTH_RADIUS_KM = 6371;

export const BANGKOK_CENTER = {
  lat: 13.7563,
  lng: 100.5018,
} as const;

export const DEFAULT_NEARBY_RADIUS_KM = 20;

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(distanceKm: number | null | undefined): string | undefined {
  if (distanceKm == null || !Number.isFinite(distanceKm)) {
    return undefined;
  }
  if (distanceKm < 1) {
    return `${Math.max(100, Math.round(distanceKm * 1000))} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
