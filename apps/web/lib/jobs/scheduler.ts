import { ensureJobDefinitionsRegistered } from "@/lib/jobs/definitions";
import { listRegisteredJobs } from "@/lib/jobs/registry";
import { runJob } from "@/lib/jobs/runner";

function isDueCron(expression: string, now: Date): boolean {
  const minute = now.getMinutes();
  const hour = now.getHours();
  const day = now.getDate();

  if (expression === "*/5 * * * *") {
    return minute % 5 === 0;
  }
  if (expression === "0 0 * * *") {
    return minute === 0 && hour === 0;
  }
  if (expression === "5 0 1 * *") {
    return minute === 5 && hour === 0 && day === 1;
  }
  return false;
}

export async function runDueJobs(now = new Date()) {
  ensureJobDefinitionsRegistered();
  const dueJobs = listRegisteredJobs().filter((job) => {
    if (job.schedule.kind === "interval") {
      return true;
    }
    return isDueCron(job.schedule.expression, now);
  });

  const executions = [];
  for (const job of dueJobs) {
    executions.push(await runJob(job.name));
  }
  return executions;
}
