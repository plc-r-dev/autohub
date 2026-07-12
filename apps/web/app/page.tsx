import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Hero } from "@/components/marketing/hero";
import { ForCustomers } from "@/components/marketing/for-customers";
import { ForServiceStores } from "@/components/marketing/for-service-stores";
import { Problem } from "@/components/marketing/problem";
import { KeyFeatures } from "@/components/marketing/key-features";
import { LineJourney } from "@/components/marketing/line-journey";
import { DashboardScreenshot } from "@/components/marketing/dashboard-screenshot";
import { FinalCta } from "@/components/marketing/final-cta";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function MarketingLandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <Hero />
        <ForCustomers />
        <ForServiceStores />
        <Problem />
        <KeyFeatures />
        <LineJourney />
        <DashboardScreenshot />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
