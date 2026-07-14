"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LineOAuthButton } from "@/components/auth/line-oauth-button";
import { PORTALS } from "@/lib/auth/portals";

type MarketingSignInButtonProps = {
  className?: string;
  children: React.ReactNode;
};

function resolveCallbackUrl(raw: string | null) {
  if (raw && raw.startsWith("/app") && raw !== "/") {
    return raw;
  }
  return PORTALS.serviceStore.home;
}

function MarketingSignInButtonInner({ className, children }: MarketingSignInButtonProps) {
  const searchParams = useSearchParams();
  const callbackUrl = resolveCallbackUrl(searchParams.get("callbackUrl"));

  return (
    <LineOAuthButton callbackUrl={callbackUrl} className={className}>
      {children}
    </LineOAuthButton>
  );
}

/** Sign In that honors ?callbackUrl= from redirects after an unauthenticated /app visit. */
export function MarketingSignInButton(props: MarketingSignInButtonProps) {
  return (
    <Suspense
      fallback={
        <LineOAuthButton
          callbackUrl={PORTALS.serviceStore.home}
          className={props.className}
        >
          {props.children}
        </LineOAuthButton>
      }
    >
      <MarketingSignInButtonInner {...props} />
    </Suspense>
  );
}
