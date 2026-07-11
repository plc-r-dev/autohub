import Link from "next/link";
import { PORTALS } from "@/lib/auth/portals";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center md:px-10">
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href={PORTALS.marketing.signIn} className="text-foreground hover:text-muted-foreground">
            Sign In
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Customer booking is available through the AutoHub LINE Official Account.
        </p>
      </div>
    </footer>
  );
}
