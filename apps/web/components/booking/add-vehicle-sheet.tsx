"use client";

import { useState } from "react";
import {
  Button,
  CustomerFormField,
  Sheet,
  TextField,
} from "@/components/customer/ui";

export type NewVehicleDraft = {
  licensePlate: string;
  province?: string;
  brand: string;
  model: string;
  year?: string;
  color?: string;
};

type AddVehicleSheetProps = {
  open: boolean;
  onClose: () => void;
  onSave: (draft: NewVehicleDraft) => void;
  initialDraft?: NewVehicleDraft | null;
  fieldErrors?: Record<string, string[]>;
};

function AddVehicleForm({
  initialDraft,
  fieldErrors,
  onSave,
}: {
  initialDraft?: NewVehicleDraft | null;
  fieldErrors?: Record<string, string[]>;
  onSave: (draft: NewVehicleDraft) => void;
}) {
  const [licensePlate, setLicensePlate] = useState(initialDraft?.licensePlate ?? "");
  const [province, setProvince] = useState(initialDraft?.province ?? "");
  const [brand, setBrand] = useState(initialDraft?.brand ?? "");
  const [model, setModel] = useState(initialDraft?.model ?? "");
  const [year, setYear] = useState(initialDraft?.year ?? "");
  const [color, setColor] = useState(initialDraft?.color ?? "");

  const canSave = licensePlate.trim() && brand.trim() && model.trim();

  return (
    <div className="grid gap-4">
      <CustomerFormField
        id="addVehicleLicensePlate"
        label="License plate"
        error={fieldErrors?.vehicleLicensePlate?.[0]}
      >
        <TextField
          id="addVehicleLicensePlate"
          value={licensePlate}
          onChange={(event) => setLicensePlate(event.target.value)}
          autoFocus
        />
      </CustomerFormField>
      <CustomerFormField
        id="addVehicleProvince"
        label="Province"
        error={fieldErrors?.vehicleProvince?.[0]}
      >
        <TextField
          id="addVehicleProvince"
          value={province}
          onChange={(event) => setProvince(event.target.value)}
        />
      </CustomerFormField>
      <div className="grid grid-cols-2 gap-3">
        <CustomerFormField
          id="addVehicleBrand"
          label="Brand"
          error={fieldErrors?.vehicleBrand?.[0]}
        >
          <TextField
            id="addVehicleBrand"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          />
        </CustomerFormField>
        <CustomerFormField
          id="addVehicleModel"
          label="Model"
          error={fieldErrors?.vehicleModel?.[0]}
        >
          <TextField
            id="addVehicleModel"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          />
        </CustomerFormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CustomerFormField
          id="addVehicleYear"
          label="Year"
          error={fieldErrors?.vehicleYear?.[0]}
        >
          <TextField
            id="addVehicleYear"
            type="number"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
        </CustomerFormField>
        <CustomerFormField
          id="addVehicleColor"
          label="Color"
          error={fieldErrors?.vehicleColor?.[0]}
        >
          <TextField
            id="addVehicleColor"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </CustomerFormField>
      </div>
      <Button
        type="button"
        disabled={!canSave}
        onClick={() =>
          onSave({
            licensePlate: licensePlate.trim(),
            province: province.trim() || undefined,
            brand: brand.trim(),
            model: model.trim(),
            year: year.trim() || undefined,
            color: color.trim() || undefined,
          })
        }
        className="mt-2 w-full"
      >
        Save vehicle
      </Button>
    </div>
  );
}

export function AddVehicleSheet({
  open,
  onClose,
  onSave,
  initialDraft,
  fieldErrors,
}: AddVehicleSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Add vehicle">
      {open ? (
        <AddVehicleForm
          key={initialDraft?.licensePlate ?? "new-vehicle"}
          initialDraft={initialDraft}
          fieldErrors={fieldErrors}
          onSave={onSave}
        />
      ) : null}
    </Sheet>
  );
}
