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
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
