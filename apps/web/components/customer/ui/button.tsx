import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[20px] px-6 text-[15px] font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

const variants = {
  primary:
    "bg-[#16A34A] text-white shadow-sm hover:bg-[#15803D] dark:border dark:border-border dark:bg-muted dark:text-foreground dark:hover:bg-accent",
  secondary: "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]",
  ghost: "text-[#16A34A] hover:bg-[#F0FDF4]",
  dark: "bg-[#0F172A] text-white hover:bg-[#1e293b]",
} as const;

const sizes = {
  md: "h-[48px]",
  lg: "h-[52px]",
  sm: "h-[40px] px-4 text-[14px]",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  children,
  className,
  variant = "primary",
  size = "lg",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  size = "lg",
  onClick,
  ...props
}: React.ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
