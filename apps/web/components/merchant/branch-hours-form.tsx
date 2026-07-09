"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
} from "@/components/onboarding/form-field";
import { DAY_LABELS } from "@/lib/booking/engine/time";
import {
  updateBranchOperatingHours,
  type CatalogActionState,
} from "@/lib/merchant/catalog-actions";

type DayHours = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

type BranchHoursFormProps = {
  branchId: string;
  hours: DayHours[];
};

const initialState: CatalogActionState = {};

export function BranchHoursForm({ branchId, hours }: BranchHoursFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBranchOperatingHours.bind(null, branchId),
    initialState,
  );

  const hoursByDay = new Map(hours.map((hour) => [hour.dayOfWeek, hour]));

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <div className="flex flex-col gap-3">
        {DAY_LABELS.map((label, dayOfWeek) => {
          const day = hoursByDay.get(dayOfWeek) ?? {
            dayOfWeek,
            openTime: "09:00",
            closeTime: "18:00",
            isClosed: dayOfWeek === 0 || dayOfWeek === 6,
          };
          const prefix = `day-${dayOfWeek}`;

          return (
            <div
              key={dayOfWeek}
              className="border-input grid gap-3 rounded-md border p-4 sm:grid-cols-[8rem_1fr_1fr_auto]"
            >
              <p className="font-medium">{label}</p>

              <FormField
                id={`${prefix}-openTime`}
                label="Opens"
                error={state.fieldErrors?.openTime?.[0]}
              >
                <input
                  id={`${prefix}-openTime`}
                  name={`${prefix}-openTime`}
                  type="time"
                  required
                  className={inputClassName}
                  defaultValue={day.openTime}
                  disabled={day.isClosed}
                />
              </FormField>

              <FormField
                id={`${prefix}-closeTime`}
                label="Closes"
                error={state.fieldErrors?.closeTime?.[0]}
              >
                <input
                  id={`${prefix}-closeTime`}
                  name={`${prefix}-closeTime`}
                  type="time"
                  required
                  className={inputClassName}
                  defaultValue={day.closeTime}
                  disabled={day.isClosed}
                />
              </FormField>

              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  name={`${prefix}-isClosed`}
                  value="true"
                  defaultChecked={day.isClosed}
                />
                Closed
              </label>
            </div>
          );
        })}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save operating hours"}
      </Button>
    </form>
  );
}
