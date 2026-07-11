import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

type MarketingSectionProps = {
  id?: string;
  tone?: "default" | "muted";
  className?: string;
  children: ReactNode;
};

/**
 * Shared section wrapper for the marketing site — consistent max-width,
 * padding, and background rhythm across every section. Add new marketing
 * sections on top of this rather than repeating the container markup.
 */
export function MarketingSection({
  id,
  tone = "default",
  className,
  children,
}: MarketingSectionProps) {
  return (
    <section
      id={id}
      className={cn("w-full", tone === "muted" ? "bg-muted/40" : "bg-background")}
    >
      <div className={cn("mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-24", className)}>
        {children}
      </div>
    </section>
  );
}

type MarketingSectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function MarketingSectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: MarketingSectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
