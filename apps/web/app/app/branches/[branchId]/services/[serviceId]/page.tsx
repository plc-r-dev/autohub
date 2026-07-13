import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ serviceId: string }>
}

export default async function EditBranchServiceRedirectPage({ params }: PageProps) {
  await params
  redirect("/app/settings?tab=services")
}
