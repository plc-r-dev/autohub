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
        variant === "primary" && "bg-[#06C755] text-white hover:bg-[#05b34c]",
        variant === "secondary" &&
          "border border-[#dce5ee] bg-white text-[#15202b] hover:bg-[#f4f7fa]",
        variant === "ghost" && "text-[#5b6b7a] hover:bg-[#eef3f7] hover:text-[#15202b]",
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
        variant === "primary" && "bg-[#06C755] text-white hover:bg-[#05b34c]",
        variant === "secondary" &&
          "border border-[#dce5ee] bg-white text-[#15202b] hover:bg-[#f4f7fa]",
        variant === "ghost" && "text-[#5b6b7a] hover:bg-[#eef3f7] hover:text-[#15202b]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
