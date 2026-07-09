"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
  selectClassName,
  textareaClassName,
} from "@/components/onboarding/form-field";
import { createWalkInBooking, type BookingActionState } from "@/lib/booking/actions";
import { formatPrice } from "@/lib/booking/format";

type BranchOption = {
  id: string;
  name: string;
  services: Array<{
    id: string;
    name: string;
    duration: number;
    bufferMinutes: number;
    price: string;
  }>;
};

type WalkInBookingFormProps = {
  branches: BranchOption[];
};

const initialState: BookingActionState = {};

function nowDateTimeValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function WalkInBookingForm({ branches }: WalkInBookingFormProps) {
  const [state, formAction, isPending] = useActionState(
    createWalkInBooking,
    initialState,
  );
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [customerType, setCustomerType] = useState<"existing" | "temporary">(
    "existing",
  );
  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">("new");

  const services = useMemo(
    () => branches.find((branch) => branch.id === branchId)?.services ?? [],
    [branches, branchId],
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <FormField id="branchId" label="Branch" error={state.fieldErrors?.branchId?.[0]}>
        <select
          id="branchId"
          name="branchId"
          required
          className={selectClassName}
          value={branchId}
          onChange={(event) => setBranchId(event.target.value)}
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="serviceId" label="Service" error={state.fieldErrors?.serviceId?.[0]}>
        <select id="serviceId" name="serviceId" required className={selectClassName}>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {service.duration} min + {service.bufferMinutes} min
              buffer · {formatPrice(service.price)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        id="bookingDate"
        label="Date and time"
        error={state.fieldErrors?.bookingDate?.[0]}
      >
        <input
          id="bookingDate"
          name="bookingDate"
          type="datetime-local"
          required
          className={inputClassName}
          defaultValue={nowDateTimeValue()}
        />
      </FormField>

      <FormField
        id="customerType"
        label="Customer type"
        error={state.fieldErrors?.customerType?.[0]}
      >
        <select
          id="customerType"
          name="customerType"
          required
          className={selectClassName}
          value={customerType}
          onChange={(event) =>
            setCustomerType(event.target.value as "existing" | "temporary")
          }
        >
          <option value="existing">Existing customer</option>
          <option value="temporary">Temporary walk-in customer</option>
        </select>
      </FormField>

      <FormField
        id="vehicleMode"
        label="Vehicle mode"
        error={state.fieldErrors?.vehicleId?.[0]}
      >
        <select
          id="vehicleMode"
          name="vehicleMode"
          required
          className={selectClassName}
          value={vehicleMode}
          onChange={(event) =>
            setVehicleMode(event.target.value as "existing" | "new")
          }
        >
          <option value="new">Create vehicle for this booking</option>
          <option value="existing">Use existing vehicle by plate</option>
        </select>
      </FormField>

      {customerType === "existing" ? (
        <FormField
          id="customerPhone"
          label="Customer phone"
          error={state.fieldErrors?.customerPhone?.[0]}
        >
          <input
            id="customerPhone"
            name="customerPhone"
            required
            className={inputClassName}
            placeholder="Phone number on file"
          />
        </FormField>
      ) : (
        <>
          <FormField
            id="firstName"
            label="First name"
            error={state.fieldErrors?.firstName?.[0]}
          >
            <input id="firstName" name="firstName" required className={inputClassName} />
          </FormField>
          <FormField
            id="lastName"
            label="Last name"
            error={state.fieldErrors?.lastName?.[0]}
          >
            <input id="lastName" name="lastName" required className={inputClassName} />
          </FormField>
          <FormField id="phone" label="Phone" error={state.fieldErrors?.phone?.[0]}>
            <input id="phone" name="phone" className={inputClassName} />
          </FormField>
        </>
      )}

      {vehicleMode === "existing" ? (
        <FormField
          id="vehicleLicensePlate"
          label="Existing vehicle plate"
          error={state.fieldErrors?.vehicleLicensePlate?.[0]}
        >
          <input
            id="vehicleLicensePlate"
            name="vehicleLicensePlate"
            required
            className={inputClassName}
            placeholder="Exact customer plate"
          />
        </FormField>
      ) : (
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
      )}

      <FormField id="note" label="Note" error={state.fieldErrors?.note?.[0]}>
        <textarea id="note" name="note" className={textareaClassName} />
      </FormField>

      <Button type="submit" disabled={isPending || services.length === 0}>
        {isPending ? "Creating..." : "Create walk-in booking"}
      </Button>
    </form>
  );
}
