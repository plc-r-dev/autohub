"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { AvatarInitials } from "@/components/dashboard/avatar-initials"
import { ManagementInteractiveDataTable } from "@/components/listing/management/data-table.client"
import { ManagementRowActionsMenu } from "@/components/listing/management/row-actions-menu"
import type { ManagementTableColumn } from "@/components/listing/management/data-table"
import { ServiceStoreStatusBadge } from "@/components/service-store/ui"
import { removeServiceStoreMember } from "@/lib/service-store/member-actions"
import type { UserStatus } from "@/lib/generated/prisma/client"

export type StaffListMember = {
  id: string
  role: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    status: UserStatus
  }
}

type StaffListTableProps = {
  members: StaffListMember[]
  currentUserId: string
  canRemove: boolean
}

function formatJoinedDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso))
}

const columns: ManagementTableColumn<StaffListMember>[] = [
  {
    key: "name",
    header: "Name",
    render: (member) => (
      <div className="flex items-center gap-3">
        <AvatarInitials
          firstName={member.user.firstName}
          lastName={member.user.lastName}
          size="sm"
        />
        <span className="font-medium text-foreground">
          {member.user.firstName} {member.user.lastName}
        </span>
      </div>
    ),
  },
  {
    key: "joined",
    header: "Joined date",
    render: (member) => (
      <span className="text-muted-foreground">{formatJoinedDate(member.createdAt)}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (member) => (
      <ServiceStoreStatusBadge
        label={member.user.status === "ACTIVE" ? "Active" : member.user.status}
        status={member.user.status === "ACTIVE" ? "ACTIVE" : "CANCELLED"}
      />
    ),
  },
]

export function StaffListTable({
  members,
  currentUserId,
  canRemove,
}: StaffListTableProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  function handleRemove(memberId: string) {
    if (!confirm("Remove this staff member?")) {
      return
    }

    const formData = new FormData()
    formData.set("memberId", memberId)

    startTransition(async () => {
      await removeServiceStoreMember({}, formData)
      router.refresh()
    })
  }

  return (
    <ManagementInteractiveDataTable
      rows={members}
      columns={columns}
      getRowKey={(member) => member.id}
      emptyIcon={Users}
      emptyMessage="No staff members yet."
      filteredEmptyMessage="No staff members found."
      hasFilters={false}
      page={1}
      pageSize={members.length || 1}
      totalCount={members.length}
      searchParams={{}}
      itemLabel="staff"
      minWidth="640px"
      actionColumn={
        canRemove
          ? {
              render: (member) => {
                const isSelf = member.user.id === currentUserId
                const isOwner = member.role === "OWNER"

                if (isSelf || isOwner) {
                  return <span className="text-xs text-muted-foreground">—</span>
                }

                return (
                  <ManagementRowActionsMenu
                    ariaLabel={`Actions for ${member.user.firstName}`}
                    actions={[
                      {
                        key: "remove",
                        label: "Remove staff",
                        destructive: true,
                        onSelect: () => handleRemove(member.id),
                      },
                    ]}
                  />
                )
              },
            }
          : undefined
      }
    />
  )
}
