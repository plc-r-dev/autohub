"use client";

import Link from "next/link";
import { ChevronDown, Eye, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { getDashboardBookingActions } from "@/lib/booking/dashboard-status-options";
import type { BookingStatus } from "@/lib/generated/prisma/client";

type BookingStatusUpdateMenuProps = {
  bookingNumber: string;
  status: BookingStatus;
  isPending?: boolean;
  onStatusChange: (bookingNumber: string, nextStatus: BookingStatus) => void;
  triggerVariant?: "icon" | "label";
  hideViewAction?: boolean;
};

export function BookingStatusUpdateMenu({
  bookingNumber,
  status,
  isPending = false,
  onStatusChange,
  triggerVariant = "icon",
  hideViewAction = false,
}: BookingStatusUpdateMenuProps) {
  const actions = getDashboardBookingActions(status).filter(
    (action) => !(hideViewAction && action.type === "view"),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          triggerVariant === "label" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="h-9 rounded-xl border-[#dce5ee] bg-white px-3 text-sm font-semibold text-[#0F172A] hover:border-[#16A34A]/40 hover:bg-[#f0fdf4]"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  More actions
                  <ChevronDown className="size-4 text-[#8a97a5]" />
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              className="rounded-full text-muted-foreground"
              aria-label="More actions"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MoreVertical className="size-4" />
              )}
            </Button>
          )
        }
      />
      <DropdownMenuContent align="end">
        {actions.map((action) => {
          if (action.type === "view") {
            return (
              <DropdownMenuItem
                key="view"
                render={<Link href={`/app/bookings/${bookingNumber}`} />}
              >
                <Eye />
                {action.label}
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={action.status}
              disabled={isPending}
              onClick={() => onStatusChange(bookingNumber, action.status)}
            >
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
