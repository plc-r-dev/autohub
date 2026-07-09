type ChartPoint = {
  label: string;
  value: number;
};

type SimpleBarChartProps = {
  title: string;
  points: ChartPoint[];
  valueFormatter?: (value: number) => string;
};

export function SimpleBarChart({
  title,
  points,
  valueFormatter = (value) => String(value),
}: SimpleBarChartProps) {
  const max = points.reduce((m, point) => Math.max(m, point.value), 0) || 1;

  return (
    <section className="border-input rounded-md border p-4">
      <h3 className="mb-3 text-sm font-medium">{title}</h3>
      {points.length === 0 ? (
        <p className="text-muted-foreground text-sm">No data.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {points.map((point) => (
            <div key={point.label} className="grid grid-cols-[7rem_1fr_auto] items-center gap-2">
              <span className="text-muted-foreground text-xs">{point.label}</span>
              <div className="bg-muted h-2 rounded">
                <div
                  className="bg-primary h-2 rounded"
                  style={{ width: `${Math.max((point.value / max) * 100, 2)}%` }}
                />
              </div>
              <span className="text-xs font-medium">{valueFormatter(point.value)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
