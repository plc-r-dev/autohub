type EmptyStateProps = {
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
};

/** Centered placeholder for a card/section with no data yet -- never leave a section blank. */
export function EmptyState({ message, icon: Icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      {Icon ? <Icon className="size-8 text-muted-foreground" /> : null}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
