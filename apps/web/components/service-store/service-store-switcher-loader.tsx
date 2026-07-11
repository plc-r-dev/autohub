import { ServiceStoreSwitcher } from "@/components/service-store/service-store-switcher";
import { listAccessibleServiceStores, requireServiceStoreContext } from "@/lib/service-store/context";

export async function ServiceStoreSwitcherLoader() {
  const ctx = await requireServiceStoreContext();
  const memberships = await listAccessibleServiceStores(ctx.user.id);

  return (
    <ServiceStoreSwitcher
      memberships={memberships}
      activeServiceStoreId={ctx.serviceStore.id}
    />
  );
}
