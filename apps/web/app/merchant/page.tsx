import Link from "next/link";

const BENEFITS = [
  "Receive online bookings",
  "Manage appointments",
  "Customer CRM",
  "Billing & Settlement",
  "Reports",
] as const;

export default function MerchantLandingPage() {
  return (
    <div className="min-h-svh bg-[#eef3f7]">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-6 py-10">
        <header className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide text-[#0b7a3a] uppercase">
            AutoHub Merchant
          </p>
          <Link
            href="/merchant/login"
            className="text-sm font-medium text-[#15202b] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-8 py-12">
          <section className="max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight text-[#15202b] sm:text-5xl">
              Grow your business with AutoHub.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#5b6b7a]">
              Join the marketplace, receive LINE bookings, and run your shop from
              one merchant portal.
            </p>
          </section>

          <section className="rounded-[28px] border border-[#dce5ee] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold tracking-wide text-[#8a97a5] uppercase">
              Benefits
            </h2>
            <ul className="mt-4 space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-[#15202b]">
                  <span className="mt-1 text-[#06C755]" aria-hidden>
                    ✓
                  </span>
                  <span className="text-sm font-medium sm:text-base">{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/merchant/login?callbackUrl=/merchant/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#06C755] px-4 text-center text-sm font-semibold text-white shadow-[0_8px_20px_rgba(6,199,85,0.25)]"
            >
              Login with LINE
            </Link>
            <Link
              href="/merchant/login?callbackUrl=/merchant/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#dce5ee] bg-white px-4 text-center text-sm font-semibold text-[#15202b]"
            >
              Claim My Business
            </Link>
            <Link
              href="/merchant/login?callbackUrl=/merchant/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#dce5ee] bg-white px-4 text-center text-sm font-semibold text-[#15202b]"
            >
              Create New Business
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
