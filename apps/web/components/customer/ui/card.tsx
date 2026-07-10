import { cn } from "@workspace/ui/lib/utils";

export function Card({
  children,
  className,
  padding = true,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
        padding && "p-6",
        hover && "transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
