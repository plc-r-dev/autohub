"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "@/lib/auth/session"
import { ensureServiceStoreUser } from "@/lib/service-store/ensure-service-store-user"
import {
  ensureStaffInviteLink,
  getStaffInviteByToken,
  regenerateStaffInviteLink,
  validateStaffInviteToken,
} from "@/lib/service-store/application/staff-invite-queries"
import { requireServiceStoreContext } from "@/lib/service-store/context"
import { SERVICE_STORE_PERMISSION } from "@/lib/service-store/domain"
import { prisma } from "@/lib/prisma"

export type StaffInviteActionResult =
  | { ok: true; inviteUrl: string; expiresAt: string; message?: string }
  | { ok: false; error: string }

export type AcceptStaffInviteResult =
  | { ok: true; serviceStoreName: string }
  | { ok: false; error: string }

function revalidateStaffPaths() {
  revalidatePath("/app/settings")
  revalidatePath("/app/members")
  revalidatePath("/app/dashboard")
  revalidatePath("/app")
}

export async function getOrCreateStaffInviteLink(): Promise<StaffInviteActionResult> {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.MEMBERS_INVITE, {
    allowOnboarding: true,
  })

  try {
    const invite = await ensureStaffInviteLink(ctx.serviceStore.id, ctx.user.id)
    return { ok: true, ...invite }
  } catch {
    return { ok: false, error: "Unable to generate invitation link." }
  }
}

export async function regenerateStaffInviteLinkAction(): Promise<StaffInviteActionResult> {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.MEMBERS_INVITE, {
    allowOnboarding: true,
  })

  try {
    const invite = await regenerateStaffInviteLink(ctx.serviceStore.id, ctx.user.id)
    revalidateStaffPaths()
    return {
      ok: true,
      ...invite,
      message: "Invitation link regenerated. Previous links no longer work.",
    }
  } catch {
    return { ok: false, error: "Unable to regenerate invitation link." }
  }
}

export async function acceptStaffInvite(token: string): Promise<AcceptStaffInviteResult> {
  const session = await getServerSession()
  if (!session) {
    return { ok: false, error: "Sign in with LINE to join this store." }
  }

  const inviteRecord = await getStaffInviteByToken(token)
  const validation = validateStaffInviteToken(inviteRecord)
  if (!validation.ok) {
    const messages = {
      NOT_FOUND: "This invitation link is invalid.",
      REVOKED: "This invitation link has been revoked.",
      EXPIRED: "This invitation link has expired.",
    }
    return { ok: false, error: messages[validation.reason] }
  }

  let domainUserId: string
  try {
    const result = await ensureServiceStoreUser({
      authUserId: session.user.id,
      displayName: session.user.name,
    })
    domainUserId = result.domainUserId
  } catch {
    return { ok: false, error: "Unable to verify your account. Try signing in again." }
  }

  const user = await prisma.user.findUnique({
    where: { id: domainUserId },
    select: { id: true, tenantId: true },
  })

  if (!user) {
    return { ok: false, error: "Account not found." }
  }

  if (user.tenantId !== validation.invite.tenantId) {
    return { ok: false, error: "This invitation is not valid for your account." }
  }

  const existingMember = await prisma.serviceStoreMember.findUnique({
    where: {
      serviceStoreId_userId: {
        serviceStoreId: validation.invite.serviceStoreId,
        userId: user.id,
      },
    },
    select: { id: true, role: true },
  })

  if (existingMember) {
    await prisma.user.update({
      where: { id: user.id },
      data: { serviceStoreId: validation.invite.serviceStoreId },
    })
    revalidateStaffPaths()
    return { ok: true, serviceStoreName: validation.invite.serviceStoreName }
  }

  await prisma.$transaction(async (tx) => {
    await tx.serviceStoreMember.create({
      data: {
        serviceStoreId: validation.invite.serviceStoreId,
        userId: user.id,
        role: "STAFF",
      },
    })

    await tx.user.update({
      where: { id: user.id },
      data: { serviceStoreId: validation.invite.serviceStoreId },
    })
  })

  revalidateStaffPaths()
  return { ok: true, serviceStoreName: validation.invite.serviceStoreName }
}
