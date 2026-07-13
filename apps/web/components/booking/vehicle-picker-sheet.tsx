"use client";

import { Plus } from "lucide-react";
import { Sheet } from "@/components/customer/ui";
import { cn } from "@workspace/ui/lib/utils";

export type VehicleOption = {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  province: string | null;
  color: string | null;
};

type VehiclePickerSheetProps = {
  open: boolean;
  onClose: () => void;
  vehicles: VehicleOption[];
  selectedVehicleId: string;
  onSelect: (vehicleId: string) => void;
  onAddNew: () => void;
};

export function VehiclePickerSheet({
  open,
  onClose,
  vehicles,
  selectedVehicleId,
  onSelect,
  onAddNew,
}: VehiclePickerSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Choose vehicle">
      <div className="flex flex-col gap-3">
        {vehicles.map((vehicle) => {
          const selected = selectedVehicleId === vehicle.id;
          return (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => {
                onSelect(vehicle.id);
                onClose();
              }}
              className={cn(
                "rounded-[16px] border p-4 text-left transition-colors",
                selected
                  ? "border-[#16A34A] bg-[#F0FDF4]"
                  : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]",
              )}
            >
              <p className="text-[16px] font-semibold text-[#0F172A]">
                {vehicle.brand} {vehicle.model}
              </p>
              <p className="mt-1 text-[14px] text-[#64748B]">{vehicle.licensePlate}</p>
              {vehicle.color ? (
                <p className="mt-1 text-[13px] text-[#94A3B8]">{vehicle.color}</p>
              ) : null}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            onClose();
            onAddNew();
          }}
          className="flex items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-4 text-[14px] font-semibold text-[#16A34A]"
        >
          <Plus className="size-4" />
          Add vehicle
        </button>
      </div>
    </Sheet>
  );
}
