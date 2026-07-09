"use client";

import { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { deleteService } from "@/lib/merchant/catalog-actions";

type DeleteServiceButtonProps = {
  branchId: string;
  serviceId: string;
};

export function DeleteServiceButton({
  branchId,
  serviceId,
}: DeleteServiceButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this service?")) {
          return;
        }
        startTransition(async () => {
          await deleteService(branchId, serviceId);
        });
      }}
    >
      {isPending ? "Deleting..." : "Delete service"}
    </Button>
  );
}
