import {
  BarChart3,
  CalendarCheck,
  MessageCircle,
  Receipt,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import { MarketingSection, MarketingSectionHeading } from "@/components/marketing/section-container";

const FEATURES = [
  { icon: CalendarCheck, label: "Booking" },
  { icon: Users, label: "Customers" },
  { icon: Wrench, label: "Services" },
  { icon: UserCog, label: "Staff" },
  { icon: Receipt, label: "Billing" },
  { icon: BarChart3, label: "Analytics" },
  { icon: MessageCircle, label: "LINE OA" },
] as const;

export function KeyFeatures() {
  return (
    <MarketingSection id="features">
      <MarketingSectionHeading eyebrow="Platform Features" title="Everything, in one platform" />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {FEATURES.map((feature) => (
          <div
            key={feature.label}
            className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-4 py-8 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
              <feature.icon className="size-6 text-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">{feature.label}</span>
          </div>
        ))}
      </div>
    </MarketingSection>
  );
}
