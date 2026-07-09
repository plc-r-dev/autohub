import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { MerchantProfileForm } from "@/components/merchant/merchant-profile-form";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";

export default async function MerchantProfilePage() {
  const { merchant } = await requireApprovedMerchantUser();

  return (
    <PageShell
      title="Merchant profile"
      description="Update your business profile information."
      nav={merchantNav}
      backHref="/merchant/dashboard"
    >
      <MerchantProfileForm
        defaultValues={{
          name: merchant.name,
          description: merchant.description ?? "",
          phone: merchant.phone ?? "",
          email: merchant.email ?? "",
          website: merchant.website ?? "",
        }}
      />
    </PageShell>
  );
}
