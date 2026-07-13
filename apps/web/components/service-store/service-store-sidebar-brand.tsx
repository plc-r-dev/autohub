import Image from "next/image";
import Link from "next/link";
import { Car } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type ServiceStoreSidebarBrandProps = {
  name: string;
  subtitle: string;
  href?: string;
  coverSrc?: string | null;
  coverAlt?: string;
};

export function ServiceStoreSidebarBrand({
  name,
  subtitle,
  href = "/app/dashboard",
  coverSrc,
  coverAlt,
}: ServiceStoreSidebarBrandProps) {
  return (
    <Link href={href} className="flex items-center gap-3 px-2 py-1">
      <span
        className={cn(
          "relative size-10 shrink-0 overflow-hidden rounded-xl shadow-sm",
          !coverSrc && "flex items-center justify-center bg-primary text-primary-foreground",
        )}
      >
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={coverAlt ?? name}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <Car className="size-5" strokeWidth={2.25} />
        )}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </Link>
  );
}
