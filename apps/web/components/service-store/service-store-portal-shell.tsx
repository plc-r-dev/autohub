import Link from "next/link";
import { Bell } from "lucide-react";
import { ServiceStoreHeaderBrand } from "@/components/service-store/service-store-header-brand";
import { ServiceStoreMobileNav } from "@/components/service-store/service-store-sidebar-nav";
import { ServiceStoreSidebar } from "@/components/service-store/service-store-sidebar";
import { ServiceStorePortalUserMenuLoader } from "@/components/service-store/service-store-portal-user-menu-loader";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { portalPageMainClassName } from "@/components/service-store/ui/portal-surfaces";

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
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between bg-background/95 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
        <ServiceStoreHeaderBrand />

        <div className="flex items-center gap-2 md:gap-3">
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

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ServiceStoreSidebar />

        <main
          className={cn(
            "min-w-0 flex-1 overflow-y-auto px-6 py-6 xl:px-8 2xl:px-10",
            portalPageMainClassName,
            className,
          )}
        >
          <div className="mb-8 flex flex-col gap-6">
            <div className="min-w-0">
              {backHref ? (
                <Link
                  href={backHref}
                  className="mb-2 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  ← {backLabel}
                </Link>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground xl:text-4xl">
                  {title}
                </h1>
                {actions ? (
                  <div className="flex shrink-0 items-center gap-2">{actions}</div>
                ) : null}
              </div>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>
              ) : null}
            </div>
            <ServiceStoreMobileNav />
          </div>

          <div className="flex flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
