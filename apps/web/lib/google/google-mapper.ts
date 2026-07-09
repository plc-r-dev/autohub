import type {
  GooglePlacesPeriod,
  GooglePlacesPlace,
  MappedGoogleMerchant,
  MappedOperatingHour,
} from "@/lib/google/google-types";

const DEFAULT_HOURS: MappedOperatingHour[] = [
  { dayOfWeek: 0, openTime: "09:00", closeTime: "17:00", isClosed: false },
  { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isClosed: false },
];

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

function toTime(hour: number | undefined, minute: number | undefined): string {
  return `${twoDigits(hour ?? 0)}:${twoDigits(minute ?? 0)}`;
}

function mapPeriodsToHours(periods: GooglePlacesPeriod[] | undefined): MappedOperatingHour[] {
  if (!periods || periods.length === 0) {
    return DEFAULT_HOURS;
  }

  const byDay = new Map<number, MappedOperatingHour>();
  for (const period of periods) {
    const day = period.open?.day;
    if (day === undefined || day < 0 || day > 6) {
      continue;
    }
    const openTime = toTime(period.open?.hour, period.open?.minute);
    const closeTime = toTime(period.close?.hour, period.close?.minute);
    byDay.set(day, {
      dayOfWeek: day,
      openTime,
      closeTime,
      isClosed: false,
    });
  }

  return Array.from({ length: 7 }, (_, day) => {
    const found = byDay.get(day);
    if (found) {
      return found;
    }
    return {
      dayOfWeek: day,
      openTime: "09:00",
      closeTime: day === 0 || day === 6 ? "17:00" : "18:00",
      isClosed: false,
    };
  });
}

function cleanPhotoReference(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  return value.trim();
}

export function mapGooglePlaceToMerchant(place: GooglePlacesPlace): MappedGoogleMerchant {
  if (!place.id || !place.displayName?.text) {
    throw new Error("Invalid Google place payload: id and displayName are required.");
  }

  const photoReferences = (place.photos ?? [])
    .map((photo) => cleanPhotoReference(photo.name))
    .filter((photo): photo is string => Boolean(photo));

  return {
    googlePlaceId: place.id,
    businessName: place.displayName.text.trim(),
    phoneNumber: place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    rating: typeof place.rating === "number" ? place.rating : null,
    reviewCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    googleMapsUrl: place.googleMapsUri ?? null,
    formattedAddress: place.formattedAddress ?? null,
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    openingHours: mapPeriodsToHours(place.regularOpeningHours?.periods),
    photoReferences,
  };
}
