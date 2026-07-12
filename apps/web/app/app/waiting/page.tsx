import { redirect } from "next/navigation";
import { Clock3 } from "lucide-react";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreCard } from "@/components/service-store/ui";
import { requireServiceStoreSession } from "@/lib/auth/require-identity";
import {
  getServiceStoreAccessState,
  isApprovedServiceStore,
  isPendingServiceStore,
} from "@/lib/service-store/access";
import { prisma } from "@/lib/prisma";

export default async function ServiceStoreWaitingPage() {
  const { session, identity } = await requireServiceStoreSession();

  if (!identity.domainUserId) {
    redirect("/app/onboarding");
  }

  const serviceStoreAccess = await getServiceStoreAccessState(identity.domainUserId);

  if (isApprovedServiceStore(serviceStoreAccess)) {
    const store = await prisma.serviceStore.findUnique({
      where: { id: serviceStoreAccess.serviceStoreId! },
      select: { status: true },
    });
    if (store?.status === "ONBOARDING") {
      redirect("/app/setup");
    }
    redirect("/app/dashboard");
  }

  if (!isPendingServiceStore(serviceStoreAccess)) {
    redirect("/app/onboarding");
  }

  const domainUser = await prisma.user.findUnique({
    where: { id: identity.domainUserId },
    select: {
      serviceStoreClaims: {
        where: { status: "PENDING" },
        select: {
          serviceStore: { select: { name: true, code: true } },
        },
        take: 1,
      },
      serviceStoreOnboardingRequests: {
        where: { status: "PENDING" },
        select: { businessName: true, businessCode: true },
        take: 1,
      },
    },
  });

  const pendingClaim = domainUser?.serviceStoreClaims[0];
  const pendingRequest = domainUser?.serviceStoreOnboardingRequests[0];

  return (
    <ServiceStorePublicLayout
      title="Waiting for approval"
      description={`Hi ${session.user.name ?? "there"}, your request is being reviewed by the AutoHub team.`}
      backHref="/app"
    >
      <ServiceStoreCard className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-50">
          <Clock3 className="size-8 text-amber-600" strokeWidth={1.5} />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-[#15202b]">Under review</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#5b6b7a]">
          You will be redirected to the serviceStore dashboard once your business is approved.
          This usually takes 1–2 business days.
        </p>

        <dl className="mt-8 w-full max-w-md space-y-3 rounded-2xl bg-[#f4f7fa] p-5 text-left text-sm">
          {pendingClaim ? (
            <div>
              <dt className="text-[#8a97a5]">Pending claim</dt>
              <dd className="mt-1 font-semibold text-[#15202b]">
                {pendingClaim.serviceStore.name} ({pendingClaim.serviceStore.code})
              </dd>
            </div>
          ) : null}
          {pendingRequest ? (
            <div>
              <dt className="text-[#8a97a5]">New business request</dt>
              <dd className="mt-1 font-semibold text-[#15202b]">
                {pendingRequest.businessName} ({pendingRequest.businessCode})
              </dd>
            </div>
          ) : null}
        </dl>
      </ServiceStoreCard>
    </ServiceStorePublicLayout>
  );
}
