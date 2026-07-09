import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

type OnboardingLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  backHref?: string;
};

export function OnboardingLayout({
  title,
  description,
  children,
  backHref,
}: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {backHref ? (
              <Link
                href={backHref}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Back
              </Link>
            ) : null}
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <LogoutButton />
        </div>
        {children}
      </div>
    </div>
  );
}
