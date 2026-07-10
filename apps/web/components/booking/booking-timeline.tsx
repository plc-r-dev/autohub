import { formatDateTime } from "@/lib/booking/format";
import { CustomerCard } from "@/components/customer/customer-ui";
import { cn } from "@workspace/ui/lib/utils";

type BookingTimelineProps = {
  status: string;
  confirmedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  noShowAt: Date | null;
};

const STEPS = [
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "NO_SHOW", label: "No show" },
] as const;

function timestampForStatus(
  status: string,
  props: Omit<BookingTimelineProps, "status">,
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

export function BookingTimeline(props: BookingTimelineProps) {
  const { status } = props;
  const visibleSteps =
    status === "CANCELLED" || status === "NO_SHOW"
      ? STEPS.filter((s) => s.key === "PENDING" || s.key === status)
      : STEPS.filter((s) => s.key !== "CANCELLED" && s.key !== "NO_SHOW");

  return (
    <CustomerCard>
      <h3 className="mb-6 text-[15px] font-semibold text-[#18181B]">Status</h3>
      <ol className="flex flex-col">
        {visibleSteps.map((step, index) => {
          const active = isStepActive(step.key, status);
          const isCurrent = step.key === status;
          const timestamp = timestampForStatus(step.key, props);

          return (
            <li key={step.key} className="flex gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-[12px] font-semibold",
                    active
                      ? "bg-[#18181B] text-white"
                      : "bg-[#F4F4F5] text-[#A1A1AA]",
                    isCurrent && "ring-4 ring-[#18181B]/10",
                  )}
                >
                  {index + 1}
                </div>
                {index < visibleSteps.length - 1 ? (
                  <div
                    className={cn(
                      "mt-1 w-px flex-1 min-h-[24px]",
                      active ? "bg-[#18181B]" : "bg-[#E4E4E7]",
                    )}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p
                  className={cn(
                    "text-[14px] font-medium",
                    active ? "text-[#18181B]" : "text-[#A1A1AA]",
                  )}
                >
                  {step.label}
                </p>
                {timestamp ? (
                  <p className="mt-0.5 text-[12px] text-[#71717A]">{formatDateTime(timestamp)}</p>
                ) : isCurrent ? (
                  <p className="mt-0.5 text-[12px] font-medium text-[#0F766E]">Current</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </CustomerCard>
  );
}
