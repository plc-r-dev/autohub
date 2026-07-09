import { NextResponse } from "next/server";
import { runAll, runDueJobs, runJob } from "@/lib/jobs";

function isAuthorized(request: Request): boolean {
  const expectedToken = process.env.JOB_RUNNER_TOKEN;
  if (!expectedToken) {
    return false;
  }
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${expectedToken}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    mode?: "due" | "all" | "single";
    jobName?: string;
  };

  if (body.mode === "single") {
    if (!body.jobName) {
      return NextResponse.json(
        { error: "jobName is required for single mode." },
        { status: 400 },
      );
    }
    const execution = await runJob(body.jobName, { maxRetries: 1 });
    return NextResponse.json({ ok: true, execution });
  }

  if (body.mode === "all") {
    const executions = await runAll({ maxRetries: 1 });
    return NextResponse.json({ ok: true, executions });
  }

  const executions = await runDueJobs(new Date());
  return NextResponse.json({ ok: true, executions });
}
