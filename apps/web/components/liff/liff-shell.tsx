import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

type LiffShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  headerAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** When true, shows a minimal LINE OA context bar instead of a full app header. */
  showLineContext?: boolean;
};

export function LiffShell({
  children,
  title,
  subtitle,
  backHref,
  headerAction,
  className,
  contentClassName,
  showLineContext = false,
}: LiffShellProps) {
  const hasHeader = Boolean(title || backHref || headerAction || showLineContext);

  return (
    <div className="min-h-svh bg-[#f0f2f5]">
      <div
        className={cn(
          "relative mx-auto flex min-h-svh w-full max-w-[420px] flex-col bg-[#f7f8fa]",
          className,
        )}
        style={{
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {hasHeader ? (
          <header className="sticky top-0 z-10 border-b border-[#e5e8eb] bg-[#f7f8fa]/96 backdrop-blur-sm">
            {showLineContext ? (
              <div className="flex items-center gap-2 px-4 py-2">
                <span className="size-2 rounded-full bg-[#06C755]" aria-hidden />
                <span className="text-xs font-medium text-[#6b7c8c]">AutoHub Official Account</span>
              </div>
            ) : null}
            {(title || backHref || headerAction) && (
              <div className="flex items-center gap-2 px-3 py-2.5">
                {backHref ? (
                  <Link
                    href={backHref}
                    className="inline-flex size-11 items-center justify-center rounded-xl text-lg text-[#15202b] active:bg-[#e5e8eb]"
                    aria-label="Back"
                  >
                    ‹
                  </Link>
                ) : (
                  <div className="size-11 shrink-0" />
                )}
                <div className="min-w-0 flex-1 text-center">
                  {title ? (
                    <h1 className="truncate text-[15px] font-semibold text-[#111]">
                      {title}
                    </h1>
                  ) : null}
                  {subtitle ? (
                    <p className="truncate text-xs text-[#6b7c8c]">{subtitle}</p>
                  ) : null}
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center">
                  {headerAction}
                </div>
              </div>
            )}
          </header>
        ) : null}

        <main
          className={cn(
            "flex-1 overflow-y-auto px-4 pt-3",
            "pb-[max(1rem,env(safe-area-inset-bottom))]",
            contentClassName,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
