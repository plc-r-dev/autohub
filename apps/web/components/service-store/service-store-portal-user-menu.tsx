"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, LogOut, Settings, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function ServiceStorePortalUserMenu({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-accent"
          >
            <Avatar>
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
              <AvatarFallback>{initials(displayName)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {displayName || "there"}
            </span>
          </button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href="/app/settings" />}>
          <User />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/app" />}>
          <ArrowLeftRight />
          Switch Store
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/app/settings" />}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/app/login");
                  router.refresh();
                },
              },
            });
          }}
        >
          <LogOut />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
