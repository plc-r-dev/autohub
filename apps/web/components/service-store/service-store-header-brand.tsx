import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"

type ServiceStoreHeaderBrandProps = {
  href?: string
  className?: string
}

export function ServiceStoreHeaderBrand({
  href = "/app/dashboard",
  className,
}: ServiceStoreHeaderBrandProps) {
  return (
    <Link href={href} className={cn("flex min-w-0 items-center gap-2 bg-transparent sm:gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/autohub-wordmark.png"
        alt="AutoHub"
        width={909}
        height={156}
        className="h-5 w-auto shrink-0 bg-transparent sm:h-6 dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/autohub-wordmark-dark.png"
        alt=""
        width={860}
        height={149}
        aria-hidden
        className="hidden h-5 w-auto shrink-0 bg-transparent sm:h-6 dark:block"
      />
      <span className="hidden min-w-0 border-l border-border pl-2 sm:block sm:pl-2.5">
        <span className="block text-[10px] leading-tight font-medium tracking-wide text-muted-foreground">
          The Automotive Service Platform
        </span>
      </span>
    </Link>
  )
}
