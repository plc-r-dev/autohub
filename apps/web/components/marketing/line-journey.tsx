import { ArrowDown, CalendarCheck, MessageCircle, Sparkles, Wrench } from "lucide-react";
import { MarketingSection, MarketingSectionHeading } from "@/components/marketing/section-container";

const JOURNEY = [
  { icon: MessageCircle, label: "LINE OA" },
  { icon: Sparkles, label: "Rich Menu" },
  { icon: CalendarCheck, label: "Booking" },
  { icon: Wrench, label: "Service" },
] as const;

export function LineJourney() {
  return (
    <MarketingSection tone="muted">
      <MarketingSectionHeading
        eyebrow="LINE Journey"
        title="No app to download"
        description="Customers stay inside LINE — the app they already use every day."
      />
      <div className="mt-12 flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-4">
        {JOURNEY.map((item, index) => (
          <div key={item.label} className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-8 py-6">
              <item.icon className="size-6 text-foreground" />
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
            </div>
            {index < JOURNEY.length - 1 ? (
              <ArrowDown className="size-5 text-muted-foreground md:-rotate-90" />
            ) : null}
          </div>
        ))}
      </div>
    </MarketingSection>
  );
}
