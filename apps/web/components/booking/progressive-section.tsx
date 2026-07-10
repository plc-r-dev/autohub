"use client";

import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

type ProgressiveSectionProps = {
  show: boolean;
  children: React.ReactNode;
  className?: string;
};

export function ProgressiveSection({ show, children, className }: ProgressiveSectionProps) {
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), 320);
    return () => window.clearTimeout(timeout);
  }, [show]);

  if (!mounted) return null;

  return (
    <section
      className={cn(
        "transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className,
      )}
    >
      {children}
    </section>
  );
}
