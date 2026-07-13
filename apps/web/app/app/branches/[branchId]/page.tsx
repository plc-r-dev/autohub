import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ branchId: string }>
}

export default async function BranchDetailRedirectPage({ params }: PageProps) {
  await params
  redirect("/app/settings")
}
