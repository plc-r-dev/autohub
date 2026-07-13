"use client"

import { useActionState } from "react"
import {
  ServiceStoreButton,
  ServiceStoreCard,
  ServiceStoreFormField,
  serviceStoreInputClassName,
} from "@/components/service-store/ui"
import { DAY_LABELS } from "@/lib/booking/engine/time"
import { saveStoreHours, type StoreSettingsActionResult } from "@/lib/service-store/store-settings-actions"
import type { StoreSettingsHoursDay } from "@/lib/service-store/store-settings-queries"

type StoreHoursTabProps = {
  hours: StoreSettingsHoursDay[]
}

const initialState: StoreSettingsActionResult = { ok: true }

export function StoreHoursTab({ hours }: StoreHoursTabProps) {
  const [state, formAction, isPending] = useActionState(saveStoreHours, initialState)
  const hoursByDay = new Map(hours.map((hour) => [hour.dayOfWeek, hour]))

  return (
    <ServiceStoreCard className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Opening hours</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your weekly business hours for customer bookings.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {!state.ok && state.error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {state.error}
          </p>
        ) : null}
        {state.ok && state.message ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {DAY_LABELS.map((label, dayOfWeek) => {
            const day = hoursByDay.get(dayOfWeek) ?? {
              dayOfWeek,
              openTime: "09:00",
              closeTime: "18:00",
              isClosed: dayOfWeek === 0 || dayOfWeek === 6,
            }
            const prefix = `day-${dayOfWeek}`

            return (
              <div
                key={dayOfWeek}
                className="grid gap-4 rounded-2xl border border-border bg-muted/20 p-4 sm:grid-cols-[7rem_1fr_1fr_auto] sm:items-end"
              >
                <p className="text-sm font-semibold text-foreground">{label}</p>

                <ServiceStoreFormField
                  id={`${prefix}-openTime`}
                  label="Opening time"
                  error={!state.ok ? state.fieldErrors?.openTime?.[0] : undefined}
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
                  label="Closing time"
                  error={!state.ok ? state.fieldErrors?.closeTime?.[0] : undefined}
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

                <label className="flex items-center gap-2 pb-2 text-sm font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    name={`${prefix}-isClosed`}
                    value="true"
                    defaultChecked={day.isClosed}
                    className="size-4 rounded border-border"
                  />
                  Closed
                </label>
              </div>
            )
          })}
        </div>

        <ServiceStoreButton type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Saving…" : "Save changes"}
        </ServiceStoreButton>
      </form>
    </ServiceStoreCard>
  )
}
