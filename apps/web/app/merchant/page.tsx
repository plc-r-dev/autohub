import { redirect } from "next/navigation";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import {
  getMerchantAccessState,
  isApprovedMerchant,
  isPendingMerchant,
} from "@/lib/merchant/access";

export default async function MerchantHomePage() {
  const { identity } = await requireLinkedIdentity();
  const merchantAccess = await getMerchantAccessState(identity.domainUserId!);

  if (isApprovedMerchant(merchantAccess)) {
    redirect("/merchant/dashboard");
  }

  if (isPendingMerchant(merchantAccess)) {
    redirect("/merchant/waiting");
  }

  redirect("/dashboard");
}
