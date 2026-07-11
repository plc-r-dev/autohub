export type {
  CustomerProfile,
  EnsureCustomerProfileInput,
  EnsureCustomerProfileResult,
} from "@/lib/customer/domain/types";
export { ensureCustomerProfile } from "@/lib/customer/application/ensure-profile";
export {
  getCustomerForUser,
  requireCustomerForUser,
} from "@/lib/customer/context";
