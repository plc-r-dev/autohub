import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ billingId: string }>
}

/** Deep links to billing detail open the Payment Review drawer on the workspace. */
export default async function AdminBillingDetailPage({ params }: PageProps) {
  const { billingId } = await params
  redirect(`/admin/billings?tab=payments&billingId=${billingId}`)
}
