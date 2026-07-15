import { formatBillingDateTime } from "@/lib/billing/format"
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
      href: "/admin/service-stores/claims",
      tone: "amber",
    },
    {
      id: "payments",
      title: "Pending Payment Review",
      count: pendingPaymentReview,
      description: "Stores submitted payment slips that need admin review.",
      actionLabel: "Review payments",
      href: "/admin/billings/payment-review",
      tone: "sky",
    },
    {
      id: "billing-batch",
      title: "Billing Batch",
      count: pendingBillings,
      description: "Open billings awaiting store payment. Run a batch when needed.",
      actionLabel: "Open billings",
      href: "/admin/billings/history",
      tone: "emerald",
    },
    {
      id: "suspended",
      title: "Suspended Stores",
      count: suspendedStores,
      description: "Service stores currently suspended on the platform.",
      actionLabel: "View stores",
      href: "/admin/service-stores/active?status=SUSPENDED",
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
      href: "/admin/service-stores/claims",
    })),
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      category: "payment" as const,
      title: "Payment submission",
      detail: `${payment.billing.serviceStore.name} · ${payment.reviewStatus}`,
      at: payment.submittedAt.toISOString(),
      href: `/admin/billings/payment-review?billingId=${payment.billing.id}`,
    })),
    ...billings.map((billing) => ({
      id: `billing-${billing.id}`,
      category: "billing" as const,
      title: "Billing batch item",
      detail: `${billing.serviceStore.name} · ${billing.invoiceNumber ?? billing.id.slice(0, 8)}`,
      at: billing.createdAt.toISOString(),
      href: `/admin/billings/payment-review?billingId=${billing.id}`,
    })),
    ...suspendedStores.map((store) => ({
      id: `suspended-${store.id}`,
      category: "suspended" as const,
      title: "Suspended store",
      detail: store.name,
      at: store.updatedAt.toISOString(),
      href: `/admin/service-stores/${store.id}`,
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
