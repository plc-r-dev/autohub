import Link from "next/link";
import { PORTALS } from "@/lib/auth/portals";

const CAPABILITIES = [
  "Service Store Approval",
  "Billing oversight",
  "Platform reports",
  "Platform settings",
  "Background jobs",
] as const;

export default function AdminLandingPage() {
  return (
    <div className="min-h-svh bg-[#0f172a] text-white">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-6 py-10">
        <header className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide text-[#94a3b8] uppercase">
            AutoHub Admin
          </p>
          <Link
            href={PORTALS.admin.login}
            className="text-sm font-medium text-white underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-8 py-12">
          <section className="max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Platform Administration
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#94a3b8]">
              Operate the AutoHub marketplace — approve Service Stores, manage billing,
              and configure platform settings.
            </p>
          </section>

          <section className="rounded-[28px] border border-[#1e293b] bg-[#111827] p-6">
            <h2 className="text-sm font-semibold tracking-wide text-[#64748b] uppercase">
              Capabilities
            </h2>
            <ul className="mt-4 space-y-3">
              {CAPABILITIES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-[#38bdf8]" aria-hidden>
                    ✓
                  </span>
                  <span className="text-sm font-medium sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <Link
            href={PORTALS.admin.login}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#06C755] px-6 text-center text-sm font-semibold text-white shadow-[0_8px_20px_rgba(6,199,85,0.25)]"
          >
            Login with LINE
          </Link>
        </main>
      </div>
    </div>
  );
}
