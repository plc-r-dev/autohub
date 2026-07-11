import { ServiceStoreCard, type BrowseServiceStoreCardData } from "@/components/browse/service-store-card";
import { CustomerEmptyState } from "@/components/customer/customer-ui";

type ServiceStoreCardGridProps = {
  serviceStores: BrowseServiceStoreCardData[];
  emptyLabel?: string;
  hasSearch?: boolean;
};

export function ServiceStoreCardGrid({
  serviceStores,
  emptyLabel = "No service shops available right now.",
  hasSearch = false,
}: ServiceStoreCardGridProps) {
  if (serviceStores.length === 0) {
    return (
      <CustomerEmptyState
        title={hasSearch ? "No results" : "Nothing here yet"}
        description={emptyLabel}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {serviceStores.map((serviceStore) => (
        <ServiceStoreCard key={serviceStore.id} serviceStore={serviceStore} />
      ))}
    </div>
  );
}
