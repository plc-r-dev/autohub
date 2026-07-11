import { redirect } from "next/navigation";
import { PORTALS } from "@/lib/auth/portals";

export default function OnboardingHubPage() {
  redirect(PORTALS.serviceStore.onboarding);
}
