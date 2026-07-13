"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { NewBookingModal } from "@/components/booking/new-booking-modal";
import { ServiceStoreButton } from "@/components/service-store/ui";

export function BookingsPageActions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("newBooking") === "1") {
      setOpen(true);
    }
  }, [searchParams]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen && searchParams.get("newBooking")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("newBooking");
      const query = params.toString();
      router.replace(query ? `/app/bookings?${query}` : "/app/bookings");
    }
  }

  return (
    <>
      <ServiceStoreButton
        type="button"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" strokeWidth={2.5} />
        New booking
      </ServiceStoreButton>
      <NewBookingModal open={open} onOpenChange={handleOpenChange} />
    </>
  );
}
