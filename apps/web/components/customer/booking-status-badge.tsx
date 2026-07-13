import { cn } from "@workspace/ui/lib/utils";
import { bookingStatusLabel } from "@/lib/booking/format";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-[#F0FDF4] text-[#16A34A]",
  IN_PROGRESS: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
  NO_SHOW: "bg-[#F1F5F9] text-[#64748B]",
};

export function BookingStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
        STATUS_STYLES[status] ?? "bg-[#F4F4F5] text-[#71717A]",
        className,
      )}
    >
      {bookingStatusLabel(status)}
    </span>
  );
}
