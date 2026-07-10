import { cn } from "@workspace/ui/lib/utils";

type ImagePlaceholderProps = {
  label?: string;
  className?: string;
  variant?: "merchant" | "vehicle" | "hero";
};

function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AH";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ImagePlaceholder({
  label = "AutoHub",
  className,
  variant = "merchant",
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#134E4A] via-[#0F766E] to-[#5EEAD4]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-semibold tracking-tight text-white/20",
            variant === "hero" ? "text-6xl md:text-7xl" : "text-4xl",
          )}
        >
          {initials(label)}
        </span>
      </div>
    </div>
  );
}
