import type { ServiceStoreMemberRole } from "@/lib/generated/prisma/client";

export const SERVICE_STORE_PERMISSION = {
  STORE_VIEW: "store.view",
  STORE_MANAGE_PROFILE: "store.manage_profile",
  MEMBERS_VIEW: "members.view",
  MEMBERS_INVITE: "members.invite",
  MEMBERS_REMOVE: "members.remove",
  MEMBERS_CHANGE_ROLE: "members.change_role",
  OWNERSHIP_TRANSFER: "ownership.transfer",
  BRANCHES_MANAGE: "branches.manage",
  BOOKINGS_MANAGE: "bookings.manage",
  CRM_VIEW: "crm.view",
  BILLING_VIEW: "billing.view",
  BILLING_SUBMIT: "billing.submit",
} as const;

export type ServiceStorePermission =
  (typeof SERVICE_STORE_PERMISSION)[keyof typeof SERVICE_STORE_PERMISSION];

const ALL_PERMISSIONS = Object.values(SERVICE_STORE_PERMISSION);

const MANAGER_PERMISSIONS: ServiceStorePermission[] = [
  SERVICE_STORE_PERMISSION.STORE_VIEW,
  SERVICE_STORE_PERMISSION.STORE_MANAGE_PROFILE,
  SERVICE_STORE_PERMISSION.MEMBERS_VIEW,
  SERVICE_STORE_PERMISSION.MEMBERS_INVITE,
  SERVICE_STORE_PERMISSION.MEMBERS_REMOVE,
  SERVICE_STORE_PERMISSION.MEMBERS_CHANGE_ROLE,
  SERVICE_STORE_PERMISSION.BRANCHES_MANAGE,
  SERVICE_STORE_PERMISSION.BOOKINGS_MANAGE,
  SERVICE_STORE_PERMISSION.CRM_VIEW,
  SERVICE_STORE_PERMISSION.BILLING_VIEW,
  SERVICE_STORE_PERMISSION.BILLING_SUBMIT,
];

const STAFF_PERMISSIONS: ServiceStorePermission[] = [
  SERVICE_STORE_PERMISSION.STORE_VIEW,
  SERVICE_STORE_PERMISSION.BOOKINGS_MANAGE,
  SERVICE_STORE_PERMISSION.CRM_VIEW,
];

const FINANCE_PERMISSIONS: ServiceStorePermission[] = [
  SERVICE_STORE_PERMISSION.STORE_VIEW,
  SERVICE_STORE_PERMISSION.BILLING_VIEW,
  SERVICE_STORE_PERMISSION.BILLING_SUBMIT,
  SERVICE_STORE_PERMISSION.CRM_VIEW,
];

const VIEWER_PERMISSIONS: ServiceStorePermission[] = [
  SERVICE_STORE_PERMISSION.STORE_VIEW,
  SERVICE_STORE_PERMISSION.CRM_VIEW,
  SERVICE_STORE_PERMISSION.MEMBERS_VIEW,
  SERVICE_STORE_PERMISSION.BILLING_VIEW,
];

export const ROLE_PERMISSIONS: Record<ServiceStoreMemberRole, readonly ServiceStorePermission[]> =
  {
    OWNER: ALL_PERMISSIONS,
    MANAGER: MANAGER_PERMISSIONS,
    STAFF: STAFF_PERMISSIONS,
    FINANCE: FINANCE_PERMISSIONS,
    VIEWER: VIEWER_PERMISSIONS,
  };

export function permissionsForRole(role: ServiceStoreMemberRole): readonly ServiceStorePermission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(
  role: ServiceStoreMemberRole,
  permission: ServiceStorePermission,
): boolean {
  return permissionsForRole(role).includes(permission);
}

export function roleLabel(role: ServiceStoreMemberRole): string {
  const labels: Record<ServiceStoreMemberRole, string> = {
    OWNER: "Owner",
    MANAGER: "Manager",
    STAFF: "Staff",
    FINANCE: "Finance",
    VIEWER: "Viewer",
  };
  return labels[role];
}

export const ASSIGNABLE_MEMBER_ROLES: ServiceStoreMemberRole[] = [
  "MANAGER",
  "STAFF",
  "FINANCE",
  "VIEWER",
];
