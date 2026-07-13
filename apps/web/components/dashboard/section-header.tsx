type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

/** Title + optional description on the left, optional action (e.g. "View all") on the right. */
export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="h-4 w-1 shrink-0 rounded-full bg-[#16A34A]" aria-hidden />
          {title}
        </h3>
        {description ? <p className="mt-0.5 pl-3 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
