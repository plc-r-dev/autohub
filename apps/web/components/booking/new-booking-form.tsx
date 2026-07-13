"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreSelectClassName,
  serviceStoreTextareaClassName,
} from "@/components/service-store/ui";
import type { NewBookingFormOptions } from "@/lib/booking/application/new-booking-options";
import {
  createNewBooking,
  searchNewBookingCustomerByPhone,
  searchNewBookingVehicleByPlate,
} from "@/lib/booking/new-booking-actions";
import { formatPrice } from "@/lib/booking/format";
import {
  formatCustomerDisplayName,
  NEW_BOOKING_STATUS_OPTIONS,
  newBookingFormSchema,
  type NewBookingFormValues,
} from "@/lib/booking/schemas/new-booking";
import { formatServiceCatalogLabel } from "@/lib/service-store/domain/service-catalog";
import { cn } from "@workspace/ui/lib/utils";

type NewBookingFormProps = {
  formOptions: NewBookingFormOptions;
  onSuccess: (message: string) => void;
  onCancel: () => void;
};

function nowDateTimeValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="h-4 w-1 rounded-full bg-[#16A34A]" aria-hidden />
      {children}
    </h3>
  );
}

export function NewBookingForm({
  formOptions,
  onSuccess,
  onCancel,
}: NewBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);
  const [isLookingUpVehicle, setIsLookingUpVehicle] = useState(false);
  const [customerFound, setCustomerFound] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultBranchId = formOptions.defaultBranchId ?? formOptions.branches[0]?.id ?? "";

  const form = useForm<NewBookingFormValues>({
    resolver: zodResolver(newBookingFormSchema),
    defaultValues: {
      branchId: defaultBranchId,
      serviceId: formOptions.branches[0]?.services[0]?.id ?? "",
      bookingDate: nowDateTimeValue(),
      status: "CONFIRMED",
      phone: "",
      customerName: "",
      licensePlate: "",
      vehicleBrand: "",
      vehicleModel: "",
      note: "",
    },
    mode: "onChange",
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const branchId = watch("branchId") || defaultBranchId;
  const phone = watch("phone");
  const customerId = watch("customerId");
  const customerName = watch("customerName");
  const licensePlate = watch("licensePlate");
  const serviceId = watch("serviceId");
  const bookingDate = watch("bookingDate");

  const services = useMemo(
    () => formOptions.branches.find((branch) => branch.id === branchId)?.services ?? [],
    [branchId, formOptions.branches],
  );

  useEffect(() => {
    if (services.length === 0) {
      setValue("serviceId", "", { shouldValidate: true });
      return;
    }

    if (!services.some((service) => service.id === serviceId)) {
      setValue("serviceId", services[0]!.id, { shouldValidate: true });
    }
  }, [branchId, services, serviceId, setValue]);

  useEffect(() => {
    const normalizedPhone = phone?.trim() ?? "";
    if (normalizedPhone.length < 6) {
      setCustomerFound(false);
      setValue("customerId", undefined);
      return;
    }

    const handle = window.setTimeout(async () => {
      setIsLookingUpCustomer(true);
      try {
        const customer = await searchNewBookingCustomerByPhone(normalizedPhone);
        if (customer) {
          setCustomerFound(true);
          setValue("customerId", customer.id, { shouldValidate: true });
          setValue(
            "customerName",
            formatCustomerDisplayName(customer.firstName, customer.lastName),
            { shouldValidate: true },
          );
        } else {
          setCustomerFound(false);
          setValue("customerId", undefined, { shouldValidate: true });
        }
      } finally {
        setIsLookingUpCustomer(false);
      }
    }, 400);

    return () => window.clearTimeout(handle);
  }, [phone, setValue]);

  useEffect(() => {
    const normalizedPlate = licensePlate?.trim() ?? "";
    if (!customerId || normalizedPlate.length < 2) {
      setVehicleFound(false);
      setValue("vehicleId", undefined);
      return;
    }

    const handle = window.setTimeout(async () => {
      setIsLookingUpVehicle(true);
      try {
        const vehicle = await searchNewBookingVehicleByPlate(
          customerId,
          normalizedPlate,
        );
        if (vehicle) {
          setVehicleFound(true);
          setValue("vehicleId", vehicle.id, { shouldValidate: true });
          setValue("vehicleBrand", vehicle.brand === "-" ? "" : vehicle.brand, {
            shouldValidate: true,
          });
          setValue("vehicleModel", vehicle.model === "-" ? "" : vehicle.model, {
            shouldValidate: true,
          });
        } else {
          setVehicleFound(false);
          setValue("vehicleId", undefined, { shouldValidate: true });
        }
      } finally {
        setIsLookingUpVehicle(false);
      }
    }, 400);

    return () => window.clearTimeout(handle);
  }, [customerId, licensePlate, setValue]);

  const canSubmit = Boolean(
    serviceId &&
      bookingDate &&
      phone?.trim() &&
      licensePlate?.trim() &&
      (customerId || customerName?.trim()),
  );

  const onSubmit = useCallback(
    async (values: NewBookingFormValues) => {
      setSubmitError(null);
      setIsSubmitting(true);

      try {
        const result = await createNewBooking(values, formOptions.defaultBranchId);

        if (!result.ok) {
          if (result.fieldErrors) {
            for (const [field, messages] of Object.entries(result.fieldErrors)) {
              const message = messages?.[0];
              if (message) {
                form.setError(field as keyof NewBookingFormValues, { message });
              }
            }
          }
          if (result.error) {
            setSubmitError(result.error);
          }
          return;
        }

        onSuccess(result.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formOptions.defaultBranchId, onSuccess, form],
  );

  if (formOptions.branches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add at least one active service to a branch before creating bookings.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {submitError}
        </p>
      ) : null}

      <section className="space-y-4">
        <SectionTitle>Booking</SectionTitle>

        {formOptions.branches.length > 1 ? (
          <ServiceStoreFormField
            id="branchId"
            label="Branch *"
            error={errors.branchId?.message}
          >
            <select
              id="branchId"
              className={serviceStoreSelectClassName}
              {...register("branchId")}
            >
              {formOptions.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </ServiceStoreFormField>
        ) : (
          <input type="hidden" {...register("branchId")} value={defaultBranchId} />
        )}

        <ServiceStoreFormField
          id="serviceId"
          label="Service *"
          error={errors.serviceId?.message}
        >
          <select
            id="serviceId"
            className={serviceStoreSelectClassName}
            {...register("serviceId")}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {formatServiceCatalogLabel(service)} · {formatPrice(service.price)}
              </option>
            ))}
          </select>
        </ServiceStoreFormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <ServiceStoreFormField
            id="bookingDate"
            label="Date & Time *"
            error={errors.bookingDate?.message}
          >
            <input
              id="bookingDate"
              type="datetime-local"
              className={serviceStoreInputClassName}
              {...register("bookingDate")}
            />
          </ServiceStoreFormField>

          <ServiceStoreFormField
            id="status"
            label="Status *"
            error={errors.status?.message}
          >
            <select
              id="status"
              className={serviceStoreSelectClassName}
              {...register("status")}
            >
              {NEW_BOOKING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </ServiceStoreFormField>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Customer</SectionTitle>

        <ServiceStoreFormField
          id="phone"
          label="Phone Number *"
          error={errors.phone?.message}
        >
          <div className="relative">
            <input
              id="phone"
              className={serviceStoreInputClassName}
              placeholder="08x-xxx-xxxx"
              {...register("phone")}
            />
            {isLookingUpCustomer ? (
              <Loader2 className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          {customerFound ? (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Existing customer found.</p>
          ) : phone?.trim() && phone.trim().length >= 6 && !isLookingUpCustomer ? (
            <p className="text-xs text-muted-foreground">No customer found. Enter a name below.</p>
          ) : null}
        </ServiceStoreFormField>

        <ServiceStoreFormField
          id="customerName"
          label={customerFound ? "Customer Name" : "Customer Name *"}
          error={errors.customerName?.message}
        >
          <input
            id="customerName"
            className={cn(
              serviceStoreInputClassName,
              customerFound && "bg-muted text-muted-foreground",
            )}
            placeholder="First and last name"
            readOnly={customerFound}
            {...register("customerName")}
          />
        </ServiceStoreFormField>
      </section>

      <section className="space-y-4">
        <SectionTitle>Vehicle</SectionTitle>

        <ServiceStoreFormField
          id="licensePlate"
          label="License Plate *"
          error={errors.licensePlate?.message}
        >
          <div className="relative">
            <input
              id="licensePlate"
              className={serviceStoreInputClassName}
              placeholder="ABC-1234"
              {...register("licensePlate")}
            />
            {isLookingUpVehicle ? (
              <Loader2 className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          {vehicleFound ? (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Existing vehicle found.</p>
          ) : null}
        </ServiceStoreFormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <ServiceStoreFormField
            id="vehicleBrand"
            label="Brand"
            error={errors.vehicleBrand?.message}
          >
            <input
              id="vehicleBrand"
              className={cn(
                serviceStoreInputClassName,
                vehicleFound && "bg-muted",
              )}
              readOnly={vehicleFound}
              {...register("vehicleBrand")}
            />
          </ServiceStoreFormField>

          <ServiceStoreFormField
            id="vehicleModel"
            label="Model"
            error={errors.vehicleModel?.message}
          >
            <input
              id="vehicleModel"
              className={cn(
                serviceStoreInputClassName,
                vehicleFound && "bg-muted",
              )}
              readOnly={vehicleFound}
              {...register("vehicleModel")}
            />
          </ServiceStoreFormField>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Additional</SectionTitle>
        <ServiceStoreFormField id="note" label="Note" error={errors.note?.message}>
          <textarea
            id="note"
            rows={3}
            className={serviceStoreTextareaClassName}
            placeholder="Optional booking note"
            {...register("note")}
          />
        </ServiceStoreFormField>
      </section>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <ServiceStoreButton type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </ServiceStoreButton>
        <ServiceStoreButton
          type="submit"
          className="gap-2"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Booking"
          )}
        </ServiceStoreButton>
      </div>
    </form>
  );
}
