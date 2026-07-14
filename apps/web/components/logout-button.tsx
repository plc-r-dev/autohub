"use client";

import { useRouter } from "next/navigation";
import {
  customerAuthClient,
  serviceStoreAuthClient,
} from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";

type LogoutButtonProps = {
  redirectTo?: string;
  portal?: "customer" | "serviceStore";
};

export function LogoutButton({
  redirectTo = "/",
  portal = "serviceStore",
}: LogoutButtonProps) {
  const router = useRouter();
  const client = portal === "customer" ? customerAuthClient : serviceStoreAuthClient;

  return (
    <Button
      variant="outline"
      onClick={async () => {
        await client.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push(redirectTo);
              router.refresh();
            },
          },
        });
      }}
    >
      Sign out
    </Button>
  );
}
