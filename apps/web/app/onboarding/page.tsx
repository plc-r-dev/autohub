import { redirect } from "next/navigation";

/** Legacy customer/merchant hub — merchant portal owns onboarding now. */
export default function OnboardingHubPage() {
  redirect("/merchant/onboarding");
}
