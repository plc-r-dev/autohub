import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

type LiffShellProps = {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
  className?: string;
};

/** LINE LIFF surface — max 420px, no dashboard chrome. */
export function LiffShell({
  children,
  backHref,
  backLabel = "Back",
  title,
  subtitle,
  className,
}: LiffShellProps) {
  return (
    <div className="min-h-svh bg-[#F4F6F8]">
      <div className={cn("mx-auto w-full max-w-[420px] px-4 py-5", className)}>
        {backHref ? (
          <Link
            href={backHref}
            className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-[14px] font-medium text-[#64748B]"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </Link>
        ) : null}

        {title ? (
          <header className="mb-6">
            <h1 className="text-[24px] font-semibold tracking-tight text-[#0F172A]">{title}</h1>
            {subtitle ? <p className="mt-1 text-[14px] leading-relaxed text-[#64748B]">{subtitle}</p> : null}
          </header>
        ) : null}

        {children}
      </div>
    </div>
  );
}
