"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
  selectClassName,
  textareaClassName,
} from "@/components/onboarding/form-field";
import { createBooking, type BookingActionState } from "@/lib/booking/actions";
import { formatPrice } from "@/lib/booking/format";

type AvailableSlot = {
  startTime: string;
  label: string;
};

type CreateBookingFormProps = {
  branchId: string;
  serviceId: string;
  serviceName: string;
  servicePrice: string;
  serviceDuration: number;
  serviceBufferMinutes: number;
  vehicles: Array<{
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    province: string | null;
    color: string | null;
  }>;
};

const initialState: BookingActionState = {};

function todayDateValue(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function CreateBookingForm({
  branchId,
  serviceId,
  serviceName,
  servicePrice,
  serviceDuration,
  serviceBufferMinutes,
  vehicles,
}: CreateBookingFormProps) {
  const [state, formAction, isPending] = useActionState(
    createBooking,
    initialState,
  );
  const [selectedDate, setSelectedDate] = useState(todayDateValue);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">(
    vehicles.length > 0 ? "existing" : "new",
  );
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedSlot(null);

      try {
        const params = new URLSearchParams({
          serviceId,
          date: selectedDate,
        });
        const response = await fetch(
          `/api/branches/${branchId}/available-slots?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load available slots.");
        }

        const data = (await response.json()) as { slots: AvailableSlot[] };
        if (!cancelled) {
          setSlots(data.slots);
        }
      } catch {
        if (!cancelled) {
          setSlots([]);
          setSlotsError("Could not load available slots. Try another date.");
        }
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    }

    void loadSlots();

    return () => {
      cancelled = true;
    };
  }, [branchId, serviceId, selectedDate]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="bookingDate" value={selectedSlot ?? ""} />
      <input type="hidden" name="vehicleMode" value={vehicleMode} />

      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <div className="border-input rounded-md border p-4 text-sm">
        <p className="font-medium">{serviceName}</p>
        <p className="text-muted-foreground">
          {serviceDuration} min + {serviceBufferMinutes} min buffer ·{" "}
          {formatPrice(servicePrice)}
        </p>
      </div>

      <FormField id="vehicleMode" label="Vehicle" error={state.fieldErrors?.vehicleId?.[0]}>
        <select
          id="vehicleMode"
          className={selectClassName}
          value={vehicleMode}
          onChange={(event) => setVehicleMode(event.target.value as "existing" | "new")}
        >
          {vehicles.length > 0 ? (
            <option value="existing">Select existing vehicle</option>
          ) : null}
          <option value="new">Add new vehicle</option>
        </select>
      </FormField>

      {vehicleMode === "existing" && vehicles.length > 0 ? (
        <FormField
          id="vehicleId"
          label="Vehicle selection"
          error={state.fieldErrors?.vehicleId?.[0]}
        >
          <select id="vehicleId" name="vehicleId" required className={selectClassName}>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.licensePlate} · {vehicle.brand} {vehicle.model}
                {vehicle.province ? ` · ${vehicle.province}` : ""}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      {vehicleMode === "new" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            id="vehicleLicensePlate"
            label="License plate"
            error={state.fieldErrors?.vehicleLicensePlate?.[0]}
          >
            <input
              id="vehicleLicensePlate"
              name="vehicleLicensePlate"
              required
              className={inputClassName}
            />
          </FormField>
          <FormField
            id="vehicleProvince"
            label="Province"
            error={state.fieldErrors?.vehicleProvince?.[0]}
          >
            <input id="vehicleProvince" name="vehicleProvince" className={inputClassName} />
          </FormField>
          <FormField
            id="vehicleBrand"
            label="Brand"
            error={state.fieldErrors?.vehicleBrand?.[0]}
          >
            <input id="vehicleBrand" name="vehicleBrand" required className={inputClassName} />
          </FormField>
          <FormField
            id="vehicleModel"
            label="Model"
            error={state.fieldErrors?.vehicleModel?.[0]}
          >
            <input id="vehicleModel" name="vehicleModel" required className={inputClassName} />
          </FormField>
          <FormField id="vehicleYear" label="Year" error={state.fieldErrors?.vehicleYear?.[0]}>
            <input id="vehicleYear" name="vehicleYear" type="number" className={inputClassName} />
          </FormField>
          <FormField
            id="vehicleColor"
            label="Color"
            error={state.fieldErrors?.vehicleColor?.[0]}
          >
            <input id="vehicleColor" name="vehicleColor" className={inputClassName} />
          </FormField>
          <FormField
            id="vehicleNotes"
            label="Vehicle notes"
            error={state.fieldErrors?.vehicleNotes?.[0]}
            className="sm:col-span-2"
          >
            <textarea id="vehicleNotes" name="vehicleNotes" className={textareaClassName} />
          </FormField>
        </div>
      ) : null}

      <FormField
        id="bookingDate"
        label="Date"
        error={state.fieldErrors?.bookingDate?.[0]}
      >
        <input
          id="bookingDate"
          name="bookingDatePicker"
          type="date"
          required
          min={todayDateValue()}
          className={inputClassName}
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Available times</p>
        {slotsLoading ? (
          <p className="text-muted-foreground text-sm">Loading slots...</p>
        ) : slotsError ? (
          <p className="text-destructive text-sm">{slotsError}</p>
        ) : slots.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No available slots for this date.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.startTime;

              return (
                <button
                  key={slot.startTime}
                  type="button"
                  onClick={() => setSelectedSlot(slot.startTime)}
                  className={
                    isSelected
                      ? "bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm"
                      : "border-input hover:bg-muted rounded-md border px-3 py-2 text-sm"
                  }
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}
        {!selectedSlot && !slotsLoading && slots.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            Select a time slot to continue.
          </p>
        ) : null}
      </div>

      <FormField id="note" label="Note" error={state.fieldErrors?.note?.[0]}>
        <textarea id="note" name="note" className={textareaClassName} />
      </FormField>

      <Button type="submit" disabled={isPending || !selectedSlot}>
        {isPending ? "Booking..." : "Create booking"}
      </Button>
    </form>
  );
}
