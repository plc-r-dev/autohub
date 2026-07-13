import Link from "next/link";

export function SectionHeader({
  title,
  actionLabel,
  actionHref,
  action,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-[22px] font-semibold tracking-tight text-[#0F172A] md:text-[24px]">
        {title}
      </h2>
      {action}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="shrink-0 text-[14px] font-semibold text-[#16A34A] hover:text-[#15803D]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
