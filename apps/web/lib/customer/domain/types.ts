/** Customer domain types (presentation-agnostic). */
export type CustomerProfile = {
  customerId: string;
  domainUserId: string;
  lineUserId: string | null;
  firstName: string;
  lastName: string;
  lineDisplayName: string | null;
  linePictureUrl: string | null;
};

export type EnsureCustomerProfileInput = {
  authUserId: string;
  displayName: string | null | undefined;
  imageUrl: string | null | undefined;
};

export type EnsureCustomerProfileResult = {
  domainUserId: string;
  customerId: string;
  created: boolean;
};
