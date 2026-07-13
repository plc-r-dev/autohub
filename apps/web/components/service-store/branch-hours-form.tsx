"use client";

import { useActionState } from "react";
import {
  ServiceStoreButton,
  ServiceStoreCard,
  ServiceStoreFormField,
  serviceStoreInputClassName,
} from "@/components/service-store/ui";
import { DAY_LABELS } from "@/lib/booking/engine/time";
import {
  updateBranchOperatingHours,
  type CatalogActionState,
} from "@/lib/service-store/catalog-actions";

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
    <form action={formAction} className="flex max-w-3xl flex-col gap-5">
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
      ) : null}

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
            <ServiceStoreCard
              key={dayOfWeek}
              className="grid gap-4 sm:grid-cols-[7rem_1fr_1fr_auto] sm:items-end"
            >
              <p className="text-sm font-semibold text-[#0F172A]">{label}</p>

              <ServiceStoreFormField
                id={`${prefix}-openTime`}
                label="Opens"
                error={state.fieldErrors?.openTime?.[0]}
              >
                <input
                  id={`${prefix}-openTime`}
                  name={`${prefix}-openTime`}
                  type="time"
                  required
                  className={serviceStoreInputClassName}
                  defaultValue={day.openTime}
                  disabled={day.isClosed}
                />
              </ServiceStoreFormField>

              <ServiceStoreFormField
                id={`${prefix}-closeTime`}
                label="Closes"
                error={state.fieldErrors?.closeTime?.[0]}
              >
                <input
                  id={`${prefix}-closeTime`}
                  name={`${prefix}-closeTime`}
                  type="time"
                  required
                  className={serviceStoreInputClassName}
                  defaultValue={day.closeTime}
                  disabled={day.isClosed}
                />
              </ServiceStoreFormField>

              <label className="flex items-center gap-2 pb-2 text-sm font-medium text-[#5b6b7a]">
                <input
                  type="checkbox"
                  name={`${prefix}-isClosed`}
                  value="true"
                  defaultChecked={day.isClosed}
                  className="size-4 rounded border-[#dce5ee]"
                />
                Closed
              </label>
            </ServiceStoreCard>
          );
        })}
      </div>

      <ServiceStoreButton type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving…" : "Save operating hours"}
      </ServiceStoreButton>
    </form>
  );
}
