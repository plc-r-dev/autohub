import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

type CustomerShellProps = {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
  className?: string;
};

/**
 * Single shared shell for every customer page.
 * Navigation (top nav on desktop, bottom tab bar on mobile) lives in
 * CustomerRouteChrome (the (customer) route-group layout) — not here — so
 * every page under /(customer) gets responsive nav automatically without
 * opting in per page.
 */
export function CustomerShell({
  children,
  backHref,
  backLabel = "Back",
  title,
  subtitle,
  className,
}: CustomerShellProps) {
  return (
    <div className="min-h-svh bg-[#F8F8F8]">
      {backHref ? (
        <div className="mx-auto max-w-[1280px] px-5 pt-6 md:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#64748B] hover:text-[#0F172A]"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </Link>
        </div>
      ) : null}

      <main
        className={cn(
          "mx-auto w-full max-w-[1280px] px-5 py-8 md:px-8 md:py-10",
          backHref && "pt-4",
          className,
        )}
      >
        {title ? (
          <header className="mb-6">
            <h1 className="text-[24px] font-semibold tracking-tight text-[#0F172A]">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-[14px] leading-relaxed text-[#64748B]">{subtitle}</p>
            ) : null}
          </header>
        ) : null}
        {children}
      </main>
    </div>
  );
}
