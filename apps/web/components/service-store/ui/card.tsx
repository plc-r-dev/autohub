import { cn } from "@workspace/ui/lib/utils";

export function ServiceStoreCard({
  children,
  className,
  padding = true,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
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
