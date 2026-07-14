"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireServiceStoreDomainUser } from "@/lib/auth/domain-user";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import { SERVICE_STORE_PERMISSION } from "@/lib/service-store/domain";
import { countServiceStoreOwners } from "@/lib/service-store/application/member-queries";
import type { ServiceStoreMemberRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type MemberActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

const inviteSchema = z.object({
  phone: z.string().trim().min(1, "Phone is required"),
  role: z.enum(["MANAGER", "STAFF", "FINANCE", "VIEWER"]),
});

const roleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["MANAGER", "STAFF", "FINANCE", "VIEWER"]),
});

const memberIdSchema = z.object({
  memberId: z.string().uuid(),
});

const transferSchema = z.object({
  memberId: z.string().uuid(),
});

function revalidateServiceStorePaths() {
  revalidatePath("/app/settings");
  revalidatePath("/app/members");
  revalidatePath("/app/readiness");
  revalidatePath("/app/dashboard");
  revalidatePath("/app");
  revalidatePath("/browse");
}

export async function inviteServiceStoreMember(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.MEMBERS_INVITE, {
    allowOnboarding: true,
  });
  const parsed = inviteSchema.safeParse({
    phone: formData.get("phone"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const phone = parsed.data.phone;
  const invitee = await prisma.user.findFirst({
    where: {
      tenantId: ctx.user.tenantId,
      phone,
    },
    select: { id: true },
  });

  if (!invitee) {
    return {
      fieldErrors: {
        phone: ["No user found with this phone. They must sign in with LINE first."],
      },
    };
  }

  if (invitee.id === ctx.user.id) {
    return { error: "You are already a member of this Service Store." };
  }

  const existing = await prisma.serviceStoreMember.findUnique({
    where: {
      serviceStoreId_userId: {
        serviceStoreId: ctx.serviceStore.id,
        userId: invitee.id,
      },
    },
  });

  if (existing) {
    return { error: "This user is already a member." };
  }

  await prisma.serviceStoreMember.create({
    data: {
      serviceStoreId: ctx.serviceStore.id,
      userId: invitee.id,
      role: parsed.data.role,
    },
  });

  revalidateServiceStorePaths();
  return { success: "Member added successfully." };
}

export async function updateServiceStoreMemberRole(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.MEMBERS_CHANGE_ROLE, {
    allowOnboarding: true,
  });
  const parsed = roleSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const member = await prisma.serviceStoreMember.findFirst({
    where: {
      id: parsed.data.memberId,
      serviceStoreId: ctx.serviceStore.id,
    },
  });

  if (!member) {
    return { error: "Member not found." };
  }

  if (member.role === "OWNER") {
    return { error: "Use transfer ownership to change the Owner role." };
  }

  if (member.userId === ctx.user.id && ctx.membership.role === "OWNER") {
    return { error: "Owners cannot change their own role. Transfer ownership first." };
  }

  await prisma.serviceStoreMember.update({
    where: { id: member.id },
    data: { role: parsed.data.role as ServiceStoreMemberRole },
  });

  revalidateServiceStorePaths();
  return { success: "Member role updated." };
}

export async function removeServiceStoreMember(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.MEMBERS_REMOVE, {
    allowOnboarding: true,
  });
  const parsed = memberIdSchema.safeParse({
    memberId: formData.get("memberId"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const member = await prisma.serviceStoreMember.findFirst({
    where: {
      id: parsed.data.memberId,
      serviceStoreId: ctx.serviceStore.id,
    },
  });

  if (!member) {
    return { error: "Member not found." };
  }

  if (member.role === "OWNER") {
    const ownerCount = await countServiceStoreOwners(ctx.serviceStore.id);
    if (ownerCount <= 1) {
      return { error: "Cannot remove the only Owner. Transfer ownership first." };
    }
  }

  if (member.userId === ctx.user.id) {
    return { error: "You cannot remove yourself. Ask another Owner to remove you." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.serviceStoreMember.delete({ where: { id: member.id } });

    const activeUser = await tx.user.findUnique({
      where: { id: member.userId },
      select: { serviceStoreId: true },
    });

    if (activeUser?.serviceStoreId === ctx.serviceStore.id) {
      const fallback = await tx.serviceStoreMember.findFirst({
        where: { userId: member.userId },
        select: { serviceStoreId: true },
      });
      await tx.user.update({
        where: { id: member.userId },
        data: { serviceStoreId: fallback?.serviceStoreId ?? null },
      });
    }
  });

  revalidateServiceStorePaths();
  return { success: "Member removed." };
}

export async function transferServiceStoreOwnership(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.OWNERSHIP_TRANSFER, {
    allowOnboarding: true,
  });

  if (ctx.membership.role !== "OWNER") {
    return { error: "Only Owners can transfer ownership." };
  }

  const parsed = transferSchema.safeParse({
    memberId: formData.get("memberId"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const target = await prisma.serviceStoreMember.findFirst({
    where: {
      id: parsed.data.memberId,
      serviceStoreId: ctx.serviceStore.id,
    },
  });

  if (!target) {
    return { error: "Member not found." };
  }

  if (target.userId === ctx.user.id) {
    return { error: "Select a different member to receive ownership." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.serviceStoreMember.update({
      where: { id: target.id },
      data: { role: "OWNER" },
    });
    await tx.serviceStoreMember.update({
      where: { id: ctx.membership.id },
      data: { role: "MANAGER" },
    });
  });

  revalidateServiceStorePaths();
  return { success: "Ownership transferred. You are now a Manager." };
}

export async function switchActiveServiceStore(
  serviceStoreId: string,
): Promise<void> {
  const { user } = await requireServiceStoreDomainUser()

  const membership = await prisma.serviceStoreMember.findUnique({
    where: {
      serviceStoreId_userId: {
        serviceStoreId,
        userId: user.id,
      },
    },
    select: {
      id: true,
      serviceStore: { select: { status: true } },
    },
  })

  if (!membership) {
    redirect("/app")
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { serviceStoreId },
  })

  revalidatePath("/app")
  revalidatePath("/app/dashboard")

  redirect("/app/dashboard")
}
