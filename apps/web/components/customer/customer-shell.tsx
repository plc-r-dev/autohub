import Link from "next/link";
import { CustomerTopNav } from "@/components/customer/customer-top-nav";
import { cn } from "@workspace/ui/lib/utils";

type CustomerShellProps = {
  children: React.ReactNode;
  showNav?: boolean;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function CustomerShell({
  children,
  showNav = true,
  backHref,
  backLabel = "Back",
  className,
}: CustomerShellProps) {
  return (
    <div className="min-h-svh bg-[#F8F8F8]">
      {showNav ? <CustomerTopNav /> : null}

      {backHref ? (
        <div className="mx-auto max-w-[1280px] px-5 pt-6 md:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#64748B] hover:text-[#0A0A0A]"
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
        {children}
      </main>
    </div>
  );
}
