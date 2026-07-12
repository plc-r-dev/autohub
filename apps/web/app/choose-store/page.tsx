import { redirect } from "next/navigation";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreButton, ServiceStoreCard } from "@/components/service-store/ui";
import { requireServiceStoreSession } from "@/lib/auth/require-identity";
import {
  getServiceStoreAccessState,
  isApprovedServiceStore,
} from "@/lib/service-store/access";
import { listAccessibleServiceStores } from "@/lib/service-store/context";
import { switchActiveServiceStore } from "@/lib/service-store/member-actions";
import { roleLabel } from "@/lib/service-store/domain";

export default async function ChooseServiceStorePage() {
  const { session, identity } = await requireServiceStoreSession();

  if (!identity.domainUserId) {
    redirect("/app/onboarding");
  }

  const serviceStoreAccess = await getServiceStoreAccessState(identity.domainUserId);

  if (!isApprovedServiceStore(serviceStoreAccess)) {
    redirect(serviceStoreAccess.status === "pending" ? "/pending-approval" : "/app/onboarding");
  }

  if (serviceStoreAccess.membershipCount <= 1) {
    redirect("/app/dashboard");
  }

  const memberships = await listAccessibleServiceStores(identity.domainUserId);

  return (
    <ServiceStorePublicLayout
      title="Choose a Service Store"
      description={`Hi ${session.user.name ?? "there"}, you manage more than one Service Store. Pick one to continue.`}
    >
      <ServiceStoreCard className="flex flex-col gap-3">
        {memberships.map((row) => (
          <form
            key={row.serviceStore.id}
            action={async () => {
              "use server";
              await switchActiveServiceStore(row.serviceStore.id);
            }}
          >
            <ServiceStoreButton type="submit" variant="secondary" className="h-auto w-full justify-between px-5 py-4">
              <span className="text-left">
                <span className="block text-[15px] font-semibold text-[#15202b]">
                  {row.serviceStore.name}
                </span>
                <span className="mt-0.5 block text-xs text-[#8a97a5]">
                  {row.serviceStore.code} · {roleLabel(row.role)}
                </span>
              </span>
            </ServiceStoreButton>
          </form>
        ))}
      </ServiceStoreCard>
    </ServiceStorePublicLayout>
  );
}
