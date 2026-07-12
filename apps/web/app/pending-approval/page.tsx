import { redirect } from "next/navigation";
import { Clock3 } from "lucide-react";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreCard, ServiceStoreStatusBadge } from "@/components/service-store/ui";
import { requireServiceStoreSession } from "@/lib/auth/require-identity";
import {
  getServiceStoreAccessState,
  isApprovedServiceStore,
  isPendingServiceStore,
  resolveApprovedServiceStoreDestination,
} from "@/lib/service-store/access";
import { formatBillingDate } from "@/lib/billing/format";
import { prisma } from "@/lib/prisma";

export default async function PendingApprovalPage() {
  const { session, identity } = await requireServiceStoreSession();

  if (!identity.domainUserId) {
    redirect("/app/onboarding");
  }

  const serviceStoreAccess = await getServiceStoreAccessState(identity.domainUserId);

  if (isApprovedServiceStore(serviceStoreAccess)) {
    redirect(resolveApprovedServiceStoreDestination(serviceStoreAccess));
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
          status: true,
          submittedAt: true,
          serviceStore: { select: { name: true, code: true } },
        },
        take: 1,
      },
      serviceStoreOnboardingRequests: {
        where: { status: "PENDING" },
        select: { status: true, submittedAt: true, businessName: true, businessCode: true },
        take: 1,
      },
    },
  });

  const pendingClaim = domainUser?.serviceStoreClaims[0];
  const pendingRequest = domainUser?.serviceStoreOnboardingRequests[0];
  const applicationLabel = pendingClaim
    ? `${pendingClaim.serviceStore.name} (${pendingClaim.serviceStore.code})`
    : pendingRequest
      ? `${pendingRequest.businessName} (${pendingRequest.businessCode})`
      : null;
  const submittedAt = pendingClaim?.submittedAt ?? pendingRequest?.submittedAt ?? null;

  return (
    <ServiceStorePublicLayout
      title="Pending approval"
      description={`Hi ${session.user.name ?? "there"}, your application is being reviewed by the AutoHub team.`}
    >
      <ServiceStoreCard className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-50">
          <Clock3 className="size-8 text-amber-600" strokeWidth={1.5} />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-[#15202b]">Under review</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#5b6b7a]">
          You&apos;ll be redirected to your Service Store dashboard as soon as this is approved.
        </p>

        <dl className="mt-8 w-full max-w-md space-y-3 rounded-2xl bg-[#f4f7fa] p-5 text-left text-sm">
          <div>
            <dt className="text-[#8a97a5]">Current application</dt>
            <dd className="mt-1 font-semibold text-[#15202b]">{applicationLabel ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Status</dt>
            <dd className="mt-1">
              <ServiceStoreStatusBadge label="Pending review" status="PENDING" />
            </dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Submitted</dt>
            <dd className="mt-1 font-semibold text-[#15202b]">
              {submittedAt ? formatBillingDate(submittedAt) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Estimated review time</dt>
            <dd className="mt-1 font-semibold text-[#15202b]">1–2 business days</dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Current review state</dt>
            <dd className="mt-1 font-semibold text-[#15202b]">Awaiting AutoHub team review</dd>
          </div>
        </dl>
      </ServiceStoreCard>
    </ServiceStorePublicLayout>
  );
}
