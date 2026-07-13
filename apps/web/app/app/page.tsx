import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Plus, Store } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { buttonVariants } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { ServiceStoreOnboardingWizard } from "@/components/onboarding/service-store-onboarding-wizard";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreCard } from "@/components/service-store/ui";
import { ServiceStoreWorkspaceShell } from "@/components/service-store/service-store-workspace-shell";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { PORTALS } from "@/lib/auth/portals";
import { getServerSession } from "@/lib/auth/session";
import { formatPrice } from "@/lib/booking/format";
import { formatBillingDate } from "@/lib/billing/format";
import { requireServiceStoreOnboardingContext } from "@/lib/onboarding/context";
import { listActiveTenants } from "@/lib/onboarding/queries";
import { prisma } from "@/lib/prisma";
import {
  getServiceStoreAccessState,
  isApprovedServiceStore,
  isPendingServiceStore,
} from "@/lib/service-store/access";
import {
  listServiceStoreWorkspaceSummaries,
  type ServiceStoreWorkspaceSummary,
} from "@/lib/service-store/application/member-queries";
import { roleLabel } from "@/lib/service-store/domain";
import { switchActiveServiceStore } from "@/lib/service-store/member-actions";

type PageProps = {
  searchParams: Promise<{ mode?: string }>;
};

const CAPABILITIES = [
  { title: "Receive bookings", description: "Accept online and walk-in appointments." },
  { title: "Manage services", description: "Branches, services, and operating hours." },
  { title: "Customer CRM", description: "View visit history and vehicle records." },
  { title: "Billing", description: "Submit statements and payment slips." },
] as const;

const APPLICATION_STEPS = ["Submitted", "Under Review", "Approved", "Dashboard Ready"] as const;

function splitDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export default async function ServiceStoreWorkspacePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedMode: "claim" | "create" | undefined =
    params.mode === "create" || params.mode === "request"
      ? "create"
      : params.mode === "claim"
        ? "claim"
        : undefined;

  // Claim/create is reachable from any state (fresh visitor or a multi-store
  // owner adding another store) — resolved before we look at access state.
  if (requestedMode) {
    return <OnboardingWizardView requestedMode={requestedMode} />;
  }

  const session = await getServerSession();
  if (!session) {
    return <AnonymousLandingView />;
  }

  const displayName = session.user.name ?? "";
  const avatarUrl = session.user.image ?? null;

  const identity = await resolveIdentityLink(session.user.id);
  if (!isIdentityLinked(identity) || !identity.domainUserId) {
    return <NoStoreView displayName={displayName} avatarUrl={avatarUrl} />;
  }

  const access = await getServiceStoreAccessState(identity.domainUserId);

  if (isApprovedServiceStore(access)) {
    if (access.membershipCount === 1) {
      redirect(PORTALS.serviceStore.dashboard);
    }
    const summaries = await listServiceStoreWorkspaceSummaries(identity.domainUserId);
    return <WorkspaceHomeView displayName={displayName} avatarUrl={avatarUrl} summaries={summaries} />;
  }

  if (isPendingServiceStore(access)) {
    return (
      <PendingApprovalView
        domainUserId={identity.domainUserId}
        displayName={displayName}
        avatarUrl={avatarUrl}
      />
    );
  }

  return <NoStoreView displayName={displayName} avatarUrl={avatarUrl} />;
}

async function OnboardingWizardView({ requestedMode }: { requestedMode: "claim" | "create" }) {
  const callbackPath = `/app?mode=${requestedMode}`;
  const context = await requireServiceStoreOnboardingContext(callbackPath);
  const tenants = await listActiveTenants();
  const { firstName, lastName } = splitDisplayName(context.authUserName);

  return (
    <ServiceStorePublicLayout
      title={requestedMode === "claim" ? "Claim your Service Store" : "Create a Service Store"}
      description="Sign in with LINE, find your business on AutoHub or Google Places, then complete setup."
      backHref="/app"
    >
      <ServiceStoreCard>
        <ServiceStoreOnboardingWizard
          tenants={tenants}
          defaultFirstName={firstName}
          defaultLastName={lastName}
          defaultEmail={context.authUserEmail}
          defaultMode={requestedMode}
        />
      </ServiceStoreCard>
    </ServiceStorePublicLayout>
  );
}

function NoStoreView({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl: string | null;
}) {
  return (
    <ServiceStoreWorkspaceShell
      displayName={displayName}
      avatarUrl={avatarUrl}
      statusLabel="No Store Yet"
      statusTone="muted"
      navLocked
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome to AutoHub</CardTitle>
          <CardDescription>
            Bring your business onto AutoHub to start receiving bookings, managing services, and
            handling billing.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {CAPABILITIES.map((item) => (
          <Card key={item.title} size="sm">
            <CardContent>
              <h3 className="font-medium text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Store className="size-7" />
            </div>
            <CardTitle className="text-lg">Claim Existing Service Store</CardTitle>
            <CardDescription>
              Already listed on AutoHub? Claim it to start managing bookings and billing.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Link href="/app?mode=claim" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              Claim Existing Service Store
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Plus className="size-7" />
            </div>
            <CardTitle className="text-lg">Create New Service Store</CardTitle>
            <CardDescription>New to AutoHub? Set up your business from scratch.</CardDescription>
          </CardContent>
          <CardFooter>
            <Link
              href="/app?mode=create"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
            >
              Create New Service Store
            </Link>
          </CardFooter>
        </Card>
      </div>
    </ServiceStoreWorkspaceShell>
  );
}

async function PendingApprovalView({
  domainUserId,
  displayName,
  avatarUrl,
}: {
  domainUserId: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const domainUser = await prisma.user.findUnique({
    where: { id: domainUserId },
    select: {
      serviceStoreClaims: {
        where: { status: "PENDING" },
        select: {
          submittedAt: true,
          proposedPhone: true,
          proposedEmail: true,
          proposedAddress: true,
          serviceStore: { select: { name: true, code: true } },
        },
        take: 1,
      },
      serviceStoreOnboardingRequests: {
        where: { status: "PENDING" },
        select: {
          submittedAt: true,
          businessName: true,
          businessCode: true,
          phone: true,
          email: true,
          description: true,
        },
        take: 1,
      },
    },
  });

  const pendingClaim = domainUser?.serviceStoreClaims[0];
  const pendingRequest = domainUser?.serviceStoreOnboardingRequests[0];
  const storeName = pendingClaim
    ? `${pendingClaim.serviceStore.name} (${pendingClaim.serviceStore.code})`
    : pendingRequest
      ? `${pendingRequest.businessName} (${pendingRequest.businessCode})`
      : null;
  const submittedAt = pendingClaim?.submittedAt ?? pendingRequest?.submittedAt ?? null;
  const applicationType = pendingClaim ? "Claim" : pendingRequest ? "Create" : "—";
  const contactPhone = pendingClaim?.proposedPhone ?? pendingRequest?.phone ?? "—";
  const contactEmail = pendingClaim?.proposedEmail ?? pendingRequest?.email ?? "—";
  const contactAddress = pendingClaim?.proposedAddress ?? pendingRequest?.description ?? "—";
  const currentStepIndex = 1; // "Under Review" — the only sub-state PENDING tracks today.

  return (
    <ServiceStoreWorkspaceShell
      displayName={displayName}
      avatarUrl={avatarUrl}
      statusLabel="Under Review"
      statusTone="warning"
      navLocked
    >
      <Card>
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
          <CardDescription>
            You&apos;ll get a LINE notification the moment this changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex items-start">
            {APPLICATION_STEPS.map((label, index) => {
              const done = index < currentStepIndex;
              const current = index === currentStepIndex;
              const isLast = index === APPLICATION_STEPS.length - 1;
              return (
                <li key={label} className={cn("flex items-center", !isLast && "flex-1")}>
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        done && "bg-emerald-500 text-white",
                        current &&
                          "bg-amber-500/15 text-amber-600 ring-2 ring-amber-500 dark:text-amber-400",
                        !done && !current && "bg-muted text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="size-4" /> : index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-center text-xs font-medium whitespace-nowrap",
                        done || current ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {!isLast ? (
                    <span
                      className={cn(
                        "mx-2 h-0.5 flex-1 -translate-y-[18px]",
                        done ? "bg-emerald-500" : "bg-border",
                      )}
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Store Name</dt>
                <dd className="mt-1 font-medium text-foreground">{storeName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted Date</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {submittedAt ? formatBillingDate(submittedAt) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estimated Review Time</dt>
                <dd className="mt-1 font-medium text-foreground">1–2 business days</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Application Type</dt>
                <dd className="mt-1 font-medium text-foreground">{applicationType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Current Status</dt>
                <dd className="mt-1">
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    Under Review
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What&apos;s happening now</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
              <li>Your application is under review.</li>
              <li>Our team is verifying your business.</li>
              <li>You&apos;ll receive a LINE notification when approved.</li>
              <li>Dashboard access will be enabled automatically.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need help?</CardTitle>
          <CardDescription>
            Reach out if this is taking longer than expected, or review exactly what you submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Link href="#" className={cn(buttonVariants({ variant: "outline" }))}>
            Contact Support
          </Link>
          <details className="group w-full sm:w-auto sm:min-w-80">
            <summary className={cn(buttonVariants({ variant: "ghost" }), "cursor-pointer justify-between")}>
              View Submitted Information
            </summary>
            <dl className="mt-3 space-y-2 rounded-2xl border border-border bg-muted/40 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium text-foreground">{contactPhone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{contactEmail}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Address / Notes</dt>
                <dd className="max-w-56 text-right font-medium text-foreground">{contactAddress}</dd>
              </div>
            </dl>
          </details>
        </CardContent>
      </Card>
    </ServiceStoreWorkspaceShell>
  );
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  READY_FOR_BOOKING: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  ONBOARDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  PENDING_VERIFICATION: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  SUSPENDED: "bg-destructive/15 text-destructive",
  DRAFT: "bg-muted text-muted-foreground",
};

function storeInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function WorkspaceHomeView({
  displayName,
  avatarUrl,
  summaries,
}: {
  displayName: string;
  avatarUrl: string | null;
  summaries: ServiceStoreWorkspaceSummary[];
}) {
  return (
    <ServiceStoreWorkspaceShell
      displayName={displayName}
      avatarUrl={avatarUrl}
      statusLabel="Choose a Store"
      statusTone="success"
      navLocked={false}
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">Choose Your Service Store</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the Service Store you want to manage.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((summary) => {
          const initials = storeInitials(summary.serviceStore.name);
          return (
            <Card key={summary.serviceStore.id}>
              <CardContent className="space-y-4">
                <div className="relative h-20 overflow-hidden rounded-xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent">
                  <div className="absolute -bottom-5 left-4 flex size-12 items-center justify-center rounded-xl border-2 border-card bg-primary text-sm font-semibold text-primary-foreground">
                    {initials ?? <Store className="size-5" />}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2 pt-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-foreground">
                      {summary.serviceStore.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {summary.primaryBranchName ?? "No branch yet"}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {roleLabel(summary.role)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Today&apos;s Bookings</p>
                    <p className="font-semibold text-foreground">{summary.todaysBookings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue Today</p>
                    <p className="font-semibold text-foreground">
                      {formatPrice(summary.todaysRevenue)}
                    </p>
                  </div>
                </div>

                <Badge
                  className={STATUS_BADGE_CLASS[summary.serviceStore.status] ?? "bg-muted text-muted-foreground"}
                >
                  {summary.serviceStore.status}
                </Badge>
              </CardContent>
              <CardFooter>
                <form
                  action={async () => {
                    "use server";
                    await switchActiveServiceStore(summary.serviceStore.id);
                  }}
                  className="w-full"
                >
                  <button type="submit" className={cn(buttonVariants(), "w-full")}>
                    Open Store
                  </button>
                </form>
              </CardFooter>
            </Card>
          );
        })}

        <Link
          href="/app?mode=claim"
          className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-4xl border-2 border-dashed border-border text-center text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <Plus className="size-6" />
          <span className="text-sm font-medium">Claim Existing Service Store</span>
        </Link>
        <Link
          href="/app?mode=create"
          className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-4xl border-2 border-dashed border-border text-center text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <Plus className="size-6" />
          <span className="text-sm font-medium">Create New Service Store</span>
        </Link>
      </div>
    </ServiceStoreWorkspaceShell>
  );
}

function AnonymousLandingView() {
  const onboardingClaim = `${PORTALS.serviceStore.onboarding}?mode=claim`;
  const onboardingCreate = `${PORTALS.serviceStore.onboarding}?mode=create`;

  return (
    <div className="min-h-svh bg-[#eef3f7]">
      <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col px-6 py-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#0b7a3a] uppercase">
              AutoHub Service Store
            </p>
            <p className="mt-1 text-sm text-[#5b6b7a]">Web portal for service shop operators</p>
          </div>
          <Link
            href={PORTALS.serviceStore.login}
            className="text-sm font-semibold text-[#15202b] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-10 py-12">
          <section className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight text-[#15202b] sm:text-5xl">
              Manage your business.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#5b6b7a]">
              Receive bookings, manage services, track customers, and handle billing — all
              from one Service Store portal.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {CAPABILITIES.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#dce5ee] bg-white p-5 shadow-sm"
              >
                <h2 className="font-semibold text-[#15202b]">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6b7a]">{item.description}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <Link
              href={`${PORTALS.serviceStore.login}?callbackUrl=${encodeURIComponent(PORTALS.serviceStore.dashboard)}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#06C755] px-4 text-center text-sm font-semibold text-white shadow-[0_8px_20px_rgba(6,199,85,0.25)]"
            >
              Login with LINE
            </Link>
            <Link
              href={`${PORTALS.serviceStore.login}?callbackUrl=${encodeURIComponent(onboardingClaim)}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#dce5ee] bg-white px-4 text-center text-sm font-semibold text-[#15202b]"
            >
              Claim Business
            </Link>
            <Link
              href={`${PORTALS.serviceStore.login}?callbackUrl=${encodeURIComponent(onboardingCreate)}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#dce5ee] bg-white px-4 text-center text-sm font-semibold text-[#15202b]"
            >
              Create Business
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
