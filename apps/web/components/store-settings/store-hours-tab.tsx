"use client"

import { useActionState, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import {
  ServiceStoreButton,
  ServiceStoreCard,
  serviceStoreInputClassName,
} from "@/components/service-store/ui"
import { DAY_LABELS } from "@/lib/booking/engine/time"
import { saveStoreHours, type StoreSettingsActionResult } from "@/lib/service-store/store-settings-actions"
import type { StoreSettingsHoursDay } from "@/lib/service-store/store-settings-queries"

type StoreHoursTabProps = {
  hours: StoreSettingsHoursDay[]
}

const initialState: StoreSettingsActionResult = { ok: true }

const DAY_SHORT_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

const compactTimeInputClassName = cn(
  serviceStoreInputClassName,
  "h-9 px-3 text-sm",
)

type StoreHoursDayRowProps = {
  dayOfWeek: number
  day: StoreSettingsHoursDay
  hasError?: boolean
}

function StoreHoursDayRow({ dayOfWeek, day, hasError }: StoreHoursDayRowProps) {
  const [isOpen, setIsOpen] = useState(!day.isClosed)
  const prefix = `day-${dayOfWeek}`

  return (
    <div
      className={cn(
        "grid items-center gap-3 border-b border-border py-3 last:border-b-0 sm:grid-cols-[5.5rem_7.5rem_1fr_1fr] sm:gap-4",
        hasError && "bg-red-50/40 dark:bg-red-950/10",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground sm:hidden">{DAY_LABELS[dayOfWeek]}</p>
        <p className="hidden text-sm font-medium text-foreground sm:block">
          {DAY_SHORT_LABELS[dayOfWeek]}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:justify-start">
        <button
          type="button"
          role="switch"
          aria-checked={isOpen}
          aria-label={`${DAY_LABELS[dayOfWeek]} ${isOpen ? "open" : "closed"}`}
          onClick={() => setIsOpen((current) => !current)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
            isOpen
              ? "bg-[#16A34A] dark:bg-primary"
              : "bg-muted",
          )}
        >
          <span
            className={cn(
              "pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
              isOpen ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
        <span className="text-xs font-medium text-muted-foreground">
          {isOpen ? "Open" : "Closed"}
        </span>
        {!isOpen ? <input type="hidden" name={`${prefix}-isClosed`} value="true" /> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:contents">
        <div className="min-w-0">
          <label htmlFor={`${prefix}-openTime`} className="mb-1 block text-xs text-muted-foreground sm:sr-only">
            Opens
          </label>
          <input
            id={`${prefix}-openTime`}
            name={`${prefix}-openTime`}
            type="time"
            required={isOpen}
            disabled={!isOpen}
            className={compactTimeInputClassName}
            defaultValue={day.openTime}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor={`${prefix}-closeTime`} className="mb-1 block text-xs text-muted-foreground sm:sr-only">
            Closes
          </label>
          <input
            id={`${prefix}-closeTime`}
            name={`${prefix}-closeTime`}
            type="time"
            required={isOpen}
            disabled={!isOpen}
            className={compactTimeInputClassName}
            defaultValue={day.closeTime}
          />
        </div>
      </div>
    </div>
  )
}

export function StoreHoursTab({ hours }: StoreHoursTabProps) {
  const [state, formAction, isPending] = useActionState(saveStoreHours, initialState)
  const hoursByDay = new Map(hours.map((hour) => [hour.dayOfWeek, hour]))

  return (
    <ServiceStoreCard className="max-w-4xl space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Opening hours</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your weekly business hours for customer bookings.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
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

        <div className="rounded-xl border border-border bg-muted/15 px-4">
          <div className="hidden border-b border-border py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:grid sm:grid-cols-[5.5rem_7.5rem_1fr_1fr] sm:gap-4">
            <span>Day</span>
            <span>Status</span>
            <span>Opens</span>
            <span>Closes</span>
          </div>

          {DAY_LABELS.map((_, dayOfWeek) => {
            const day = hoursByDay.get(dayOfWeek) ?? {
              dayOfWeek,
              openTime: "09:00",
              closeTime: "18:00",
              isClosed: dayOfWeek === 0 || dayOfWeek === 6,
            }

            return (
              <StoreHoursDayRow
                key={dayOfWeek}
                dayOfWeek={dayOfWeek}
                day={day}
                hasError={!state.ok && Boolean(state.fieldErrors)}
              />
            )
          })}
        </div>

        <div className="flex justify-end">
          <ServiceStoreButton
            type="submit"
            disabled={isPending}
            className="h-9 px-3.5 text-sm"
          >
            {isPending ? "Saving…" : "Save changes"}
          </ServiceStoreButton>
        </div>
      </form>
    </ServiceStoreCard>
  )
}
