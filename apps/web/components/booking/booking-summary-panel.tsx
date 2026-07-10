import { Card } from "@/components/customer/ui";
import { formatBookingDate, formatBookingTime, formatPrice } from "@/lib/booking/format";
import { cn } from "@workspace/ui/lib/utils";

type BookingSummaryPanelProps = {
  merchantName: string;
  branchName: string;
  vehicleLabel: string | null;
  serviceName: string | null;
  servicePrice: string | null;
  durationMinutes: number | null;
  dateLabel: string | null;
  timeLabel: string | null;
  estimatedFinishLabel?: string | null;
  className?: string;
  compact?: boolean;
};

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[13px] text-[#64748B]">{label}</dt>
      <dd
        className={cn(
          "text-right text-[14px] font-medium",
          value ? "text-[#0A0A0A]" : "text-[#CBD5E1]",
          highlight && value && "text-[#0F9B76]",
        )}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

export function BookingSummaryPanel({
  merchantName,
  branchName,
  vehicleLabel,
  serviceName,
  servicePrice,
  durationMinutes,
  dateLabel,
  timeLabel,
  estimatedFinishLabel,
  className,
  compact = false,
}: BookingSummaryPanelProps) {
  const priceLabel = servicePrice ? formatPrice(servicePrice) : null;
  const durationLabel =
    durationMinutes != null ? `~${durationMinutes} min` : null;

  return (
    <Card className={cn(compact ? "p-5" : "p-6", className)}>
      <h2 className="text-[13px] font-semibold tracking-wide text-[#64748B] uppercase">
        Booking summary
      </h2>
      <dl className={cn("space-y-4", compact ? "mt-4" : "mt-6")}>
        <SummaryRow label="Service shop" value={`${merchantName} · ${branchName}`} />
        <SummaryRow label="Vehicle" value={vehicleLabel} />
        <SummaryRow label="Service" value={serviceName} />
        <SummaryRow label="Date" value={dateLabel} />
        <SummaryRow label="Time" value={timeLabel} />
        <SummaryRow label="Est. finish" value={estimatedFinishLabel ?? null} />
        <SummaryRow label="Duration" value={durationLabel} />
        <div className="border-t border-[#F1F5F9] pt-4">
          <SummaryRow label="Total" value={priceLabel} highlight />
        </div>
      </dl>
    </Card>
  );
}

export function formatSummaryDate(dateValue: string): string {
  return formatBookingDate(`${dateValue}T12:00:00`);
}

export function formatSummaryTime(slotIso: string): string {
  return formatBookingTime(slotIso);
}
