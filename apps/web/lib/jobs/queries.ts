import { ensureJobDefinitionsRegistered } from "@/lib/jobs/definitions"
import { getDisabledJobNames } from "@/lib/jobs/job-settings"
import { listRegisteredJobs } from "@/lib/jobs/registry"
import { formatSchedule, getNextRunDate } from "@/lib/jobs/schedules"
import { prisma } from "@/lib/prisma"

export async function getJobsOverview() {
  ensureJobDefinitionsRegistered()
  const jobs = listRegisteredJobs()
  const disabled = new Set(await getDisabledJobNames())
  const lastRuns = await prisma.jobExecution.findMany({
    where: {
      jobName: { in: jobs.map((job) => job.name) },
    },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      jobName: true,
      status: true,
      startedAt: true,
      finishedAt: true,
      duration: true,
      message: true,
      attempt: true,
    },
  })

  return jobs.map((job) => {
    const latest = lastRuns.find((run) => run.jobName === job.name) ?? null
    return {
      name: job.name,
      description: job.description,
      schedule: formatSchedule(job.schedule),
      nextRun: getNextRunDate(job.schedule),
      lastRun: latest,
      enabled: !disabled.has(job.name),
    }
  })
}

export async function getJobExecutionLogs(jobName: string, take = 50) {
  return prisma.jobExecution.findMany({
    where: { jobName },
    orderBy: { startedAt: "desc" },
    take,
  })
}
