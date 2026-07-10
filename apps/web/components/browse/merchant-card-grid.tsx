import { MerchantCard, type BrowseMerchantCardData } from "@/components/browse/merchant-card";
import { CustomerEmptyState } from "@/components/customer/customer-ui";

type MerchantCardGridProps = {
  merchants: BrowseMerchantCardData[];
  emptyLabel?: string;
  hasSearch?: boolean;
};

export function MerchantCardGrid({
  merchants,
  emptyLabel = "No service shops available right now.",
  hasSearch = false,
}: MerchantCardGridProps) {
  if (merchants.length === 0) {
    return (
      <CustomerEmptyState
        title={hasSearch ? "No results" : "Nothing here yet"}
        description={emptyLabel}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {merchants.map((merchant) => (
        <MerchantCard key={merchant.id} merchant={merchant} />
      ))}
    </div>
  );
}
