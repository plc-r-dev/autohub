import { ServiceStoreSidebarBrand } from "@/components/service-store/service-store-sidebar-brand";
import { ServiceStoreSidebarFooter } from "@/components/service-store/service-store-sidebar-footer";
import { ServiceStoreSidebarNav } from "@/components/service-store/service-store-sidebar-nav";
import { getServiceShopImage } from "@/lib/media/service-shop-images";
import { isServiceStoreCatalogConfigured } from "@/lib/service-store/application/catalog-gate";
import { requireServiceStoreContext } from "@/lib/service-store/context";

type ServiceStoreSidebarProps = {
  locked?: boolean;
};

export async function ServiceStoreSidebar({ locked = false }: ServiceStoreSidebarProps) {
  let storeName = "Service Store";
  let storeSubtitle = "AutoHub";
  let coverSrc: string | null = null;
  let coverAlt: string | undefined;
  let settingsOnly = false;

  if (!locked) {
    const ctx = await requireServiceStoreContext(undefined, { allowOnboarding: true });
    storeName = ctx.serviceStore.name;
    storeSubtitle = ctx.serviceStore.code;
    const cover = getServiceShopImage(ctx.serviceStore.id, ctx.serviceStore.name);
    coverSrc = cover.src;
    coverAlt = cover.alt;
    settingsOnly = !(await isServiceStoreCatalogConfigured(ctx.serviceStore.id));
  }

  return (
    <aside className="hidden w-[272px] shrink-0 flex-col overflow-hidden bg-muted/30 shadow-sm lg:flex">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
        <ServiceStoreSidebarBrand
          name={storeName}
          subtitle={storeSubtitle}
          href="/app"
          coverSrc={coverSrc}
          coverAlt={coverAlt}
        />

        <div className="mt-8 min-h-0 flex-1 overflow-y-auto">
          <ServiceStoreSidebarNav locked={locked} settingsOnly={settingsOnly} />
        </div>

        <ServiceStoreSidebarFooter locked={locked} className="mt-auto shrink-0 pt-4" />
      </div>
    </aside>
  );
}
