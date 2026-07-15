import { formatBillingDateTime } from "@/lib/billing/format"
import { prisma } from "@/lib/prisma"

export type AdminAuditLogItem = {
  id: string
  action: string
  detail: string
  at: string
  href?: string
}

export async function getAdminAuditLogs(
  limit = 100,
): Promise<AdminAuditLogItem[]> {
  const [claims, onboarding, payments, suspendedStores, settings] =
    await Promise.all([
      prisma.serviceStoreClaim.findMany({
        where: { status: { in: ["APPROVED", "REJECTED"] } },
        orderBy: { reviewedAt: "desc" },
        take: 40,
        select: {
          id: true,
          status: true,
          reviewedAt: true,
          submittedAt: true,
          serviceStore: { select: { name: true } },
        },
      }),
      prisma.serviceStoreOnboardingRequest.findMany({
        where: { status: { in: ["APPROVED", "REJECTED"] } },
        orderBy: { reviewedAt: "desc" },
        take: 40,
        select: {
          id: true,
          status: true,
          reviewedAt: true,
          submittedAt: true,
          businessName: true,
        },
      }),
      prisma.billingPayment.findMany({
        where: { reviewStatus: { in: ["APPROVED", "REJECTED"] } },
        orderBy: { reviewedAt: "desc" },
        take: 40,
        select: {
          id: true,
          reviewStatus: true,
          reviewedAt: true,
          submittedAt: true,
          billing: {
            select: {
              id: true,
              invoiceNumber: true,
              serviceStore: { select: { name: true } },
            },
          },
        },
      }),
      prisma.serviceStore.findMany({
        where: { status: "SUSPENDED" },
        orderBy: { updatedAt: "desc" },
        take: 40,
        select: { id: true, name: true, updatedAt: true },
      }),
      prisma.platformSettings.findUnique({
        where: { id: "default" },
        select: { updatedAt: true },
      }),
    ])

  const items: Array<AdminAuditLogItem & { atMs: number }> = []

  for (const claim of claims) {
    const at = claim.reviewedAt ?? claim.submittedAt
    items.push({
      id: `claim-${claim.id}`,
      action:
        claim.status === "APPROVED" ? "Store Approved" : "Store Claim Rejected",
      detail: claim.serviceStore.name,
      at: formatBillingDateTime(at),
      atMs: at.getTime(),
      href: "/admin/service-stores/claims",
    })
  }

  for (const request of onboarding) {
    const at = request.reviewedAt ?? request.submittedAt
    items.push({
      id: `onboarding-${request.id}`,
      action:
        request.status === "APPROVED"
          ? "Store Approved"
          : "Store Request Rejected",
      detail: request.businessName,
      at: formatBillingDateTime(at),
      atMs: at.getTime(),
      href: "/admin/service-stores/claims",
    })
  }

  for (const payment of payments) {
    const at = payment.reviewedAt ?? payment.submittedAt
    items.push({
      id: `payment-${payment.id}`,
      action:
        payment.reviewStatus === "APPROVED"
          ? "Billing Approved"
          : "Billing Payment Rejected",
      detail: `${payment.billing.serviceStore.name}${
        payment.billing.invoiceNumber
          ? ` · ${payment.billing.invoiceNumber}`
          : ""
      }`,
      at: formatBillingDateTime(at),
      atMs: at.getTime(),
      href: `/admin/billings/payment-review?billingId=${payment.billing.id}`,
    })
  }

  for (const store of suspendedStores) {
    items.push({
      id: `suspended-${store.id}`,
      action: "Store Suspended",
      detail: store.name,
      at: formatBillingDateTime(store.updatedAt),
      atMs: store.updatedAt.getTime(),
      href: `/admin/service-stores/${store.id}`,
    })
  }

  if (settings?.updatedAt) {
    items.push({
      id: "settings-updated",
      action: "Settings Updated",
      detail: "Platform settings",
      at: formatBillingDateTime(settings.updatedAt),
      atMs: settings.updatedAt.getTime(),
      href: "/admin/settings/platform",
    })
  }

  return items
    .sort((a, b) => b.atMs - a.atMs)
    .slice(0, limit)
    .map(({ atMs: _atMs, ...item }) => item)
}
