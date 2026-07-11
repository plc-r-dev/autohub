"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";
import { createBooking, type BookingActionState } from "@/lib/booking/actions";
import {
  BOOKING_WIZARD_STEP,
  buildBookingWizardHref,
  type BookingWizardStep,
  wizardStepLabel,
} from "@/lib/booking/wizard";
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
  serviceStoreName: string;
  storeDescription?: string | null;
  initialStep: BookingWizardStep;
  services: BookingWizardService[];
  branches: BookingWizardBranch[];
  vehicles: BookingWizardVehicle[];
  initialServiceId?: string;
  initialBranchId?: string;
  initialVehicleId?: string;
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

function todayDateValue() {
  return dateValueFromOffset(0);
}

function tomorrowDateValue() {
  return dateValueFromOffset(1);
}

function dateForMode(mode: DateMode, calendarDate: string) {
  if (mode === "today") return todayDateValue();
  if (mode === "tomorrow") return tomorrowDateValue();
  return calendarDate;
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
        "min-h-[48px] shrink-0 rounded-full border px-5 text-[15px] font-semibold transition-all",
        selected
          ? "border-[#062C21] bg-[#062C21] text-white"
          : "border-[#E2E8F0] bg-white text-[#0A0A0A]",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

function StepProgress({ step }: { step: BookingWizardStep }) {
  const index = [
    BOOKING_WIZARD_STEP.SERVICE,
    BOOKING_WIZARD_STEP.BRANCH,
    BOOKING_WIZARD_STEP.VEHICLE,
    BOOKING_WIZARD_STEP.DATE,
    BOOKING_WIZARD_STEP.TIME,
    BOOKING_WIZARD_STEP.REVIEW,
  ].indexOf(step);

  return (
    <div className="mb-6 flex items-center gap-2">
      {[0, 1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            dot <= index ? "bg-[#062C21]" : "bg-[#E2E8F0]",
          )}
        />
      ))}
    </div>
  );
}

export function BookingWizard({
  serviceStoreId,
  serviceStoreName,
  storeDescription,
  initialStep,
  services,
  branches,
  vehicles,
  initialServiceId,
  initialBranchId,
  initialVehicleId,
  backHref,
}: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<BookingWizardStep>(initialStep);
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId ?? "");
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId ?? "");
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId ?? vehicles[0]?.id ?? "");
  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">(
    vehicles.length === 0 ? "new" : "existing",
  );

  const [dateMode, setDateMode] = useState<DateMode>("today");
  const [calendarDate, setCalendarDate] = useState(todayDateValue());
  const selectedDate = dateForMode(dateMode, calendarDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(createBooking, initialState);

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? null;
  const branchOptions = useMemo(() => {
    if (!selectedServiceId) return branches;
    const service = services.find((row) => row.id === selectedServiceId);
    if (!service) return branches;
    return branches.filter((branch) => branch.id === service.branchId);
  }, [branches, selectedServiceId, services]);

  const resolvedBranchId = selectedBranchId || selectedService?.branchId || "";
  const selectedBranch = branches.find((branch) => branch.id === resolvedBranchId) ?? null;
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
  const totalDuration = (selectedService?.duration ?? 0) + (selectedService?.bufferMinutes ?? 0);

  function syncUrl(next: {
    step?: BookingWizardStep;
    serviceId?: string;
    branchId?: string;
    vehicleId?: string;
  }) {
    const href = buildBookingWizardHref({
      serviceStoreId,
      serviceId: next.serviceId ?? selectedServiceId,
      branchId: next.branchId ?? resolvedBranchId,
      vehicleId: next.vehicleId ?? selectedVehicleId,
      step: next.step ?? step,
    });
    router.replace(href, { scroll: false });
  }

  function goTo(nextStep: BookingWizardStep) {
    setStep(nextStep);
    syncUrl({ step: nextStep });
  }

  useEffect(() => {
    if (step !== BOOKING_WIZARD_STEP.TIME && step !== BOOKING_WIZARD_STEP.REVIEW) {
      return;
    }
    if (!resolvedBranchId || !selectedServiceId) return;

    let cancelled = false;
    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedSlot(null);
      setSelectedSlotLabel(null);
      try {
        const params = new URLSearchParams({ serviceId: selectedServiceId, date: selectedDate });
        const response = await fetch(
          `/api/branches/${resolvedBranchId}/available-slots?${params.toString()}`,
        );
        if (!response.ok) throw new Error("slots");
        const data = (await response.json()) as { slots: AvailableSlot[] };
        if (!cancelled) setSlots(data.slots);
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
  }, [resolvedBranchId, selectedDate, selectedServiceId, step]);

  const canProceedVehicle =
    vehicleMode === "new" ||
    Boolean(selectedVehicleId && vehicles.some((vehicle) => vehicle.id === selectedVehicleId));

  return (
    <form action={formAction} className="pb-28">
      <input type="hidden" name="branchId" value={resolvedBranchId} />
      <input type="hidden" name="serviceId" value={selectedServiceId} />
      <input type="hidden" name="bookingDate" value={selectedSlot ?? ""} />
      <input type="hidden" name="vehicleMode" value={vehicleMode} />
      <input type="hidden" name="vehicleId" value={vehicleMode === "existing" ? selectedVehicleId : ""} />
      <input type="hidden" name="note" value="" />

      <StepProgress step={step} />
      <p className="mb-4 text-[12px] font-semibold tracking-wide text-[#94A3B8] uppercase">
        Step · {wizardStepLabel(step)}
      </p>

      {state.error ? (
        <p className="mb-4 rounded-[14px] bg-red-50 px-4 py-3 text-[14px] text-red-600">{state.error}</p>
      ) : null}

      {step === BOOKING_WIZARD_STEP.SERVICE ? (
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => {
                setSelectedServiceId(service.id);
                setSelectedBranchId(service.branchId);
              }}
              className={cn(
                "rounded-[18px] border bg-white p-4 text-left shadow-sm transition-colors",
                selectedServiceId === service.id ? "border-[#062C21]" : "border-[#E8EDF2]",
              )}
            >
              <div className="flex gap-3">
                <ServiceShopImage
                  serviceStoreId={serviceStoreId}
                  serviceStoreName={service.name}
                  slot={service.name.length % 5}
                  className="size-16 shrink-0 rounded-[12px]"
                  sizes="64px"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#0A0A0A]">{service.name}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-[#64748B]">
                    {getServiceDisplayDescription(service.name, storeDescription)}
                  </p>
                  <p className="mt-2 text-[13px] text-[#64748B]">
                    {service.duration} min · from {formatPrice(service.price)}
                  </p>
                </div>
              </div>
            </button>
          ))}
          <WizardFooter
            backHref={backHref}
            onContinue={() => {
              if (!selectedServiceId) return;
              const service = services.find((row) => row.id === selectedServiceId);
              if (!service) return;
              setSelectedBranchId(service.branchId);
              goTo(branches.length > 1 ? BOOKING_WIZARD_STEP.BRANCH : BOOKING_WIZARD_STEP.VEHICLE);
            }}
            continueDisabled={!selectedServiceId}
            continueLabel="Continue"
          />
        </div>
      ) : null}

      {step === BOOKING_WIZARD_STEP.BRANCH ? (
        <div className="flex flex-col gap-3">
          {branchOptions.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => setSelectedBranchId(branch.id)}
              className={cn(
                "min-h-[56px] rounded-[16px] border bg-white px-4 py-3 text-left",
                selectedBranchId === branch.id ? "border-[#062C21]" : "border-[#E8EDF2]",
              )}
            >
              <p className="font-semibold text-[#0A0A0A]">{branch.name}</p>
              {branch.address ? (
                <p className="mt-1 text-[13px] text-[#64748B]">{branch.address}</p>
              ) : null}
            </button>
          ))}
          <WizardFooter
            onBack={() => goTo(BOOKING_WIZARD_STEP.SERVICE)}
            onContinue={() => goTo(BOOKING_WIZARD_STEP.VEHICLE)}
            continueDisabled={!resolvedBranchId}
          />
        </div>
      ) : null}

      {step === BOOKING_WIZARD_STEP.VEHICLE ? (
        <Card className="space-y-4">
          {vehicles.length > 0 ? (
            <>
              <div className="flex gap-2">
                <SelectChip selected={vehicleMode === "existing"} onClick={() => setVehicleMode("existing")}>
                  My vehicles
                </SelectChip>
                <SelectChip selected={vehicleMode === "new"} onClick={() => setVehicleMode("new")}>
                  Add new
                </SelectChip>
              </div>
              {vehicleMode === "existing" ? (
                <CustomerFormField id="vehicleId" label="Select vehicle">
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
                <div className="grid gap-3">
                  <CustomerFormField id="vehicleLicensePlate" label="License plate" error={state.fieldErrors?.vehicleLicensePlate?.[0]}>
                    <TextField id="vehicleLicensePlate" name="vehicleLicensePlate" required />
                  </CustomerFormField>
                  <CustomerFormField id="vehicleBrand" label="Brand" error={state.fieldErrors?.vehicleBrand?.[0]}>
                    <TextField id="vehicleBrand" name="vehicleBrand" required />
                  </CustomerFormField>
                  <CustomerFormField id="vehicleModel" label="Model" error={state.fieldErrors?.vehicleModel?.[0]}>
                    <TextField id="vehicleModel" name="vehicleModel" required />
                  </CustomerFormField>
                  <CustomerFormField id="vehicleProvince" label="Province">
                    <TextField id="vehicleProvince" name="vehicleProvince" />
                  </CustomerFormField>
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-3">
              <EmptyState title="Add your vehicle" description="We need your car details to complete the booking." />
              <CustomerFormField id="vehicleLicensePlate" label="License plate" error={state.fieldErrors?.vehicleLicensePlate?.[0]}>
                <TextField id="vehicleLicensePlate" name="vehicleLicensePlate" required />
              </CustomerFormField>
              <CustomerFormField id="vehicleBrand" label="Brand" error={state.fieldErrors?.vehicleBrand?.[0]}>
                <TextField id="vehicleBrand" name="vehicleBrand" required />
              </CustomerFormField>
              <CustomerFormField id="vehicleModel" label="Model" error={state.fieldErrors?.vehicleModel?.[0]}>
                <TextField id="vehicleModel" name="vehicleModel" required />
              </CustomerFormField>
            </div>
          )}
          <WizardFooter
            onBack={() =>
              goTo(branchOptions.length > 1 ? BOOKING_WIZARD_STEP.BRANCH : BOOKING_WIZARD_STEP.SERVICE)
            }
            onContinue={() => goTo(BOOKING_WIZARD_STEP.DATE)}
            continueDisabled={!canProceedVehicle}
          />
        </Card>
      ) : null}

      {step === BOOKING_WIZARD_STEP.DATE ? (
        <Card className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <SelectChip selected={dateMode === "today"} onClick={() => setDateMode("today")}>
              Today
            </SelectChip>
            <SelectChip selected={dateMode === "tomorrow"} onClick={() => setDateMode("tomorrow")}>
              Tomorrow
            </SelectChip>
            <SelectChip selected={dateMode === "calendar"} onClick={() => setDateMode("calendar")}>
              Pick date
            </SelectChip>
          </div>
          {dateMode === "calendar" ? (
            <TextField
              type="date"
              min={todayDateValue()}
              value={calendarDate}
              onChange={(event) => setCalendarDate(event.target.value)}
            />
          ) : null}
          <WizardFooter
            onBack={() => goTo(BOOKING_WIZARD_STEP.VEHICLE)}
            onContinue={() => goTo(BOOKING_WIZARD_STEP.TIME)}
          />
        </Card>
      ) : null}

      {step === BOOKING_WIZARD_STEP.TIME ? (
        <Card className="space-y-4">
          <p className="text-[14px] text-[#64748B]">{formatSummaryDate(selectedDate)}</p>
          {slotsLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-24 rounded-full" />
              ))}
            </div>
          ) : slotsError ? (
            <p className="text-[14px] text-red-600">{slotsError}</p>
          ) : slots.length === 0 ? (
            <p className="text-[14px] text-[#64748B]">No slots available. Try another date.</p>
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
          <WizardFooter
            onBack={() => goTo(BOOKING_WIZARD_STEP.DATE)}
            onContinue={() => goTo(BOOKING_WIZARD_STEP.REVIEW)}
            continueDisabled={!selectedSlot}
          />
        </Card>
      ) : null}

      {step === BOOKING_WIZARD_STEP.REVIEW ? (
        <div className="flex flex-col gap-4">
          <BookingSummaryPanel
            serviceStoreName={serviceStoreName}
            branchName={selectedBranch?.name ?? ""}
            vehicleLabel={
              vehicleMode === "existing" && selectedVehicle
                ? formatVehicleSelectLabel(selectedVehicle)
                : "New vehicle"
            }
            serviceName={selectedService?.name ?? "—"}
            servicePrice={selectedService?.price ?? "0"}
            durationMinutes={totalDuration}
            dateLabel={formatSummaryDate(selectedDate)}
            timeLabel={selectedSlotLabel ?? (selectedSlot ? formatSummaryTime(selectedSlot) : null)}
            estimatedFinishLabel={
              selectedSlot
                ? formatBookingTime(
                    new Date(new Date(selectedSlot).getTime() + totalDuration * 60_000),
                  )
                : null
            }
          />
          <WizardFooter
            onBack={() => goTo(BOOKING_WIZARD_STEP.TIME)}
            continueLabel={isPending ? "Confirming…" : "Confirm booking"}
            continueDisabled={!selectedSlot || isPending}
            submit
          />
        </div>
      ) : null}
    </form>
  );
}

function WizardFooter({
  backHref,
  onBack,
  onContinue,
  continueDisabled,
  continueLabel = "Continue",
  submit = false,
}: {
  backHref?: string;
  onBack?: () => void;
  onContinue?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  submit?: boolean;
}) {
  return (
    <CustomerStickyFooter>
      <div className="flex gap-3">
        {onBack ? (
          <Button type="button" variant="secondary" className="flex-1" onClick={onBack}>
            Back
          </Button>
        ) : backHref ? (
          <ButtonLink href={backHref} variant="secondary" className="flex-1">
            Back
          </ButtonLink>
        ) : null}
        <Button
          type={submit ? "submit" : "button"}
          className="flex-[2]"
          disabled={continueDisabled}
          onClick={submit ? undefined : onContinue}
        >
          {continueLabel}
        </Button>
      </div>
    </CustomerStickyFooter>
  );
}
