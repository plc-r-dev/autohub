"use client";

import { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { deleteBranch } from "@/lib/service-store/catalog-actions";

type DeleteBranchButtonProps = {
  branchId: string;
};

export function DeleteBranchButton({ branchId }: DeleteBranchButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this branch and all its services?")) {
          return;
        }
        startTransition(async () => {
          await deleteBranch(branchId);
        });
      }}
    >
      {isPending ? "Deleting..." : "Delete branch"}
    </Button>
  );
}
