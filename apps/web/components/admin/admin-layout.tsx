import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

type AdminLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AdminLayout({ title, description, children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <LogoutButton />
        </div>
        <nav className="flex flex-wrap gap-2">
          <Link
            href="/admin/dashboard"
            className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/merchant-requests"
            className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
          >
            Merchant requests
          </Link>
          <Link
            href="/admin/billings"
            className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
          >
            Billings
          </Link>
          <Link
            href="/admin/settings"
            className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
          >
            Settings
          </Link>
          <Link
            href="/admin/reports"
            className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
          >
            Reports
          </Link>
          <Link
            href="/admin/jobs"
            className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
          >
            Jobs
          </Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
