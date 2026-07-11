export type GooglePlaceAutocompleteSuggestion = {
  placeId: string;
  label: string;
};

export type GooglePlaceDetails = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  types: string[];
  description: string | null;
};

function getGoogleMapsApiKey(): string | null {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return key || null;
}

export function isGooglePlacesConfigured(): boolean {
  return Boolean(getGoogleMapsApiKey());
}

export async function autocompleteGooglePlaces(
  input: string,
): Promise<GooglePlaceAutocompleteSuggestion[]> {
  const apiKey = getGoogleMapsApiKey();
  const trimmed = input.trim();
  if (!apiKey || trimmed.length < 2) {
    return [];
  }

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
    },
    body: JSON.stringify({
      input: trimmed,
      includedRegionCodes: ["th"],
      languageCode: "th",
    }),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
      };
    }>;
  };

  return (payload.suggestions ?? [])
    .map((row) => {
      const placeId = row.placePrediction?.placeId;
      const label = row.placePrediction?.text?.text;
      if (!placeId || !label) {
        return null;
      }
      return { placeId, label };
    })
    .filter((row): row is GooglePlaceAutocompleteSuggestion => row !== null);
}

export async function fetchGooglePlaceDetails(
  placeId: string,
): Promise<GooglePlaceDetails | null> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey || !placeId.trim()) {
    return null;
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,location,types,editorialSummary",
      },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    location?: { latitude?: number; longitude?: number };
    types?: string[];
    editorialSummary?: { text?: string };
  };

  if (!payload.id) {
    return null;
  }

  return {
    placeId: payload.id,
    name: payload.displayName?.text ?? "Unnamed place",
    formattedAddress: payload.formattedAddress ?? null,
    phone: payload.nationalPhoneNumber ?? null,
    website: payload.websiteUri ?? null,
    latitude: payload.location?.latitude ?? null,
    longitude: payload.location?.longitude ?? null,
    types: payload.types ?? [],
    description: payload.editorialSummary?.text ?? null,
  };
}
