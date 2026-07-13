import Link from "next/link";
import { PORTALS } from "@/lib/auth/portals";

export default function OpenInLinePage() {
  return (
    <div className="min-h-svh bg-[#f0f2f5]">
      <div
        className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col justify-center bg-[#f7f8fa] px-6"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#16A34A] text-2xl font-bold text-white">
            A
          </div>
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="size-2 rounded-full bg-[#16A34A]" aria-hidden />
            <span className="text-xs font-medium text-[#6b7c8c]">LINE Official Account</span>
          </div>
          <h1 className="text-xl font-semibold text-[#111]">Open AutoHub in LINE</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6b7c8c]">
            AutoHub is a LINE-first experience. Open the AutoHub Official Account, use the
            Rich Menu, and book from LIFF.
          </p>
        </div>

        <ol className="mt-8 space-y-3 rounded-2xl border border-[#e5e8eb] bg-white p-5 text-left text-sm text-[#0F172A]">
          <li className="flex gap-3">
            <span className="font-semibold text-[#16A34A]">1.</span>
            <span>Open the AutoHub LINE Official Account</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-[#16A34A]">2.</span>
            <span>Tap Nearby Shops or Book from the Rich Menu</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-[#16A34A]">3.</span>
            <span>Complete your booking inside LIFF</span>
          </li>
        </ol>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={PORTALS.marketing.home}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#16A34A] text-[15px] font-semibold text-white"
          >
            Back to AutoHub
          </Link>
        </div>
      </div>
    </div>
  );
}
