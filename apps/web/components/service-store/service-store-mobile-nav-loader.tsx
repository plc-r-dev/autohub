import { ServiceStoreMobileNav } from "@/components/service-store/service-store-sidebar-nav"
import { isServiceStoreCatalogConfigured } from "@/lib/service-store/application/catalog-gate"
import { requireServiceStoreContext } from "@/lib/service-store/context"

type ServiceStoreMobileNavLoaderProps = {
  locked?: boolean
}

export async function ServiceStoreMobileNavLoader({
  locked = false,
}: ServiceStoreMobileNavLoaderProps) {
  let settingsOnly = false

  if (!locked) {
    try {
      const ctx = await requireServiceStoreContext(undefined, {
        allowOnboarding: true,
      })
      settingsOnly = !(await isServiceStoreCatalogConfigured(ctx.serviceStore.id))
    } catch {
      settingsOnly = false
    }
  }

  return <ServiceStoreMobileNav locked={locked} settingsOnly={settingsOnly} />
}
