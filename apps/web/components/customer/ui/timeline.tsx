import { bookingStatusLabel, formatDateTime } from "@/lib/booking/format";
import { Card } from "@/components/customer/ui/card";
import { cn } from "@workspace/ui/lib/utils";
import { Check } from "lucide-react";

type TimelineProps = {
  status: string;
  confirmedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  noShowAt: Date | null;
};

const STEPS = [
  { key: "PENDING", label: bookingStatusLabel("PENDING") },
  { key: "CONFIRMED", label: bookingStatusLabel("CONFIRMED") },
  { key: "IN_PROGRESS", label: bookingStatusLabel("IN_PROGRESS") },
  { key: "COMPLETED", label: bookingStatusLabel("COMPLETED") },
  { key: "CANCELLED", label: bookingStatusLabel("CANCELLED") },
  { key: "NO_SHOW", label: bookingStatusLabel("NO_SHOW") },
] as const;

function timestampForStatus(
  status: string,
  props: Omit<TimelineProps, "status">,
): Date | null {
  switch (status) {
    case "CONFIRMED":
      return props.confirmedAt;
    case "IN_PROGRESS":
      return props.startedAt;
    case "COMPLETED":
      return props.completedAt;
    case "CANCELLED":
      return props.cancelledAt;
    case "NO_SHOW":
      return props.noShowAt;
    default:
      return null;
  }
}

function isStepActive(stepKey: string, currentStatus: string): boolean {
  if (currentStatus === "CANCELLED") return stepKey === "CANCELLED";
  if (currentStatus === "NO_SHOW") return stepKey === "NO_SHOW";
  const order = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];
  const currentIdx = order.indexOf(currentStatus);
  const stepIdx = order.indexOf(stepKey);
  if (stepIdx === -1) return false;
  return stepIdx <= currentIdx;
}

export function Timeline(props: TimelineProps) {
  const { status } = props;
  const visibleSteps =
    status === "CANCELLED" || status === "NO_SHOW"
      ? STEPS.filter((s) => s.key === "PENDING" || s.key === status)
      : STEPS.filter((s) => s.key !== "CANCELLED" && s.key !== "NO_SHOW");

  return (
    <Card>
      <h3 className="mb-6 text-[13px] font-semibold tracking-wide text-[#64748B] uppercase">
        Status
      </h3>
      <ol className="flex flex-col">
        {visibleSteps.map((step, index) => {
          const active = isStepActive(step.key, status);
          const isCurrent = step.key === status;
          const timestamp = timestampForStatus(step.key, props);

          return (
            <li key={step.key} className="flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border-2 transition-colors",
                    active
                      ? "border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]"
                      : "border-[#E2E8F0] bg-white text-[#94A3B8]",
                    isCurrent && "ring-4 ring-[#16A34A]/15",
                  )}
                >
                  {active && !isCurrent ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <span className="text-[12px] font-bold">{index + 1}</span>
                  )}
                </div>
                {index < visibleSteps.length - 1 ? (
                  <div
                    className={cn(
                      "mt-2 w-px flex-1 min-h-[28px]",
                      active ? "bg-[#16A34A]" : "bg-[#E2E8F0]",
                    )}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 pt-1.5">
                <p
                  className={cn(
                    "text-[15px] font-semibold",
                    active ? "text-[#0F172A]" : "text-[#94A3B8]",
                  )}
                >
                  {step.label}
                </p>
                {timestamp ? (
                  <p className="mt-1 text-[13px] text-[#64748B]">{formatDateTime(timestamp)}</p>
                ) : isCurrent ? (
                  <p className="mt-1 text-[13px] font-medium text-[#16A34A]">Current</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
