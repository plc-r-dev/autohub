import Link from "next/link";
import { ServiceStoreMobileNav, ServiceStoreSidebarNav } from "@/components/service-store/service-store-sidebar-nav";
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
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 md:px-6">
        <Link href="/app" className="flex shrink-0 flex-col leading-tight">
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">AutoHub</span>
          <span className="text-base font-semibold text-foreground">Service Store</span>
        </Link>

        <div className="hidden min-w-0 flex-col items-center sm:flex">
          <p className="text-xs text-muted-foreground">Welcome back, {displayName || "there"}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Service Store Workspace</span>
            <Badge className={STATUS_TONE_CLASS[statusTone]}>{statusLabel}</Badge>
          </div>
        </div>

        <ServiceStoreWorkspaceHeaderMenu displayName={displayName} avatarUrl={avatarUrl} />
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border lg:block">
          <div className="sticky top-0 flex flex-col gap-6 p-4">
            <ServiceStoreSidebarNav locked={navLocked} />
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-4">
            <ServiceStoreMobileNav locked={navLocked} />
          </div>

          <div className="flex flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
