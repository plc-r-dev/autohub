import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import {
  getMerchantAccessState,
  isApprovedMerchant,
  isPendingMerchant,
} from "@/lib/merchant/access";
import { prisma } from "@/lib/prisma";

export default async function MerchantWaitingPage() {
  const { session, identity } = await requireLinkedIdentity();
  const merchantAccess = await getMerchantAccessState(identity.domainUserId!);

  if (isApprovedMerchant(merchantAccess)) {
    redirect("/merchant/dashboard");
  }

  if (!isPendingMerchant(merchantAccess)) {
    redirect("/merchant/onboarding");
  }

  const domainUser = await prisma.user.findUnique({
    where: { id: identity.domainUserId! },
    select: {
      merchantClaims: {
        where: { status: "PENDING" },
        select: {
          merchant: {
            select: {
              name: true,
              code: true,
            },
          },
        },
        take: 1,
      },
      merchantOnboardingRequests: {
        where: { status: "PENDING" },
        select: {
          businessName: true,
          businessCode: true,
        },
        take: 1,
      },
    },
  });

  const pendingClaim = domainUser?.merchantClaims[0];
  const pendingRequest = domainUser?.merchantOnboardingRequests[0];

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold">Waiting for approval</h1>
            <p className="text-muted-foreground text-sm">
              Signed in as {session.user.name}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="border-input flex flex-col gap-2 rounded-md border p-4 text-sm">
          <p>
            Your merchant request is pending review. You will be redirected to
            the merchant dashboard once it is approved.
          </p>
          {pendingClaim ? (
            <p>
              Pending claim: {pendingClaim.merchant.name} (
              {pendingClaim.merchant.code})
            </p>
          ) : null}
          {pendingRequest ? (
            <p>
              Pending onboarding request: {pendingRequest.businessName} (
              {pendingRequest.businessCode})
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
