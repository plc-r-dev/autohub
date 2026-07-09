import {
  formatDateTime,
  formatTimelineLabel,
} from "@/lib/booking/format";

type BookingTimelineProps = {
  confirmedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  noShowAt: Date | null;
};

export function BookingTimeline({
  confirmedAt,
  startedAt,
  completedAt,
  cancelledAt,
  noShowAt,
}: BookingTimelineProps) {
  const entries = [
    { key: "confirmedAt", value: confirmedAt },
    { key: "startedAt", value: startedAt },
    { key: "completedAt", value: completedAt },
    { key: "cancelledAt", value: cancelledAt },
    { key: "noShowAt", value: noShowAt },
  ].filter((entry) => entry.value !== null);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-muted-foreground mb-2">Timeline</p>
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li key={entry.key} className="flex items-center justify-between gap-4">
            <span>{formatTimelineLabel(entry.key)}</span>
            <span className="font-medium">{formatDateTime(entry.value!)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
