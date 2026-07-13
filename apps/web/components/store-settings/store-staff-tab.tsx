import { StaffInviteCard } from "@/components/store-settings/staff-invite-card"
import { StaffListTable, type StaffListMember } from "@/components/store-settings/staff-list-table"
import { ServiceStoreCard } from "@/components/service-store/ui"
import { getActiveStaffInviteForStore } from "@/lib/service-store/application/staff-invite-queries"
import {
  roleHasPermission,
  SERVICE_STORE_PERMISSION,
} from "@/lib/service-store/domain"
import type { ServiceStoreMemberRole } from "@/lib/generated/prisma/client"

type StaffMemberRow = {
  id: string
  role: ServiceStoreMemberRole
  createdAt: Date
  user: {
    id: string
    firstName: string
    lastName: string
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  }
}

type StoreStaffTabProps = {
  serviceStoreId: string
  members: StaffMemberRow[]
  currentUserId: string
  currentRole: ServiceStoreMemberRole
}

export async function StoreStaffTab({
  serviceStoreId,
  members,
  currentUserId,
  currentRole,
}: StoreStaffTabProps) {
  const canInvite = roleHasPermission(currentRole, SERVICE_STORE_PERMISSION.MEMBERS_INVITE)
  const canRemove = roleHasPermission(currentRole, SERVICE_STORE_PERMISSION.MEMBERS_REMOVE)
  const invite = canInvite ? await getActiveStaffInviteForStore(serviceStoreId) : null

  const staffRows: StaffListMember[] = members.map((member) => ({
    id: member.id,
    role: member.role,
    createdAt: member.createdAt.toISOString(),
    user: {
      id: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      status: member.user.status,
    },
  }))

  return (
    <div className="space-y-5">
      <StaffInviteCard
        canManage={canInvite}
        initialInviteUrl={invite?.inviteUrl}
        initialExpiresAt={invite?.expiresAt}
      />

      <ServiceStoreCard className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Staff list</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            People who can access this store dashboard.
          </p>
        </div>

        <StaffListTable
          members={staffRows}
          currentUserId={currentUserId}
          canRemove={canRemove}
        />
      </ServiceStoreCard>
    </div>
  )
}
