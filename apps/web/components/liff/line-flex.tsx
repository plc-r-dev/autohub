import { cn } from "@workspace/ui/lib/utils";

/** LINE Official Account + LIFF design tokens */
export const lineColors = {
  green: "#16A34A",
  greenDark: "#15803D",
  greenLight: "#8de055",
  chatBg: "#8cabd8",
  chatBgLight: "#b2c7d9",
  bubbleWhite: "#ffffff",
  bubbleSystem: "#f0f0f0",
  text: "#111111",
  textMuted: "#8a97a5",
  border: "#e8eaed",
} as const;

type LineFlexBubbleProps = {
  children: React.ReactNode;
  className?: string;
  /** System message style (gray, left-aligned feel) */
  variant?: "card" | "system";
};

/** White bubble card — mimics LINE Flex Message container */
export function LineFlexBubble({
  children,
  className,
  variant = "card",
}: LineFlexBubbleProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[18px] shadow-sm",
        variant === "card" ? "bg-white" : "bg-[#f0f0f0]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type LineFlexCardProps = {
  hero?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/** Flex Message bubble with hero + body + optional footer action strip */
export function LineFlexCard({ hero, children, footer, className }: LineFlexCardProps) {
  return (
    <LineFlexBubble className={className}>
      {hero}
      <div className="p-4">{children}</div>
      {footer ? (
        <div className="border-t border-[#f0f2f5]">{footer}</div>
      ) : null}
    </LineFlexBubble>
  );
}

type LineFlexActionProps = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "link";
  className?: string;
};

/** Flex Message footer action button (full-width tap target) */
export function LineFlexAction({
  href,
  onClick,
  children,
  variant = "link",
  className,
}: LineFlexActionProps) {
  const base =
    "flex min-h-[48px] w-full items-center justify-center px-4 text-[15px] font-semibold active:bg-[#f5f6f8]";

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          base,
          variant === "primary" ? "bg-[#16A34A] text-white active:bg-[#15803D]" : "text-[#16A34A]",
          className,
        )}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        base,
        variant === "primary" ? "bg-[#16A34A] text-white active:bg-[#15803D]" : "text-[#16A34A]",
        className,
      )}
    >
      {children}
    </button>
  );
}

type LineStickyCtaProps = {
  children: React.ReactNode;
  className?: string;
};

/** Floating sticky bottom CTA bar (LIFF pattern) */
export function LineStickyCta({ children, className }: LineStickyCtaProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-30 w-full max-w-[420px] -translate-x-1/2 border-t border-[#e8eaed]/80 bg-white/95 px-4 pt-3 backdrop-blur-md",
        className,
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {children}
    </div>
  );
}

type LineChatRowProps = {
  children: React.ReactNode;
  from?: "oa" | "user";
};

/** Chat row with avatar dot — mimics LINE chat thread */
export function LineChatRow({ children, from = "oa" }: LineChatRowProps) {
  return (
    <div className={cn("flex gap-2", from === "user" ? "flex-row-reverse" : "flex-row")}>
      {from === "oa" ? (
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-[11px] font-bold text-white">
          A
        </div>
      ) : (
        <div className="size-8 shrink-0" />
      )}
      <div className="min-w-0 max-w-[88%] flex-1">{children}</div>
    </div>
  );
}

/** OA chat header bar */
export function LineOaHeader({ name = "AutoHub" }: { name?: string }) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-black/5 bg-[#16A34A] px-4 py-3 text-white">
      <div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
        A
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{name}</p>
        <p className="text-[11px] text-white/80">Official Account</p>
      </div>
    </header>
  );
}
