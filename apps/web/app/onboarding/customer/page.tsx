import { redirect } from "next/navigation";
import { PORTALS } from "@/lib/auth/portals";

/** Customer manual onboarding removed — profile is auto-created after LINE auth. */
export default function CustomerOnboardingPage() {
  redirect(PORTALS.customer.openInLine);
}
