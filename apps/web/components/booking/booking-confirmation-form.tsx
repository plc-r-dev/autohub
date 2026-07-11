"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";
import {
  BookingSummaryPanel,
  formatSummaryDate,
  formatSummaryTime,
} from "@/components/booking/booking-summary-panel";
import { CustomerStickyFooter } from "@/components/customer/customer-ui";
import {
  Button,
  ButtonLink,
  Card,
  CustomerFormField,
  EmptyState,
  SelectField,
  Skeleton,
  TextField,
} from "@/components/customer/ui";
import { createBooking, type BookingActionState } from "@/lib/booking/actions";
import { formatBookingTime, formatPrice } from "@/lib/booking/format";
import { formatVehicleSelectLabel } from "@/lib/customer/vehicle-format";
import { cn } from "@workspace/ui/lib/utils";

type AvailableSlot = {
  startTime: string;
  label: string;
};

export type VehicleOption = {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  province: string | null;
  color: string | null;
};

type ServiceOption = {
  id: string;
  name: string;
  duration: number;
  bufferMinutes: number;
  price: string;
};

type BookingConfirmationFormProps = {
  serviceStoreId: string;
  serviceStoreName: string;
  branchName: string;
  branchAddress: string | null;
  branchId: string;
  serviceId: string;
  service: ServiceOption;
  vehicles: VehicleOption[];
  defaultVehicleId?: string;
  backHref: string;
};

type DateMode = "today" | "tomorrow" | "calendar";

const initialState: BookingActionState = {};

function dateValueFromOffset(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function todayDateValue(): string {
  return dateValueFromOffset(0);
}

function tomorrowDateValue(): string {
  return dateValueFromOffset(1);
}

function dateForMode(mode: DateMode, calendarDate: string): string {
  if (mode === "today") return todayDateValue();
  if (mode === "tomorrow") return tomorrowDateValue();
  return calendarDate;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[13px] font-semibold tracking-wide text-[#94A3B8] uppercase">{title}</h2>
      {subtitle ? <p className="mt-1 text-[14px] text-[#64748B]">{subtitle}</p> : null}
    </div>
  );
}

function SelectChip({
  selected,
  onClick,
  children,
  className,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-5 py-2.5 text-[14px] font-semibold transition-all",
        selected
          ? "border-[#0F9B76] bg-[#ECFDF5] text-[#0F9B76]"
          : "border-[#E2E8F0] bg-white text-[#0A0A0A] hover:border-[#CBD5E1]",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

function buildAddVehicleHref(branchId: string, serviceId: string): string {
  const returnTo = encodeURIComponent(
    `/bookings/new?branchId=${branchId}&serviceId=${serviceId}`,
  );
  return `/vehicles/new?returnTo=${returnTo}`;
}

export function BookingConfirmationForm({
  serviceStoreId,
  serviceStoreName,
  branchName,
  branchAddress,
  branchId,
  serviceId,
  service,
  vehicles,
  defaultVehicleId,
  backHref,
}: BookingConfirmationFormProps) {
  const [state, formAction, isPending] = useActionState(createBooking, initialState);

  const initialVehicleId =
    defaultVehicleId && vehicles.some((vehicle) => vehicle.id === defaultVehicleId)
      ? defaultVehicleId
      : (vehicles[0]?.id ?? "");

  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId);
  const [dateMode, setDateMode] = useState<DateMode>("today");
  const [calendarDate, setCalendarDate] = useState(todayDateValue());
  const selectedDate = dateForMode(dateMode, calendarDate);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId],
  );

  const totalDuration = service.duration + service.bufferMinutes;

  const estimatedFinishLabel = useMemo(() => {
    if (!selectedSlot) return null;
    const finish = new Date(selectedSlot);
    finish.setMinutes(finish.getMinutes() + totalDuration);
    return formatBookingTime(finish);
  }, [selectedSlot, totalDuration]);

  const vehicleSelected = Boolean(selectedVehicleId);
  const canConfirm =
    vehicleSelected && Boolean(selectedSlot) && Boolean(selectedDate) && !isPending;

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedSlot(null);
      setSelectedSlotLabel(null);

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

  function handleDateModeChange(mode: DateMode) {
    setDateMode(mode);
    setSelectedSlot(null);
    setSelectedSlotLabel(null);
  }

  const vehicleLabel = selectedVehicle
    ? formatVehicleSelectLabel(selectedVehicle)
    : null;

  const summaryProps = {
    serviceStoreName,
    branchName,
    vehicleLabel,
    serviceName: service.name,
    servicePrice: service.price,
    durationMinutes: totalDuration,
    dateLabel: formatSummaryDate(selectedDate),
    timeLabel: selectedSlotLabel ?? (selectedSlot ? formatSummaryTime(selectedSlot) : null),
    estimatedFinishLabel,
  };

  return (
    <form action={formAction} className="pb-32">
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="bookingDate" value={selectedSlot ?? ""} />
      <input type="hidden" name="vehicleMode" value="existing" />
      <input type="hidden" name="vehicleId" value={selectedVehicleId} />
      <input type="hidden" name="note" value="" />

      {state.error ? (
        <p className="mb-6 rounded-[16px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-6">
        <Card padding={false} className="overflow-hidden">
          <ServiceShopImage
            serviceStoreId={serviceStoreId}
            serviceStoreName={serviceStoreName}
            className="h-44 md:h-52"
            sizes="100vw"
          />
          <div className="p-6">
            <SectionTitle title="Service shop" />
            <p className="text-[22px] font-semibold tracking-tight text-[#0A0A0A]">{serviceStoreName}</p>
            <p className="mt-1 text-[15px] font-medium text-[#0F9B76]">{branchName}</p>
            {branchAddress ? (
              <p className="mt-3 flex items-start gap-2 text-[14px] leading-relaxed text-[#64748B]">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {branchAddress}
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Selected service" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[18px] font-semibold text-[#0A0A0A]">{service.name}</p>
              <p className="mt-2 text-[14px] text-[#64748B]">
                {service.duration} min service · {service.bufferMinutes} min buffer
              </p>
            </div>
            <p className="text-[20px] font-semibold text-[#0F9B76]">{formatPrice(service.price)}</p>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Vehicle" />
          {vehicles.length === 0 ? (
            <EmptyState
              title="Add your first vehicle"
              description="Save your car to complete this booking."
              action={
                <ButtonLink href={buildAddVehicleHref(branchId, serviceId)}>
                  Add vehicle
                </ButtonLink>
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              <CustomerFormField id="vehicleId" label="Vehicle">
                <SelectField
                  id="vehicleId"
                  value={selectedVehicleId}
                  onChange={(event) => setSelectedVehicleId(event.target.value)}
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {formatVehicleSelectLabel(vehicle)}
                    </option>
                  ))}
                </SelectField>
              </CustomerFormField>

              <Link
                href={buildAddVehicleHref(branchId, serviceId)}
                className="text-[14px] font-semibold text-[#0F9B76]"
              >
                Add another vehicle
              </Link>
            </div>
          )}
          {state.fieldErrors?.vehicleId?.[0] ? (
            <p className="mt-3 text-[14px] text-red-600">{state.fieldErrors.vehicleId[0]}</p>
          ) : null}
        </Card>

        <Card>
          <SectionTitle title="Booking date" />
          <div className="flex flex-wrap gap-2">
            <SelectChip
              selected={dateMode === "today"}
              onClick={() => handleDateModeChange("today")}
            >
              Today
            </SelectChip>
            <SelectChip
              selected={dateMode === "tomorrow"}
              onClick={() => handleDateModeChange("tomorrow")}
            >
              Tomorrow
            </SelectChip>
            <SelectChip
              selected={dateMode === "calendar"}
              onClick={() => handleDateModeChange("calendar")}
            >
              {dateMode === "calendar" ? formatSummaryDate(calendarDate) : "Pick date"}
            </SelectChip>
          </div>
          {dateMode === "calendar" ? (
            <div className="mt-4">
              <CustomerFormField id="calendarDate" label="Date" hideLabel>
                <TextField
                  id="calendarDate"
                  type="date"
                  min={todayDateValue()}
                  value={calendarDate}
                  onChange={(event) => {
                    setCalendarDate(event.target.value);
                    setSelectedSlot(null);
                    setSelectedSlotLabel(null);
                  }}
                />
              </CustomerFormField>
            </div>
          ) : null}
          {state.fieldErrors?.bookingDate?.[0] ? (
            <p className="mt-3 text-[14px] text-red-600">{state.fieldErrors.bookingDate[0]}</p>
          ) : null}
        </Card>

        <Card>
          <SectionTitle title="Available time" subtitle={formatSummaryDate(selectedDate)} />
          {slotsLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-[88px] rounded-full" />
              ))}
            </div>
          ) : slotsError ? (
            <p className="text-[14px] text-red-600">{slotsError}</p>
          ) : slots.length === 0 ? (
            <p className="text-[14px] text-[#64748B]">
              No available slots for this date. Try another day.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <SelectChip
                  key={slot.startTime}
                  selected={selectedSlot === slot.startTime}
                  onClick={() => {
                    setSelectedSlot(slot.startTime);
                    setSelectedSlotLabel(slot.label);
                  }}
                  className="min-w-[88px]"
                >
                  {slot.label}
                </SelectChip>
              ))}
            </div>
          )}
        </Card>

        <BookingSummaryPanel {...summaryProps} />
      </div>

      <CustomerStickyFooter>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={backHref} variant="secondary" className="w-full sm:flex-1">
            Back
          </ButtonLink>
          <Button type="submit" disabled={!canConfirm} className="w-full sm:flex-[2]">
            {isPending ? "Confirming…" : "Confirm booking"}
          </Button>
        </div>
      </CustomerStickyFooter>
    </form>
  );
}
