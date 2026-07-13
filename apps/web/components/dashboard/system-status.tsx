import { Card, CardContent } from "@workspace/ui/components/card";

/** Lightweight operational status card for the dashboard sidebar. */
export function SystemStatus() {
  return (
    <Card className="rounded-2xl border border-border bg-muted/20 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">System status</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="size-2 rounded-full bg-emerald-500" />
            Operational
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">API</p>
            <p>Responsive</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Bookings</p>
            <p>Live sync</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
