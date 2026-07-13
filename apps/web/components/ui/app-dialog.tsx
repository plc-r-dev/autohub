"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type AppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

/** Centered modal dialog with ESC and backdrop dismiss. */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: AppDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-[680px] -translate-x-1/2 -translate-y-1/2",
        "rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl",
        "backdrop:bg-background/60 backdrop:backdrop-blur-[2px]",
        "open:animate-in open:fade-in-0 open:zoom-in-95",
        className,
      )}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div className="flex max-h-[min(90vh,820px)] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </dialog>
  );
}
