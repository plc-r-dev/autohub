import type { JobDefinition } from "@/lib/jobs/types";

const jobs = new Map<string, JobDefinition>();

export function registerJob(job: JobDefinition): void {
  if (jobs.has(job.name)) {
    throw new Error(`Job "${job.name}" is already registered.`);
  }
  jobs.set(job.name, job);
}

export function getRegisteredJob(name: string): JobDefinition | null {
  return jobs.get(name) ?? null;
}

export function listRegisteredJobs(): JobDefinition[] {
  return [...jobs.values()].sort((a, b) => a.name.localeCompare(b.name));
}
