import type {
  GooglePlacesPlace,
  GooglePlacesTextSearchRequest,
  GooglePlacesTextSearchResponse,
} from "@/lib/google/google-types";

const GOOGLE_PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.formattedAddress",
  "places.location",
  "places.regularOpeningHours.periods",
  "places.photos.name",
].join(",");

function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured.");
  }
  return key;
}

export async function searchCarWashesByProvince(
  province: string,
  limit: number,
): Promise<GooglePlacesPlace[]> {
  const apiKey = getApiKey();
  const body: GooglePlacesTextSearchRequest = {
    textQuery: `Car Wash in ${province}, Thailand`,
    pageSize: Math.min(Math.max(limit, 1), 20),
  };

  const response = await fetch(GOOGLE_PLACES_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Places API failed (${response.status}): ${details}`);
  }

  const payload = (await response.json()) as GooglePlacesTextSearchResponse;
  return (payload.places ?? []).slice(0, limit);
}
