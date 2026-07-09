export type GooglePlacesTextSearchRequest = {
  textQuery: string;
  pageSize: number;
};

export type GooglePlacesLocation = {
  latitude?: number;
  longitude?: number;
};

export type GooglePlacesDisplayName = {
  text?: string;
};

export type GooglePlacesPhoto = {
  name?: string;
};

export type GooglePlacesPeriodPoint = {
  day?: number;
  hour?: number;
  minute?: number;
};

export type GooglePlacesPeriod = {
  open?: GooglePlacesPeriodPoint;
  close?: GooglePlacesPeriodPoint;
};

export type GooglePlacesOpeningHours = {
  weekdayDescriptions?: string[];
  periods?: GooglePlacesPeriod[];
};

export type GooglePlacesPlace = {
  id?: string;
  displayName?: GooglePlacesDisplayName;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  formattedAddress?: string;
  location?: GooglePlacesLocation;
  regularOpeningHours?: GooglePlacesOpeningHours;
  photos?: GooglePlacesPhoto[];
};

export type GooglePlacesTextSearchResponse = {
  places?: GooglePlacesPlace[];
};

export type MappedOperatingHour = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export type MappedGoogleMerchant = {
  googlePlaceId: string;
  businessName: string;
  phoneNumber: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  googleMapsUrl: string | null;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: MappedOperatingHour[];
  photoReferences: string[];
};
