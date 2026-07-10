import { redirect } from "next/navigation";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import {
  getMerchantAccessState,
  isApprovedMerchant,
} from "@/lib/merchant/access";
import { prisma } from "@/lib/prisma";

export async function requireDomainUser() {
  const { session, identity } = await requireLinkedIdentity();

  const user = await prisma.user.findUnique({
    where: { id: identity.domainUserId! },
    select: {
      id: true,
      authUserId: true,
      lineUserId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      tenantId: true,
      merchantId: true,
    },
  });

  if (!user) {
    redirect("/browse");
  }

  return { session, identity, user };
}

export async function requireApprovedMerchantUser() {
  const { session, identity, user } = await requireDomainUser();

  const merchantAccess = await getMerchantAccessState(user.id);
  if (!isApprovedMerchant(merchantAccess) || !user.merchantId) {
    redirect("/merchant/waiting");
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: user.merchantId },
  });

  if (!merchant) {
    redirect("/merchant/waiting");
  }

  return { session, identity, user, merchant };
}
