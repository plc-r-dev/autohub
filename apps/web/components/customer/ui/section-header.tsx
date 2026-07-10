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
      <h2 className="text-[22px] font-semibold tracking-tight text-[#0A0A0A] md:text-[24px]">
        {title}
      </h2>
      {action}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="shrink-0 text-[14px] font-semibold text-[#0F9B76] hover:text-[#0D8666]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
