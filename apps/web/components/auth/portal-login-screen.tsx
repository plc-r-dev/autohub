"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";

type PortalLoginFormProps = {
  portal: "customer" | "serviceStore" | "admin";
  title: string;
  description: string;
  defaultCallbackUrl: string;
  errorCallbackURL: string;
  embedded?: boolean;
};

function PortalLoginForm({
  portal,
  title,
  description,
  defaultCallbackUrl,
  errorCallbackURL,
}: PortalLoginFormProps) {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    !rawCallbackUrl || rawCallbackUrl === "/"
      ? defaultCallbackUrl
      : rawCallbackUrl;
  const authError = searchParams.get("error");

  const [error, setError] = useState<string | null>(
    authError ? "Sign in with LINE failed. Please try again." : null,
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleLineSignIn() {
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await authClient.signIn.oauth2({
      providerId: "line",
      callbackURL: callbackUrl,
      errorCallbackURL,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Sign in with LINE failed");
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="text-center">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2">
          <span className="size-2 rounded-full bg-[#06C755]" aria-hidden />
          <span className="text-xs font-medium text-[#6b7c8c]">LINE Official Account</span>
        </div>
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#06C755] text-2xl font-bold text-white">
          {portal === "admin" ? "A" : portal === "serviceStore" ? "S" : "C"}
        </div>
        <h1 className="text-xl font-semibold text-[#111]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7c8c]">{description}</p>
      </div>
      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
      <Button
        type="button"
        disabled={isLoading}
        onClick={handleLineSignIn}
        className="h-12 rounded-xl bg-[#06C755] text-[15px] font-semibold text-white hover:bg-[#05b34c]"
      >
        {isLoading ? "Opening LINE..." : "Continue with LINE"}
      </Button>
      <p className="text-center text-[11px] text-[#8a97a5]">
        You will stay inside the LINE app experience.
      </p>
    </div>
  );
}

export function PortalLoginScreen({
  embedded = false,
  ...props
}: PortalLoginFormProps) {
  const form = (
    <Suspense>
      <PortalLoginForm {...props} embedded={embedded} />
    </Suspense>
  );

  if (embedded) {
    return form;
  }

  return (
    <div className="min-h-svh bg-[#f0f2f5]">
      <div
        className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col justify-center bg-[#f7f8fa] px-5"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {form}
      </div>
    </div>
  );
}
