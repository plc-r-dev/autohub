import { ServiceStoreHeaderBrand } from "@/components/service-store/service-store-header-brand";
import { ServiceStoreMobileNav } from "@/components/service-store/service-store-sidebar-nav";
import { ServiceStoreSidebar } from "@/components/service-store/service-store-sidebar";
import { ServiceStoreWorkspaceHeaderMenu } from "@/components/service-store/service-store-workspace-header-menu";
import { Badge } from "@workspace/ui/components/badge";

type StatusTone = "warning" | "success" | "muted";

const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  muted: "bg-muted text-muted-foreground",
};

type ServiceStoreWorkspaceShellProps = {
  displayName: string;
  avatarUrl: string | null;
  statusLabel: string;
  statusTone?: StatusTone;
  /** No approved store yet — every feature route is unreachable. */
  navLocked?: boolean;
  children: React.ReactNode;
};

export function ServiceStoreWorkspaceShell({
  displayName,
  avatarUrl,
  statusLabel,
  statusTone = "muted",
  navLocked = true,
  children,
}: ServiceStoreWorkspaceShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between gap-4 bg-card px-4 py-3 shadow-sm md:px-6">
        <ServiceStoreHeaderBrand href="/app" />

        <div className="hidden min-w-0 flex-col items-center sm:flex">
          <p className="text-xs text-muted-foreground">Welcome back, {displayName || "there"}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Service Store Workspace</span>
            <Badge className={STATUS_TONE_CLASS[statusTone]}>{statusLabel}</Badge>
          </div>
        </div>

        <ServiceStoreWorkspaceHeaderMenu displayName={displayName} avatarUrl={avatarUrl} />
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ServiceStoreSidebar locked={navLocked} />

        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4">
            <ServiceStoreMobileNav locked={navLocked} />
          </div>

          <div className="flex flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
