import {
  getPlatformSettings,
  PLATFORM_SETTINGS_ID,
} from "@/lib/platform-settings/queries"
import { prisma } from "@/lib/prisma"

export function parseDisabledJobs(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

export async function getDisabledJobNames(): Promise<string[]> {
  const settings = await getPlatformSettings()
  return parseDisabledJobs(settings.disabledJobs)
}

export async function isJobEnabled(jobName: string): Promise<boolean> {
  const disabled = await getDisabledJobNames()
  return !disabled.includes(jobName)
}

export async function setJobEnabled(
  jobName: string,
  enabled: boolean,
): Promise<void> {
  const settings = await getPlatformSettings()
  const current = parseDisabledJobs(settings.disabledJobs)
  const next = enabled
    ? current.filter((name) => name !== jobName)
    : current.includes(jobName)
      ? current
      : [...current, jobName]

  await prisma.platformSettings.update({
    where: { id: PLATFORM_SETTINGS_ID },
    data: { disabledJobs: JSON.stringify(next) },
  })
}
