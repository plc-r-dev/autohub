"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Card, Sheet, VehicleCard, type VehicleCardData } from "@/components/customer/ui";

type VehicleListProps = {
  vehicles: VehicleCardData[];
};

export function VehicleList({ vehicles }: VehicleListProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<VehicleCardData | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<VehicleCardData | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            footer={
              <div className="grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setEditVehicle(vehicle)}
                  className="min-h-[52px] border-r border-[#F1F5F9] text-[14px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteVehicle(vehicle)}
                  className="min-h-[52px] text-[14px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
                >
                  Remove
                </button>
              </div>
            }
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="fixed bottom-8 right-6 z-10 flex size-14 items-center justify-center rounded-full bg-[#16A34A] text-white shadow-[0_8px_24px_rgba(22,163,74,0.35)] hover:bg-[#15803D] md:right-[max(1.5rem,calc(50%-640px+1.5rem))]"
        aria-label="Add vehicle"
      >
        <Plus className="size-6" strokeWidth={2} />
      </button>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add vehicle">
        <p className="mb-6 text-center text-[15px] leading-relaxed text-[#64748B]">
          Add a new vehicle when you book your next service — it only takes a few seconds.
        </p>
        <Link href="/browse" onClick={() => setAddOpen(false)}>
          <Button type="button" className="w-full">
            Book service
          </Button>
        </Link>
      </Sheet>

      <Sheet
        open={Boolean(editVehicle)}
        onClose={() => setEditVehicle(null)}
        title="Vehicle details"
      >
        {editVehicle ? (
          <div className="space-y-4">
            <Card className="py-4">
              <p className="text-[11px] font-medium tracking-wide text-[#94A3B8] uppercase">Plate</p>
              <p className="mt-1 text-[24px] font-semibold text-[#0F172A]">
                {editVehicle.licensePlate}
              </p>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Card className="py-3">
                <p className="text-[11px] text-[#94A3B8] uppercase">Brand</p>
                <p className="mt-1 font-medium">{editVehicle.brand}</p>
              </Card>
              <Card className="py-3">
                <p className="text-[11px] text-[#94A3B8] uppercase">Model</p>
                <p className="mt-1 font-medium">{editVehicle.model}</p>
              </Card>
            </div>
            <p className="text-center text-[14px] text-[#64748B]">
              To update details, add a new vehicle when booking.
            </p>
            <Link href="/browse" onClick={() => setEditVehicle(null)}>
              <Button type="button" className="w-full">
                Book service
              </Button>
            </Link>
          </div>
        ) : null}
      </Sheet>

      <Sheet
        open={Boolean(deleteVehicle)}
        onClose={() => setDeleteVehicle(null)}
        title="Remove vehicle?"
      >
        {deleteVehicle ? (
          <div className="space-y-4">
            <p className="text-center text-[15px] leading-relaxed text-[#64748B]">
              Vehicles linked to bookings cannot be removed yet.
            </p>
            <Button type="button" className="w-full" onClick={() => setDeleteVehicle(null)}>
              Got it
            </Button>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
