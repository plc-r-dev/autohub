import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type ServiceStoreSidebarFooterProps = {
  locked?: boolean;
  className?: string;
};

export function ServiceStoreSidebarFooter({
  locked = false,
  className,
}: ServiceStoreSidebarFooterProps) {
  if (locked) {
    return (
      <div className={cn(className)}>
        <span className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/50">
          <HelpCircle className="size-4" />
          Support
        </span>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <Link
        href="/app/readiness"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        <HelpCircle className="size-4" />
        Support
      </Link>
    </div>
  );
}
