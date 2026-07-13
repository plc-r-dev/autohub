"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CircleHelp, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
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

export function ServiceStoreWorkspaceHeaderMenu({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" aria-label="Notifications" disabled>
        <Bell className="size-4" />
      </Button>

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
          <DropdownMenuItem render={<Link href="/app/profile" />}>
            <User />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="#" />}>
            <CircleHelp />
            Help
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
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
