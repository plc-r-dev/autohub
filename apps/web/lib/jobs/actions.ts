"use server";

import { revalidatePath } from "next/cache";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import { runAll, runJob } from "@/lib/jobs/runner";

export async function runJobNowAction(jobName: string) {
  await requireLinkedIdentity();
  await runJob(jobName, { maxRetries: 2, retryDelayMs: 1500 });
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${encodeURIComponent(jobName)}`);
}

export async function runAllJobsNowAction() {
  await requireLinkedIdentity();
  await runAll({ maxRetries: 1, retryDelayMs: 1000 });
  revalidatePath("/admin/jobs");
}
