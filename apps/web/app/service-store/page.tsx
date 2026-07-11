import Link from "next/link";
import { PORTALS } from "@/lib/auth/portals";

const CAPABILITIES = [
  { title: "Receive bookings", description: "Accept online and walk-in appointments." },
  { title: "Manage services", description: "Branches, services, and operating hours." },
  { title: "Customer CRM", description: "View visit history and vehicle records." },
  { title: "Billing", description: "Submit statements and payment slips." },
] as const;

export default function ServiceStoreLandingPage() {
  const onboardingClaim = `${PORTALS.serviceStore.onboarding}?mode=claim`;
  const onboardingCreate = `${PORTALS.serviceStore.onboarding}?mode=request`;

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
