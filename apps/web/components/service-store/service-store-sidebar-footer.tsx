import { cn } from "@workspace/ui/lib/utils";

type ServiceStoreSidebarFooterProps = {
  locked?: boolean;
  className?: string;
};

export function ServiceStoreSidebarFooter({
  className,
}: ServiceStoreSidebarFooterProps) {
  return <div className={cn(className)} />;
}
