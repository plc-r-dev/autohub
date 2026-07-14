import Link from "next/link";
import { LineOAuthButton } from "@/components/auth/line-oauth-button";
import { PORTALS } from "@/lib/auth/portals";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function OpenInLinePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl &&
    (params.callbackUrl.startsWith("/browse") ||
      params.callbackUrl.startsWith("/bookings") ||
      params.callbackUrl.startsWith("/vehicles") ||
      params.callbackUrl.startsWith("/profile") ||
      params.callbackUrl.startsWith("/more"))
      ? params.callbackUrl
      : PORTALS.customer.home;

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
          <h1 className="text-xl font-semibold text-[#111]">Sign in to AutoHub</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6b7c8c]">
            Customer booking uses a separate LINE login from the Service Store portal.
            Sign in below to browse shops and manage bookings.
          </p>
        </div>

        {params.error === "auth" ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Sign in with LINE failed. Please try again.
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          <LineOAuthButton
            portal="customer"
            callbackUrl={callbackUrl}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#16A34A] text-[15px] font-semibold text-white"
          >
            Login with LINE
          </LineOAuthButton>
          <Link
            href={PORTALS.marketing.home}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#e5e8eb] bg-white text-[15px] font-semibold text-[#0F172A]"
          >
            Back to AutoHub
          </Link>
        </div>
      </div>
    </div>
  );
}
