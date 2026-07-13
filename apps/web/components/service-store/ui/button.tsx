import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

const base =
  "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors";

export function ServiceStoreButton({
  children,
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      className={cn(
        base,
        variant === "primary" &&
          "bg-[#16A34A] text-white hover:bg-[#15803D] dark:border dark:border-border dark:bg-muted dark:text-foreground dark:hover:bg-accent",
        variant === "secondary" &&
          "border border-[#dce5ee] bg-white text-[#0F172A] hover:bg-[#f4f7fa] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted",
        variant === "ghost" &&
          "text-[#5b6b7a] hover:bg-[#eef3f7] hover:text-[#0F172A] dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ServiceStoreButtonLink({
  href,
  children,
  className,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={cn(
        base,
        variant === "primary" &&
          "bg-[#16A34A] text-white hover:bg-[#15803D] dark:border dark:border-border dark:bg-muted dark:text-foreground dark:hover:bg-accent",
        variant === "secondary" &&
          "border border-[#dce5ee] bg-white text-[#0F172A] hover:bg-[#f4f7fa] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted",
        variant === "ghost" &&
          "text-[#5b6b7a] hover:bg-[#eef3f7] hover:text-[#0F172A] dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}
