import { getLineUserId } from "@/lib/onboarding/context";
import { prisma } from "@/lib/prisma";

export type EnsureCustomerProfileInput = {
  authUserId: string;
  displayName: string | null | undefined;
  imageUrl: string | null | undefined;
};

export type EnsureCustomerProfileResult = {
  domainUserId: string;
  customerId: string;
  created: boolean;
};

export function splitDisplayName(name: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const trimmed = (name ?? "").trim();
  if (!trimmed) {
    return { firstName: "LINE", lastName: "User" };
  }

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] ?? "LINE";
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
  return { firstName, lastName };
}

export async function resolveDefaultTenantId(): Promise<string> {
  const preferred = await prisma.tenant.findFirst({
    where: { code: "AUTOHUB", status: "ACTIVE" },
    select: { id: true },
  });
  if (preferred) {
    return preferred.id;
  }

  const fallback = await prisma.tenant.findFirst({
    where: { status: "ACTIVE" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!fallback) {
    throw new Error("NO_ACTIVE_TENANT");
  }

  return fallback.id;
}

/**
 * Ensures a domain User + Customer exist for a LINE-authenticated auth user.
 * Creates them from LINE profile data when missing. Phone/email stay empty.
 */
export async function ensureCustomerProfile(
  input: EnsureCustomerProfileInput,
): Promise<EnsureCustomerProfileResult> {
  const existingUser = await prisma.user.findUnique({
    where: { authUserId: input.authUserId },
    select: {
      id: true,
      customer: { select: { id: true } },
    },
  });

  if (existingUser?.customer) {
    return {
      domainUserId: existingUser.id,
      customerId: existingUser.customer.id,
      created: false,
    };
  }

  const lineUserId = await getLineUserId(input.authUserId);
  const { firstName, lastName } = splitDisplayName(input.displayName);
  const lineDisplayName = input.displayName?.trim() || null;
  const linePictureUrl = input.imageUrl?.trim() || null;

  if (existingUser && !existingUser.customer) {
    if (lineUserId) {
      const existingLineCustomer = await prisma.customer.findUnique({
        where: { lineUserId },
        select: { id: true, userId: true },
      });
      if (existingLineCustomer && existingLineCustomer.userId !== existingUser.id) {
        throw new Error("LINE_CUSTOMER_ALREADY_LINKED");
      }
    }

    const customer = await prisma.customer.create({
      data: {
        userId: existingUser.id,
        tenantId: (
          await prisma.user.findUniqueOrThrow({
            where: { id: existingUser.id },
            select: { tenantId: true },
          })
        ).tenantId,
        lineUserId,
        firstName,
        lastName,
        phone: null,
        email: null,
        lineDisplayName,
        linePictureUrl,
      },
      select: { id: true },
    });

    return {
      domainUserId: existingUser.id,
      customerId: customer.id,
      created: true,
    };
  }

  if (lineUserId) {
    const existingLineUser = await prisma.user.findUnique({
      where: { lineUserId },
      select: { id: true },
    });
    if (existingLineUser) {
      throw new Error("LINE_USER_ALREADY_LINKED");
    }

    const existingLineCustomer = await prisma.customer.findUnique({
      where: { lineUserId },
      select: { id: true },
    });
    if (existingLineCustomer) {
      throw new Error("LINE_CUSTOMER_ALREADY_LINKED");
    }
  }

  const tenantId = await resolveDefaultTenantId();

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
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

    const customer = await tx.customer.create({
      data: {
        userId: user.id,
        tenantId,
        lineUserId,
        firstName,
        lastName,
        phone: null,
        email: null,
        lineDisplayName,
        linePictureUrl,
      },
      select: { id: true },
    });

    return { domainUserId: user.id, customerId: customer.id };
  });

  return { ...created, created: true };
}
