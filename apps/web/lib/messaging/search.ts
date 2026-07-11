/**
 * Extension points for future LINE chat search flows.
 * - Location-based serviceStore search (user shares location in chat)
 * - Keyword serviceStore search (user types in chat)
 */

export type LocationSearchInput = {
  lineUserId: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
};

export type ServiceStoreSearchInput = {
  lineUserId: string;
  query: string;
};

export interface LineLocationSearchPort {
  findNearbyShops(input: LocationSearchInput): Promise<{ serviceStoreIds: string[] }>;
}

export interface LineServiceStoreSearchPort {
  searchServiceStores(input: ServiceStoreSearchInput): Promise<{ serviceStoreIds: string[] }>;
}

/** Stub ports — implement when Messaging API webhook is added. */
export const lineLocationSearch: LineLocationSearchPort = {
  async findNearbyShops() {
    throw new Error("LINE_LOCATION_SEARCH_NOT_IMPLEMENTED");
  },
};

export const lineServiceStoreSearch: LineServiceStoreSearchPort = {
  async searchServiceStores() {
    throw new Error("LINE_MERCHANT_SEARCH_NOT_IMPLEMENTED");
  },
};
