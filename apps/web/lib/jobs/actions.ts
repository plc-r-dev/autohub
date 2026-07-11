"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { runAll, runJob } from "@/lib/jobs/runner";

export async function runJobNowAction(jobName: string) {
  await requireAdminSession();
  await runJob(jobName, { maxRetries: 2, retryDelayMs: 1500 });
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${encodeURIComponent(jobName)}`);
}

export async function runAllJobsNowAction() {
  await requireAdminSession();
  await runAll({ maxRetries: 1, retryDelayMs: 1000 });
  revalidatePath("/admin/jobs");
}
