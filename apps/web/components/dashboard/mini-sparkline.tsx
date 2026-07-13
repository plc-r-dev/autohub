import { cn } from "@workspace/ui/lib/utils";

type MiniSparklineProps = {
  values: number[];
  className?: string;
  variant?: "default" | "positive" | "negative";
};

/** Tiny SVG sparkline for KPI cards. */
export function MiniSparkline({
  values,
  className,
  variant = "default",
}: MiniSparklineProps) {
  if (values.length === 0) {
    return null;
  }

  const width = 72;
  const height = 28;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-7 w-[4.5rem]", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className={cn(
          variant === "positive" && "stroke-emerald-500",
          variant === "negative" && "stroke-rose-500",
          variant === "default" && "stroke-[#16A34A]",
        )}
      />
    </svg>
  );
}
