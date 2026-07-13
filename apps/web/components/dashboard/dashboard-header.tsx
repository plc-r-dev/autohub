import { ServiceStoreStatusBadge } from "@/components/service-store/ui";

type DashboardHeaderProps = {
  storeCode: string;
  role: string;
  status: string;
};

/** Compact store-context line rendered under the page title (code, role, current status). */
export function DashboardHeader({ storeCode, role, status }: DashboardHeaderProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        {storeCode} · {role}
      </span>
      <ServiceStoreStatusBadge label={status} status={status} />
    </div>
  );
}
