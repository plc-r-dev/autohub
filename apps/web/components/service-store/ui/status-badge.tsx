import { cn } from "@workspace/ui/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  CONFIRMED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  CHECKED_IN: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  IN_PROGRESS: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  COMPLETED: "bg-slate-100 text-slate-700 dark:bg-muted dark:text-muted-foreground",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  NO_SHOW: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  DRAFT: "bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground",
  SUBMITTED: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  APPROVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  PAYMENT_SUBMITTED: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  PAYMENT_REJECTED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  PAID: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  ONBOARDING: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  READY_FOR_BOOKING: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

const STATUS_FALLBACK =
  "bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground";

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
        status && STATUS_STYLES[status] ? STATUS_STYLES[status] : STATUS_FALLBACK,
        className,
      )}
    >
      {label}
    </span>
  );
}
