import { ensureJobDefinitionsRegistered } from "@/lib/jobs/definitions";
import { getRegisteredJob, listRegisteredJobs } from "@/lib/jobs/registry";
import type { RunJobOptions } from "@/lib/jobs/types";
import { prisma } from "@/lib/prisma";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runJob(name: string, options: RunJobOptions = {}) {
  ensureJobDefinitionsRegistered();
  const job = getRegisteredJob(name);
  if (!job) {
    throw new Error(`Job "${name}" is not registered.`);
  }

  const currentlyRunning = await prisma.jobExecution.findFirst({
    where: {
      jobName: name,
      status: "RUNNING",
    },
    select: { id: true },
  });
  if (currentlyRunning) {
    const execution = await prisma.jobExecution.create({
      data: {
        jobName: name,
        startedAt: new Date(),
        finishedAt: new Date(),
        duration: 0,
        status: "SKIPPED",
        message: "Skipped because a previous execution is still running.",
      },
    });
    return execution;
  }

  const startedAt = new Date();
  const execution = await prisma.jobExecution.create({
    data: {
      jobName: name,
      startedAt,
      status: "RUNNING",
      attempt: 1,
    },
  });

  const maxRetries = options.maxRetries ?? 1;
  const retryDelayMs = options.retryDelayMs ?? 1000;
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    try {
      attempt += 1;
      const outcome = await job.execute();
      const finishedAt = new Date();
      const status = outcome?.status ?? "SUCCESS";
      return prisma.jobExecution.update({
        where: { id: execution.id },
        data: {
          finishedAt,
          duration: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
          status,
          message: outcome?.message,
          attempt,
        },
      });
    } catch (error) {
      lastError = error;
      if (attempt <= maxRetries) {
        await sleep(retryDelayMs);
      }
    }
  }

  const finishedAt = new Date();
  return prisma.jobExecution.update({
    where: { id: execution.id },
    data: {
      finishedAt,
      duration: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
      status: "FAILED",
      message:
        lastError instanceof Error ? lastError.message : "Job failed with unknown error.",
      attempt,
    },
  });
}

export async function runAll(options: RunJobOptions = {}) {
  ensureJobDefinitionsRegistered();
  const jobs = listRegisteredJobs();
  const executions = [];
  for (const job of jobs) {
    executions.push(await runJob(job.name, options));
  }
  return executions;
}
