import type { JobDefinition } from "@/lib/jobs/types"

const globalForJobs = globalThis as unknown as {
  autohubJobRegistry?: Map<string, JobDefinition>
}

function getJobsMap(): Map<string, JobDefinition> {
  if (!globalForJobs.autohubJobRegistry) {
    globalForJobs.autohubJobRegistry = new Map()
  }
  return globalForJobs.autohubJobRegistry
}

/** Idempotent — safe under Next.js HMR / repeated ensureJobDefinitionsRegistered calls. */
export function registerJob(job: JobDefinition): void {
  getJobsMap().set(job.name, job)
}

export function getRegisteredJob(name: string): JobDefinition | null {
  return getJobsMap().get(name) ?? null
}

export function listRegisteredJobs(): JobDefinition[] {
  return [...getJobsMap().values()].sort((a, b) => a.name.localeCompare(b.name))
}
