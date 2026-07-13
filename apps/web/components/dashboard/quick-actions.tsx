import Link from "next/link";
import { Plus, Users2, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { portalCardClassName } from "@/components/service-store/ui/portal-surfaces";

const QUICK_ACTIONS = [
  { href: "/app/bookings?newBooking=1", label: "New booking", icon: Plus },
  { href: "/app/customers", label: "Customer", icon: Users2 },
  { href: "/app/branches", label: "Service", icon: Wrench },
] as const;

/** Shortcut tiles to the most common Service Store destinations. */
export function QuickActions() {
  return (
    <Card className={portalCardClassName}>
      <CardHeader className="pb-3">
        <SectionHeader title="Quick actions" />
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2.5 pt-0">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#16A34A]/40 hover:bg-[#16A34A]/10 hover:shadow-sm"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#16A34A]/15">
              <action.icon className="size-4 text-[#166534] dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
