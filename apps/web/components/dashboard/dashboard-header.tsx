import { MapPin } from "lucide-react";
import { ServiceStoreStatusBadge } from "@/components/service-store/ui";

type DashboardHeaderProps = {
  storeCode: string;
  storeName: string;
  role: string;
  status: string;
};

/** Store context line under the page title. */
export function DashboardHeader({
  storeCode,
  storeName,
  role,
  status,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <MapPin className="size-4 text-primary" />
        Performance overview for {storeName}
      </span>
      <span className="hidden h-4 w-px bg-border sm:block" />
      <span>
        {storeCode} · {role}
      </span>
      <ServiceStoreStatusBadge label={status} status={status} />
    </div>
  );
}
