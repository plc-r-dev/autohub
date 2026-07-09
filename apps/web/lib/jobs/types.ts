export type JobSchedule =
  | {
      kind: "cron";
      expression: string;
      humanReadable: string;
      timezone?: string;
    }
  | {
      kind: "interval";
      minutes: number;
      humanReadable: string;
    };

export type JobResult = {
  status?: "SUCCESS" | "SKIPPED";
  message?: string;
};

export type JobDefinition = {
  name: string;
  description: string;
  schedule: JobSchedule;
  execute: () => Promise<JobResult | void>;
};

export type RunJobOptions = {
  maxRetries?: number;
  retryDelayMs?: number;
};
