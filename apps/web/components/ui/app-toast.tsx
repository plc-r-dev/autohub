"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type ToastVariant = "success" | "error";

type ToastState = {
  message: string;
  variant: ToastVariant;
};

export function useAppToast(durationMs = 3200) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      setToast({ message, variant });
    },
    [],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [toast, durationMs]);

  return { toast, showToast, dismissToast };
}

export function AppToastViewport({
  toast,
  onDismiss,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
}) {
  if (!toast) {
    return null;
  }

  const Icon = toast.variant === "success" ? CheckCircle2 : XCircle;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex max-w-sm">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg",
          toast.variant === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800",
        )}
      >
        <Icon className="mt-0.5 size-4 shrink-0" />
        <span className="min-w-0 flex-1">{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-current/70 hover:text-current"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
