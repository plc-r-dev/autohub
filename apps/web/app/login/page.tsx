"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
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
      errorCallbackURL: "/login?error=auth",
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Sign in with LINE failed");
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-lg font-medium">Sign in</h1>
      <p className="text-muted-foreground text-sm">
        Continue with your LINE account to access AutoHub.
      </p>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="button" disabled={isLoading} onClick={handleLineSignIn}>
        {isLoading ? "Redirecting..." : "Continue with LINE"}
      </Button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
