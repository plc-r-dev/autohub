import { randomBytes } from "crypto"

export const STAFF_INVITE_TTL_DAYS = 30

export type StaffInviteValidationResult =
  | {
      ok: true
      invite: {
        id: string
        serviceStoreId: string
        serviceStoreName: string
        expiresAt: Date
      }
    }
  | { ok: false; reason: "NOT_FOUND" | "REVOKED" | "EXPIRED" }

export function generateStaffInviteToken(): string {
  return randomBytes(32).toString("base64url")
}

export function getStaffInviteExpiresAt(from = new Date()): Date {
  const expiresAt = new Date(from)
  expiresAt.setDate(expiresAt.getDate() + STAFF_INVITE_TTL_DAYS)
  return expiresAt
}

export function buildStaffInviteUrl(token: string): string {
  const baseUrl =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    "http://localhost:3000"

  return `${baseUrl.replace(/\/$/, "")}/invite/${token}`
}

export function validateStaffInviteRecord(invite: {
  expiresAt: Date
  revokedAt: Date | null
} | null): StaffInviteValidationResult {
  if (!invite) {
    return { ok: false, reason: "NOT_FOUND" }
  }

  if (invite.revokedAt) {
    return { ok: false, reason: "REVOKED" }
  }

  if (invite.expiresAt.getTime() <= Date.now()) {
    return { ok: false, reason: "EXPIRED" }
  }

  return {
    ok: true,
    invite: {
      id: invite.id,
      serviceStoreId: invite.serviceStoreId,
      serviceStoreName: "",
      expiresAt: invite.expiresAt,
    },
  }
}
