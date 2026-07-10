import { Card } from "@/components/customer/ui/card";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center py-16 text-center md:py-20">
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B]">
        {icon ?? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
      </div>
      <h3 className="text-[20px] font-semibold tracking-tight text-[#0A0A0A]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#64748B]">{description}</p>
      ) : null}
      {action ? <div className="mt-8 w-full max-w-xs">{action}</div> : null}
    </Card>
  );
}
