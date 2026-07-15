import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ jobName: string }>
}

export default async function AdminJobLogsPage({ params }: PageProps) {
  const { jobName } = await params
  redirect(`/admin/settings/scheduler/${jobName}`)
}
