import Link from "next/link";
import { CalendarPlus, Receipt, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

const QUICK_ACTIONS = [
  { href: "/app/bookings/new", label: "New Booking", icon: CalendarPlus },
  { href: "/app/customers", label: "Customers", icon: Users2 },
  { href: "/app/billings", label: "Billing", icon: Receipt },
] as const;

/** Shortcut tiles to the most common Service Store destinations. */
export function QuickActions() {
  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Quick actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <action.icon className="size-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{action.label}</span>
              <span className="text-xs text-muted-foreground">Open</span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
