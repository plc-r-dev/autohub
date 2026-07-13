/**
 * The dashboard's stat tile is the same component already shared with the
 * customer/vehicle detail pages -- re-exported here (not duplicated) so
 * components/dashboard/ stays the discoverable home for every dashboard
 * building block without forking an already-compliant, token-based component.
 */
export { StatCard } from "@/components/service-store/ui";
