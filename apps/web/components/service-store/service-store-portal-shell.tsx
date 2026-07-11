import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ServiceStoreMobileNav, ServiceStoreSidebarNav } from "@/components/service-store/service-store-sidebar-nav";
import { ServiceStoreSwitcherLoader } from "@/components/service-store/service-store-switcher-loader";
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
    <div className="min-h-svh bg-[#f4f7fa]">
      <div className="mx-auto flex w-full max-w-7xl gap-6 p-4 md:p-6 lg:p-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-6 flex flex-col gap-6">
            <Link href="/service-store/dashboard" className="px-3">
              <p className="text-xs font-semibold tracking-wide text-[#0b7a3a] uppercase">
                AutoHub
              </p>
              <p className="text-lg font-semibold text-[#15202b]">Service Store</p>
            </Link>
            <ServiceStoreSwitcherLoader />
            <ServiceStoreSidebarNav />
          </div>
        </aside>

        <div className={cn("min-w-0 flex-1", className)}>
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {backHref ? (
                  <Link
                    href={backHref}
                    className="mb-2 inline-flex text-sm font-medium text-[#8a97a5] hover:text-[#15202b]"
                  >
                    ← {backLabel}
                  </Link>
                ) : null}
                <h1 className="text-2xl font-semibold tracking-tight text-[#15202b] md:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1 text-sm text-[#5b6b7a] md:text-base">{description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {actions}
                <LogoutButton redirectTo="/service-store/login" />
              </div>
            </div>
            <ServiceStoreMobileNav />
          </div>

          <div className="flex flex-col gap-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
