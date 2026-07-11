import { cn } from "@workspace/ui/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CHECKED_IN: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-700",
  NO_SHOW: "bg-orange-50 text-orange-700",
  DRAFT: "bg-slate-100 text-slate-600",
  SUBMITTED: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  PAYMENT_SUBMITTED: "bg-sky-50 text-sky-700",
  PAYMENT_REJECTED: "bg-red-50 text-red-700",
  PAID: "bg-emerald-50 text-emerald-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  ONBOARDING: "bg-sky-50 text-sky-700",
  READY_FOR_BOOKING: "bg-emerald-50 text-emerald-700",
};

export function ServiceStoreStatusBadge({
  label,
  status,
  className,
}: {
  label: string;
  status?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        status && STATUS_STYLES[status] ? STATUS_STYLES[status] : "bg-slate-100 text-slate-600",
        className,
      )}
    >
      {label}
    </span>
  );
}
