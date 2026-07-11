/**
 * Application layer — customer profile provisioning.
 * Re-exports existing implementation (business logic unchanged).
 */
export {
  ensureCustomerProfile,
  type EnsureCustomerProfileInput,
  type EnsureCustomerProfileResult,
} from "@/lib/customer/ensure-customer-profile";
