"use client";

import { useEffect } from "react";
import { cn } from "@workspace/ui/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[#0A0A0A]/20 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative max-h-[85vh] overflow-y-auto rounded-t-[24px] bg-white px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(0,0,0,0.12)]",
          className,
        )}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#E2E8F0]" />
        {title ? (
          <h2 className="mb-5 text-center text-[20px] font-semibold tracking-tight text-[#0A0A0A]">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}
