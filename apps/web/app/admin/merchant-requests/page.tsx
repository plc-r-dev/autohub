import { AdminLayout } from "@/components/admin/admin-layout";
import { MerchantRequestManagement } from "@/components/admin/merchant-request-management";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";

export default async function MerchantRequestsAdminPage() {
  await requireLinkedIdentity();

  return (
    <AdminLayout
      title="Merchant request management"
      description="Review pending merchant claims and onboarding requests. Approval links the domain user to the merchant and tenant."
    >
      <MerchantRequestManagement />
    </AdminLayout>
  );
}
