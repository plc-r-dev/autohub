import Image from "next/image"
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
    <Link href={href} className={cn("flex min-w-0 items-center gap-2.5 sm:gap-3", className)}>
      <Image
        src="/brand/autohub-logo.png"
        alt="AutoHub"
        width={180}
        height={46}
        className="h-10 w-auto shrink-0 sm:h-11 dark:hidden"
        priority
      />
      <Image
        src="/brand/autohub-logo-dark.png"
        alt=""
        width={180}
        height={46}
        aria-hidden
        className="hidden h-10 w-auto shrink-0 sm:h-11 dark:block"
        priority
      />
      <span className="hidden min-w-0 border-l border-border pl-2.5 sm:block sm:pl-3">
        <span className="block text-[10px] leading-tight font-medium tracking-wide text-muted-foreground sm:text-[11px]">
          The Automotive Service Platform
        </span>
      </span>
    </Link>
  )
}
