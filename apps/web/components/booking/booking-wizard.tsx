"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  BookingSummaryPanel,
  formatSummaryDate,
  formatSummaryTime,
} from "@/components/booking/booking-summary-panel";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { CustomerStickyFooter } from "@/components/customer/customer-ui";
import {
  Button,
  ButtonLink,
  Card,
  CustomerFormField,
  EmptyState,
  SelectField,
  Skeleton,
  TextareaField,
  TextField,
} from "@/components/customer/ui";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";
import { createBooking, type BookingActionState } from "@/lib/booking/actions";
import { formatBookingTime, formatPrice } from "@/lib/booking/format";
import { getServiceDisplayDescription } from "@/lib/booking/customer-display";
import { formatVehicleSelectLabel } from "@/lib/customer/vehicle-format";
import { cn } from "@workspace/ui/lib/utils";

export type BookingWizardService = {
  id: string;
  name: string;
  duration: number;
  bufferMinutes: number;
  price: string;
  branchId: string;
  branchName: string;
};

export type BookingWizardBranch = {
  id: string;
  name: string;
  address: string | null;
};

export type BookingWizardVehicle = {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  province: string | null;
  color: string | null;
};

type AvailableSlot = {
  startTime: string;
  label: string;
};

export type BookingWizardProps = {
  serviceStoreId: string;
  storeDescription?: string | null;
  services: BookingWizardService[];
  branches: BookingWizardBranch[];
  vehicles: BookingWizardVehicle[];
  customerPhone?: string | null;
  initialServiceId?: string;
  initialBranchId?: string;
  initialVehicleId?: string;
  backHref: string;
};

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

function todayDateValue() {
  return dateValueFromOffset(0);
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-[13px] font-semibold tracking-wide text-[#94A3B8] uppercase">{title}</h2>
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
        "min-h-[44px] shrink-0 rounded-full border px-5 text-[14px] font-semibold transition-all",
        selected
          ? "border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]"
          : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1]",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function BookingWizard({
  serviceStoreId,
  storeDescription,
  services,
  branches,
  vehicles,
  customerPhone,
  initialServiceId,
  initialBranchId,
  initialVehicleId,
  backHref,
}: BookingWizardProps) {
  const [selectedServiceId, setSelectedServiceId] = useState(
    initialServiceId ?? services[0]?.id ?? "",
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId ?? vehicles[0]?.id ?? "");
  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">(
    vehicles.length === 0 ? "new" : "existing",
  );

  const [calendarDate, setCalendarDate] = useState(todayDateValue());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(createBooking, initialState);

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? null;
  const resolvedBranchId = selectedService?.branchId ?? initialBranchId ?? "";
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
  const totalDuration = (selectedService?.duration ?? 0) + (selectedService?.bufferMinutes ?? 0);
  const showBranchHint = branches.length > 1;

  useEffect(() => {
    if (!resolvedBranchId || !selectedServiceId) return;

    let cancelled = false;

    async function fetchSlotsForDate(date: string): Promise<AvailableSlot[]> {
      const params = new URLSearchParams({ serviceId: selectedServiceId, date });
      const response = await fetch(
        `/api/branches/${resolvedBranchId}/available-slots?${params.toString()}`,
      );
      if (!response.ok) throw new Error("slots");
      const data = (await response.json()) as { slots: AvailableSlot[] };
      return data.slots;
    }

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedSlot(null);
      setSelectedSlotLabel(null);
      try {
        let nextSlots = await fetchSlotsForDate(calendarDate);

        // After shop close time, today returns []. Jump to the next day with slots
        // so Book Now does not land on an empty times grid.
        if (nextSlots.length === 0 && calendarDate === todayDateValue()) {
          for (let offset = 1; offset <= 14; offset += 1) {
            const candidate = dateValueFromOffset(offset);
            const candidateSlots = await fetchSlotsForDate(candidate);
            if (cancelled) return;
            if (candidateSlots.length > 0) {
              if (!cancelled) {
                setCalendarDate(candidate);
                setSlots(candidateSlots);
              }
              return;
            }
          }
        }

        if (!cancelled) setSlots(nextSlots);
      } catch {
        if (!cancelled) {
          setSlots([]);
          setSlotsError("Could not load available slots.");
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }
    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [resolvedBranchId, calendarDate, selectedServiceId]);

  const estimatedFinishLabel = useMemo(() => {
    if (!selectedSlot) return null;
    return formatBookingTime(new Date(new Date(selectedSlot).getTime() + totalDuration * 60_000));
  }, [selectedSlot, totalDuration]);

  const missingRequirements = [
    !selectedServiceId && "a service",
    !selectedSlot && "a date & time",
    vehicleMode === "existing" && !selectedVehicleId && "a vehicle",
  ].filter((value): value is string => Boolean(value));

  const canSubmit = missingRequirements.length === 0 && !isPending;

  return (
    <form action={formAction} className="pb-32 lg:pb-24">
      <input type="hidden" name="branchId" value={resolvedBranchId} />
      <input type="hidden" name="serviceId" value={selectedServiceId} />
      <input type="hidden" name="bookingDate" value={selectedSlot ?? ""} />
      <input type="hidden" name="vehicleMode" value={vehicleMode} />
      <input type="hidden" name="vehicleId" value={vehicleMode === "existing" ? selectedVehicleId : ""} />

      {state.error ? (
        <p className="mb-6 rounded-[16px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-6">
          {/* Vehicle */}
          <Card className="space-y-4">
            <SectionTitle title="Vehicle" />
            {vehicles.length > 0 ? (
              <>
                <div className="flex gap-2">
                  <SelectChip selected={vehicleMode === "existing"} onClick={() => setVehicleMode("existing")}>
                    My vehicles
                  </SelectChip>
                  <SelectChip selected={vehicleMode === "new"} onClick={() => setVehicleMode("new")}>
                    Add new vehicle
                  </SelectChip>
                </div>
                {vehicleMode === "existing" ? (
                  <CustomerFormField
                    id="vehicleId"
                    label="Select vehicle"
                    error={state.fieldErrors?.vehicleId?.[0]}
                  >
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
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CustomerFormField
                      id="vehicleLicensePlate"
                      label="License plate"
                      error={state.fieldErrors?.vehicleLicensePlate?.[0]}
                    >
                      <TextField id="vehicleLicensePlate" name="vehicleLicensePlate" required />
                    </CustomerFormField>
                    <CustomerFormField
                      id="vehicleBrand"
                      label="Brand"
                      error={state.fieldErrors?.vehicleBrand?.[0]}
                    >
                      <TextField id="vehicleBrand" name="vehicleBrand" required />
                    </CustomerFormField>
                    <CustomerFormField
                      id="vehicleModel"
                      label="Model"
                      error={state.fieldErrors?.vehicleModel?.[0]}
                    >
                      <TextField id="vehicleModel" name="vehicleModel" required />
                    </CustomerFormField>
                    <CustomerFormField id="vehicleProvince" label="Province">
                      <TextField id="vehicleProvince" name="vehicleProvince" />
                    </CustomerFormField>
                  </div>
                )}
              </>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <EmptyState
                    title="Add your vehicle"
                    description="We need your car details to complete the booking."
                  />
                </div>
                <CustomerFormField
                  id="vehicleLicensePlate"
                  label="License plate"
                  error={state.fieldErrors?.vehicleLicensePlate?.[0]}
                >
                  <TextField id="vehicleLicensePlate" name="vehicleLicensePlate" required />
                </CustomerFormField>
                <CustomerFormField
                  id="vehicleBrand"
                  label="Brand"
                  error={state.fieldErrors?.vehicleBrand?.[0]}
                >
                  <TextField id="vehicleBrand" name="vehicleBrand" required />
                </CustomerFormField>
                <CustomerFormField
                  id="vehicleModel"
                  label="Model"
                  error={state.fieldErrors?.vehicleModel?.[0]}
                >
                  <TextField id="vehicleModel" name="vehicleModel" required />
                </CustomerFormField>
              </div>
            )}
          </Card>

          {/* Service */}
          <Card className="space-y-4">
            <SectionTitle title="Service" />
            {services.length === 0 ? (
              <EmptyState
                title="No services available"
                description="This shop has not published services yet. Try another store."
                action={
                  <ButtonLink href={backHref} variant="secondary">
                    Back to shop
                  </ButtonLink>
                }
              />
            ) : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedServiceId(service.id)}
                  className={cn(
                    "flex gap-3 rounded-[20px] border-2 bg-white p-4 text-left transition-colors",
                    selectedServiceId === service.id
                      ? "border-[#16A34A] bg-[#F0FDF4]"
                      : "border-[#E8EDF2] hover:border-[#CBD5E1]",
                  )}
                >
                  <ServiceShopImage
                    serviceStoreId={serviceStoreId}
                    serviceStoreName={service.name}
                    slot={service.name.length % 5}
                    className="size-16 shrink-0 rounded-[12px]"
                    sizes="64px"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0F172A]">{service.name}</p>
                    <p className="mt-1 line-clamp-2 text-[13px] text-[#64748B]">
                      {getServiceDisplayDescription(service.name, storeDescription)}
                    </p>
                    {showBranchHint ? (
                      <p className="mt-1 text-[12px] text-[#94A3B8]">{service.branchName}</p>
                    ) : null}
                    <p className="mt-2 flex items-center gap-2 text-[13px]">
                      <span className="text-[#64748B]">{service.duration} min</span>
                      <span className="text-[#CBD5E1]">·</span>
                      <span className="font-semibold text-[#16A34A]">{formatPrice(service.price)}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Date & Time */}
          <Card className="space-y-6">
            <SectionTitle title="Date & time" />
            <div className="flex flex-col gap-6 md:flex-row md:gap-8">
              <div className="shrink-0 md:w-[300px]">
                <BookingCalendar
                  value={calendarDate}
                  onChange={setCalendarDate}
                  minDateValue={todayDateValue()}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#64748B]">
                  Available times · {formatSummaryDate(calendarDate)}
                </p>
                <div className="mt-3">
                  {slotsLoading ? (
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-11 w-24 rounded-full" />
                      ))}
                    </div>
                  ) : slotsError ? (
                    <p className="text-[14px] text-red-600">{slotsError}</p>
                  ) : slots.length === 0 ? (
                    <p className="text-[14px] text-[#64748B]">
                      {calendarDate === todayDateValue()
                        ? "No more times left today. Pick another date on the calendar."
                        : "No slots available on this date. Try another day."}
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
                        >
                          {slot.label}
                        </SelectChip>
                      ))}
                    </div>
                  )}
                </div>
                {state.fieldErrors?.bookingDate?.[0] ? (
                  <p className="mt-3 text-[14px] text-red-600">{state.fieldErrors.bookingDate[0]}</p>
                ) : null}
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="space-y-4">
            <SectionTitle title="Customer information" />
            <div className="grid gap-4 sm:grid-cols-2">
              <CustomerFormField id="contactPhone" label="Phone number">
                <TextField
                  id="contactPhone"
                  type="tel"
                  inputMode="tel"
                  defaultValue={customerPhone ?? ""}
                  placeholder="e.g. 081-234-5678"
                />
              </CustomerFormField>
            </div>
            <CustomerFormField id="note" label="Notes (optional)" error={state.fieldErrors?.note?.[0]}>
              <TextareaField
                id="note"
                name="note"
                rows={3}
                maxLength={1000}
                placeholder="Anything the shop should know before you arrive?"
              />
            </CustomerFormField>
          </Card>
        </div>

        {/* Booking Summary (sticky on desktop) */}
        <div className="lg:sticky lg:top-6">
          <BookingSummaryPanel
            vehicleLabel={
              vehicleMode === "existing" && selectedVehicle
                ? formatVehicleSelectLabel(selectedVehicle)
                : "New vehicle"
            }
            licensePlate={vehicleMode === "existing" ? (selectedVehicle?.licensePlate ?? null) : null}
            serviceName={selectedService?.name ?? null}
            servicePrice={selectedService?.price ?? null}
            durationMinutes={selectedService ? totalDuration : null}
            dateLabel={formatSummaryDate(calendarDate)}
            timeLabel={selectedSlotLabel ?? (selectedSlot ? formatSummaryTime(selectedSlot) : null)}
            estimatedFinishLabel={estimatedFinishLabel}
          />
        </div>
      </div>

      <CustomerStickyFooter>
        <div className="flex flex-col gap-3">
          {missingRequirements.length > 0 ? (
            <p className="text-[13px] text-[#94A3B8]">
              Select {missingRequirements.join(" and ")} to continue.
            </p>
          ) : null}
          <div className="flex gap-3">
            <ButtonLink href={backHref} variant="secondary" className="flex-1">
              Back
            </ButtonLink>
            <Button type="submit" className="flex-[2]" disabled={!canSubmit}>
              {isPending ? "Confirming…" : "Confirm booking"}
            </Button>
          </div>
        </div>
      </CustomerStickyFooter>
    </form>
  );
}
