import { prisma } from "@/lib/prisma"
import {
  buildStaffInviteUrl,
  generateStaffInviteToken,
  getStaffInviteExpiresAt,
  validateStaffInviteRecord,
} from "@/lib/service-store/staff-invite"

export type StaffInviteLinkData = {
  inviteUrl: string
  expiresAt: string
}

export async function getStaffInviteByToken(token: string) {
  return prisma.serviceStoreStaffInvite.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      expiresAt: true,
      revokedAt: true,
      serviceStoreId: true,
      serviceStore: {
        select: {
          id: true,
          name: true,
          status: true,
          tenantId: true,
        },
      },
    },
  })
}

export async function getActiveStaffInviteForStore(serviceStoreId: string) {
  const invite = await prisma.serviceStoreStaffInvite.findUnique({
    where: { serviceStoreId },
    select: {
      token: true,
      expiresAt: true,
      revokedAt: true,
    },
  })

  if (!invite) {
    return null
  }

  const validation = validateStaffInviteRecord(invite)
  if (!validation.ok) {
    return null
  }

  return {
    inviteUrl: buildStaffInviteUrl(invite.token),
    expiresAt: invite.expiresAt.toISOString(),
  } satisfies StaffInviteLinkData
}

export async function ensureStaffInviteLink(
  serviceStoreId: string,
  createdByUserId: string,
): Promise<StaffInviteLinkData> {
  const existing = await getActiveStaffInviteForStore(serviceStoreId)
  if (existing) {
    return existing
  }

  const current = await prisma.serviceStoreStaffInvite.findUnique({
    where: { serviceStoreId },
    select: { id: true },
  })

  const token = generateStaffInviteToken()
  const expiresAt = getStaffInviteExpiresAt()

  if (current) {
    await prisma.serviceStoreStaffInvite.update({
      where: { serviceStoreId },
      data: {
        token,
        expiresAt,
        revokedAt: null,
        createdByUserId,
      },
    })
  } else {
    await prisma.serviceStoreStaffInvite.create({
      data: {
        serviceStoreId,
        token,
        expiresAt,
        createdByUserId,
      },
    })
  }

  return {
    inviteUrl: buildStaffInviteUrl(token),
    expiresAt: expiresAt.toISOString(),
  }
}

export async function regenerateStaffInviteLink(
  serviceStoreId: string,
  createdByUserId: string,
): Promise<StaffInviteLinkData> {
  const token = generateStaffInviteToken()
  const expiresAt = getStaffInviteExpiresAt()

  await prisma.serviceStoreStaffInvite.upsert({
    where: { serviceStoreId },
    create: {
      serviceStoreId,
      token,
      expiresAt,
      createdByUserId,
    },
    update: {
      token,
      expiresAt,
      revokedAt: null,
      createdByUserId,
    },
  })

  return {
    inviteUrl: buildStaffInviteUrl(token),
    expiresAt: expiresAt.toISOString(),
  }
}

export async function revokeStaffInviteLink(serviceStoreId: string) {
  await prisma.serviceStoreStaffInvite.updateMany({
    where: { serviceStoreId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export function validateStaffInviteToken(
  invite: Awaited<ReturnType<typeof getStaffInviteByToken>>,
) {
  if (!invite) {
    return { ok: false as const, reason: "NOT_FOUND" as const }
  }

  const validation = validateStaffInviteRecord(invite)
  if (!validation.ok) {
    return validation
  }

  return {
    ok: true as const,
    invite: {
      id: invite.id,
      serviceStoreId: invite.serviceStoreId,
      serviceStoreName: invite.serviceStore.name,
      serviceStoreStatus: invite.serviceStore.status,
      tenantId: invite.serviceStore.tenantId,
      expiresAt: invite.expiresAt,
    },
  }
}
