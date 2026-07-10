"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { requireCustomerForUser } from "@/lib/customer/context";
import { createCustomerVehicleSchema } from "@/lib/customer/vehicle-schemas";
import { prisma } from "@/lib/prisma";

export type CustomerVehicleActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

function parseVehicleYear(value?: string): number | null {
  if (!value) {
    return null;
  }
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return null;
  }
  return year;
}

function safeReturnTo(value?: string): string {
  if (!value || !value.startsWith("/")) {
    return "/vehicles";
  }
  if (value.startsWith("//")) {
    return "/vehicles";
  }
  return value;
}

export async function createCustomerVehicle(
  _prev: CustomerVehicleActionState,
  formData: FormData,
): Promise<CustomerVehicleActionState> {
  const parsed = createCustomerVehicleSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { user } = await requireDomainUser();
  const customer = await requireCustomerForUser(user.id);
  if (!customer) {
    return { error: "Customer profile is required." };
  }

  const input = parsed.data;

  const duplicate = await prisma.vehicle.findFirst({
    where: {
      customerId: customer.id,
      licensePlate: input.licensePlate,
    },
    select: { id: true },
  });

  if (duplicate) {
    return {
      fieldErrors: {
        licensePlate: ["This license plate already exists on your profile."],
      },
    };
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      customerId: customer.id,
      licensePlate: input.licensePlate,
      province: input.province,
      brand: input.brand,
      model: input.model,
      year: parseVehicleYear(input.year),
      color: input.color,
    },
    select: { id: true },
  });

  revalidatePath("/vehicles");
  revalidatePath("/bookings/new");

  const returnTo = safeReturnTo(input.returnTo);
  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}vehicleId=${vehicle.id}`);
}
