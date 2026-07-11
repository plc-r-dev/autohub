import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceStoreMemberManagement } from "@/components/service-store/service-store-member-management";
import { ServiceStoreCard } from "@/components/service-store/ui";
import { listServiceStoreMembers } from "@/lib/service-store/application/member-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import {
  roleHasPermission,
  roleLabel,
  SERVICE_STORE_PERMISSION,
} from "@/lib/service-store/domain";

export default async function ServiceStoreMembersPage() {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.MEMBERS_VIEW);
  const members = await listServiceStoreMembers(ctx.serviceStore.id);
  const canManage =
    roleHasPermission(ctx.membership.role, SERVICE_STORE_PERMISSION.MEMBERS_INVITE) ||
    roleHasPermission(ctx.membership.role, SERVICE_STORE_PERMISSION.MEMBERS_REMOVE) ||
    roleHasPermission(ctx.membership.role, SERVICE_STORE_PERMISSION.MEMBERS_CHANGE_ROLE);

  return (
    <PageShell
      title="Members"
      description="Manage who can access this Service Store and their roles."
      nav={serviceStoreNav}
      backHref="/service-store/dashboard"
    >
      <ServiceStoreCard className="space-y-2">
        <p className="text-sm text-[#5b6b7a]">
          You are signed in as <strong>{roleLabel(ctx.membership.role)}</strong> for{" "}
          <strong>{ctx.serviceStore.name}</strong>.
        </p>
        {!canManage ? (
          <p className="text-sm text-[#8a97a5]">
            Only Owners and Managers can invite or change members.
          </p>
        ) : null}
      </ServiceStoreCard>

      <ServiceStoreMemberManagement
        members={members}
        currentUserId={ctx.user.id}
        currentRole={ctx.membership.role}
        canManage={canManage}
      />
    </PageShell>
  );
}
