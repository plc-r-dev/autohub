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
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <MarketingSectionHeading
            eyebrow="LINE Journey"
            title="No app to download"
            description="Customers stay inside LINE — the app they already use every day."
            align="left"
          />

          <div className="mt-8 flex flex-col items-start">
            {JOURNEY.map((item, index) => (
              <div key={item.label} className="flex flex-col items-start">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3">
                  <item.icon className="size-5 text-foreground" />
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </div>
                {index < JOURNEY.length - 1 ? (
                  <ArrowDown className="ml-5 my-1 size-4 text-muted-foreground" />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/10 blur-3xl"
          />
          <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#06C755]">
                <MessageCircle className="size-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AutoHub</p>
                <p className="text-xs text-muted-foreground">LINE Official Account</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
                Hi! Ready to book your next service?
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                Yes, I need a wash this weekend.
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
                Great — pick a time and we&apos;ll confirm instantly.
              </div>
            </div>

            <div className="mt-4 w-full rounded-full bg-[#06C755] px-4 py-2.5 text-center text-sm font-semibold text-white">
              Book Now
            </div>
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
