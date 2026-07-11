import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ServiceStorePortalShell } from "@/components/service-store/service-store-portal-shell";
import { serviceStoreNav } from "@/components/service-store/service-store-nav";
import { cn } from "@workspace/ui/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type PageShellProps = {
  title: string;
  description?: string;
  nav?: NavItem[];
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function isServiceStoreNav(nav?: NavItem[]) {
  return Boolean(nav?.length && nav.every((item) => item.href.startsWith("/service-store")));
}

export function PageShell({
  title,
  description,
  nav,
  backHref,
  backLabel,
  actions,
  children,
  className,
}: PageShellProps) {
  if (isServiceStoreNav(nav)) {
    return (
      <ServiceStorePortalShell
        title={title}
        description={description}
        backHref={backHref}
        backLabel={backLabel}
        actions={actions}
        className={className}
      >
        {children}
      </ServiceStorePortalShell>
    );
  }

  return (
    <div className="flex min-h-svh flex-col p-6">
      <div className={cn("mx-auto flex w-full max-w-4xl flex-col gap-6", className)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {backHref ? (
              <Link
                href={backHref}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Back
              </Link>
            ) : null}
            <h1 className="text-xl font-semibold">{title}</h1>
            {description ? (
              <p className="text-muted-foreground text-sm">{description}</p>
            ) : null}
          </div>
          <LogoutButton />
        </div>

        {nav && nav.length > 0 ? (
          <nav className="flex flex-wrap gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        {children}
      </div>
    </div>
  );
}

export { serviceStoreNav };

export const customerNav: NavItem[] = [
  { href: "/browse", label: "Home" },
  { href: "/bookings", label: "Bookings" },
  { href: "/profile", label: "Profile" },
  { href: "/more", label: "More" },
];
