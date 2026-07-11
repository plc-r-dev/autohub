import { cn } from "@workspace/ui/lib/utils";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
};

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <article className={cn("rounded-2xl border border-[#dce5ee] bg-white p-5 shadow-sm", className)}>
      <p className="text-xs font-semibold tracking-wide text-[#8a97a5] uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#15202b]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#8a97a5]">{hint}</p> : null}
    </article>
  );
}
