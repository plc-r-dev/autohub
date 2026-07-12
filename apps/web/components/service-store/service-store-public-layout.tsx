import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

type ServiceStorePublicLayoutProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  maxWidth?: "md" | "lg";
};

export function ServiceStorePublicLayout({
  title,
  description,
  backHref = "/",
  backLabel = "Back to Home",
  children,
  maxWidth = "lg",
}: ServiceStorePublicLayoutProps) {
  return (
    <div className="min-h-svh bg-[#eef3f7]">
      <div
        className={`mx-auto flex min-h-svh w-full flex-col px-6 py-10 ${
          maxWidth === "lg" ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            {backHref ? (
              <Link
                href={backHref}
                className="mb-3 inline-flex text-sm font-medium text-[#5b6b7a] hover:text-[#15202b]"
              >
                ← {backLabel}
              </Link>
            ) : null}
            <p className="text-xs font-semibold tracking-wide text-[#0b7a3a] uppercase">
              AutoHub ServiceStore
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#15202b]">{title}</h1>
            {description ? (
              <p className="mt-3 text-base leading-relaxed text-[#5b6b7a]">{description}</p>
            ) : null}
          </div>
          <LogoutButton redirectTo="/app/login" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
