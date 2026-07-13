"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppToastViewport, useAppToast } from "@/components/ui/app-toast";
import { NewBookingForm } from "@/components/booking/new-booking-form";
import type { NewBookingFormOptions } from "@/lib/booking/application/new-booking-options";
import { refreshNewBookingFormOptions } from "@/lib/booking/new-booking-actions";

type NewBookingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewBookingModal({ open, onOpenChange }: NewBookingModalProps) {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useAppToast();
  const [formKey, setFormKey] = useState(0);
  const [formOptions, setFormOptions] = useState<NewBookingFormOptions | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormKey((current) => current + 1);
    setIsLoadingOptions(true);

    refreshNewBookingFormOptions()
      .then(setFormOptions)
      .finally(() => setIsLoadingOptions(false));
  }, [open]);

  function handleSuccess(message: string) {
    showToast(message, "success");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <AppDialog
        open={open}
        onOpenChange={onOpenChange}
        title="New booking"
        description="Create a booking without leaving the list."
      >
        {isLoadingOptions || !formOptions ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-foreground" />
            Loading services...
          </div>
        ) : (
          <NewBookingForm
            key={formKey}
            formOptions={formOptions}
            onCancel={() => onOpenChange(false)}
            onSuccess={handleSuccess}
          />
        )}
      </AppDialog>
      <AppToastViewport toast={toast} onDismiss={dismissToast} />
    </>
  );
}
