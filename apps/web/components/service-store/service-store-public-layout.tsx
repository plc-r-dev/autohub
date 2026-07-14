import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

type ServiceStorePublicLayoutProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl";
};

export function ServiceStorePublicLayout({
  title,
  description,
  backHref = "/",
  backLabel = "Back to Home",
  children,
  maxWidth = "lg",
}: ServiceStorePublicLayoutProps) {
  const widthClass =
    maxWidth === "xl"
      ? "max-w-5xl"
      : maxWidth === "lg"
        ? "max-w-3xl"
        : "max-w-xl"

  return (
    <div className="min-h-svh bg-[#F4F6F8]">
      <div
        className={`mx-auto flex min-h-svh w-full flex-col px-6 py-10 sm:px-8 ${widthClass}`}
      >
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            {backHref ? (
              <Link
                href={backHref}
                className="mb-3 inline-flex text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
              >
                ← {backLabel}
              </Link>
            ) : null}
            <p className="text-xs font-semibold tracking-wide text-[#16A34A] uppercase">
              AutoHub
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0F172A]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 text-base leading-relaxed text-[#64748B]">
                {description}
              </p>
            ) : null}
          </div>
          <LogoutButton redirectTo="/" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
