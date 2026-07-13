import { cn } from "@workspace/ui/lib/utils";

export function ServiceStoreCard({
  children,
  className,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        padding && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
