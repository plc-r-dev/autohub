import { ServiceStoreSwitcher } from "@/components/service-store/service-store-switcher"
import { roleLabel } from "@/lib/service-store/domain"
import { requireServiceStoreContext } from "@/lib/service-store/context"

export async function ServiceStoreSwitcherLoader() {
  const ctx = await requireServiceStoreContext(undefined, { allowOnboarding: true })

  return (
    <ServiceStoreSwitcher
      storeName={ctx.serviceStore.name}
      roleLabel={roleLabel(ctx.membership.role)}
    />
  )
}
