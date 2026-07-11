import { MarketingSection } from "@/components/marketing/section-container";

export function Problem() {
  return (
    <MarketingSection tone="muted" className="text-center">
      <p className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Bookings, staff, and billing shouldn't live in three different tools.
      </p>
      <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
        AutoHub brings your whole service business into one place.
      </p>
    </MarketingSection>
  );
}
