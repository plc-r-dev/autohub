"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import {
  branchSchema,
  branchOperatingHoursSchema,
  serviceStoreProfileSchema,
  serviceSchema,
} from "@/lib/service-store/schemas";
import { getDefaultOperatingHours, parseTimeToMinutes } from "@/lib/booking/engine/time";
import { prisma } from "@/lib/prisma";

export type CatalogActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

export async function updateServiceStoreProfile(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const parsed = serviceStoreProfileSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.serviceStore.update({
    where: { id: serviceStore.id },
    data: parsed.data,
  });

  revalidatePath("/service-store/profile");
  revalidatePath("/service-store/dashboard");
  redirect("/service-store/profile");
}

export async function createBranch(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const parsed = branchSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.branch.findUnique({
    where: {
      serviceStoreId_code: {
        serviceStoreId: serviceStore.id,
        code: parsed.data.code,
      },
    },
  });

  if (existing) {
    return { error: "Branch code already exists for this serviceStore." };
  }

  await prisma.$transaction(async (tx) => {
    const branch = await tx.branch.create({
      data: {
        serviceStoreId: serviceStore.id,
        code: parsed.data.code,
        name: parsed.data.name,
        phone: parsed.data.phone,
        address: parsed.data.address,
        slotIntervalMinutes: parsed.data.slotIntervalMinutes,
        concurrentCapacity: parsed.data.concurrentCapacity,
      },
    });

    await tx.branchOperatingHours.createMany({
      data: getDefaultOperatingHours().map((hours) => ({
        branchId: branch.id,
        ...hours,
      })),
    });
  });

  revalidatePath("/service-store/branches");
  redirect("/service-store/branches");
}

export async function updateBranch(
  branchId: string,
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const parsed = branchSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, serviceStoreId: serviceStore.id },
  });

  if (!branch) {
    return { error: "Branch not found." };
  }

  if (parsed.data.code !== branch.code) {
    const duplicate = await prisma.branch.findUnique({
      where: {
        serviceStoreId_code: {
          serviceStoreId: serviceStore.id,
          code: parsed.data.code,
        },
      },
    });
    if (duplicate) {
      return { error: "Branch code already exists for this serviceStore." };
    }
  }

  await prisma.branch.update({
    where: { id: branchId },
    data: parsed.data,
  });

  revalidatePath("/service-store/branches");
  revalidatePath(`/service-store/branches/${branchId}`);
  redirect(`/service-store/branches/${branchId}`);
}

export async function updateBranchOperatingHours(
  branchId: string,
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const { serviceStore } = await requireApprovedServiceStoreUser();

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, serviceStoreId: serviceStore.id },
  });

  if (!branch) {
    return { error: "Branch not found." };
  }

  const entries = Array.from({ length: 7 }, (_, dayOfWeek) => {
    const prefix = `day-${dayOfWeek}`;
    return branchOperatingHoursSchema.safeParse({
      dayOfWeek: String(dayOfWeek),
      openTime: formData.get(`${prefix}-openTime`) ?? "09:00",
      closeTime: formData.get(`${prefix}-closeTime`) ?? "18:00",
      isClosed: formData.get(`${prefix}-isClosed`) ?? "false",
    });
  });

  const fieldErrors: Record<string, string[]> = {};
  const hours = [];

  for (const entry of entries) {
    if (!entry.success) {
      Object.assign(fieldErrors, entry.error.flatten().fieldErrors);
      continue;
    }

    if (
      !entry.data.isClosed &&
      parseTimeToMinutes(entry.data.openTime) >=
        parseTimeToMinutes(entry.data.closeTime)
    ) {
      return { error: "Opening time must be before closing time." };
    }

    hours.push(entry.data);
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  await prisma.$transaction(
    hours.map((hour) =>
      prisma.branchOperatingHours.upsert({
        where: {
          branchId_dayOfWeek: {
            branchId,
            dayOfWeek: hour.dayOfWeek,
          },
        },
        create: {
          branchId,
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
        },
        update: {
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
        },
      }),
    ),
  );

  revalidatePath(`/service-store/branches/${branchId}`);
  revalidatePath(`/service-store/branches/${branchId}/hours`);
  redirect(`/service-store/branches/${branchId}/hours`);
}

export async function deleteBranch(branchId: string) {
  const { serviceStore } = await requireApprovedServiceStoreUser();

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, serviceStoreId: serviceStore.id },
  });

  if (!branch) {
    return { error: "Branch not found." };
  }

  await prisma.branch.delete({ where: { id: branchId } });

  revalidatePath("/service-store/branches");
  redirect("/service-store/branches");
}

export async function createService(
  branchId: string,
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const parsed = serviceSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, serviceStoreId: serviceStore.id },
  });

  if (!branch) {
    return { error: "Branch not found." };
  }

  const existing = await prisma.service.findUnique({
    where: {
      branchId_code: {
        branchId,
        code: parsed.data.code,
      },
    },
  });

  if (existing) {
    return { error: "Service code already exists for this branch." };
  }

  await prisma.service.create({
    data: {
      branchId,
      code: parsed.data.code,
      name: parsed.data.name,
      duration: parsed.data.duration,
      bufferMinutes: parsed.data.bufferMinutes,
      price: parsed.data.price,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath(`/service-store/branches/${branchId}/services`);
  redirect(`/service-store/branches/${branchId}/services`);
}

export async function updateService(
  branchId: string,
  serviceId: string,
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const parsed = serviceSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, serviceStoreId: serviceStore.id },
  });

  if (!branch) {
    return { error: "Branch not found." };
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, branchId },
  });

  if (!service) {
    return { error: "Service not found." };
  }

  if (parsed.data.code !== service.code) {
    const duplicate = await prisma.service.findUnique({
      where: {
        branchId_code: {
          branchId,
          code: parsed.data.code,
        },
      },
    });
    if (duplicate) {
      return { error: "Service code already exists for this branch." };
    }
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      code: parsed.data.code,
      name: parsed.data.name,
      duration: parsed.data.duration,
      bufferMinutes: parsed.data.bufferMinutes,
      price: parsed.data.price,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath(`/service-store/branches/${branchId}/services`);
  revalidatePath(`/service-store/branches/${branchId}/services/${serviceId}`);
  redirect(`/service-store/branches/${branchId}/services/${serviceId}`);
}

export async function deleteService(branchId: string, serviceId: string) {
  const { serviceStore } = await requireApprovedServiceStoreUser();

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, serviceStoreId: serviceStore.id },
  });

  if (!branch) {
    return { error: "Branch not found." };
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, branchId },
  });

  if (!service) {
    return { error: "Service not found." };
  }

  await prisma.service.delete({ where: { id: serviceId } });

  revalidatePath(`/service-store/branches/${branchId}/services`);
  redirect(`/service-store/branches/${branchId}/services`);
}
