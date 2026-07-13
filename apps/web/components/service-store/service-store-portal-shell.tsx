import Link from "next/link";
import { Bell } from "lucide-react";
import { ServiceStoreMobileNav, ServiceStoreSidebarNav } from "@/components/service-store/service-store-sidebar-nav";
import { ServiceStorePortalUserMenuLoader } from "@/components/service-store/service-store-portal-user-menu-loader";
import { ServiceStoreSwitcherLoader } from "@/components/service-store/service-store-switcher-loader";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

type ServiceStorePortalShellProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ServiceStorePortalShell({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  children,
  className,
}: ServiceStorePortalShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Link href="/app/dashboard" className="flex shrink-0 flex-col leading-tight">
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">AutoHub</span>
          <span className="text-base font-semibold text-foreground">Service Store</span>
        </Link>

        <div className="flex items-center gap-3">
          <ServiceStoreSwitcherLoader />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="rounded-full"
          >
            <Bell className="size-4" />
          </Button>
          <ThemeToggle />
          <ServiceStorePortalUserMenuLoader />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-muted/20 lg:block">
          <div className="sticky top-6 flex flex-col gap-8 px-4 py-6">
            <ServiceStoreSidebarNav />
          </div>
        </aside>

        <main
          className={cn(
            "flex-1 overflow-y-auto px-6 py-6 xl:px-8 2xl:px-10",
            className,
          )}
        >
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {backHref ? (
                  <Link
                    href={backHref}
                    className="mb-2 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    ← {backLabel}
                  </Link>
                ) : null}
                <h1 className="text-3xl font-bold tracking-tight text-foreground xl:text-4xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
            </div>
            <ServiceStoreMobileNav />
          </div>

          <div className="flex flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
