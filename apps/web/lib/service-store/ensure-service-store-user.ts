import { resolveDefaultTenantId, splitDisplayName } from "@/lib/customer/ensure-customer-profile";
import { getLineUserId } from "@/lib/onboarding/context";
import { prisma } from "@/lib/prisma";

export type EnsureServiceStoreUserInput = {
  authUserId: string;
  displayName: string | null | undefined;
};

export type EnsureServiceStoreUserResult = {
  domainUserId: string;
  created: boolean;
};

/**
 * Ensures a domain User exists for a LINE-authenticated auth user on the
 * ServiceStore portal — mirrors ensureCustomerProfile's provisioning step so
 * ServiceStore identity is linked at login, not deferred to claim/create
 * submission. Does not create a Customer record.
 */
export async function ensureServiceStoreUser(
  input: EnsureServiceStoreUserInput,
): Promise<EnsureServiceStoreUserResult> {
  const existingUser = await prisma.user.findUnique({
    where: { authUserId: input.authUserId },
    select: { id: true },
  });

  if (existingUser) {
    return { domainUserId: existingUser.id, created: false };
  }

  const lineUserId = await getLineUserId(input.authUserId);

  if (lineUserId) {
    const existingLineUser = await prisma.user.findUnique({
      where: { lineUserId },
      select: { id: true },
    });
    if (existingLineUser) {
      throw new Error("LINE_USER_ALREADY_LINKED");
    }
  }

  const { firstName, lastName } = splitDisplayName(input.displayName);
  const tenantId = await resolveDefaultTenantId();

  const user = await prisma.user.create({
    data: {
      authUserId: input.authUserId,
      lineUserId,
      tenantId,
      firstName,
      lastName,
      phone: null,
      email: null,
    },
    select: { id: true },
  });

  return { domainUserId: user.id, created: true };
}
