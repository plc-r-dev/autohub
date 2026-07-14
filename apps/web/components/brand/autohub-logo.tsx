import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

type AutohubLogoProps = {
  /** Pass `null` to render without a link (e.g. hero). Default `/`. */
  href?: string | null;
  className?: string;
  /** Image height class, e.g. h-8 / h-10 / h-14 */
  heightClassName?: string;
  priority?: boolean;
};

/**
 * Theme-aware AutoHub wordmark (transparent PNGs).
 * Uses plain <img> so nothing re-encodes alpha away.
 */
export function AutohubLogo({
  href = "/",
  className,
  heightClassName = "h-8",
  priority = false,
}: AutohubLogoProps) {
  const images = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/autohub-wordmark.png"
        alt="AutoHub"
        width={909}
        height={156}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className={cn("w-auto shrink-0 bg-transparent dark:hidden", heightClassName)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/autohub-wordmark-dark.png"
        alt=""
        width={860}
        height={149}
        aria-hidden
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className={cn("hidden w-auto shrink-0 bg-transparent dark:block", heightClassName)}
      />
    </>
  );

  if (href == null) {
    return (
      <span className={cn("inline-flex items-center bg-transparent", className)}>{images}</span>
    );
  }

  return (
    <Link href={href} className={cn("inline-flex items-center bg-transparent", className)}>
      {images}
    </Link>
  );
}
