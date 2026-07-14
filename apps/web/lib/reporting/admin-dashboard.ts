import { formatBillingDateTime } from "@/lib/billing/format"
import { getLineClient } from "@/lib/line/line-client"
import { prisma } from "@/lib/prisma"

export type AdminTodoTaskCard = {
  id: string
  title: string
  count: number
  description: string
  actionLabel: string
  href: string
  tone: "amber" | "sky" | "emerald" | "rose"
}

export type AdminActivityItem = {
  id: string
  category: "claim" | "payment" | "billing" | "suspended"
  title: string
  detail: string
  at: string
  href?: string
}

export type AdminSystemAlert = {
  id: string
  title: string
  detail: string
  severity: "warning" | "error" | "info"
  href?: string
}

export async function getSuspendedServiceStoreCount() {
  return prisma.serviceStore.count({ where: { status: "SUSPENDED" } })
}

export async function getAdminTodoTaskCards(): Promise<AdminTodoTaskCard[]> {
  const [pendingClaims, pendingRequests, pendingPaymentReview, pendingBillings, suspendedStores] =
    await Promise.all([
      prisma.serviceStoreClaim.count({ where: { status: "PENDING" } }),
      prisma.serviceStoreOnboardingRequest.count({ where: { status: "PENDING" } }),
      prisma.billingPayment.count({
        where: {
          reviewStatus: "PENDING",
          billing: { status: "PAYMENT_SUBMITTED" },
        },
      }),
      prisma.billing.count({ where: { status: "PENDING" } }),
      getSuspendedServiceStoreCount(),
    ])

  return [
    {
      id: "claims",
      title: "Pending Store Claims",
      count: pendingClaims + pendingRequests,
      description: "New claim and onboarding requests waiting for approval.",
      actionLabel: "Review requests",
      href: "/admin/service-store-requests",
      tone: "amber",
    },
    {
      id: "payments",
      title: "Pending Payment Review",
      count: pendingPaymentReview,
      description: "Stores submitted payment slips that need admin review.",
      actionLabel: "Review payments",
      href: "/admin/billings?status=PAYMENT_SUBMITTED",
      tone: "sky",
    },
    {
      id: "billing-batch",
      title: "Billing Batch",
      count: pendingBillings,
      description: "Open billings awaiting store payment. Run a batch when needed.",
      actionLabel: "Open billings",
      href: "/admin/billings",
      tone: "emerald",
    },
    {
      id: "suspended",
      title: "Suspended Stores",
      count: suspendedStores,
      description: "Service stores currently suspended on the platform.",
      actionLabel: "View reports",
      href: "/admin/reports",
      tone: "rose",
    },
  ]
}

export async function getAdminRecentActivity(limit = 12): Promise<AdminActivityItem[]> {
  const [claims, payments, billings, suspendedStores] = await Promise.all([
    prisma.serviceStoreClaim.findMany({
      orderBy: { submittedAt: "desc" },
      take: 8,
      select: {
        id: true,
        status: true,
        submittedAt: true,
        serviceStore: { select: { name: true } },
      },
    }),
    prisma.billingPayment.findMany({
      orderBy: { submittedAt: "desc" },
      take: 8,
      select: {
        id: true,
        submittedAt: true,
        reviewStatus: true,
        amount: true,
        billing: {
          select: {
            id: true,
            serviceStore: { select: { name: true } },
          },
        },
      },
    }),
    prisma.billing.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        createdAt: true,
        status: true,
        invoiceNumber: true,
        total: true,
        serviceStore: { select: { name: true } },
      },
    }),
    prisma.serviceStore.findMany({
      where: { status: "SUSPENDED" },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
    }),
  ])

  const items: AdminActivityItem[] = [
    ...claims.map((claim) => ({
      id: `claim-${claim.id}`,
      category: "claim" as const,
      title: "Store claim",
      detail: `${claim.serviceStore.name} · ${claim.status.replaceAll("_", " ")}`,
      at: claim.submittedAt.toISOString(),
      href: "/admin/service-store-requests",
    })),
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      category: "payment" as const,
      title: "Payment submission",
      detail: `${payment.billing.serviceStore.name} · ${payment.reviewStatus}`,
      at: payment.submittedAt.toISOString(),
      href: `/admin/billings/${payment.billing.id}`,
    })),
    ...billings.map((billing) => ({
      id: `billing-${billing.id}`,
      category: "billing" as const,
      title: "Billing batch item",
      detail: `${billing.serviceStore.name} · ${billing.invoiceNumber ?? billing.id.slice(0, 8)}`,
      at: billing.createdAt.toISOString(),
      href: `/admin/billings/${billing.id}`,
    })),
    ...suspendedStores.map((store) => ({
      id: `suspended-${store.id}`,
      category: "suspended" as const,
      title: "Suspended store",
      detail: store.name,
      at: store.updatedAt.toISOString(),
      href: "/admin/reports",
    })),
  ]

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit)
    .map((item) => ({
      ...item,
      at: formatBillingDateTime(item.at),
    }))
}

export async function getAdminSystemAlerts(): Promise<AdminSystemAlert[]> {
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const [failedJobs, recentFailures] = await Promise.all([
    prisma.jobExecution.count({
      where: {
        status: "FAILED",
        startedAt: { gte: since },
      },
    }),
    prisma.jobExecution.findMany({
      where: {
        status: "FAILED",
        startedAt: { gte: since },
      },
      orderBy: { startedAt: "desc" },
      take: 5,
      select: {
        id: true,
        jobName: true,
        message: true,
        startedAt: true,
      },
    }),
  ])

  const alerts: AdminSystemAlert[] = []

  if (!getLineClient().isConfigured()) {
    alerts.push({
      id: "line-config",
      title: "Failed Notifications",
      detail: "LINE channel credentials are not configured. Outbound pushes will fail.",
      severity: "warning",
      href: "/admin/settings",
    })
  } else if (failedJobs > 0) {
    const latest = recentFailures[0]
    alerts.push({
      id: "failed-notifications",
      title: "Failed Notifications",
      detail: latest
        ? `${failedJobs} failed job run(s) in 7 days. Latest: ${latest.jobName}`
        : `${failedJobs} failed job run(s) in the last 7 days.`,
      severity: "error",
      href: "/admin/jobs",
    })
  } else {
    alerts.push({
      id: "notifications-ok",
      title: "Failed Notifications",
      detail: "No failed notification-related job runs in the last 7 days.",
      severity: "info",
    })
  }

  const apiFailures = recentFailures.filter((job) =>
    /billing|storage|reminder|expiration/i.test(job.jobName),
  )
  if (apiFailures.length > 0) {
    alerts.push({
      id: "api-errors",
      title: "API Errors",
      detail: apiFailures[0]?.message
        ? `${apiFailures[0].jobName}: ${apiFailures[0].message}`
        : `${apiFailures.length} backend job failure(s) detected.`,
      severity: "error",
      href: "/admin/jobs",
    })
  } else {
    alerts.push({
      id: "api-ok",
      title: "API Errors",
      detail: "No platform API / job errors reported recently.",
      severity: "info",
    })
  }

  const suspended = await getSuspendedServiceStoreCount()
  if (suspended > 0) {
    alerts.push({
      id: "platform-warning-suspended",
      title: "Platform Warnings",
      detail: `${suspended} suspended store(s) need attention.`,
      severity: "warning",
      href: "/admin/reports",
    })
  } else {
    alerts.push({
      id: "platform-ok",
      title: "Platform Warnings",
      detail: "No active platform warnings.",
      severity: "info",
    })
  }

  return alerts
}
