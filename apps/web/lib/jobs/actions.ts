"use server"

import { revalidatePath } from "next/cache"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { setJobEnabled } from "@/lib/jobs/job-settings"
import { runJob } from "@/lib/jobs/runner"

function revalidateSchedulerPaths(jobName?: string) {
  revalidatePath("/admin/settings/scheduler")
  revalidatePath("/admin/jobs")
  if (jobName) {
    revalidatePath(`/admin/settings/scheduler/${encodeURIComponent(jobName)}`)
    revalidatePath(`/admin/jobs/${encodeURIComponent(jobName)}`)
  }
}

export async function runJobNowAction(jobName: string) {
  await requireAdminSession()
  await runJob(jobName, { maxRetries: 2, retryDelayMs: 1500, force: true })
  revalidateSchedulerPaths(jobName)
}

export async function setJobEnabledAction(jobName: string, enabled: boolean) {
  await requireAdminSession()
  await setJobEnabled(jobName, enabled)
  revalidateSchedulerPaths(jobName)
}
