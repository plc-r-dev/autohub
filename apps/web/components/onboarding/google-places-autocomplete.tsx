"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { serviceStoreInputClassName } from "@/components/service-store/ui";

export type GooglePlaceSelection = {
  placeId: string;
  label: string;
  name: string;
  formattedAddress: string | null;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
};

type GooglePlacesAutocompleteProps = {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  onSelect: (place: GooglePlaceSelection) => void;
};

type Suggestion = {
  placeId: string;
  label: string;
};

export function GooglePlacesAutocomplete({
  label = "Search on Google Maps",
  placeholder = "Search business name or address",
  defaultValue = "",
  onSelect,
}: GooglePlacesAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      startTransition(async () => {
        const response = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          setSuggestions([]);
          return;
        }
        const payload = (await response.json()) as { suggestions: Suggestion[] };
        setSuggestions(payload.suggestions ?? []);
      });
    }, 300);
  }, [query]);

  async function handleSelect(suggestion: Suggestion) {
    setQuery(suggestion.label);
    setSuggestions([]);

    const response = await fetch(
      `/api/places/details?placeId=${encodeURIComponent(suggestion.placeId)}`,
    );
    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as {
      place: {
        placeId: string;
        name: string;
        formattedAddress: string | null;
        phone: string | null;
        website: string | null;
        latitude: number | null;
        longitude: number | null;
        description: string | null;
      };
    };

    onSelect({
      placeId: payload.place.placeId,
      label: suggestion.label,
      name: payload.place.name,
      formattedAddress: payload.place.formattedAddress,
      phone: payload.place.phone,
      website: payload.place.website,
      latitude: payload.place.latitude,
      longitude: payload.place.longitude,
      description: payload.place.description,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#0F172A]">{label}</label>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className={serviceStoreInputClassName}
      />
      {isPending ? <p className="text-xs text-[#8a97a5]">Searching Google Places…</p> : null}
      {suggestions.length > 0 ? (
        <ul className="flex flex-col gap-1 rounded-xl border border-[#dce5ee] bg-white p-2">
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId}>
              <button
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f4f7fa]"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
